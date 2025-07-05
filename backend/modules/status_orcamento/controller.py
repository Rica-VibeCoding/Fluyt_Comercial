"""
Controller - Rotas da API para status de orçamento
"""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from supabase import Client

from core.dependencies import get_db_with_user_context, get_current_user
from core.database import get_database as get_db
from core.exceptions import NotFoundException, BusinessRuleException, ConflictException
from .repository import StatusOrcamentoRepository
from .services import StatusOrcamentoService
from .schemas import (
    StatusOrcamentoCreate, 
    StatusOrcamentoUpdate, 
    StatusOrcamentoResponse,
    StatusOrcamentoListResponse
)

router = APIRouter(prefix="/status-orcamento", tags=["Status de Orçamento"])


@router.get("/", response_model=StatusOrcamentoListResponse)
async def listar_status(
    apenas_ativos: bool = Query(True, description="Listar apenas status ativos"),
    db: Client = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Lista todos os status de orçamento ordenados"""
    try:
        repository = StatusOrcamentoRepository(db)
        service = StatusOrcamentoService(repository)
        
        items = await service.listar(apenas_ativos)
        
        return StatusOrcamentoListResponse(
            items=items,
            total=len(items)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao listar status: {str(e)}"
        )


@router.get("/{status_id}", response_model=StatusOrcamentoResponse)
async def buscar_status(
    status_id: UUID,
    db: Client = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Busca status por ID"""
    try:
        repository = StatusOrcamentoRepository(db)
        service = StatusOrcamentoService(repository)
        
        return await service.buscar_por_id(str(status_id))
        
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Status não encontrado"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar status: {str(e)}"
        )


@router.post("/", response_model=StatusOrcamentoResponse)
async def criar_status(
    dados: StatusOrcamentoCreate,
    db: Client = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Cria novo status de orçamento"""
    try:
        repository = StatusOrcamentoRepository(db)
        service = StatusOrcamentoService(repository)
        
        return await service.criar(dados)
        
    except ConflictException as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )
    except BusinessRuleException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar status: {str(e)}"
        )


@router.patch("/{status_id}", response_model=StatusOrcamentoResponse)
async def atualizar_status(
    status_id: UUID,
    dados: StatusOrcamentoUpdate,
    db: Client = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Atualiza status existente"""
    try:
        repository = StatusOrcamentoRepository(db)
        service = StatusOrcamentoService(repository)
        
        return await service.atualizar(str(status_id), dados)
        
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Status não encontrado"
        )
    except ConflictException as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )
    except BusinessRuleException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar status: {str(e)}"
        )


@router.delete("/{status_id}")
async def excluir_status(
    status_id: UUID,
    db: Client = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Desativa status (soft delete)"""
    try:
        repository = StatusOrcamentoRepository(db)
        service = StatusOrcamentoService(repository)
        
        sucesso = await service.excluir(str(status_id))
        
        if sucesso:
            return {"message": "Status desativado com sucesso"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao desativar status"
            )
            
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Status não encontrado"
        )
    except BusinessRuleException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir status: {str(e)}"
        )