"""
Schemas Pydantic para autenticação
"""
from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr, field_validator


class LoginRequest(BaseModel):
    """Dados para login"""
    email: EmailStr
    password: str
    
    @field_validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Senha deve ter pelo menos 6 caracteres')
        return v


class RefreshTokenRequest(BaseModel):
    """Dados para refresh do token"""
    refresh_token: str


class UserResponse(BaseModel):
    """Dados do usuário para resposta"""
    id: str
    email: str
    nome: Optional[str] = None
    perfil: str
    loja_id: Optional[str] = None
    empresa_id: Optional[str] = None
    ativo: bool = True
    funcao: Optional[str] = None
    loja_nome: Optional[str] = None
    empresa_nome: Optional[str] = None


class LoginResponse(BaseModel):
    """Resposta de login"""
    success: bool = True
    message: str = "Login realizado com sucesso"
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class RefreshResponse(BaseModel):
    """Resposta de refresh token"""
    success: bool = True
    message: str = "Token renovado com sucesso"
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class LogoutResponse(BaseModel):
    """Resposta de logout"""
    success: bool = True
    message: str = "Logout realizado com sucesso"