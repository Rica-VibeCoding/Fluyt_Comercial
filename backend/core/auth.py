"""
Sistema de autenticação e autorização usando JWT e Supabase Auth
"""
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from pydantic import BaseModel
import logging

from .config import settings
from .database import get_supabase

logger = logging.getLogger(__name__)

# Security scheme
security = HTTPBearer()


class TokenData(BaseModel):
    """Dados extraídos do token JWT"""
    sub: str  # user_id do Supabase
    email: Optional[str] = None
    role: Optional[str] = None
    loja_id: Optional[str] = None
    empresa_id: Optional[str] = None
    exp: Optional[int] = None


class User(BaseModel):
    """Modelo do usuário autenticado"""
    id: str
    email: str
    perfil: str  # ADMIN_MASTER, ADMIN, USUARIO
    loja_id: Optional[str] = None
    empresa_id: Optional[str] = None
    nome: Optional[str] = None
    ativo: bool = True
    metadata: Dict[str, Any] = {}


class AuthResponse(BaseModel):
    """Resposta de autenticação"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: User


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Cria um token JWT de acesso"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.jwt_access_token_expire_minutes
        )
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.jwt_secret_key, 
        algorithm=settings.jwt_algorithm
    )
    return encoded_jwt


def verify_token(token: str) -> TokenData:
    """Verifica e decodifica um token JWT"""
    try:
        payload = jwt.decode(
            token, 
            settings.jwt_secret_key, 
            algorithms=[settings.jwt_algorithm]
        )
        
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return TokenData(**payload)
    
    except JWTError as e:
        logger.error(f"JWT verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    """
    Dependency que extrai e valida o usuário do token JWT
    
    Uso:
    ```python
    @router.get("/profile")
    async def get_profile(current_user: User = Depends(get_current_user)):
        return current_user
    ```
    """
    token = credentials.credentials
    token_data = verify_token(token)
    
    # Busca dados completos do usuário
    supabase = get_supabase()
    
    try:
        # Busca na tabela de equipe
        result = supabase.admin.table('c_equipe').select(
            "*, c_lojas!inner(id, nome, empresa_id)"
        ).eq('usuario_id', token_data.sub).single().execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        
        user_data = result.data
        loja_data = user_data.get('c_lojas', {})
        
        user = User(
            id=token_data.sub,
            email=token_data.email or user_data.get('email', ''),
            perfil=user_data.get('perfil', 'USUARIO'),
            loja_id=loja_data.get('id'),
            empresa_id=loja_data.get('empresa_id'),
            nome=user_data.get('nome'),
            ativo=user_data.get('ativo', True),
            metadata={
                'funcao': user_data.get('funcao'),
                'comissao_padrao': user_data.get('comissao_padrao'),
                'minimo_garantido': user_data.get('minimo_garantido')
            }
        )
        
        if not user.ativo:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Usuário inativo"
            )
        
        return user
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching user data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao buscar dados do usuário"
        )


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Garante que o usuário está ativo"""
    if not current_user.ativo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário inativo"
        )
    return current_user


# Funções de autorização por perfil
def require_admin():
    """Dependency que requer perfil ADMIN ou superior"""
    async def verify_admin(current_user: User = Depends(get_current_user)):
        if current_user.perfil not in ["ADMIN", "ADMIN_MASTER"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso restrito a administradores"
            )
        return current_user
    return verify_admin


def require_admin_master():
    """Dependency que requer perfil ADMIN_MASTER"""
    async def verify_admin_master(current_user: User = Depends(get_current_user)):
        if current_user.perfil != "ADMIN_MASTER":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso restrito ao Admin Master"
            )
        return current_user
    return verify_admin_master


def require_vendedor_ou_superior():
    """Dependency que permite VENDEDOR ou superior"""
    async def verify_vendedor(current_user: User = Depends(get_current_user)):
        # Todos os perfis têm acesso (USUARIO inclui vendedores)
        return current_user
    return verify_vendedor


# Serviço de autenticação
class AuthService:
    """Serviço para operações de autenticação"""
    
    @staticmethod
    async def login(email: str, password: str) -> AuthResponse:
        """Realiza login usando Supabase Auth"""
        supabase = get_supabase()
        
        try:
            # Login via Supabase Auth
            response = supabase.client.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            if not response.user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Email ou senha inválidos"
                )
            
            # Busca dados completos do usuário
            user_data = await get_current_user(
                HTTPAuthorizationCredentials(
                    scheme="Bearer",
                    credentials=response.session.access_token
                )
            )
            
            return AuthResponse(
                access_token=response.session.access_token,
                refresh_token=response.session.refresh_token,
                expires_in=settings.jwt_access_token_expire_minutes * 60,
                user=user_data
            )
        
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Login failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao realizar login"
            )
    
    @staticmethod
    async def refresh_token(refresh_token: str) -> AuthResponse:
        """Renova o token de acesso usando refresh token"""
        supabase = get_supabase()
        
        try:
            # Refresh via Supabase Auth
            response = supabase.client.auth.refresh_session(refresh_token)
            
            if not response.user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Refresh token inválido"
                )
            
            # Busca dados atualizados do usuário
            user_data = await get_current_user(
                HTTPAuthorizationCredentials(
                    scheme="Bearer",
                    credentials=response.session.access_token
                )
            )
            
            return AuthResponse(
                access_token=response.session.access_token,
                refresh_token=response.session.refresh_token,
                expires_in=settings.jwt_access_token_expire_minutes * 60,
                user=user_data
            )
        
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Token refresh failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao renovar token"
            )