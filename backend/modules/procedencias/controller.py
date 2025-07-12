"""
Controller - Endpoints REST para Procedências
"""
import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from supabase import Client

from core.database import get_admin_database
from core.dependencies import get_current_user
from core.exceptions import NotFoundException, ConflictException, BusinessRuleException
from .repository import ProcedenciaRepository
from .services import ProcedenciaService
from .schemas import (
    ProcedenciaCreate,
    ProcedenciaUpdate, 
    ProcedenciaResponse,
    ProcedenciaListResponse
)

logger = logging.getLogger(__name__)

# Router do módulo
router = APIRouter(prefix="/procedencias", tags=["procedencias"])


@router.get("/", response_model=ProcedenciaListResponse)
async def listar_procedencias(
    apenas_ativas: bool = Query(True, description="Listar apenas procedências ativas"),
    current_user: dict = Depends(get_current_user)
):
    """Lista todas as procedências"""
    try:
        db = get_admin_database()
        repository = ProcedenciaRepository(db)
        service = ProcedenciaService(repository)
        
        procedencias = await service.listar_todas(apenas_ativas)
        
        logger.info(f"Procedências listadas: {len(procedencias)} itens (user: {getattr(current_user, 'id', 'unknown')})")
        
        return ProcedenciaListResponse(
            items=procedencias,
            total=len(procedencias)
        )
    
    except Exception as e:
        logger.error(f"Erro ao listar procedências: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/public", response_model=List[ProcedenciaResponse])
async def listar_procedencias_publico():
    """Lista procedências ativas - endpoint público para clientes"""
    try:
        db = get_admin_database()
        repository = ProcedenciaRepository(db)
        service = ProcedenciaService(repository)
        
        procedencias = await service.listar_todas(apenas_ativas=True)
        
        logger.info(f"Procedências públicas listadas: {len(procedencias)} itens")
        
        return procedencias
    
    except Exception as e:
        logger.error(f"Erro ao listar procedências públicas: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao buscar procedências"
        )


@router.get("/{procedencia_id}", response_model=ProcedenciaResponse)
async def buscar_procedencia(
    procedencia_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Busca procedência por ID"""
    try:
        db = get_admin_database()
        repository = ProcedenciaRepository(db)
        service = ProcedenciaService(repository)
        
        procedencia = await service.buscar_por_id(procedencia_id)
        
        logger.info(f"Procedência consultada: {procedencia_id} (user: {getattr(current_user, 'id', 'unknown')})")
        
        return procedencia
    
    except NotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Erro ao buscar procedência: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.post("/", response_model=ProcedenciaResponse, status_code=status.HTTP_201_CREATED)
async def criar_procedencia(
    dados: ProcedenciaCreate,
    current_user: dict = Depends(get_current_user)
):
    """Cria nova procedência"""
    try:
        db = get_admin_database()
        repository = ProcedenciaRepository(db)
        service = ProcedenciaService(repository)
        
        procedencia = await service.criar(dados)
        
        logger.info(f"Procedência criada: {procedencia.id} - {dados.nome} (user: {getattr(current_user, 'id', 'unknown')})")
        
        return procedencia
    
    except ConflictException as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )
    except BusinessRuleException as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Erro ao criar procedência: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.put("/{procedencia_id}", response_model=ProcedenciaResponse)
async def atualizar_procedencia(
    procedencia_id: str,
    dados: ProcedenciaUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Atualiza procedência existente"""
    try:
        db = get_admin_database()
        repository = ProcedenciaRepository(db)
        service = ProcedenciaService(repository)
        
        procedencia = await service.atualizar(procedencia_id, dados)
        
        logger.info(f"Procedência atualizada: {procedencia_id} (user: {getattr(current_user, 'id', 'unknown')})")
        
        return procedencia
    
    except NotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except ConflictException as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )
    except BusinessRuleException as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Erro ao atualizar procedência: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.delete("/{procedencia_id}")
async def deletar_procedencia(
    procedencia_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Soft delete de procedência"""
    try:
        db = get_admin_database()
        repository = ProcedenciaRepository(db)
        service = ProcedenciaService(repository)
        
        sucesso = await service.deletar(procedencia_id)
        
        if not sucesso:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não foi possível deletar a procedência"
            )
        
        logger.info(f"Procedência deletada: {procedencia_id} (user: {getattr(current_user, 'id', 'unknown')})")
        
        return {"message": "Procedência removida com sucesso"}
    
    except NotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except BusinessRuleException as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Erro ao deletar procedência: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/buscar/{termo}", response_model=List[ProcedenciaResponse])
async def buscar_procedencias_por_nome(
    termo: str,
    current_user: dict = Depends(get_current_user)
):
    """Busca procedências por termo no nome"""
    try:
        db = get_admin_database()
        repository = ProcedenciaRepository(db)
        service = ProcedenciaService(repository)
        
        procedencias = await service.buscar_por_nome(termo)
        
        logger.info(f"Busca de procedências: '{termo}' - {len(procedencias)} resultados")
        
        return procedencias
    
    except Exception as e:
        logger.error(f"Erro ao buscar procedências por nome: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )