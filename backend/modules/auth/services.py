"""
Serviços de autenticação
"""
import logging
from typing import Optional, Dict, Any
from fastapi import HTTPException, status

from core.database import get_supabase
from core.config import settings
from core.exceptions import (
    UnauthorizedException,
    NotFoundException,
    ValidationException,
    handle_supabase_error
)
from .schemas import UserResponse, LoginResponse, RefreshResponse

logger = logging.getLogger(__name__)


class AuthService:
    """Serviço de autenticação e autorização"""
    
    def __init__(self):
        # Usar o cliente e admin diretamente
        from core.database import _supabase
        self.supabase = _supabase.client
        self.supabase_admin = _supabase.admin
    
    async def login(self, email: str, password: str) -> LoginResponse:
        """
        Realiza login usando Supabase Auth
        
        Args:
            email: Email do usuário
            password: Senha do usuário
            
        Returns:
            LoginResponse com tokens e dados do usuário
            
        Raises:
            UnauthorizedException: Email/senha inválidos
            NotFoundException: Usuário não encontrado no sistema
        """
        try:
            # 1. Autentica no Supabase Auth
            auth_response = self.supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            if not auth_response.user or not auth_response.session:
                raise UnauthorizedException("Email ou senha inválidos")
            
            # 2. Busca dados completos do usuário na tabela c_equipe
            user_data = await self._get_user_data(auth_response.user.id)
            
            # 3. Verifica se usuário está ativo
            if not user_data.get('ativo', True):
                raise UnauthorizedException("Usuário inativo")
            
            # 4. Monta resposta
            user_response = UserResponse(
                id=auth_response.user.id,
                email=auth_response.user.email,
                nome=user_data.get('nome'),
                perfil=user_data.get('perfil', 'USUARIO'),
                loja_id=user_data.get('loja_id'),
                empresa_id=user_data.get('empresa_id'),
                ativo=user_data.get('ativo', True),
                funcao=user_data.get('funcao'),
                loja_nome=user_data.get('loja_nome'),
                empresa_nome=user_data.get('empresa_nome')
            )
            
            return LoginResponse(
                access_token=auth_response.session.access_token,
                refresh_token=auth_response.session.refresh_token,
                expires_in=settings.jwt_access_token_expire_minutes * 60,
                user=user_response
            )
        
        except UnauthorizedException:
            raise
        except NotFoundException:
            raise
        except Exception as e:
            logger.error(f"Login failed for {email}: {str(e)}")
            raise handle_supabase_error(e)
    
    async def refresh_token(self, refresh_token: str) -> RefreshResponse:
        """
        Renova o token de acesso usando refresh token
        
        Args:
            refresh_token: Token de refresh
            
        Returns:
            RefreshResponse com novos tokens
            
        Raises:
            UnauthorizedException: Refresh token inválido
        """
        try:
            # 1. Renova token no Supabase
            auth_response = self.supabase.client.auth.refresh_session(refresh_token)
            
            if not auth_response.session:
                raise UnauthorizedException("Refresh token inválido ou expirado")
            
            return RefreshResponse(
                access_token=auth_response.session.access_token,
                refresh_token=auth_response.session.refresh_token,
                expires_in=settings.jwt_access_token_expire_minutes * 60
            )
        
        except UnauthorizedException:
            raise
        except Exception as e:
            logger.error(f"Token refresh failed: {str(e)}")
            raise handle_supabase_error(e)
    
    async def logout(self, access_token: str) -> bool:
        """
        Realiza logout invalidando o token
        
        Args:
            access_token: Token de acesso a ser invalidado
            
        Returns:
            True se logout bem-sucedido
        """
        try:
            # Cria cliente com token específico
            client = self.supabase.get_client_with_auth(access_token)
            
            # Faz logout no Supabase
            client.auth.sign_out()
            
            return True
        
        except Exception as e:
            logger.error(f"Logout failed: {str(e)}")
            # Mesmo com erro, consideramos logout bem-sucedido
            # pois o token pode ter expirado naturalmente
            return True
    
    async def get_current_user(self, user_id: str) -> UserResponse:
        """
        Busca dados completos do usuário atual
        
        Args:
            user_id: ID do usuário (sub do JWT)
            
        Returns:
            UserResponse com dados completos
            
        Raises:
            NotFoundException: Usuário não encontrado
        """
        user_data = await self._get_user_data(user_id)
        
        return UserResponse(
            id=user_id,
            email=user_data.get('email', ''),
            nome=user_data.get('nome'),
            perfil=user_data.get('perfil', 'USUARIO'),
            loja_id=user_data.get('loja_id'),
            empresa_id=user_data.get('empresa_id'),
            ativo=user_data.get('ativo', True),
            funcao=user_data.get('funcao'),
            loja_nome=user_data.get('loja_nome'),
            empresa_nome=user_data.get('empresa_nome')
        )
    
    async def _get_user_data(self, user_id: str) -> Dict[str, Any]:
        """
        Busca dados do usuário - VERSÃO SIMPLIFICADA
        
        Args:
            user_id: ID do usuário no Supabase Auth
            
        Returns:
            Dicionário com dados do usuário
            
        Raises:
            NotFoundException: Usuário não encontrado
        """
        try:
            # Buscar na tabela usuarios
            result = self.supabase_admin.table('usuarios').select('*').eq('user_id', user_id).single().execute()
            
            if result.data:
                user_data = result.data
                
                # Mapear função baseada no perfil
                funcao_map = {
                    'SUPER_ADMIN': 'Administrador Master',
                    'ADMIN': 'Administrador',
                    'GERENTE': 'Gerente',
                    'VENDEDOR': 'Vendedor',
                    'USER': 'Usuário'
                }
                
                return {
                    'nome': user_data.get('nome'),
                    'email': user_data.get('email'),
                    'perfil': user_data.get('perfil', 'USER'),
                    'ativo': user_data.get('ativo', True),
                    'funcao': funcao_map.get(user_data.get('perfil', 'USER'), 'Usuário'),
                    'loja_id': user_data.get('loja_id'),
                    'loja_nome': None,  # Por enquanto sem join
                    'empresa_id': user_data.get('empresa_id'),
                    'empresa_nome': None,
                }
            else:
                raise NotFoundException(f"Usuário não encontrado: {user_id}")
        
        except NotFoundException:
            raise
        except Exception as e:
            logger.error(f"Erro ao buscar usuário {user_id}: {str(e)}")
            raise NotFoundException(f"Usuário não encontrado: {user_id}")