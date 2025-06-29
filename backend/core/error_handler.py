"""
Decorator centralizado para tratamento de erros em endpoints
"""
import logging
from functools import wraps
from typing import Callable
from fastapi import HTTPException, status

from .exceptions import NotFoundException, ValidationException, DatabaseException

logger = logging.getLogger(__name__)


def handle_exceptions(func: Callable) -> Callable:
    """
    Decorator que captura exceções comuns e converte em HTTPException
    
    Tratamento padrão:
    - ValidationException -> 400 Bad Request
    - NotFoundException -> 404 Not Found  
    - DatabaseException -> 500 Internal Server Error
    - Exception -> 500 Internal Server Error
    """
    @wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except HTTPException:
            # Se já for HTTPException, apenas propaga
            raise
        except ValidationException as e:
            logger.error(f"Erro de validação em {func.__name__}: {e}")
            raise HTTPException(status_code=400, detail=str(e))
        except NotFoundException as e:
            logger.warning(f"Recurso não encontrado em {func.__name__}: {e}")
            raise HTTPException(status_code=404, detail=str(e))
        except DatabaseException as e:
            logger.error(f"Erro de banco em {func.__name__}: {e}")
            raise HTTPException(status_code=500, detail="Erro interno do servidor")
        except Exception as e:
            logger.error(f"Erro inesperado em {func.__name__}: {e}")
            raise HTTPException(status_code=500, detail="Erro interno do servidor")
    
    return wrapper