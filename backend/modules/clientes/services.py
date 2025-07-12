"""
Services - Lógica de negócio para clientes
Camada intermediária entre os controllers e o repository
"""
import logging
from typing import Dict, Any, Optional

from core.database import get_database
from core.auth import User
from core.dependencies import PaginationParams
from core.exceptions import ValidationException, NotFoundException

from .repository import ClienteRepository
from .schemas import (
    ClienteCreate,
    ClienteUpdate,
    ClienteResponse,
    ClienteListResponse,
    FiltrosCliente
)
from ..status_orcamento.services import StatusOrcamentoService
from ..status_orcamento.repository import StatusOrcamentoRepository

logger = logging.getLogger(__name__)


class ClienteService:
    """
    Serviço principal para operações com clientes
    """
    
    def __init__(self):
        """
        Inicializa o serviço
        """
        pass
    
    def _validar_usuario_loja(self, user: User, permitir_super_admin: bool = True) -> None:
        """
        Valida se usuário tem loja associada
        
        Args:
            user: Usuário a validar
            permitir_super_admin: Se True, SUPER_ADMIN pode passar sem loja
            
        Raises:
            ValidationException: Se usuário não tem loja e não é SUPER_ADMIN
        """
        if not user.loja_id and not (permitir_super_admin and user.perfil == "SUPER_ADMIN"):
            raise ValidationException("Usuário não possui loja associada")
    
    def _determinar_loja_id(self, user: User) -> Optional[str]:
        """
        Determina loja_id baseado no perfil do usuário
        
        Args:
            user: Usuário logado
            
        Returns:
            loja_id ou None para SUPER_ADMIN/ADMIN_MASTER
        """
        if user.perfil in ["ADMIN_MASTER", "SUPER_ADMIN"]:
            return None
        return user.loja_id
    
    def _validar_dados_cliente(self, dados: Dict[str, Any]) -> None:
        """
        Validações centralizadas dos dados do cliente
        
        Args:
            dados: Dados do cliente para validar
            
        Raises:
            ValidationException: Se dados inválidos
        """
        # Validação de nome obrigatório
        if not dados.get('nome') or not dados['nome'].strip():
            raise ValidationException("Nome do cliente é obrigatório")
        
        # Validação de CPF/CNPJ se fornecido
        if dados.get('cpf_cnpj'):
            cpf_cnpj = dados['cpf_cnpj'].strip()
            if len(cpf_cnpj) not in [11, 14]:  # CPF: 11 dígitos, CNPJ: 14 dígitos
                raise ValidationException("CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos")
        
        # Validação de email se fornecido
        if dados.get('email'):
            import re
            email = dados['email'].strip()
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, email):
                raise ValidationException("Email inválido")
        
        # Validação de telefone se fornecido
        if dados.get('telefone'):
            telefone = dados['telefone'].strip()
            # Remove caracteres especiais para validação
            telefone_numeros = re.sub(r'[^\d]', '', telefone)
            if len(telefone_numeros) < 10 or len(telefone_numeros) > 11:
                raise ValidationException("Telefone deve ter 10 ou 11 dígitos")
    
    async def listar_clientes(
        self,
        user: User,
        filtros: FiltrosCliente,
        pagination: PaginationParams
    ) -> ClienteListResponse:
        """
        Lista clientes da loja do usuário com filtros e paginação
        
        Args:
            user: Usuário logado
            filtros: Filtros a aplicar
            pagination: Parâmetros de paginação
            
        Returns:
            Lista paginada de clientes
        """
        try:
            # Validações centralizadas
            self._validar_usuario_loja(user)
            
            # Conecta com o banco
            db = get_database()
            repository = ClienteRepository(db)
            
            # Converte filtros para dicionário
            filtros_dict = {}
            if filtros.busca:
                filtros_dict['busca'] = filtros.busca
            if filtros.tipo_venda:
                filtros_dict['tipo_venda'] = filtros.tipo_venda
            if filtros.vendedor_id:
                filtros_dict['vendedor_id'] = filtros.vendedor_id
            if filtros.procedencia_id:
                filtros_dict['procedencia_id'] = filtros.procedencia_id
            if filtros.data_inicio:
                filtros_dict['data_inicio'] = filtros.data_inicio
            if filtros.data_fim:
                filtros_dict['data_fim'] = filtros.data_fim
            
            # Define loja_id baseado no perfil usando método centralizado
            loja_id = self._determinar_loja_id(user)
            
            # Busca no repository
            resultado = await repository.listar(
                loja_id=loja_id,
                filtros=filtros_dict,
                page=pagination.page,
                limit=pagination.limit
            )
            
            # Converte para response model
            clientes = [ClienteResponse(**item) for item in resultado['items']]
            
            return ClienteListResponse(
                items=clientes,
                total=resultado['total'],
                page=resultado['page'],
                limit=resultado['limit'],
                pages=resultado['pages']
            )
        
        except Exception as e:
            logger.error(f"Erro ao listar clientes para usuário {user.id}: {str(e)}")
            raise
    
    async def buscar_cliente(self, cliente_id: str, user: User) -> ClienteResponse:
        """
        Busca um cliente específico
        
        Args:
            cliente_id: ID do cliente
            user: Usuário logado
            
        Returns:
            Dados completos do cliente
        """
        try:
            # Verifica se usuário tem loja associada (exceto SUPER_ADMIN)
            if not user.loja_id and user.perfil != "SUPER_ADMIN":
                raise ValidationException("Usuário não possui loja associada")
            
            # Define loja_id baseado no perfil
            loja_id = None if user.perfil == "SUPER_ADMIN" else user.loja_id
            
            # Conecta com o banco
            db = get_database()
            repository = ClienteRepository(db)
            
            # Busca o cliente
            cliente_data = await repository.buscar_por_id(cliente_id, loja_id)
            
            return ClienteResponse(**cliente_data)
        
        except Exception as e:
            logger.error(f"Erro ao buscar cliente {cliente_id}: {str(e)}")
            raise
    
    async def buscar_cliente_por_id(self, cliente_id: str, user: User) -> ClienteResponse:
        """
        Alias para buscar_cliente (compatibilidade com testes)
        
        Args:
            cliente_id: ID do cliente
            user: Usuário logado
            
        Returns:
            Dados completos do cliente
        """
        return await self.buscar_cliente(cliente_id, user)
    
    async def criar_cliente(self, dados: ClienteCreate, user: User) -> ClienteResponse:
        """
        Cria um novo cliente
        
        Args:
            dados: Dados do cliente a ser criado
            user: Usuário logado (vendedor/admin)
            
        Returns:
            Cliente criado
        """
        try:
            # Validações centralizadas
            self._validar_usuario_loja(user, permitir_super_admin=True)
            
            # Conecta com o banco
            db = get_database()
            repository = ClienteRepository(db)
            
            # Converte dados para dicionário
            dados_cliente = dados.model_dump(exclude_unset=True)
            
            # Validações específicas dos dados
            self._validar_dados_cliente(dados_cliente)
            
            # Se não foi informado vendedor, usa o usuário atual (se for vendedor)
            if not dados_cliente.get('vendedor_id') and user.perfil in ['USUARIO', 'VENDEDOR']:
                dados_cliente['vendedor_id'] = user.id
            
            # Define loja_id baseado no perfil 
            loja_id = None if user.perfil == "SUPER_ADMIN" else user.loja_id
            
            # Cria o cliente
            cliente_criado = await repository.criar(dados_cliente, loja_id)
            
            # TRIGGER AUTOMÁTICO: Define status inicial (Ordem 1 - Cliente Cadastrado)
            try:
                await self.atualizar_status_cliente(cliente_criado['id'], 1, user)
                logger.info(f"Status inicial aplicado ao cliente {cliente_criado['id']}")
            except Exception as status_error:
                logger.warning(f"Erro ao aplicar status inicial: {status_error}")
                # Não falha a criação do cliente por erro de status
            
            # Busca o cliente completo (com dados relacionados)
            cliente_completo = await repository.buscar_por_id(
                cliente_criado['id'], 
                loja_id
            )
            
            logger.info(f"Cliente criado: {cliente_completo['id']} por usuário {user.id}")
            
            return ClienteResponse(**cliente_completo)
        
        except Exception as e:
            logger.error(f"Erro ao criar cliente: {str(e)}")
            raise
    
    async def atualizar_cliente(
        self,
        cliente_id: str,
        dados: ClienteUpdate,
        user: User
    ) -> ClienteResponse:
        """
        Atualiza dados de um cliente
        
        Args:
            cliente_id: ID do cliente
            dados: Dados a atualizar
            user: Usuário logado
            
        Returns:
            Cliente atualizado
        """
        try:
            # Verifica se usuário tem loja associada (exceto SUPER_ADMIN)
            if not user.loja_id and user.perfil != "SUPER_ADMIN":
                raise ValidationException("Usuário não possui loja associada")
            
            # Define loja_id baseado no perfil
            loja_id = None if user.perfil == "SUPER_ADMIN" else user.loja_id
            
            # Conecta com o banco
            db = get_database()
            repository = ClienteRepository(db)
            
            # Converte dados para dicionário (apenas campos não None)
            dados_atualizacao = dados.model_dump(exclude_unset=True, exclude_none=True)
            
            if not dados_atualizacao:
                raise ValidationException("Nenhum dado fornecido para atualização")
            
            # Atualiza o cliente
            await repository.atualizar(cliente_id, dados_atualizacao, loja_id)
            
            # Busca o cliente atualizado
            cliente_atualizado = await repository.buscar_por_id(cliente_id, loja_id)
            
            logger.info(f"Cliente atualizado: {cliente_id} por usuário {user.id}")
            
            return ClienteResponse(**cliente_atualizado)
        
        except Exception as e:
            logger.error(f"Erro ao atualizar cliente {cliente_id}: {str(e)}")
            raise
    
    async def contar_dados_relacionados(self, cliente_id: str, user: User) -> dict:
        """
        Conta dados relacionados ao cliente antes da exclusão
        
        Args:
            cliente_id: ID do cliente
            user: Usuário logado
            
        Returns:
            Dicionário com contadores de dados relacionados
        """
        try:
            logger.info(f"Contando dados relacionados do cliente: {cliente_id}")
            
            # Conecta com o banco
            db = get_database()
            repository = ClienteRepository(db)
            
            # Conta dados relacionados
            contadores = await repository.contar_dados_relacionados(cliente_id, user.loja_id)
            
            return contadores
        
        except Exception as e:
            logger.error(f"Erro ao contar dados relacionados do cliente {cliente_id}: {str(e)}")
            raise

    async def excluir_cliente(self, cliente_id: str, user: User) -> bool:
        """
        Exclui um cliente (soft delete)
        
        Args:
            cliente_id: ID do cliente
            user: Usuário logado
            
        Returns:
            True se excluído com sucesso
        """
        try:
            # Verifica se usuário tem loja associada
            if not user.loja_id:
                raise ValidationException("Usuário não possui loja associada")
            
            # Apenas admins podem excluir clientes
            if user.perfil not in ['ADMIN', 'SUPER_ADMIN']:
                raise ValidationException("Apenas administradores podem excluir clientes")
            
            # Conecta com o banco
            db = get_database()
            repository = ClienteRepository(db)
            
            # Exclui o cliente
            sucesso = await repository.excluir(cliente_id, user.loja_id)
            
            if sucesso:
                logger.info(f"Cliente excluído: {cliente_id} por usuário {user.id}")
            
            return sucesso
        
        except Exception as e:
            logger.error(f"Erro ao excluir cliente {cliente_id}: {str(e)}")
            raise
    
    async def verificar_cpf_cnpj_disponivel(
        self,
        cpf_cnpj: str,
        user: User,
        cliente_id_ignorar: Optional[str] = None
    ) -> bool:
        """
        Verifica se um CPF/CNPJ está disponível para uso
        
        Args:
            cpf_cnpj: CPF ou CNPJ a verificar
            user: Usuário logado
            cliente_id_ignorar: ID do cliente a ignorar (para edição)
            
        Returns:
            True se disponível, False se já existe
        """
        try:
            # Se CPF/CNPJ está vazio, está sempre disponível
            if not cpf_cnpj or cpf_cnpj.strip() == '':
                return True
                
            # Verifica se usuário tem loja associada (exceto ADMIN_MASTER)
            if not user.loja_id and user.perfil != "ADMIN_MASTER":
                raise ValidationException("Usuário não possui loja associada")
            
            # Define loja_id baseado no perfil
            loja_id = None if user.perfil == "ADMIN_MASTER" else user.loja_id
            
            # Conecta com o banco
            db = get_database()
            repository = ClienteRepository(db)
            
            # Busca cliente com esse CPF/CNPJ
            cliente_existente = await repository.buscar_por_cpf_cnpj(cpf_cnpj, loja_id)
            
            # Se não encontrou, está disponível
            if not cliente_existente:
                return True
            
            # Se encontrou mas é o mesmo cliente que está sendo editado, está disponível
            if cliente_id_ignorar and cliente_existente['id'] == cliente_id_ignorar:
                return True
            
            # Senão, já está em uso
            return False
        
        except Exception as e:
            logger.error(f"Erro ao verificar CPF/CNPJ {cpf_cnpj}: {str(e)}")
            raise
    
    async def verificar_cpf_cnpj_duplicado(
        self,
        cpf_cnpj: str,
        user: User,
        cliente_id_ignorar: Optional[str] = None
    ) -> bool:
        """
        Alias para verificar_cpf_cnpj_disponivel (compatibilidade com testes)
        Retorna True se CPF/CNPJ está duplicado (oposto do método principal)
        
        Args:
            cpf_cnpj: CPF ou CNPJ a verificar
            user: Usuário logado
            cliente_id_ignorar: ID do cliente a ignorar (para edição)
            
        Returns:
            True se duplicado, False se disponível
        """
        disponivel = await self.verificar_cpf_cnpj_disponivel(cpf_cnpj, user, cliente_id_ignorar)
        return not disponivel
    
    async def atualizar_status_cliente(self, cliente_id: str, ordem: int, user: User) -> ClienteResponse:
        """
        Atualiza o status do cliente baseado na ordem
        
        Args:
            cliente_id: ID do cliente
            ordem: Ordem do status (1-5)
            user: Usuário logado
            
        Returns:
            Cliente atualizado com novo status
        """
        try:
            # Verifica se usuário tem loja associada
            if not user.loja_id:
                raise ValidationException("Usuário não possui loja associada")
            
            # Conecta com o banco
            db = get_database()
            cliente_repository = ClienteRepository(db)
            status_repository = StatusOrcamentoRepository(db)
            status_service = StatusOrcamentoService(status_repository)
            
            # Busca o status pela ordem
            status = await status_service.buscar_por_ordem(ordem)
            
            # Atualiza o status do cliente
            dados_atualizacao = {'status_id': status.id}
            await cliente_repository.atualizar(cliente_id, dados_atualizacao, user.loja_id)
            
            # Busca o cliente atualizado
            cliente_atualizado = await cliente_repository.buscar_por_id(cliente_id, user.loja_id)
            
            logger.info(f"Status do cliente {cliente_id} atualizado para ordem {ordem} por usuário {user.id}")
            
            return ClienteResponse(**cliente_atualizado)
        
        except Exception as e:
            logger.error(f"Erro ao atualizar status do cliente {cliente_id}: {str(e)}")
            raise
    
    async def obter_cliente_com_status(self, cliente_id: str, user: User) -> ClienteResponse:
        """
        Obtém cliente com dados do status incluídos
        
        Args:
            cliente_id: ID do cliente
            user: Usuário logado
            
        Returns:
            Cliente com dados do status
        """
        try:
            # Verifica se usuário tem loja associada
            if not user.loja_id:
                raise ValidationException("Usuário não possui loja associada")
            
            # Conecta com o banco
            db = get_database()
            cliente_repository = ClienteRepository(db)
            
            # Busca cliente
            cliente = await cliente_repository.buscar_por_id(cliente_id, user.loja_id)
            
            # Se tem status_id, busca dados do status
            if cliente.get('status_id'):
                status_repository = StatusOrcamentoRepository(db)
                status_service = StatusOrcamentoService(status_repository)
                
                try:
                    status = await status_service.buscar_por_id(cliente['status_id'])
                    cliente['status'] = {
                        'id': status.id,
                        'nome': status.nome,
                        'cor': status.cor,
                        'ordem': status.ordem
                    }
                except NotFoundException:
                    # Status não encontrado, remove referência
                    cliente['status'] = None
            
            return ClienteResponse(**cliente)
        
        except Exception as e:
            logger.error(f"Erro ao obter cliente com status {cliente_id}: {str(e)}")
            raise