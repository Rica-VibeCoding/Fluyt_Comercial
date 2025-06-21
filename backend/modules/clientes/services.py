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
            # Verifica se usuário tem loja associada
            if not user.loja_id:
                raise ValidationException("Usuário não possui loja associada")
            
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
            
            # Define loja_id baseado no perfil
            # SUPER_ADMIN vê todos os clientes
            # Outros usuários veem apenas da sua loja
            loja_id = None if user.perfil == "SUPER_ADMIN" else user.loja_id
            
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
            # Verifica se usuário tem loja associada
            if not user.loja_id:
                raise ValidationException("Usuário não possui loja associada")
            
            # Conecta com o banco
            db = get_database()
            repository = ClienteRepository(db)
            
            # Converte dados para dicionário
            dados_cliente = dados.model_dump(exclude_unset=True)
            
            # Se não foi informado vendedor, usa o usuário atual (se for vendedor)
            if not dados_cliente.get('vendedor_id') and user.perfil in ['USUARIO', 'VENDEDOR']:
                dados_cliente['vendedor_id'] = user.id
            
            # Cria o cliente
            cliente_criado = await repository.criar(dados_cliente, user.loja_id)
            
            # Busca o cliente completo (com dados relacionados)
            cliente_completo = await repository.buscar_por_id(
                cliente_criado['id'], 
                user.loja_id
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
            # Verifica se usuário tem loja associada
            if not user.loja_id:
                raise ValidationException("Usuário não possui loja associada")
            
            # Conecta com o banco
            db = get_database()
            repository = ClienteRepository(db)
            
            # Converte dados para dicionário (apenas campos não None)
            dados_atualizacao = dados.model_dump(exclude_unset=True, exclude_none=True)
            
            if not dados_atualizacao:
                raise ValidationException("Nenhum dado fornecido para atualização")
            
            # Atualiza o cliente
            await repository.atualizar(cliente_id, dados_atualizacao, user.loja_id)
            
            # Busca o cliente atualizado
            cliente_atualizado = await repository.buscar_por_id(cliente_id, user.loja_id)
            
            logger.info(f"Cliente atualizado: {cliente_id} por usuário {user.id}")
            
            return ClienteResponse(**cliente_atualizado)
        
        except Exception as e:
            logger.error(f"Erro ao atualizar cliente {cliente_id}: {str(e)}")
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
            if user.perfil not in ['ADMIN', 'ADMIN_MASTER']:
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
            # Verifica se usuário tem loja associada (exceto SUPER_ADMIN)
            if not user.loja_id and user.perfil != "SUPER_ADMIN":
                raise ValidationException("Usuário não possui loja associada")
            
            # Define loja_id baseado no perfil
            loja_id = None if user.perfil == "SUPER_ADMIN" else user.loja_id
            
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