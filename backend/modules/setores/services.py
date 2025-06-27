"""
Services - Lógica de negócio para setores
Camada intermediária entre os controllers e o repository
"""
import logging
from typing import Dict, Any, Optional

from core.database import get_database
from core.auth import User
from core.dependencies import PaginationParams
from core.exceptions import ValidationException, NotFoundException

from .repository import SetorRepository
from .schemas import (
    SetorCreate,
    SetorUpdate,
    SetorResponse,
    SetorListResponse,
    FiltrosSetor
)
from .validations import (
    validar_permissao_admin,
    validar_permissao_super_admin,
    validar_setor_com_funcionarios,
    validar_dados_setor
)

logger = logging.getLogger(__name__)


class SetorService:
    """
    Serviço principal para operações com setores
    """
    
    def __init__(self):
        """
        Inicializa o serviço
        """
        pass
    
    async def listar_setores(
        self,
        user: User,
        filtros: FiltrosSetor,
        pagination: PaginationParams
    ) -> SetorListResponse:
        """
        Lista setores com filtros e paginação
        
        Args:
            user: Usuário logado
            filtros: Filtros a aplicar
            pagination: Parâmetros de paginação
            
        Returns:
            Lista paginada de setores
        """
        try:
            # SETORES SÃO GLOBAIS - todos os usuários podem ver todos os setores
            
            # Conecta com o banco
            db = get_database()
            repository = SetorRepository(db)
            
            # Converte filtros para dicionário
            filtros_dict = {}
            if filtros.busca:
                filtros_dict['busca'] = filtros.busca
            if filtros.ativo is not None:
                filtros_dict['ativo'] = filtros.ativo
            if filtros.data_inicio:
                filtros_dict['data_inicio'] = filtros.data_inicio
            if filtros.data_fim:
                filtros_dict['data_fim'] = filtros.data_fim
            
            # Busca no repository
            resultado = await repository.listar(
                filtros=filtros_dict,
                page=pagination.page,
                limit=pagination.limit
            )
            
            # Converte para response model
            setores = [SetorResponse(**item) for item in resultado['items']]
            
            return SetorListResponse(
                items=setores,
                total=resultado['total'],
                page=resultado['page'],
                limit=resultado['limit'],
                pages=resultado['pages']
            )
        
        except Exception as e:
            logger.error(f"Erro ao listar setores para usuário {user.id}: {str(e)}")
            raise
    
    async def buscar_setor_por_id(self, user: User, setor_id: str) -> SetorResponse:
        """
        Busca um setor específico
        
        Args:
            user: Usuário logado
            setor_id: ID do setor
            
        Returns:
            Dados completos do setor
        """
        try:
            # SETORES SÃO GLOBAIS - qualquer usuário pode ver qualquer setor
            
            # Conecta com o banco
            db = get_database()
            repository = SetorRepository(db)
            
            # Busca o setor
            setor_data = await repository.buscar_por_id(setor_id)
            
            return SetorResponse(**setor_data)
        
        except Exception as e:
            logger.error(f"Erro ao buscar setor {setor_id}: {str(e)}")
            raise
    
    async def criar_setor(self, user: User, dados: SetorCreate) -> SetorResponse:
        """
        Cria um novo setor
        
        Args:
            user: Usuário logado (admin)
            dados: Dados do setor a ser criado
            
        Returns:
            Setor criado
        """
        try:
            # Valida permissão usando validação centralizada
            validar_permissao_admin(user, "criar setores")
            
            # SETORES SÃO GLOBAIS - qualquer admin pode criar
            
            # Conecta com o banco
            db = get_database()
            repository = SetorRepository(db)
            
            # Converte dados para dicionário
            dados_setor = dados.model_dump(exclude_unset=True)
            
            # Valida dados do setor
            validar_dados_setor(dados_setor)
            
            # Cria o setor
            setor_criado = await repository.criar(dados_setor)
            
            # Busca o setor completo (com contagem de funcionários)
            setor_completo = await repository.buscar_por_id(setor_criado['id'])
            
            logger.info(f"Setor criado: {setor_completo['id']} por usuário {user.id}")
            
            return SetorResponse(**setor_completo)
        
        except Exception as e:
            logger.error(f"Erro ao criar setor: {str(e)}")
            raise
    
    async def atualizar_setor(
        self,
        user: User,
        setor_id: str,
        dados: SetorUpdate
    ) -> SetorResponse:
        """
        Atualiza dados de um setor
        
        Args:
            user: Usuário logado
            setor_id: ID do setor
            dados: Dados a atualizar
            
        Returns:
            Setor atualizado
        """
        try:
            # Valida permissão usando validação centralizada
            validar_permissao_admin(user, "atualizar setores")
            
            # SETORES SÃO GLOBAIS - qualquer admin pode atualizar
            
            # Conecta com o banco
            db = get_database()
            repository = SetorRepository(db)
            
            # Converte dados para dicionário (apenas campos não None)
            dados_atualizacao = dados.model_dump(exclude_unset=True, exclude_none=True)
            
            if not dados_atualizacao:
                raise ValidationException("Nenhum dado fornecido para atualização")
            
            # Valida dados do setor
            validar_dados_setor(dados_atualizacao)
            
            # Atualiza o setor
            await repository.atualizar(setor_id, dados_atualizacao)
            
            # Busca o setor atualizado
            setor_atualizado = await repository.buscar_por_id(setor_id)
            
            logger.info(f"Setor atualizado: {setor_id} por usuário {user.id}")
            
            return SetorResponse(**setor_atualizado)
        
        except Exception as e:
            logger.error(f"Erro ao atualizar setor {setor_id}: {str(e)}")
            raise
    
    async def excluir_setor(self, user: User, setor_id: str) -> bool:
        """
        Exclui um setor (soft delete)
        
        Args:
            user: Usuário logado
            setor_id: ID do setor
            
        Returns:
            True se excluído com sucesso
        """
        try:
            # Valida permissão usando validação centralizada
            validar_permissao_super_admin(user, "excluir setores")
            
            # SETORES SÃO GLOBAIS - super admin pode excluir qualquer setor
            
            # Conecta com o banco
            db = get_database()
            repository = SetorRepository(db)
            
            # Busca setor atual para verificar se tem funcionários
            setor_atual = await repository.buscar_por_id(setor_id)
            
            # ✅ CORREÇÃO: Verificar se o campo existe antes de usar
            total_funcionarios = setor_atual.get('total_funcionarios', 0)
            
            # Se não tem o campo, contar manualmente
            if 'total_funcionarios' not in setor_atual:
                logger.warning(f"Campo total_funcionarios não encontrado para setor {setor_id}, contando manualmente")
                total_funcionarios = await repository.contar_funcionarios(setor_id)
            
            logger.info(f"Setor {setor_id} tem {total_funcionarios} funcionários vinculados")
            
            # Valida se pode excluir (sem funcionários vinculados)
            validar_setor_com_funcionarios(
                total_funcionarios,
                setor_atual['nome']
            )
            
            # Exclui o setor
            sucesso = await repository.excluir(setor_id)
            
            if sucesso:
                logger.info(f"Setor excluído: {setor_id} por usuário {user.id}")
            
            return sucesso
        
        except Exception as e:
            logger.error(f"Erro ao excluir setor {setor_id}: {str(e)}")
            raise
    
    async def verificar_nome_disponivel(
        self,
        nome: str,
        user: User,
        setor_id_ignorar: Optional[str] = None
    ) -> bool:
        """
        Verifica se um nome de setor está disponível para uso
        
        Args:
            nome: Nome a verificar
            user: Usuário logado
            setor_id_ignorar: ID do setor a ignorar (para edição)
            
        Returns:
            True se disponível, False se já existe
        """
        try:
            # Se nome está vazio, está sempre disponível
            if not nome or nome.strip() == '':
                return True
            
            # SETORES SÃO GLOBAIS - nomes únicos globalmente
            
            # Conecta com o banco
            db = get_database()
            repository = SetorRepository(db)
            
            # Busca setor com esse nome globalmente
            setor_existente = await repository.buscar_por_nome(nome)
            
            # Se não encontrou, está disponível
            if not setor_existente:
                return True
            
            # Se encontrou mas é o mesmo setor que está sendo editado, está disponível
            if setor_id_ignorar and setor_existente['id'] == setor_id_ignorar:
                return True
            
            # Senão, já está em uso
            return False
        
        except Exception as e:
            logger.error(f"Erro ao verificar nome {nome}: {str(e)}")
            raise 