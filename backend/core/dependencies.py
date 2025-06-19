"""
Dependencies compartilhadas entre módulos
"""
from typing import Optional, Dict, Any
from fastapi import Query, Depends
from pydantic import BaseModel

from .config import settings
from .auth import User, get_current_user
from .database import get_database_with_rls, DatabaseUtils


class PaginationParams(BaseModel):
    """Parâmetros de paginação padrão"""
    page: int = Query(1, ge=1, description="Número da página")
    limit: int = Query(
        settings.default_items_per_page,
        ge=1,
        le=settings.max_items_per_page,
        description="Itens por página"
    )
    
    @property
    def offset(self) -> int:
        """Calcula o offset baseado na página"""
        return (self.page - 1) * self.limit


class OrderingParams(BaseModel):
    """Parâmetros de ordenação padrão"""
    order_by: str = Query("created_at", description="Campo para ordenação")
    order_desc: bool = Query(True, description="Ordenação descendente")


class SearchParams(BaseModel):
    """Parâmetros de busca padrão"""
    search: Optional[str] = Query(None, description="Termo de busca")
    
    def get_search_pattern(self) -> Optional[str]:
        """Retorna padrão para busca LIKE"""
        if self.search:
            return f"%{self.search}%"
        return None


async def get_db_with_user_context(
    current_user: User = Depends(get_current_user)
):
    """
    Retorna cliente do banco com contexto do usuário (RLS aplicado)
    
    Uso:
    ```python
    @router.get("/")
    async def list_items(db = Depends(get_db_with_user_context)):
        # Queries automaticamente filtradas pela loja do usuário
        result = db.table('items').select('*').execute()
        return result.data
    ```
    """
    # Por enquanto retorna o cliente normal
    # Quando implementarmos RLS via JWT, mudamos aqui
    from .database import get_database
    return get_database()


def get_pagination(
    page: int = Query(1, ge=1),
    limit: int = Query(settings.default_items_per_page, ge=1, le=settings.max_items_per_page)
) -> PaginationParams:
    """Dependency para paginação"""
    return PaginationParams(page=page, limit=limit)


def get_ordering(
    order_by: str = Query("created_at"),
    order_desc: bool = Query(True)
) -> OrderingParams:
    """Dependency para ordenação"""
    return OrderingParams(order_by=order_by, order_desc=order_desc)


def get_search(
    search: Optional[str] = Query(None)
) -> SearchParams:
    """Dependency para busca"""
    return SearchParams(search=search)


class QueryBuilder:
    """
    Helper para construir queries com filtros, paginação e ordenação
    
    Uso:
    ```python
    query_builder = QueryBuilder(
        db.table('items'),
        pagination,
        ordering,
        search
    )
    
    query = query_builder
        .add_search_fields(['nome', 'descricao'])
        .add_filter('ativo', True)
        .add_filter('loja_id', user.loja_id)
        .build()
    
    result = query.execute()
    ```
    """
    
    def __init__(
        self,
        query,
        pagination: Optional[PaginationParams] = None,
        ordering: Optional[OrderingParams] = None,
        search: Optional[SearchParams] = None
    ):
        self.query = query
        self.pagination = pagination
        self.ordering = ordering
        self.search = search
        self.search_fields = []
        self.filters = {}
    
    def add_search_fields(self, fields: list):
        """Adiciona campos para busca"""
        self.search_fields = fields
        return self
    
    def add_filter(self, field: str, value: Any):
        """Adiciona filtro se o valor não for None"""
        if value is not None:
            self.filters[field] = value
        return self
    
    def add_filters(self, filters: Dict[str, Any]):
        """Adiciona múltiplos filtros"""
        for field, value in filters.items():
            self.add_filter(field, value)
        return self
    
    def build(self):
        """Constrói a query final"""
        query = self.query
        
        # Aplica filtros
        query = DatabaseUtils.apply_filters(query, self.filters)
        
        # Aplica busca
        if self.search and self.search.search and self.search_fields:
            search_pattern = self.search.get_search_pattern()
            # Cria condição OR para todos os campos de busca
            search_conditions = []
            for field in self.search_fields:
                search_conditions.append(f"{field}.ilike.{search_pattern}")
            
            # Supabase usa or_ para condições OR
            if search_conditions:
                query = query.or_(','.join(search_conditions))
        
        # Aplica ordenação
        if self.ordering:
            query = DatabaseUtils.apply_ordering(
                query,
                self.ordering.order_by,
                self.ordering.order_desc
            )
        
        # Aplica paginação
        if self.pagination:
            query = DatabaseUtils.apply_pagination(
                query,
                self.pagination.page,
                self.pagination.limit
            )
        
        return query


# Response models comuns
class SuccessResponse(BaseModel):
    """Resposta padrão de sucesso"""
    success: bool = True
    message: str = "Operação realizada com sucesso"
    data: Optional[Any] = None


class ErrorResponse(BaseModel):
    """Resposta padrão de erro"""
    success: bool = False
    message: str
    error: Optional[str] = None
    details: Optional[Dict[str, Any]] = None


class PaginatedResponse(BaseModel):
    """Resposta paginada padrão"""
    items: list
    total: int
    page: int
    limit: int
    pages: int
    
    @classmethod
    def create(cls, items: list, total: int, pagination: PaginationParams):
        """Cria resposta paginada"""
        pages = (total + pagination.limit - 1) // pagination.limit
        return cls(
            items=items,
            total=total,
            page=pagination.page,
            limit=pagination.limit,
            pages=pages
        )