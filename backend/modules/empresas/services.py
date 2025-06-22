"""
Services - Lógica de negócio para empresas
Camada intermediária entre os controllers e o repository
"""
import logging
from typing import Dict, Any, Optional

from core.database import get_database
from core.auth import User
from core.dependencies import PaginationParams
from core.exceptions import ValidationException, NotFoundException

from .repository import EmpresaRepository
from .schemas import (
    EmpresaCreate,
    EmpresaUpdate,
    EmpresaResponse,
    EmpresaListResponse,
    FiltrosEmpresa
)

logger = logging.getLogger(__name__)


class EmpresaService:
    """
    Serviço principal para operações com empresas
    """
    
    def __init__(self):
        """
        Inicializa o serviço
        """
        pass
    
    async def listar_empresas(
        self,
        user: User,
        filtros: FiltrosEmpresa,
        pagination: PaginationParams
    ) -> EmpresaListResponse:
        """
        Lista empresas com filtros e paginação
        
        Args:
            user: Usuário logado
            filtros: Filtros a aplicar
            pagination: Parâmetros de paginação
            
        Returns:
            Lista paginada de empresas
        """
        try:
            # Apenas SUPER_ADMIN, ADMIN e ADMIN_MASTER podem listar empresas
            if user.perfil not in ["SUPER_ADMIN", "ADMIN", "ADMIN_MASTER"]:
                raise ValidationException("Acesso negado: apenas administradores podem listar empresas")
            
            # Conecta com o banco
            db = get_database()
            repository = EmpresaRepository(db)
            
            # Converte filtros para dicionário
            filtros_dict = {}
            if filtros.busca:
                filtros_dict['busca'] = filtros.busca
            if filtros.data_inicio:
                filtros_dict['data_inicio'] = filtros.data_inicio
            if filtros.data_fim:
                filtros_dict['data_fim'] = filtros.data_fim
            
            # Busca no repository - passa perfil do usuário para controle de hierarquia
            resultado = await repository.listar(
                filtros=filtros_dict,
                page=pagination.page,
                limit=pagination.limit,
                user_perfil=user.perfil
            )
            
            # Converte para response model
            empresas = [EmpresaResponse(**item) for item in resultado['items']]
            
            return EmpresaListResponse(
                items=empresas,
                total=resultado['total'],
                page=resultado['page'],
                limit=resultado['limit'],
                pages=resultado['pages']
            )
        
        except Exception as e:
            logger.error(f"Erro ao listar empresas: {str(e)}")
            raise
    
    async def buscar_empresa(self, empresa_id: str, user: User) -> EmpresaResponse:
        """
        Busca uma empresa específica
        
        Args:
            empresa_id: ID da empresa
            user: Usuário logado
            
        Returns:
            Dados completos da empresa
        """
        try:
            # Apenas SUPER_ADMIN, ADMIN e ADMIN_MASTER podem buscar empresas
            if user.perfil not in ["SUPER_ADMIN", "ADMIN", "ADMIN_MASTER"]:
                raise ValidationException("Acesso negado")
            
            # Conecta com o banco
            db = get_database()
            repository = EmpresaRepository(db)
            
            # Busca a empresa - passa perfil do usuário
            empresa_data = await repository.buscar_por_id(empresa_id, user.perfil)
            
            return EmpresaResponse(**empresa_data)
        
        except Exception as e:
            logger.error(f"Erro ao buscar empresa {empresa_id}: {str(e)}")
            raise
    
    async def criar_empresa(self, dados: EmpresaCreate, user: User) -> EmpresaResponse:
        """
        Cria uma nova empresa
        
        Args:
            dados: Dados da empresa a ser criada
            user: Usuário logado (admin)
            
        Returns:
            Empresa criada
        """
        try:
            # Apenas SUPER_ADMIN e ADMIN_MASTER podem criar empresas
            if user.perfil not in ["SUPER_ADMIN", "ADMIN_MASTER"]:
                raise ValidationException("Apenas SUPER_ADMIN ou ADMIN_MASTER podem criar empresas")
            
            # Conecta com o banco
            db = get_database()
            repository = EmpresaRepository(db)
            
            # Converte dados para dicionário
            dados_empresa = dados.model_dump(exclude_unset=True)
            
            # Cria a empresa
            empresa_criada = await repository.criar(dados_empresa)
            
            # Busca a empresa completa (com dados relacionados)
            empresa_completa = await repository.buscar_por_id(empresa_criada['id'], user.perfil)
            
            logger.info(f"Empresa criada: {empresa_completa['id']}")
            
            return EmpresaResponse(**empresa_completa)
        
        except Exception as e:
            logger.error(f"Erro ao criar empresa: {str(e)}")
            raise
    
    async def atualizar_empresa(
        self,
        empresa_id: str,
        dados: EmpresaUpdate,
        user: User
    ) -> EmpresaResponse:
        """
        Atualiza dados de uma empresa
        
        Args:
            empresa_id: ID da empresa
            dados: Dados a atualizar
            user: Usuário logado
            
        Returns:
            Empresa atualizada
        """
        try:
            # Apenas SUPER_ADMIN e ADMIN_MASTER podem atualizar empresas
            if user.perfil not in ["SUPER_ADMIN", "ADMIN_MASTER"]:
                raise ValidationException("Apenas SUPER_ADMIN ou ADMIN_MASTER podem atualizar empresas")
            
            # Conecta com o banco
            db = get_database()
            repository = EmpresaRepository(db)
            
            # Converte dados para dicionário (apenas campos não None)
            dados_atualizacao = dados.model_dump(exclude_unset=True, exclude_none=True)
            
            if not dados_atualizacao:
                raise ValidationException("Nenhum dado fornecido para atualização")
            
            # Atualiza a empresa
            await repository.atualizar(empresa_id, dados_atualizacao)
            
            # Busca a empresa atualizada
            empresa_atualizada = await repository.buscar_por_id(empresa_id, user.perfil)
            
            logger.info(f"Empresa atualizada: {empresa_id}")
            
            return EmpresaResponse(**empresa_atualizada)
        
        except Exception as e:
            logger.error(f"Erro ao atualizar empresa {empresa_id}: {str(e)}")
            raise
    
    async def excluir_empresa(self, empresa_id: str, user: User) -> bool:
        """
        Exclui uma empresa PERMANENTEMENTE do banco de dados (hard delete)
        
        ATENÇÃO: Esta operação é IRREVERSÍVEL!
        Remove completamente a empresa do banco, mas apenas se não houver dependências.
        
        Args:
            empresa_id: ID da empresa
            user: Usuário logado
            
        Returns:
            True se excluído com sucesso
        """
        try:
            # Apenas SUPER_ADMIN e ADMIN_MASTER podem excluir empresas
            if user.perfil not in ["SUPER_ADMIN", "ADMIN_MASTER"]:
                raise ValidationException("Apenas SUPER_ADMIN ou ADMIN_MASTER podem excluir empresas")
            
            # Conecta com o banco
            db = get_database()
            repository = EmpresaRepository(db)
            
            # O repository fará todas as verificações de dependências
            # e lançará ConflictException se houver lojas ou contratos vinculados
            sucesso = await repository.excluir(empresa_id)
            
            if sucesso:
                logger.warning(f"EXCLUSÃO PERMANENTE: Empresa {empresa_id} removida do banco de dados")
            
            return sucesso
        
        except Exception as e:
            logger.error(f"Erro ao excluir empresa {empresa_id}: {str(e)}")
            raise

    async def desativar_empresa(self, empresa_id: str, user: User) -> bool:
        """
        Desativa uma empresa (soft delete - apenas marca como inativa)
        
        Args:
            empresa_id: ID da empresa
            user: Usuário logado
            
        Returns:
            True se desativado com sucesso
        """
        try:
            # Apenas SUPER_ADMIN e ADMIN_MASTER podem desativar empresas
            if user.perfil not in ["SUPER_ADMIN", "ADMIN_MASTER"]:
                raise ValidationException("Apenas SUPER_ADMIN ou ADMIN_MASTER podem desativar empresas")
            
            # Conecta com o banco
            db = get_database()
            repository = EmpresaRepository(db)
            
            # Desativa a empresa (soft delete)
            sucesso = await repository.desativar(empresa_id)
            
            if sucesso:
                logger.info(f"Empresa desativada: {empresa_id}")
            
            return sucesso
        
        except Exception as e:
            logger.error(f"Erro ao desativar empresa {empresa_id}: {str(e)}")
            raise
    
    async def verificar_cnpj_disponivel(
        self,
        cnpj: str,
        user: User,
        empresa_id_ignorar: Optional[str] = None
    ) -> bool:
        """
        Verifica se um CNPJ está disponível para uso
        
        Args:
            cnpj: CNPJ a verificar
            user: Usuário logado
            empresa_id_ignorar: ID da empresa a ignorar (para edição)
            
        Returns:
            True se disponível, False se já existe
        """
        try:
            # Se CNPJ está vazio, está sempre disponível
            if not cnpj or cnpj.strip() == '':
                return True
                
            # Apenas admins podem verificar CNPJ
            if user.perfil not in ["SUPER_ADMIN", "ADMIN", "ADMIN_MASTER"]:
                raise ValidationException("Acesso negado: apenas administradores podem verificar CNPJ")
            
            # Conecta com o banco
            db = get_database()
            repository = EmpresaRepository(db)
            
            # Busca empresa com esse CNPJ (busca em todas as empresas para verificação completa)
            empresa_existente = await repository.buscar_por_cnpj(cnpj, "SUPER_ADMIN")
            
            # Se não encontrou, está disponível
            if not empresa_existente:
                return True
            
            # Se encontrou mas é a mesma empresa que está sendo editada, está disponível
            if empresa_id_ignorar and empresa_existente['id'] == empresa_id_ignorar:
                return True
            
            # Senão, já está em uso
            return False
        
        except Exception as e:
            logger.error(f"Erro ao verificar CNPJ {cnpj}: {str(e)}")
            raise
    
    async def verificar_nome_disponivel(
        self,
        nome: str,
        user: User,
        empresa_id_ignorar: Optional[str] = None
    ) -> bool:
        """
        Verifica se um nome de empresa está disponível para uso
        
        Args:
            nome: Nome a verificar
            user: Usuário logado
            empresa_id_ignorar: ID da empresa a ignorar (para edição)
            
        Returns:
            True se disponível, False se já existe
        """
        try:
            # Se nome está vazio, não está disponível
            if not nome or nome.strip() == '':
                return False
                
            # Apenas admins podem verificar nome
            if user.perfil not in ["SUPER_ADMIN", "ADMIN", "ADMIN_MASTER"]:
                raise ValidationException("Acesso negado: apenas administradores podem verificar nomes")
            
            # Conecta com o banco
            db = get_database()
            repository = EmpresaRepository(db)
            
            # Busca empresa com esse nome (busca em todas as empresas para verificação completa)
            empresa_existente = await repository.buscar_por_nome(nome.strip(), "SUPER_ADMIN")
            
            # Se não encontrou, está disponível
            if not empresa_existente:
                return True
            
            # Se encontrou mas é a mesma empresa que está sendo editada, está disponível
            if empresa_id_ignorar and empresa_existente['id'] == empresa_id_ignorar:
                return True
            
            # Senão, já está em uso
            return False
        
        except Exception as e:
            logger.error(f"Erro ao verificar nome {nome}: {str(e)}")
            raise
 