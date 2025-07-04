#!/usr/bin/env python3
"""
Extrator XML Promob - Ponto de entrada da aplicação

Autor: Ricardo Borges - 2025
"""

import uvicorn
from app.api.main import app

if __name__ == "__main__":
    uvicorn.run(
        "app.api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 