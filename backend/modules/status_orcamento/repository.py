"""
Repository - Acesso ao banco para status de orçamento
"""
import logging
from typing import List, Dict, Any, Optional

from supabase import Client
from core.exceptions import NotFoundException, DatabaseException, ConflictException, BusinessRuleException

logger = logging.getLogger(__name__)


class StatusOrcamentoRepository:
    """Repository para tabela c_status_orcamento"""
    
    def __init__(self, db: Client):
        self.db = db
        self.table = 'c_status_orcamento'
    
    async def listar(self, apenas_ativos: bool = True) -> List[Dict[str, Any]]:
        """Lista todos os status ordenados"""
        try:
            query = self.db.table(self.table).select('*')
            
            if apenas_ativos:
                query = query.eq('ativo', True)
            
            query = query.order('ordem', desc=False)
            result = query.execute()
            
            return result.data or []
            
        except Exception as e:
            logger.error(f"Erro ao listar status: {str(e)}")
            raise DatabaseException(f"Erro ao listar status: {str(e)}")
    
    async def buscar_por_id(self, status_id: str) -> Dict[str, Any]:
        """Busca status por ID"""
        try:
            result = self.db.table(self.table).select('*').eq('id', status_id).execute()
            
            if not result.data:
                raise NotFoundException(f"Status não encontrado: {status_id}")
            
            return result.data[0]
            
        except NotFoundException:
            raise
        except Exception as e:
            logger.error(f"Erro ao buscar status {status_id}: {str(e)}")
            raise DatabaseException(f"Erro ao buscar status: {str(e)}")
    
    async def buscar_por_nome(self, nome: str) -> Optional[Dict[str, Any]]:
        """Busca status por nome"""
        try:
            result = self.db.table(self.table).select('*').eq('nome', nome).execute()
            
            if result.data:
                return result.data[0]
            
            return None
            
        except Exception as e:
            logger.error(f"Erro ao buscar por nome: {str(e)}")
            raise DatabaseException(f"Erro ao buscar status: {str(e)}")
    
    async def criar(self, dados: Dict[str, Any]) -> Dict[str, Any]:
        """Cria novo status"""
        try:
            # Verifica se nome já existe
            existe = await self.buscar_por_nome(dados['nome'])
            if existe:
                raise ConflictException(f"Status '{dados['nome']}' já existe")
            
            result = self.db.table(self.table).insert(dados).execute()
            
            if not result.data:
                raise DatabaseException("Erro ao criar status")
            
            return result.data[0]
            
        except ConflictException:
            raise
        except Exception as e:
            logger.error(f"Erro ao criar status: {str(e)}")
            raise DatabaseException(f"Erro ao criar status: {str(e)}")
    
    async def atualizar(self, status_id: str, dados: Dict[str, Any]) -> Dict[str, Any]:
        """Atualiza status existente"""
        try:
            # Verifica se existe
            await self.buscar_por_id(status_id)
            
            # Se está mudando nome, verifica duplicidade
            if 'nome' in dados:
                existe = await self.buscar_por_nome(dados['nome'])
                if existe and existe['id'] != status_id:
                    raise ConflictException(f"Status '{dados['nome']}' já existe")
            
            # Remove campos None
            dados_limpos = {k: v for k, v in dados.items() if v is not None}
            
            result = self.db.table(self.table).update(dados_limpos).eq('id', status_id).execute()
            
            if not result.data:
                raise DatabaseException("Erro ao atualizar status")
            
            return result.data[0]
            
        except (NotFoundException, ConflictException):
            raise
        except Exception as e:
            logger.error(f"Erro ao atualizar status {status_id}: {str(e)}")
            raise DatabaseException(f"Erro ao atualizar status: {str(e)}")
    
    async def excluir(self, status_id: str) -> bool:
        """Marca status como inativo (soft delete)"""
        try:
            # Verifica se existe
            await self.buscar_por_id(status_id)
            
            # Verifica se há orçamentos usando este status
            orcamentos = self.db.table('c_orcamentos').select('id', count='exact').eq('status_id', status_id).execute()
            if orcamentos.count > 0:
                raise BusinessRuleException(f"Existem {orcamentos.count} orçamentos usando este status")
            
            # Marca como inativo
            result = self.db.table(self.table).update({'ativo': False}).eq('id', status_id).execute()
            
            return bool(result.data)
            
        except NotFoundException:
            raise
        except Exception as e:
            logger.error(f"Erro ao excluir status {status_id}: {str(e)}")
            raise DatabaseException(f"Erro ao excluir status: {str(e)}")