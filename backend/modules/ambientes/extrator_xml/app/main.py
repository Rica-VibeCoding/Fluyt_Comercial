"""
Entry point principal da aplicação
Comando: uvicorn app.main:app --reload --port 8000
"""

from app.api.main import app

# Expor app para uvicorn
__all__ = ["app"] 