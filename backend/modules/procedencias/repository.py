"""
Repository para operações de banco de dados - Procedências
"""
import logging
from typing import List, Optional, Dict, Any
from supabase import Client
from .schemas import ProcedenciaCreate, ProcedenciaUpdate

logger = logging.getLogger(__name__)


class ProcedenciaRepository:
    """Repository para gerenciar operações de procedências no Supabase"""
    
    def __init__(self, db: Client):
        self.db = db
        self.table_name = "c_procedencias"
    
    async def listar_todas(self, apenas_ativas: bool = False) -> List[Dict[str, Any]]:
        """Lista todas as procedências - otimizado para buscar apenas os campos essenciais"""
        try:
            # ✨ Otimização: Selecionar apenas as colunas necessárias para o frontend.
            # Adicionado 'created_at' para cumprir o schema de resposta da API (ProcedenciaResponse)
            # e evitar que a chamada falhe, o que acionava o fallback no frontend.
            query = self.db.table(self.table_name).select("id, nome, ativo, created_at")
            
            if apenas_ativas:
                query = query.eq("ativo", True)
            
            result = query.order("nome").execute()
            return result.data or []
        
        except Exception as e:
            logger.error(f"Erro ao listar procedências: {str(e)}")
            raise
    
    async def buscar_por_id(self, procedencia_id: str) -> Optional[Dict[str, Any]]:
        """Busca procedência por ID"""
        try:
            result = self.db.table(self.table_name).select("*").eq("id", procedencia_id).execute()
            return result.data[0] if result.data else None
        
        except Exception as e:
            logger.error(f"Erro ao buscar procedência {procedencia_id}: {str(e)}")
            raise
    
    async def buscar_por_nome(self, nome: str) -> Optional[Dict[str, Any]]:
        """Busca procedência por nome"""
        try:
            result = self.db.table(self.table_name).select("*").eq("nome", nome).execute()
            return result.data[0] if result.data else None
        
        except Exception as e:
            logger.error(f"Erro ao buscar procedência por nome {nome}: {str(e)}")
            raise
    
    async def criar(self, dados: ProcedenciaCreate) -> Dict[str, Any]:
        """Cria nova procedência"""
        try:
            procedencia_data = dados.model_dump()
            result = self.db.table(self.table_name).insert(procedencia_data).execute()
            return result.data[0]
        
        except Exception as e:
            logger.error(f"Erro ao criar procedência: {str(e)}")
            raise
    
    async def atualizar(self, procedencia_id: str, dados: ProcedenciaUpdate) -> Optional[Dict[str, Any]]:
        """Atualiza procedência existente"""
        try:
            # Filtrar apenas campos não-None
            update_data = {k: v for k, v in dados.model_dump().items() if v is not None}
            
            if not update_data:
                return await self.buscar_por_id(procedencia_id)
            
            result = self.db.table(self.table_name).update(update_data).eq("id", procedencia_id).execute()
            return result.data[0] if result.data else None
        
        except Exception as e:
            logger.error(f"Erro ao atualizar procedência {procedencia_id}: {str(e)}")
            raise
    
    async def deletar(self, procedencia_id: str) -> bool:
        """Soft delete - marca como inativo"""
        try:
            result = self.db.table(self.table_name).update({"ativo": False}).eq("id", procedencia_id).execute()
            return len(result.data) > 0
        
        except Exception as e:
            logger.error(f"Erro ao deletar procedência {procedencia_id}: {str(e)}")
            raise
    
    async def verificar_nome_disponivel(self, nome: str, excluir_id: Optional[str] = None) -> bool:
        """Verifica se nome está disponível"""
        try:
            query = self.db.table(self.table_name).select("id").eq("nome", nome)
            
            if excluir_id:
                query = query.neq("id", excluir_id)
            
            result = query.execute()
            return len(result.data) == 0
        
        except Exception as e:
            logger.error(f"Erro ao verificar nome disponível: {str(e)}")
            raise