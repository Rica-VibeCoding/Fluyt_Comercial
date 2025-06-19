"""
Conexão com Supabase e configuração do cliente
"""
from supabase import create_client, Client
from typing import Optional, Dict, Any
import logging
from functools import lru_cache
from .config import settings

logger = logging.getLogger(__name__)


class SupabaseClient:
    """Gerenciador de conexão com Supabase"""
    
    def __init__(self):
        self._client: Optional[Client] = None
        self._admin_client: Optional[Client] = None
    
    @property
    def client(self) -> Client:
        """Cliente com chave anônima (para operações públicas)"""
        if not self._client:
            self._client = create_client(
                settings.supabase_url,
                settings.supabase_anon_key
            )
            logger.info("Cliente Supabase inicializado (anon key)")
        return self._client
    
    @property
    def admin(self) -> Client:
        """Cliente com service key (para operações administrativas)"""
        if not self._admin_client:
            self._admin_client = create_client(
                settings.supabase_url,
                settings.supabase_service_key
            )
            logger.info("Cliente Supabase Admin inicializado (service key)")
        return self._admin_client
    
    def get_client_with_auth(self, access_token: str) -> Client:
        """
        Retorna cliente com token de autenticação específico
        Usado para operações com RLS (Row Level Security)
        """
        client = create_client(
            settings.supabase_url,
            settings.supabase_anon_key,
            options={
                "headers": {
                    "Authorization": f"Bearer {access_token}"
                }
            }
        )
        return client
    
    async def health_check(self) -> Dict[str, Any]:
        """Verifica se a conexão com Supabase está funcionando"""
        try:
            # Tenta uma query simples
            result = self.client.table('c_clientes').select('id').limit(1).execute()
            return {
                "status": "healthy",
                "database": "connected",
                "message": "Supabase connection successful"
            }
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return {
                "status": "unhealthy",
                "database": "disconnected",
                "error": str(e)
            }


# Instância singleton
_supabase = SupabaseClient()


def get_supabase() -> SupabaseClient:
    """Retorna instância do cliente Supabase"""
    return _supabase


def get_database() -> Client:
    """
    Dependency para FastAPI - retorna cliente Supabase padrão
    
    Uso:
    ```python
    @router.get("/")
    async def list_items(db: Client = Depends(get_database)):
        result = db.table('items').select('*').execute()
        return result.data
    ```
    """
    return _supabase.client


def get_admin_database() -> Client:
    """
    Dependency para FastAPI - retorna cliente admin
    Use apenas para operações administrativas que bypassam RLS
    """
    return _supabase.admin


async def get_database_with_rls(token: str) -> Client:
    """
    Retorna cliente com RLS baseado no token do usuário
    
    Uso:
    ```python
    db = await get_database_with_rls(current_user.access_token)
    # Queries agora respeitam RLS do usuário
    ```
    """
    return _supabase.get_client_with_auth(token)


# Funções auxiliares para queries comuns
class DatabaseUtils:
    """Utilitários para operações comuns no banco"""
    
    @staticmethod
    def apply_pagination(query, page: int = 1, limit: int = None):
        """Aplica paginação a uma query"""
        if limit is None:
            limit = settings.default_items_per_page
        
        offset = (page - 1) * limit
        return query.limit(limit).offset(offset)
    
    @staticmethod
    def apply_ordering(query, order_by: str, order_desc: bool = False):
        """Aplica ordenação a uma query"""
        return query.order(order_by, desc=order_desc)
    
    @staticmethod
    def apply_filters(query, filters: Dict[str, Any]):
        """Aplica filtros dinâmicos a uma query"""
        for field, value in filters.items():
            if value is not None:
                if isinstance(value, str) and '%' in value:
                    # Se tem %, usa LIKE
                    query = query.like(field, value)
                else:
                    # Senão, usa igualdade
                    query = query.eq(field, value)
        return query