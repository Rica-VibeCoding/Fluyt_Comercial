"""
Services - Lógica de negócio para lojas
Camada intermediária entre os controllers e o repository
"""
import logging
from typing import Dict, Any, Optional

from core.database import get_database
from core.auth import User
from core.dependencies import PaginationParams
from core.exceptions import ValidationException, NotFoundException

from .repository import LojaRepository
from .schemas import (
    LojaCreate,
    LojaUpdate,
    LojaResponse,
    LojaListResponse,
    FiltrosLoja
)

logger = logging.getLogger(__name__)


class LojaService:
    """
    Serviço principal para operações com lojas
    """
    
    def __init__(self):
        """
        Inicializa o serviço
        """
        pass
    
    async def listar_lojas(
        self,
        user: User,
        filtros: FiltrosLoja,
        pagination: PaginationParams
    ) -> LojaListResponse:
        """
        Lista lojas com filtros e paginação
        
        Args:
            user: Usuário logado
            filtros: Filtros a aplicar
            pagination: Parâmetros de paginação
            
        Returns:
            Lista paginada de lojas
        """
        try:
            # Conecta com o banco
            db = get_database()
            repository = LojaRepository(db)
            
            # Converte filtros para dicionário
            filtros_dict = {}
            if filtros.busca:
                filtros_dict['busca'] = filtros.busca
            if filtros.empresa_id:
                filtros_dict['empresa_id'] = filtros.empresa_id
            if filtros.gerente_id:
                filtros_dict['gerente_id'] = filtros.gerente_id
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
            lojas = [LojaResponse(**item) for item in resultado['items']]
            
            return LojaListResponse(
                items=lojas,
                total=resultado['total'],
                page=resultado['page'],
                limit=resultado['limit'],
                pages=resultado['pages']
            )
        
        except Exception as e:
            logger.error(f"Erro ao listar lojas para usuário {user.id}: {str(e)}")
            raise
    
    async def buscar_loja_por_id(self, user: User, loja_id: str) -> LojaResponse:
        """
        Busca uma loja específica
        
        Args:
            user: Usuário logado
            loja_id: ID da loja
            
        Returns:
            Dados completos da loja
        """
        try:
            # Conecta com o banco
            db = get_database()
            repository = LojaRepository(db)
            
            # Busca a loja
            loja_data = await repository.buscar_por_id(loja_id)
            
            return LojaResponse(**loja_data)
        
        except Exception as e:
            logger.error(f"Erro ao buscar loja {loja_id}: {str(e)}")
            raise
    
    async def criar_loja(self, user: User, dados: LojaCreate) -> LojaResponse:
        """
        Cria uma nova loja
        
        Args:
            user: Usuário logado (admin)
            dados: Dados da loja a ser criada
            
        Returns:
            Loja criada
        """
        try:
            # Apenas admins podem criar lojas
            if user.perfil not in ['ADMIN', 'SUPER_ADMIN']:
                raise ValidationException("Apenas administradores podem criar lojas")
            
            # Conecta com o banco
            db = get_database()
            repository = LojaRepository(db)
            
            # Converte dados para dicionário
            dados_loja = dados.model_dump(exclude_unset=True)
            
            # Cria a loja
            loja_criada = await repository.criar(dados_loja)
            
            # Busca a loja completa (com dados relacionados)
            loja_completa = await repository.buscar_por_id(loja_criada['id'])
            
            logger.info(f"Loja criada: {loja_completa['id']} por usuário {user.id}")
            
            return LojaResponse(**loja_completa)
        
        except Exception as e:
            logger.error(f"Erro ao criar loja: {str(e)}")
            raise
    
    async def atualizar_loja(
        self,
        user: User,
        loja_id: str,
        dados: LojaUpdate
    ) -> LojaResponse:
        """
        Atualiza dados de uma loja
        
        Args:
            user: Usuário logado
            loja_id: ID da loja
            dados: Dados a atualizar
            
        Returns:
            Loja atualizada
        """
        try:
            # Apenas admins podem atualizar lojas
            if user.perfil not in ['ADMIN', 'SUPER_ADMIN']:
                raise ValidationException("Apenas administradores podem atualizar lojas")
            
            # Conecta com o banco
            db = get_database()
            repository = LojaRepository(db)
            
            # Converte dados para dicionário (apenas campos não None)
            dados_atualizacao = dados.model_dump(exclude_unset=True, exclude_none=True)
            
            if not dados_atualizacao:
                raise ValidationException("Nenhum dado fornecido para atualização")
            
            # Atualiza a loja
            await repository.atualizar(loja_id, dados_atualizacao)
            
            # Busca a loja atualizada
            loja_atualizada = await repository.buscar_por_id(loja_id)
            
            logger.info(f"Loja atualizada: {loja_id} por usuário {user.id}")
            
            return LojaResponse(**loja_atualizada)
        
        except Exception as e:
            logger.error(f"Erro ao atualizar loja {loja_id}: {str(e)}")
            raise
    
    async def excluir_loja(self, user: User, loja_id: str) -> bool:
        """
        Exclui uma loja (soft delete)
        
        Args:
            user: Usuário logado
            loja_id: ID da loja
            
        Returns:
            True se excluída com sucesso
        """
        try:
            # Apenas SUPER_ADMIN pode excluir lojas
            if user.perfil != "SUPER_ADMIN":
                raise ValidationException("Apenas super administradores podem excluir lojas")
            
            # Conecta com o banco
            db = get_database()
            repository = LojaRepository(db)
            
            # Exclui a loja
            sucesso = await repository.excluir(loja_id)
            
            if sucesso:
                logger.info(f"Loja excluída: {loja_id} por usuário {user.id}")
            
            return sucesso
        
        except Exception as e:
            logger.error(f"Erro ao excluir loja {loja_id}: {str(e)}")
            raise
    
    async def verificar_nome_disponivel(
        self,
        nome: str,
        user: User,
        loja_id_ignorar: Optional[str] = None
    ) -> bool:
        """
        Verifica se um nome de loja está disponível para uso
        
        Args:
            nome: Nome a verificar
            user: Usuário logado
            loja_id_ignorar: ID da loja a ignorar (para edição)
            
        Returns:
            True se disponível, False se já existe
        """
        try:
            # Se nome está vazio, está sempre disponível
            if not nome or nome.strip() == '':
                return True
            
            # Conecta com o banco
            db = get_database()
            repository = LojaRepository(db)
            
            # Busca loja com esse nome
            loja_existente = await repository.buscar_por_nome(nome)
            
            # Se não encontrou, está disponível
            if not loja_existente:
                return True
            
            # Se encontrou mas é a mesma loja que está sendo editada, está disponível
            if loja_id_ignorar and loja_existente['id'] == loja_id_ignorar:
                return True
            
            # Senão, já está em uso
            return False
        
        except Exception as e:
            logger.error(f"Erro ao verificar nome {nome}: {str(e)}")
            raise 