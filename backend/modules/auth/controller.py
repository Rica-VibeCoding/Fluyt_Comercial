"""
Controller de autenticação - Rotas e endpoints
"""
import logging
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPAuthorizationCredentials
from supabase import Client as Supabase

from core.auth import get_current_user, security, User
from core.dependencies import SuccessResponse
from core.exceptions import UnauthorizedException, ValidationException
from core.database import get_database

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


@router.post("/login", response_model=LoginResponse, summary="Login de usuário")
async def login(
    credentials: LoginRequest,
    request: Request,
    db: Supabase = Depends(get_database)
) -> LoginResponse:
    """
    Autentica um usuário no sistema
    
    - **email**: Email do usuário
    - **password**: Senha do usuário
    
    Retorna tokens de acesso e informações do usuário
    """
    try:
        # Log da tentativa de login
        logger.info(f"Tentativa de login: {credentials.email}")
        
        # Tentar autenticar com Supabase Auth
        try:
            auth_response = db.auth.sign_in_with_password({
                "email": credentials.email,
                "password": credentials.password
            })
            
            if not auth_response.user:
                logger.warning(f"Falha na autenticação: {credentials.email}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Email ou senha incorretos"
                )
                
        except Exception as auth_error:
            # Se for erro de credenciais, retornar 401 ao invés de 500
            if "Invalid login credentials" in str(auth_error) or "invalid_credentials" in str(auth_error):
                logger.warning(f"Credenciais inválidas para: {credentials.email}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Email ou senha incorretos"
                )
            else:
                # Outros erros (conexão, etc.)
                logger.error(f"Erro interno na autenticação: {str(auth_error)}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Erro interno do servidor"
                )
        
        user_id = auth_response.user.id
        access_token = auth_response.session.access_token
        refresh_token = auth_response.session.refresh_token
        expires_in = auth_response.session.expires_in or 3600
        
        # Buscar dados do usuário na tabela cad_equipe (Equipe)
        try:
            equipe_response = db.table("cad_equipe")\
                .select("*")\
                .eq("email", credentials.email)\
                .eq("ativo", True)\
                .maybe_single()\
                .execute()
            
            if not equipe_response.data:
                logger.warning(f"Usuário {credentials.email} não encontrado na equipe")
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Usuário não autorizado no sistema"
                )
                
            membro_equipe = equipe_response.data
            
        except Exception as db_error:
            logger.error(f"Erro ao buscar dados da equipe: {str(db_error)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao acessar dados do usuário"
            )
        
        # Construir dados do usuário baseado nos dados da equipe
        user_data = UserResponse(
            id=user_id,
            email=credentials.email,
            nome=membro_equipe.get("nome", ""),
            perfil=membro_equipe.get("perfil", "VENDEDOR"),
            loja_id=membro_equipe.get("loja_id"),
            empresa_id=membro_equipe.get("empresa_id"),
            ativo=membro_equipe.get("ativo", True),
            funcao=membro_equipe.get("perfil", "VENDEDOR"),
            loja_nome=None,
            empresa_nome=None
        )
        
        logger.info(f"Login bem-sucedido: {credentials.email} ({user_data.perfil})")
        
        return LoginResponse(
            success=True,
            message="Login realizado com sucesso",
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=expires_in,
            user=user_data
        )
        
    except HTTPException:
        # Re-lançar HTTPExceptions sem modificar
        raise
    except Exception as e:
        # Capturar outros erros não tratados
        logger.error(f"Erro inesperado no login: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


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