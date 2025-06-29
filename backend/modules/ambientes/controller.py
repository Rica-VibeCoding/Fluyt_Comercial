"""
Controller - Endpoints da API para o módulo de ambientes
Define todas as rotas HTTP e suas validações
"""
import logging
from typing import Optional, Dict, Any, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import JSONResponse

from core.auth import get_current_user
from core.database import get_database
from core.exceptions import NotFoundException, ValidationException, DatabaseException

from .service import AmbienteService
from .schemas import (
    AmbienteCreate, AmbienteUpdate, AmbienteResponse, 
    AmbienteFiltros, AmbienteListResponse,
    AmbienteMaterialCreate, AmbienteMaterialResponse
)

logger = logging.getLogger(__name__)

# Router do módulo ambientes
router = APIRouter(prefix="/ambientes", tags=["Ambientes"])


def get_ambiente_service(db=Depends(get_database)) -> AmbienteService:
    """
    Dependency injection para o service de ambientes
    """
    return AmbienteService(db)


@router.get("/", response_model=AmbienteListResponse)
async def listar_ambientes(
    # Filtros de busca
    cliente_id: Optional[str] = Query(None, description="UUID do cliente"),
    nome: Optional[str] = Query(None, description="Nome do ambiente (busca parcial)"),
    origem: Optional[str] = Query(None, description="Origem: 'xml' ou 'manual'"),
    valor_min: Optional[float] = Query(None, description="Valor mínimo de venda"),
    valor_max: Optional[float] = Query(None, description="Valor máximo de venda"),
    data_inicio: Optional[str] = Query(None, description="Data início (YYYY-MM-DD)"),
    data_fim: Optional[str] = Query(None, description="Data fim (YYYY-MM-DD)"),
    
    # Paginação
    page: int = Query(1, ge=1, description="Número da página"),
    per_page: int = Query(20, ge=1, le=100, description="Itens por página"),
    
    # Ordenação
    order_by: str = Query("created_at", description="Campo para ordenação"),
    order_direction: str = Query("desc", regex="^(asc|desc)$", description="Direção da ordenação"),
    
    # Dependencies
    current_user = Depends(get_current_user),
    service: AmbienteService = Depends(get_ambiente_service)
):
    """
    Lista ambientes com filtros, paginação e ordenação
    
    **Filtros disponíveis:**
    - cliente_id: Filtra por cliente específico
    - nome: Busca parcial no nome do ambiente
    - origem: Filtra por origem ('xml' ou 'manual')
    - valor_min/valor_max: Faixa de valores de venda
    - data_inicio/data_fim: Período de importação
    
    **Retorna:** Lista paginada com dados do cliente via JOIN
    """
    try:
        logger.info(f"Listando ambientes - Usuário: {current_user.id}")
        
        # Monta filtros
        filtros = AmbienteFiltros(
            cliente_id=cliente_id,
            nome=nome,
            origem=origem,
            valor_min=valor_min,
            valor_max=valor_max,
            data_inicio=data_inicio,
            data_fim=data_fim,
            page=page,
            per_page=per_page,
            order_by=order_by,
            order_direction=order_direction
        )
        
        # Busca no service
        resultado = await service.listar_ambientes(filtros)
        
        logger.info(f"Ambientes listados com sucesso - Total: {resultado.total}")
        return resultado
        
    except ValidationException as e:
        logger.error(f"Erro de validação ao listar ambientes: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except DatabaseException as e:
        logger.error(f"Erro de banco ao listar ambientes: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")
    except Exception as e:
        logger.error(f"Erro inesperado ao listar ambientes: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/{ambiente_id}", response_model=AmbienteResponse)
async def buscar_ambiente(
    ambiente_id: str,
    incluir_materiais: bool = Query(False, description="Incluir materiais do ambiente"),
    current_user = Depends(get_current_user),
    service: AmbienteService = Depends(get_ambiente_service)
):
    """
    Busca ambiente específico por ID
    
    **Parâmetros:**
    - ambiente_id: UUID do ambiente
    - incluir_materiais: Se deve incluir os materiais na resposta
    
    **Retorna:** Dados completos do ambiente com cliente via JOIN
    """
    try:
        logger.info(f"Buscando ambiente {ambiente_id} - Usuário: {current_user.id}")
        
        ambiente = await service.buscar_ambiente_por_id(ambiente_id, incluir_materiais)
        
        logger.info(f"Ambiente {ambiente_id} encontrado com sucesso")
        return ambiente
        
    except NotFoundException as e:
        logger.warning(f"Ambiente {ambiente_id} não encontrado")
        raise HTTPException(status_code=404, detail=str(e))
    except ValidationException as e:
        logger.error(f"Erro de validação ao buscar ambiente {ambiente_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except DatabaseException as e:
        logger.error(f"Erro de banco ao buscar ambiente {ambiente_id}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")
    except Exception as e:
        logger.error(f"Erro inesperado ao buscar ambiente {ambiente_id}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/", response_model=AmbienteResponse, status_code=status.HTTP_201_CREATED)
async def criar_ambiente(
    ambiente_data: AmbienteCreate,
    current_user = Depends(get_current_user),
    service: AmbienteService = Depends(get_ambiente_service)
):
    """
    Cria novo ambiente
    
    **Campos obrigatórios:**
    - cliente_id: UUID do cliente
    - nome: Nome do ambiente
    
    **Campos opcionais:**
    - valor_custo_fabrica: Custo de fábrica
    - valor_venda: Valor de venda
    - data_importacao: Data de importação
    - hora_importacao: Hora de importação
    - origem: 'xml' ou 'manual' (padrão: 'manual')
    
    **Retorna:** Dados do ambiente criado
    """
    try:
        logger.info(f"Criando ambiente - Usuário: {current_user.id}")
        
        ambiente = await service.criar_ambiente(ambiente_data)
        
        logger.info(f"Ambiente {ambiente.id} criado com sucesso")
        return ambiente
        
    except ValidationException as e:
        logger.error(f"Erro de validação ao criar ambiente: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except DatabaseException as e:
        logger.error(f"Erro de banco ao criar ambiente: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")
    except Exception as e:
        logger.error(f"Erro inesperado ao criar ambiente: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.put("/{ambiente_id}", response_model=AmbienteResponse)
async def atualizar_ambiente(
    ambiente_id: str,
    ambiente_data: AmbienteUpdate,
    current_user = Depends(get_current_user),
    service: AmbienteService = Depends(get_ambiente_service)
):
    """
    Atualiza ambiente existente
    
    **Parâmetros:**
    - ambiente_id: UUID do ambiente
    - ambiente_data: Dados para atualização (todos opcionais)
    
    **Retorna:** Dados atualizados do ambiente
    """
    try:
        logger.info(f"Atualizando ambiente {ambiente_id} - Usuário: {current_user.id}")
        
        ambiente = await service.atualizar_ambiente(ambiente_id, ambiente_data)
        
        logger.info(f"Ambiente {ambiente_id} atualizado com sucesso")
        return ambiente
        
    except NotFoundException as e:
        logger.warning(f"Ambiente {ambiente_id} não encontrado para atualização")
        raise HTTPException(status_code=404, detail=str(e))
    except ValidationException as e:
        logger.error(f"Erro de validação ao atualizar ambiente {ambiente_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except DatabaseException as e:
        logger.error(f"Erro de banco ao atualizar ambiente {ambiente_id}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")
    except Exception as e:
        logger.error(f"Erro inesperado ao atualizar ambiente {ambiente_id}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.delete("/{ambiente_id}")
async def excluir_ambiente(
    ambiente_id: str,
    current_user = Depends(get_current_user),
    service: AmbienteService = Depends(get_ambiente_service)
):
    """
    Exclui ambiente permanentemente
    
    **Parâmetros:**
    - ambiente_id: UUID do ambiente
    
    **Retorna:** Confirmação da exclusão
    """
    try:
        logger.info(f"Excluindo ambiente {ambiente_id} - Usuário: {current_user.id}")
        
        await service.excluir_ambiente(ambiente_id)
        
        logger.info(f"Ambiente {ambiente_id} excluído com sucesso")
        return JSONResponse(
            content={"message": "Ambiente excluído com sucesso"},
            status_code=200
        )
        
    except NotFoundException as e:
        logger.warning(f"Ambiente {ambiente_id} não encontrado para exclusão")
        raise HTTPException(status_code=404, detail=str(e))
    except DatabaseException as e:
        logger.error(f"Erro de banco ao excluir ambiente {ambiente_id}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")
    except Exception as e:
        logger.error(f"Erro inesperado ao excluir ambiente {ambiente_id}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/{ambiente_id}/materiais", response_model=AmbienteMaterialResponse, status_code=status.HTTP_201_CREATED)
async def criar_material_ambiente(
    ambiente_id: str,
    material_data: AmbienteMaterialCreate,
    current_user = Depends(get_current_user),
    service: AmbienteService = Depends(get_ambiente_service)
):
    """
    Cria ou atualiza material de um ambiente (UPSERT)
    
    **Parâmetros:**
    - ambiente_id: UUID do ambiente
    - material_data: Dados do material em formato JSON
    
    **Retorna:** Dados do material criado/atualizado
    """
    try:
        logger.info(f"Criando material para ambiente {ambiente_id} - Usuário: {current_user.id}")
        
        material = await service.criar_material_ambiente(ambiente_id, material_data)
        
        logger.info(f"Material criado para ambiente {ambiente_id}")
        return material
        
    except NotFoundException as e:
        logger.warning(f"Ambiente {ambiente_id} não encontrado para criar material")
        raise HTTPException(status_code=404, detail=str(e))
    except ValidationException as e:
        logger.error(f"Erro de validação ao criar material: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except DatabaseException as e:
        logger.error(f"Erro de banco ao criar material: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")
    except Exception as e:
        logger.error(f"Erro inesperado ao criar material: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/{ambiente_id}/materiais", response_model=List[AmbienteMaterialResponse])
async def obter_materiais_ambiente(
    ambiente_id: str,
    current_user = Depends(get_current_user),
    service: AmbienteService = Depends(get_ambiente_service)
):
    """
    Obtém todos os materiais de um ambiente
    
    **Parâmetros:**
    - ambiente_id: UUID do ambiente
    
    **Retorna:** Lista de materiais do ambiente
    """
    try:
        logger.info(f"Buscando materiais do ambiente {ambiente_id} - Usuário: {current_user.id}")
        
        materiais = await service.obter_materiais_ambiente(ambiente_id)
        
        logger.info(f"Materiais do ambiente {ambiente_id} obtidos - Total: {len(materiais)}")
        return materiais
        
    except NotFoundException as e:
        logger.warning(f"Ambiente {ambiente_id} não encontrado para buscar materiais")
        raise HTTPException(status_code=404, detail=str(e))
    except DatabaseException as e:
        logger.error(f"Erro de banco ao buscar materiais: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")
    except Exception as e:
        logger.error(f"Erro inesperado ao buscar materiais: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor") 