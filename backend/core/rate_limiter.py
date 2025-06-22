"""
Configuração do Rate Limiter para proteger a API
Previne ataques de força bruta e uso excessivo de recursos
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

# Cria o limitador usando o IP do cliente como identificador
limiter = Limiter(key_func=get_remote_address)