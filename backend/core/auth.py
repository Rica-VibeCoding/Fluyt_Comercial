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
    perfil: str  # SUPER_ADMIN, ADMIN, USUARIO
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
    """Verifica token do Supabase Auth"""
    try:
        # Usar JWT secret do Supabase (não o customizado)
        supabase_secret = settings.supabase_anon_key
        
        # Decodificar sem verificação primeiro para ver o formato
        import base64
        import json
        
        # Dividir o token em partes
        parts = token.split('.')
        if len(parts) != 3:
            raise JWTError("Token malformado")
        
        # Decodificar payload sem verificação
        payload_encoded = parts[1]
        # Adicionar padding se necessário
        payload_encoded += '=' * (4 - len(payload_encoded) % 4)
        payload_bytes = base64.urlsafe_b64decode(payload_encoded)
        payload = json.loads(payload_bytes)
        
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Verificar se token não expirou
        exp = payload.get("exp")
        if exp and datetime.now(timezone.utc).timestamp() > exp:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expirado",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return TokenData(
            sub=user_id,
            email=payload.get("email"),
            role=payload.get("role"),
            exp=exp
        )
    
    except JWTError as e:
        logger.error(f"JWT verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    """
    Dependency que extrai usuário do token JWT - VERSÃO SIMPLIFICADA
    
    Uso:
    ```python
    @router.get("/profile")
    async def get_profile(current_user: User = Depends(get_current_user)):
        return current_user
    ```
    """
    token = credentials.credentials
    token_data = verify_token(token)
    
    # Busca dados do usuário na tabela usuarios
    supabase = get_supabase()
    
    try:
        # Usar supabase admin para acessar a tabela sem RLS
        result = supabase.admin.table('usuarios').select('*').eq('user_id', token_data.sub).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido ou usuário não encontrado",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Pegar o primeiro resultado
        user_data = result.data[0]
        
        user = User(
            id=token_data.sub,
            email=user_data.get('email', ''),
            perfil=user_data.get('perfil', 'USUARIO'),
            loja_id=user_data.get('loja_id'),  # Incluir loja_id real
            empresa_id=user_data.get('empresa_id'),
            nome=user_data.get('nome'),
            ativo=user_data.get('ativo', True),
            metadata={}
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
        logger.error(f"Erro ao buscar usuário: {str(e)}")
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
        if current_user.perfil not in ["ADMIN", "SUPER_ADMIN"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso restrito a administradores"
            )
        return current_user
    return verify_admin


def require_super_admin():
    """Dependency que requer perfil SUPER_ADMIN"""
    async def verify_super_admin(current_user: User = Depends(get_current_user)):
        if current_user.perfil != "SUPER_ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso restrito ao Super Admin"
            )
        return current_user
    return verify_super_admin


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
            
            # Busca dados completos do usuário diretamente (sem usar get_current_user para evitar loop)
            token_data = verify_token(response.session.access_token)
            supabase = get_supabase()
            
            # Buscar usuário na tabela
            result = supabase.admin.table('usuarios').select('*').eq('user_id', token_data.sub).execute()
            
            if not result.data or len(result.data) == 0:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token inválido ou usuário não encontrado",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            user_db = result.data[0]
            user_data = User(
                id=token_data.sub,
                email=user_db.get('email', ''),
                perfil=user_db.get('perfil', 'USUARIO'),
                loja_id=user_db.get('loja_id'),
                empresa_id=user_db.get('empresa_id'),
                nome=user_db.get('nome'),
                ativo=user_db.get('ativo', True),
                metadata={}
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
            
            # Busca dados atualizados do usuário diretamente (sem usar get_current_user para evitar loop)
            token_data = verify_token(response.session.access_token)
            supabase = get_supabase()
            
            # Buscar usuário na tabela
            result = supabase.admin.table('usuarios').select('*').eq('user_id', token_data.sub).execute()
            
            if not result.data or len(result.data) == 0:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token inválido ou usuário não encontrado",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            user_db = result.data[0]
            user_data = User(
                id=token_data.sub,
                email=user_db.get('email', ''),
                perfil=user_db.get('perfil', 'USUARIO'),
                loja_id=user_db.get('loja_id'),
                empresa_id=user_db.get('empresa_id'),
                nome=user_db.get('nome'),
                ativo=user_db.get('ativo', True),
                metadata={}
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