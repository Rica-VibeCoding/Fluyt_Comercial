"""
Middleware centralizado de permissões
Padroniza verificação de permissões entre módulos
"""

from functools import wraps
from fastapi import HTTPException, status
from core.auth import User

class PermissionMiddleware:
    """Middleware centralizado para verificação de permissões"""
    
    @staticmethod
    def require_admin(func):
        """Decorator que requer perfil ADMIN ou superior"""
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Buscar current_user nos argumentos
            current_user = None
            for arg in args:
                if isinstance(arg, User):
                    current_user = arg
                    break
            
            # Buscar em kwargs se não encontrado em args
            if not current_user:
                current_user = kwargs.get('current_user')
            
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token de autenticação requerido"
                )
            
            if current_user.perfil not in ["ADMIN", "SUPER_ADMIN", "ADMIN_MASTER"]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Apenas administradores podem realizar esta ação"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    
    @staticmethod
    def require_super_admin(func):
        """Decorator que requer perfil SUPER_ADMIN"""
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Buscar current_user nos argumentos
            current_user = None
            for arg in args:
                if isinstance(arg, User):
                    current_user = arg
                    break
            
            # Buscar em kwargs se não encontrado em args
            if not current_user:
                current_user = kwargs.get('current_user')
            
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token de autenticação requerido"
                )
            
            if current_user.perfil != "SUPER_ADMIN":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Apenas SUPER_ADMIN pode realizar esta ação"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    
    @staticmethod
    def check_admin_permission(user: User) -> bool:
        """Verifica se usuário tem permissão de administrador"""
        return user.perfil in ["ADMIN", "SUPER_ADMIN", "ADMIN_MASTER"]
    
    @staticmethod
    def check_super_admin_permission(user: User) -> bool:
        """Verifica se usuário tem permissão de super administrador"""
        return user.perfil == "SUPER_ADMIN"