"""
Controller para configurações de loja
Define endpoints da API para gerenciar configurações operacionais
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from typing import Optional
from uuid import UUID

from core.dependencies import get_current_user, get_db_with_user_context
from core.auth import User
from core.rate_limiter import limiter
from core.permissions import PermissionMiddleware
from .schemas import (
    ConfigLojaCreate,
    ConfigLojaUpdate,
    ConfigLojaResponse
)
from .services import ConfigLojaService
from .repository import ConfigLojaRepository


router = APIRouter(prefix="/config-loja", tags=["Configurações de Loja"])


def get_service(db=Depends(get_db_with_user_context)) -> ConfigLojaService:
    """Dependency para obter o service"""
    repository = ConfigLojaRepository(db)
    return ConfigLojaService(repository)


@router.get("/loja/{store_id}", response_model=ConfigLojaResponse)
@limiter.limit("30/minute")
async def obter_config_por_loja(
    request: Request,
    store_id: UUID,
    current_user: User = Depends(get_current_user),
    service: ConfigLojaService = Depends(get_service)
):
    """
    Obtém configuração de uma loja específica
    
    - **store_id**: ID da loja
    - **Retorna**: Configuração da loja ou 404 se não encontrada
    """
    config = await service.obter_por_loja(store_id)
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Configuração não encontrada para esta loja"
        )
    
    return config


@router.get("/verificar-store/{store_id}", response_model=dict)
@limiter.limit("10/minute")
async def verificar_store_configuracao(
    request: Request,
    store_id: UUID,
    current_user: User = Depends(get_current_user),
    service: ConfigLojaService = Depends(get_service)
):
    """
    Verifica se store já possui configuração
    
    - **store_id**: ID da loja
    - **Retorna**: {existe: bool, config: dados}
    """
    result = service.verificar_store_configuracao(store_id)
    return {
        "success": True,
        "data": result
    }


@router.patch("/{config_id}/desativar", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("5/minute")
async def desativar_configuracao(
    request: Request,
    config_id: UUID,
    current_user: User = Depends(get_current_user),
    service: ConfigLojaService = Depends(get_service)
):
    """
    Desativa configuração (soft delete)
    
    - **Requer**: Perfil SUPER_ADMIN
    - **config_id**: ID da configuração
    - **Retorna**: 204 No Content em caso de sucesso
    """
    if not service.desativar_configuracao(config_id, current_user.id, current_user.perfil):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Configuração não encontrada"
        )


@router.get("/{config_id}", response_model=ConfigLojaResponse)
@limiter.limit("30/minute")
async def obter_config_por_id(
    request: Request,
    config_id: UUID,
    current_user: User = Depends(get_current_user),
    service: ConfigLojaService = Depends(get_service)
):
    """
    Obtém configuração por ID
    
    - **config_id**: ID da configuração
    - **Retorna**: Dados completos da configuração
    """
    result = service.obter_por_id(config_id, current_user.perfil)
    return result


@router.get("/", response_model=dict)
@limiter.limit("20/minute")
async def listar_configuracoes(
    request: Request,
    store_id: Optional[UUID] = Query(None, description="Filtrar por loja"),
    limit: int = Query(20, ge=1, le=100, description="Itens por página"),
    page: int = Query(1, ge=1, description="Número da página"),
    current_user: User = Depends(get_current_user),
    service: ConfigLojaService = Depends(get_service)
):
    """
    Lista configurações com paginação
    
    - **store_id**: Filtrar por loja específica
    - **limit**: Número de itens por página (1-100)
    - **page**: Número da página
    - **Retorna**: Lista paginada de configurações
    """
    # Apenas ADMIN+ pode listar todas
    if current_user.perfil not in ["ADMIN", "SUPER_ADMIN", "ADMIN_MASTER"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para listar configurações"
        )
    
    configs, total = service.listar(store_id, limit, page, current_user.perfil)
    
    return {
        "success": True,
        "data": {
            "items": configs,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
    }


@router.post("/", response_model=ConfigLojaResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
@PermissionMiddleware.require_admin
async def criar_configuracao(
    request: Request,
    dados: ConfigLojaCreate,
    current_user: User = Depends(get_current_user),
    service: ConfigLojaService = Depends(get_service)
):
    """
    Cria nova configuração de loja
    
    - **Requer**: Perfil ADMIN ou superior
    - **store_id**: ID da loja (deve ser única)
    - **Retorna**: Configuração criada
    """
    result = service.criar(dados, current_user.id)
    return result


@router.put("/{config_id}", response_model=ConfigLojaResponse)
@limiter.limit("10/minute")
@PermissionMiddleware.require_admin
async def atualizar_configuracao(
    request: Request,
    config_id: UUID,
    dados: ConfigLojaUpdate,
    current_user: User = Depends(get_current_user),
    service: ConfigLojaService = Depends(get_service)
):
    """
    Atualiza configuração existente
    
    - **Requer**: Perfil ADMIN ou superior
    - **config_id**: ID da configuração
    - **Campos**: Todos opcionais, envia apenas o que deseja alterar
    - **Retorna**: Configuração atualizada
    """
    result = service.atualizar(config_id, dados, current_user.id)
    return result


@router.delete("/{config_id}", status_code=status.HTTP_204_NO_CONTENT)
@PermissionMiddleware.require_super_admin
async def deletar_configuracao(
    config_id: UUID,
    current_user: User = Depends(get_current_user),
    service: ConfigLojaService = Depends(get_service)
):
    """
    Remove configuração de loja
    
    - **Requer**: Perfil SUPER_ADMIN
    - **config_id**: ID da configuração
    - **Retorna**: 204 No Content em caso de sucesso
    """
    if not service.deletar(config_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Configuração não encontrada"
        )


@router.post("/loja/{store_id}/padrao", response_model=ConfigLojaResponse)
@limiter.limit("5/minute")
@PermissionMiddleware.require_admin
async def criar_config_padrao(
    request: Request,
    store_id: UUID,
    current_user: User = Depends(get_current_user),
    service: ConfigLojaService = Depends(get_service)
):
    """
    Cria configuração padrão para loja se não existir
    
    - **store_id**: ID da loja
    - **Retorna**: Configuração existente ou nova criada com valores padrão
    """
    result = service.obter_ou_criar_padrao(store_id, current_user.id)
    return result