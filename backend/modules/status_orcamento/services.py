"""
Services - Lógica de negócio para status de orçamento
"""
import logging
from typing import List, Dict, Any

from core.exceptions import BusinessRuleException, NotFoundException
from .repository import StatusOrcamentoRepository
from .schemas import StatusOrcamentoCreate, StatusOrcamentoUpdate, StatusOrcamentoResponse

logger = logging.getLogger(__name__)


class StatusOrcamentoService:
    """Service para status de orçamento"""
    
    def __init__(self, repository: StatusOrcamentoRepository):
        self.repository = repository
    
    async def listar(self, apenas_ativos: bool = True) -> List[StatusOrcamentoResponse]:
        """Lista todos os status"""
        status_list = await self.repository.listar(apenas_ativos)
        return [StatusOrcamentoResponse(**status) for status in status_list]
    
    async def buscar_por_id(self, status_id: str) -> StatusOrcamentoResponse:
        """Busca status por ID"""
        status = await self.repository.buscar_por_id(status_id)
        return StatusOrcamentoResponse(**status)
    
    async def criar(self, dados: StatusOrcamentoCreate) -> StatusOrcamentoResponse:
        """Cria novo status com validações"""
        try:
            # Valida ordem
            if dados.ordem < 0:
                raise BusinessRuleException("Ordem deve ser maior ou igual a zero")
            
            # Cria status
            status_dict = dados.model_dump(exclude_unset=True)
            status = await self.repository.criar(status_dict)
            
            return StatusOrcamentoResponse(**status)
            
        except BusinessRuleException:
            raise
        except Exception as e:
            logger.error(f"Erro ao criar status: {str(e)}")
            raise BusinessRuleException(f"Erro ao criar status: {str(e)}")
    
    async def atualizar(self, status_id: str, dados: StatusOrcamentoUpdate) -> StatusOrcamentoResponse:
        """Atualiza status com validações"""
        try:
            # Busca status atual
            await self.repository.buscar_por_id(status_id)
            
            # Valida ordem se fornecida
            if dados.ordem is not None and dados.ordem < 0:
                raise BusinessRuleException("Ordem deve ser maior ou igual a zero")
            
            # Atualiza
            dados_dict = dados.model_dump(exclude_unset=True)
            status = await self.repository.atualizar(status_id, dados_dict)
            
            return StatusOrcamentoResponse(**status)
            
        except NotFoundException:
            raise
        except BusinessRuleException:
            raise
        except Exception as e:
            logger.error(f"Erro ao atualizar status: {str(e)}")
            raise BusinessRuleException(f"Erro ao atualizar status: {str(e)}")
    
    async def excluir(self, status_id: str) -> bool:
        """Exclui (desativa) status"""
        try:
            return await self.repository.excluir(status_id)
            
        except NotFoundException:
            raise
        except BusinessRuleException:
            raise
        except Exception as e:
            logger.error(f"Erro ao excluir status: {str(e)}")
            raise BusinessRuleException(f"Erro ao excluir status: {str(e)}")