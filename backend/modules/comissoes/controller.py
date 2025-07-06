"""
Controller para Regras de Comissão
Define rotas da API FastAPI para gerenciamento de comissões
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from uuid import UUID

from core.dependencies import get_current_user, get_db_with_user_context
from .schemas import (
    RegraComissaoCreate,
    RegraComissaoUpdate,
    RegraComissaoResponse, 
    RegraComissaoListResponse,
    CalculoComissaoRequest,
    CalculoComissaoResponse
)
from .services import ComissoesService

router = APIRouter(prefix="/api/v1/comissoes", tags=["Regras de Comissão"])


@router.get("/", response_model=RegraComissaoListResponse)
async def listar_regras_comissao(
    loja_id: Optional[UUID] = Query(None, description="Filtrar por loja"),
    tipo_comissao: Optional[str] = Query(None, description="Filtrar por tipo (VENDEDOR, GERENTE, SUPERVISOR)"),
    ativo: Optional[bool] = Query(None, description="Filtrar por status ativo"),
    busca: Optional[str] = Query(None, description="Busca por tipo ou percentual"),
    page: int = Query(1, ge=1, description="Página"),
    limit: int = Query(20, ge=1, le=100, description="Itens por página"),
    user=Depends(get_current_user),
    db=Depends(get_db_with_user_context)
):
    """Lista regras de comissão com filtros e paginação"""
    service = ComissoesService(db)
    
    filtros = {}
    if loja_id:
        filtros['loja_id'] = loja_id
    if tipo_comissao:
        filtros['tipo_comissao'] = tipo_comissao
    if ativo is not None:
        filtros['ativo'] = ativo
    if busca:
        filtros['busca'] = busca
    
    return service.listar_regras(filtros, page, limit)


@router.get("/{regra_id}", response_model=RegraComissaoResponse)
async def buscar_regra_comissao(
    regra_id: str,
    user=Depends(get_current_user),
    db=Depends(get_db_with_user_context)
):
    """Busca regra de comissão por ID"""
    service = ComissoesService(db)
    regra = service.buscar_por_id(regra_id)
    
    if not regra:
        raise HTTPException(status_code=404, detail="Regra não encontrada")
    
    return regra


@router.post("/", response_model=RegraComissaoResponse, status_code=201)
async def criar_regra_comissao(
    dados: RegraComissaoCreate,
    user=Depends(get_current_user),
    db=Depends(get_db_with_user_context)
):
    """Cria nova regra de comissão"""
    service = ComissoesService(db)
    return service.criar_regra(dados)


@router.put("/{regra_id}", response_model=RegraComissaoResponse)
async def atualizar_regra_comissao(
    regra_id: str,
    dados: RegraComissaoUpdate,
    user=Depends(get_current_user),
    db=Depends(get_db_with_user_context)
):
    """Atualiza regra de comissão existente"""
    service = ComissoesService(db)
    regra = service.atualizar_regra(regra_id, dados)
    
    if not regra:
        raise HTTPException(status_code=404, detail="Regra não encontrada")
    
    return regra


@router.delete("/{regra_id}", status_code=204)
async def excluir_regra_comissao(
    regra_id: str,
    user=Depends(get_current_user),
    db=Depends(get_db_with_user_context)
):
    """Exclui regra de comissão (soft delete)"""
    service = ComissoesService(db)
    sucesso = service.excluir_regra(regra_id)
    
    if not sucesso:
        raise HTTPException(status_code=404, detail="Regra não encontrada")


@router.post("/calcular", response_model=CalculoComissaoResponse)
async def calcular_comissao(
    dados: CalculoComissaoRequest,
    user=Depends(get_current_user),
    db=Depends(get_db_with_user_context)
):
    """Calcula comissão para um valor específico"""
    service = ComissoesService(db)
    resultado = service.calcular_comissao(dados.valor, dados.tipo_comissao, dados.loja_id)
    
    if not resultado:
        raise HTTPException(
            status_code=404, 
            detail=f"Nenhuma regra de comissão encontrada para {dados.tipo_comissao} com valor R$ {dados.valor:.2f}"
        )
    
    return resultado


@router.patch("/{regra_id}/toggle-status", response_model=RegraComissaoResponse)
async def alternar_status_regra(
    regra_id: str,
    user=Depends(get_current_user),
    db=Depends(get_db_with_user_context)
):
    """Alterna status ativo/inativo da regra"""
    service = ComissoesService(db)
    regra = service.alternar_status(regra_id)
    
    if not regra:
        raise HTTPException(status_code=404, detail="Regra não encontrada")
    
    return regra


@router.get("/loja/{loja_id}/tipos", response_model=list[str])
async def listar_tipos_por_loja(
    loja_id: UUID,
    user=Depends(get_current_user),
    db=Depends(get_db_with_user_context)
):
    """Lista tipos de comissão disponíveis para uma loja"""
    service = ComissoesService(db)
    return service.listar_tipos_por_loja(loja_id)