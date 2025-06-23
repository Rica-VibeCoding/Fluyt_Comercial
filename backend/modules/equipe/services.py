"""
Services - Lógica de negócio para funcionários
Camada intermediária entre os controllers e o repository
"""
import logging
from typing import Dict, Any, Optional

from core.database import get_database
from core.auth import User
from core.dependencies import PaginationParams
from core.exceptions import ValidationException, NotFoundException

from .repository import FuncionarioRepository
from .schemas import (
    FuncionarioCreate,
    FuncionarioUpdate,
    FuncionarioResponse,
    FuncionarioListResponse,
    FiltrosFuncionario
)

logger = logging.getLogger(__name__)


class FuncionarioService:
    """
    Serviço principal para operações com funcionários
    """
    
    def __init__(self):
        """
        Inicializa o serviço
        """
        pass
    
    async def listar_funcionarios(
        self,
        user: User,
        filtros: FiltrosFuncionario,
        pagination: PaginationParams
    ) -> FuncionarioListResponse:
        """
        Lista funcionários com filtros e paginação
        
        Args:
            user: Usuário logado
            filtros: Filtros a aplicar
            pagination: Parâmetros de paginação
            
        Returns:
            Lista paginada de funcionários
        """
        try:
            # Verifica se usuário tem loja associada (exceto ADMIN_MASTER)
            if not user.loja_id and user.perfil not in ["ADMIN_MASTER", "SUPER_ADMIN"]:
                raise ValidationException("Usuário não possui loja associada")
            
            # Conecta com o banco
            db = get_database()
            repository = FuncionarioRepository(db)
            
            # Converte filtros para dicionário
            filtros_dict = {}
            if filtros.busca:
                filtros_dict['busca'] = filtros.busca
            if filtros.perfil:
                filtros_dict['perfil'] = filtros.perfil
            if filtros.setor_id:
                filtros_dict['setor_id'] = filtros.setor_id
            if filtros.data_inicio:
                filtros_dict['data_inicio'] = filtros.data_inicio
            if filtros.data_fim:
                filtros_dict['data_fim'] = filtros.data_fim
            
            # Define loja_id baseado no perfil
            # ADMIN_MASTER e SUPER_ADMIN veem todos os funcionários
            # Outros usuários veem apenas da sua loja
            loja_id = None if user.perfil in ["ADMIN_MASTER", "SUPER_ADMIN"] else user.loja_id
            
            # Busca no repository
            resultado = await repository.listar(
                loja_id=loja_id,
                filtros=filtros_dict,
                page=pagination.page,
                limit=pagination.limit
            )
            
            # Converte para response model
            funcionarios = [FuncionarioResponse(**item) for item in resultado['items']]
            
            return FuncionarioListResponse(
                items=funcionarios,
                total=resultado['total'],
                page=resultado['page'],
                limit=resultado['limit'],
                pages=resultado['pages']
            )
        
        except Exception as e:
            logger.error(f"Erro ao listar funcionários para usuário {user.id}: {str(e)}")
            raise
    
    async def buscar_funcionario(self, funcionario_id: str, user: User) -> FuncionarioResponse:
        """
        Busca um funcionário específico
        
        Args:
            funcionario_id: ID do funcionário
            user: Usuário logado
            
        Returns:
            Dados completos do funcionário
        """
        try:
            # Verifica se usuário tem loja associada (exceto ADMIN_MASTER)
            if not user.loja_id and user.perfil not in ["ADMIN_MASTER", "SUPER_ADMIN"]:
                raise ValidationException("Usuário não possui loja associada")
            
            # Define loja_id baseado no perfil
            loja_id = None if user.perfil in ["ADMIN_MASTER", "SUPER_ADMIN"] else user.loja_id
            
            # Conecta com o banco
            db = get_database()
            repository = FuncionarioRepository(db)
            
            # Busca o funcionário
            funcionario_data = await repository.buscar_por_id(funcionario_id, loja_id)
            
            return FuncionarioResponse(**funcionario_data)
        
        except Exception as e:
            logger.error(f"Erro ao buscar funcionário {funcionario_id}: {str(e)}")
            raise
    
    async def validar_relacionamentos(self, loja_id: Optional[str], setor_id: Optional[str]) -> Dict[str, Any]:
        """
        Valida se loja e setor existem
        
        Args:
            loja_id: ID da loja
            setor_id: ID do setor
            
        Returns:
            Dicionário com dados validados
            
        Raises:
            ValidationException: Se relacionamentos não existem
        """
        try:
            db = get_database()
            
            # Valida loja se fornecida
            if loja_id:
                result = db.table('c_lojas').select('id, nome').eq('id', loja_id).eq('ativo', True).execute()
                if not result.data:
                    raise ValidationException(f"Loja não encontrada: {loja_id}")
            
            # Valida setor se fornecido
            if setor_id:
                result = db.table('cad_setores').select('id, nome').eq('id', setor_id).eq('ativo', True).execute()
                if not result.data:
                    raise ValidationException(f"Setor não encontrado: {setor_id}")
            
            return {"loja_valida": True, "setor_valido": True}
        
        except Exception as e:
            logger.error(f"Erro ao validar relacionamentos: {str(e)}")
            raise
    
    async def criar_funcionario(self, dados: FuncionarioCreate, user: User) -> FuncionarioResponse:
        """
        Cria um novo funcionário
        
        Args:
            dados: Dados do funcionário a ser criado
            user: Usuário logado (admin/gerente)
            
        Returns:
            Funcionário criado
        """
        try:
            # Apenas admins e gerentes podem criar funcionários
            if user.perfil not in ['ADMIN_MASTER', 'SUPER_ADMIN', 'ADMIN', 'GERENTE']:
                raise ValidationException("Apenas administradores e gerentes podem criar funcionários")
            
            # Verifica se usuário tem loja associada (exceto ADMIN_MASTER)
            if not user.loja_id and user.perfil not in ["ADMIN_MASTER", "SUPER_ADMIN"]:
                raise ValidationException("Usuário não possui loja associada")
            
            # Conecta com o banco
            db = get_database()
            repository = FuncionarioRepository(db)
            
            # Converte dados para dicionário
            dados_funcionario = dados.model_dump(exclude_unset=True)
            
            # Se não foi informada loja, usa a loja do usuário
            if not dados_funcionario.get('loja_id') and user.loja_id:
                dados_funcionario['loja_id'] = user.loja_id
            
            # Valida relacionamentos se fornecidos
            if dados_funcionario.get('loja_id') or dados_funcionario.get('setor_id'):
                await self.validar_relacionamentos(
                    dados_funcionario.get('loja_id'),
                    dados_funcionario.get('setor_id')
                )
            
            # Cria o funcionário
            funcionario_criado = await repository.criar(dados_funcionario)
            
            # Busca o funcionário completo (com dados relacionados)
            funcionario_completo = await repository.buscar_por_id(
                funcionario_criado['id'], 
                dados_funcionario.get('loja_id')
            )
            
            logger.info(f"Funcionário criado: {funcionario_completo['id']} por usuário {user.id}")
            
            return FuncionarioResponse(**funcionario_completo)
        
        except Exception as e:
            logger.error(f"Erro ao criar funcionário: {str(e)}")
            raise
    
    async def atualizar_funcionario(
        self,
        funcionario_id: str,
        dados: FuncionarioUpdate,
        user: User
    ) -> FuncionarioResponse:
        """
        Atualiza dados de um funcionário
        
        Args:
            funcionario_id: ID do funcionário
            dados: Dados a atualizar
            user: Usuário logado
            
        Returns:
            Funcionário atualizado
        """
        try:
            # Apenas admins e gerentes podem atualizar funcionários
            if user.perfil not in ['ADMIN_MASTER', 'SUPER_ADMIN', 'ADMIN', 'GERENTE']:
                raise ValidationException("Apenas administradores e gerentes podem atualizar funcionários")
            
            # Verifica se usuário tem loja associada (exceto ADMIN_MASTER)
            if not user.loja_id and user.perfil not in ["ADMIN_MASTER", "SUPER_ADMIN"]:
                raise ValidationException("Usuário não possui loja associada")
            
            # Define loja_id baseado no perfil
            loja_id = None if user.perfil in ["ADMIN_MASTER", "SUPER_ADMIN"] else user.loja_id
            
            # Conecta com o banco
            db = get_database()
            repository = FuncionarioRepository(db)
            
            # Converte dados para dicionário (apenas campos não None)
            dados_atualizacao = dados.model_dump(exclude_unset=True, exclude_none=True)
            
            if not dados_atualizacao:
                raise ValidationException("Nenhum dado fornecido para atualização")
            
            # Valida relacionamentos se estão sendo alterados
            if dados_atualizacao.get('loja_id') or dados_atualizacao.get('setor_id'):
                await self.validar_relacionamentos(
                    dados_atualizacao.get('loja_id'),
                    dados_atualizacao.get('setor_id')
                )
            
            # Atualiza o funcionário
            await repository.atualizar(funcionario_id, dados_atualizacao, loja_id)
            
            # Busca o funcionário atualizado
            funcionario_atualizado = await repository.buscar_por_id(funcionario_id, loja_id)
            
            logger.info(f"Funcionário atualizado: {funcionario_id} por usuário {user.id}")
            
            return FuncionarioResponse(**funcionario_atualizado)
        
        except Exception as e:
            logger.error(f"Erro ao atualizar funcionário {funcionario_id}: {str(e)}")
            raise
    
    async def excluir_funcionario(self, funcionario_id: str, user: User) -> bool:
        """
        Exclui um funcionário (soft delete)
        
        Args:
            funcionario_id: ID do funcionário
            user: Usuário logado
            
        Returns:
            True se excluído com sucesso
        """
        try:
            # Apenas admins podem excluir funcionários
            if user.perfil not in ['ADMIN_MASTER', 'SUPER_ADMIN', 'ADMIN']:
                raise ValidationException("Apenas administradores podem excluir funcionários")
            
            # Verifica se usuário tem loja associada (exceto ADMIN_MASTER)
            if not user.loja_id and user.perfil not in ["ADMIN_MASTER", "SUPER_ADMIN"]:
                raise ValidationException("Usuário não possui loja associada")
            
            # Define loja_id baseado no perfil
            loja_id = None if user.perfil in ["ADMIN_MASTER", "SUPER_ADMIN"] else user.loja_id
            
            # Conecta com o banco
            db = get_database()
            repository = FuncionarioRepository(db)
            
            # Exclui o funcionário
            sucesso = await repository.excluir(funcionario_id, loja_id)
            
            if sucesso:
                logger.info(f"Funcionário excluído: {funcionario_id} por usuário {user.id}")
            
            return sucesso
        
        except Exception as e:
            logger.error(f"Erro ao excluir funcionário {funcionario_id}: {str(e)}")
            raise
    
    async def verificar_nome_disponivel(
        self,
        nome: str,
        user: User,
        funcionario_id_ignorar: Optional[str] = None
    ) -> bool:
        """
        Verifica se um nome de funcionário está disponível para uso
        
        Args:
            nome: Nome a verificar
            user: Usuário logado
            funcionario_id_ignorar: ID do funcionário a ignorar (para edição)
            
        Returns:
            True se disponível, False se já existe
        """
        try:
            # Se nome está vazio, não está disponível
            if not nome or nome.strip() == '':
                return False
            
            # Verifica se usuário tem loja associada (exceto ADMIN_MASTER)
            if not user.loja_id and user.perfil not in ["ADMIN_MASTER", "SUPER_ADMIN"]:
                raise ValidationException("Usuário não possui loja associada")
            
            # Define loja_id baseado no perfil
            loja_id = None if user.perfil in ["ADMIN_MASTER", "SUPER_ADMIN"] else user.loja_id
            
            # Conecta com o banco
            db = get_database()
            repository = FuncionarioRepository(db)
            
            # Busca funcionário com esse nome
            funcionario_existente = await repository.buscar_por_nome(nome.strip(), loja_id)
            
            # Se não encontrou, está disponível
            if not funcionario_existente:
                return True
            
            # Se encontrou mas é o mesmo funcionário que está sendo editado, está disponível
            if funcionario_id_ignorar and funcionario_existente['id'] == funcionario_id_ignorar:
                return True
            
            # Senão, já está em uso
            return False
        
        except Exception as e:
            logger.error(f"Erro ao verificar nome {nome}: {str(e)}")
            raise 