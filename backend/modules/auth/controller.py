"""
Controller de autenticação - Rotas e endpoints
"""
import logging
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPAuthorizationCredentials

from core.auth import get_current_user, security, User
from core.dependencies import SuccessResponse
from core.exceptions import UnauthorizedException, ValidationException

from .schemas import (
    LoginRequest,
    RefreshTokenRequest,
    LoginResponse,
    RefreshResponse,
    LogoutResponse,
    UserResponse
)
from .services import AuthService

logger = logging.getLogger(__name__)

# Router do módulo
router = APIRouter()

# Instância do serviço
auth_service = AuthService()


@router.post("/login", response_model=LoginResponse)
async def login(request: Request, credentials: LoginRequest) -> LoginResponse:
    """
    Endpoint de login
    
    Autentica usuário e retorna tokens de acesso
    
    **Payload:**
    ```json
    {
        "email": "usuario@empresa.com",
        "password": "minhasenha123"
    }
    ```
    
    **Response:**
    ```json
    {
        "success": true,
        "message": "Login realizado com sucesso",
        "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
        "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
        "token_type": "bearer",
        "expires_in": 3600,
        "user": {
            "id": "uuid",
            "email": "usuario@empresa.com",
            "nome": "João Silva",
            "perfil": "VENDEDOR",
            "loja_id": "loja-uuid",
            "empresa_id": "empresa-uuid"
        }
    }
    ```
    """
    # Rate limiting simples
    from core.simple_rate_limit import rate_limiter
    
    # Pega IP do cliente (funciona atrás de proxy também)
    client_ip = request.client.host
    if request.headers.get("X-Forwarded-For"):
        client_ip = request.headers.get("X-Forwarded-For").split(",")[0].strip()
    
    # Verifica limite por IP
    if not rate_limiter.verificar_limite(client_ip):
        tempo_espera = rate_limiter.tempo_restante(client_ip)
        minutos = tempo_espera // 60
        segundos = tempo_espera % 60
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Muitas tentativas de login. Tente novamente em {minutos}m {segundos}s"
        )
    
    try:
        result = await auth_service.login(
            email=credentials.email,
            password=credentials.password
        )
        
        # Login bem-sucedido - reseta o contador
        rate_limiter.resetar(client_ip)
        
        logger.info(f"Login successful for user: {credentials.email}")
        return result
    
    except Exception as e:
        logger.error(f"Login failed for {credentials.email}: {str(e)}")
        raise


@router.post("/refresh", response_model=RefreshResponse)
async def refresh_token(request: RefreshTokenRequest) -> RefreshResponse:
    """
    Endpoint para renovar token de acesso
    
    **Payload:**
    ```json
    {
        "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
    }
    ```
    
    **Response:**
    ```json
    {
        "success": true,
        "message": "Token renovado com sucesso",
        "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
        "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
        "token_type": "bearer",
        "expires_in": 3600
    }
    ```
    """
    try:
        result = await auth_service.refresh_token(request.refresh_token)
        logger.info("Token refresh successful")
        return result
    
    except Exception as e:
        logger.error(f"Token refresh failed: {str(e)}")
        raise


@router.post("/logout", response_model=LogoutResponse)
async def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> LogoutResponse:
    """
    Endpoint de logout
    
    Invalida o token de acesso atual
    
    **Headers:**
    ```
    Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
    ```
    
    **Response:**
    ```json
    {
        "success": true,
        "message": "Logout realizado com sucesso"
    }
    ```
    """
    try:
        await auth_service.logout(credentials.credentials)
        logger.info("Logout successful")
        return LogoutResponse()
    
    except Exception as e:
        logger.error(f"Logout failed: {str(e)}")
        # Mesmo com erro, retorna sucesso pois logout local sempre funciona
        return LogoutResponse()


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
) -> UserResponse:
    """
    Endpoint para obter dados do usuário atual
    
    **Headers:**
    ```
    Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
    ```
    
    **Response:**
    ```json
    {
        "id": "uuid",
        "email": "usuario@empresa.com",
        "nome": "João Silva",
        "perfil": "VENDEDOR",
        "loja_id": "loja-uuid",
        "empresa_id": "empresa-uuid",
        "ativo": true,
        "funcao": "Vendedor",
        "loja_nome": "Loja Centro",
        "empresa_nome": "Móveis XYZ"
    }
    ```
    """
    try:
        result = await auth_service.get_current_user(current_user.id)
        return result
    
    except Exception as e:
        logger.error(f"Failed to get user info for {current_user.id}: {str(e)}")
        raise


@router.get("/verify", response_model=SuccessResponse)
async def verify_token(
    current_user: User = Depends(get_current_user)
) -> SuccessResponse:
    """
    Endpoint para verificar se token é válido
    
    **Headers:**
    ```
    Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
    ```
    
    **Response:**
    ```json
    {
        "success": true,
        "message": "Token válido",
        "data": {
            "user_id": "uuid",
            "email": "usuario@empresa.com",
            "perfil": "VENDEDOR"
        }
    }
    ```
    """
    return SuccessResponse(
        message="Token válido",
        data={
            "user_id": current_user.id,
            "email": current_user.email,
            "perfil": current_user.perfil,
            "loja_id": current_user.loja_id
        }
    )


# Endpoints de teste (apenas em desenvolvimento)
@router.get("/test-connection")
async def test_connection() -> Dict[str, Any]:
    """
    Testa conexão com Supabase (apenas desenvolvimento)
    """
    from core.config import settings
    
    if not settings.is_development:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Endpoint disponível apenas em desenvolvimento"
        )
    
    try:
        from core.database import get_supabase
        health = await get_supabase().health_check()
        return {
            "status": "success",
            "environment": settings.environment,
            "database": health,
            "supabase_url": settings.supabase_url[:50] + "..." if len(settings.supabase_url) > 50 else settings.supabase_url
        }
    
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "environment": settings.environment
        }