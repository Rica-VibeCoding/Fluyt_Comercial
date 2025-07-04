"""
Controller - Rotas da API para orçamentos
Define endpoints e validações de requisição
"""
from typing import Optional, Dict, Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from supabase import Client

from core.dependencies import get_db_with_user_context, get_current_user
from core.database import get_database as get_db
from core.exceptions import NotFoundException, BusinessRuleException
from .repository import OrcamentoRepository, FormaPagamentoRepository
from .services import OrcamentoService, FormaPagamentoService
from .schemas import (
    OrcamentoCreate, OrcamentoUpdate, OrcamentoResponse, OrcamentoListResponse,
    FormaPagamentoCreate, FormaPagamentoUpdate, FormaPagamentoResponse
)

# Router principal
router = APIRouter(prefix="/orcamentos", tags=["Orçamentos"])

# Router para formas de pagamento
forma_router = APIRouter(prefix="/formas-pagamento", tags=["Formas de Pagamento"])


# ========== ROTAS DE ORÇAMENTOS ==========

@router.get("/", response_model=OrcamentoListResponse)
async def listar_orcamentos(
    page: int = Query(1, ge=1, description="Página"),
    limit: int = Query(20, ge=1, le=100, description="Itens por página"),
    cliente_id: Optional[UUID] = Query(None, description="Filtrar por cliente"),
    status_id: Optional[UUID] = Query(None, description="Filtrar por status"),
    numero: Optional[str] = Query(None, description="Buscar por número"),
    db: Client = Depends(get_db),
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Lista orçamentos com filtros e paginação"""
    try:
        # Prepara filtros
        filtros = {}
        if cliente_id:
            filtros['cliente_id'] = str(cliente_id)
        if status_id:
            filtros['status_id'] = str(status_id)
        if numero:
            filtros['numero'] = numero
        
        # Instancia repositórios e service
        orcamento_repo = OrcamentoRepository(db)
        forma_repo = FormaPagamentoRepository(db)
        service = OrcamentoService(orcamento_repo, forma_repo)
        
        # Lista orçamentos
        resultado = await service.listar(filtros, page, limit)
        
        return OrcamentoListResponse(**resultado)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao listar orçamentos: {str(e)}"
        )


@router.get("/{orcamento_id}", response_model=OrcamentoResponse)
async def buscar_orcamento(
    orcamento_id: UUID,
    db: Client = Depends(get_db),
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Busca orçamento por ID"""
    try:
        orcamento_repo = OrcamentoRepository(db)
        forma_repo = FormaPagamentoRepository(db)
        service = OrcamentoService(orcamento_repo, forma_repo)
        
        return await service.buscar_por_id(str(orcamento_id))
        
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orçamento não encontrado"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar orçamento: {str(e)}"
        )


@router.post("/", response_model=OrcamentoResponse)
async def criar_orcamento(
    dados: OrcamentoCreate,
    db: Client = Depends(get_db),
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Cria novo orçamento"""
    try:
        orcamento_repo = OrcamentoRepository(db)
        forma_repo = FormaPagamentoRepository(db)
        service = OrcamentoService(orcamento_repo, forma_repo)
        
        return await service.criar(dados)
        
    except BusinessException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar orçamento: {str(e)}"
        )


@router.patch("/{orcamento_id}", response_model=OrcamentoResponse)
async def atualizar_orcamento(
    orcamento_id: UUID,
    dados: OrcamentoUpdate,
    db: Client = Depends(get_db),
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Atualiza orçamento existente"""
    try:
        orcamento_repo = OrcamentoRepository(db)
        forma_repo = FormaPagamentoRepository(db)
        service = OrcamentoService(orcamento_repo, forma_repo)
        
        return await service.atualizar(str(orcamento_id), dados)
        
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orçamento não encontrado"
        )
    except BusinessException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar orçamento: {str(e)}"
        )


@router.delete("/{orcamento_id}")
async def excluir_orcamento(
    orcamento_id: UUID,
    db: Client = Depends(get_db),
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Exclui orçamento"""
    try:
        orcamento_repo = OrcamentoRepository(db)
        forma_repo = FormaPagamentoRepository(db)
        service = OrcamentoService(orcamento_repo, forma_repo)
        
        sucesso = await service.excluir(str(orcamento_id))
        
        if sucesso:
            return {"message": "Orçamento excluído com sucesso"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao excluir orçamento"
            )
            
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orçamento não encontrado"
        )
    except BusinessException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir orçamento: {str(e)}"
        )


# ========== ROTAS DE FORMAS DE PAGAMENTO ==========

@router.get("/{orcamento_id}/formas-pagamento", response_model=list[FormaPagamentoResponse])
async def listar_formas_pagamento(
    orcamento_id: UUID,
    db: Client = Depends(get_db),
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Lista formas de pagamento de um orçamento"""
    try:
        forma_repo = FormaPagamentoRepository(db)
        orcamento_repo = OrcamentoRepository(db)
        service = FormaPagamentoService(forma_repo, orcamento_repo)
        
        return await service.listar_por_orcamento(str(orcamento_id))
        
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orçamento não encontrado"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao listar formas de pagamento: {str(e)}"
        )


@forma_router.get("/{forma_id}", response_model=FormaPagamentoResponse)
async def buscar_forma_pagamento(
    forma_id: UUID,
    db: Client = Depends(get_db),
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Busca forma de pagamento por ID"""
    try:
        forma_repo = FormaPagamentoRepository(db)
        orcamento_repo = OrcamentoRepository(db)
        service = FormaPagamentoService(forma_repo, orcamento_repo)
        
        return await service.buscar_por_id(str(forma_id))
        
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Forma de pagamento não encontrada"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar forma de pagamento: {str(e)}"
        )


@forma_router.post("/", response_model=FormaPagamentoResponse)
async def criar_forma_pagamento(
    dados: FormaPagamentoCreate,
    db: Client = Depends(get_db),
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Cria nova forma de pagamento"""
    try:
        forma_repo = FormaPagamentoRepository(db)
        orcamento_repo = OrcamentoRepository(db)
        service = FormaPagamentoService(forma_repo, orcamento_repo)
        
        return await service.criar(dados)
        
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orçamento não encontrado"
        )
    except BusinessException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar forma de pagamento: {str(e)}"
        )


@forma_router.patch("/{forma_id}", response_model=FormaPagamentoResponse)
async def atualizar_forma_pagamento(
    forma_id: UUID,
    dados: FormaPagamentoUpdate,
    db: Client = Depends(get_db),
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Atualiza forma de pagamento"""
    try:
        forma_repo = FormaPagamentoRepository(db)
        orcamento_repo = OrcamentoRepository(db)
        service = FormaPagamentoService(forma_repo, orcamento_repo)
        
        return await service.atualizar(str(forma_id), dados)
        
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Forma de pagamento não encontrada"
        )
    except BusinessException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar forma de pagamento: {str(e)}"
        )


@forma_router.delete("/{forma_id}")
async def excluir_forma_pagamento(
    forma_id: UUID,
    db: Client = Depends(get_db),
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Exclui forma de pagamento"""
    try:
        forma_repo = FormaPagamentoRepository(db)
        orcamento_repo = OrcamentoRepository(db)
        service = FormaPagamentoService(forma_repo, orcamento_repo)
        
        sucesso = await service.excluir(str(forma_id))
        
        if sucesso:
            return {"message": "Forma de pagamento excluída com sucesso"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao excluir forma de pagamento"
            )
            
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Forma de pagamento não encontrada"
        )
    except BusinessException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir forma de pagamento: {str(e)}"
        )