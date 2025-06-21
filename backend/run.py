#!/usr/bin/env python3
"""
Script para iniciar o backend com logs detalhados
"""
import os
import sys
from pathlib import Path

# Adicionar o diretório ao path
sys.path.insert(0, str(Path(__file__).parent))

# Configurar logging
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

print("🚀 Iniciando Backend Fluyt Comercial...")
print("=" * 50)

try:
    # Importar e rodar
    import uvicorn
    from main import app
    
    print("✅ Aplicação carregada com sucesso!")
    print("=" * 50)
    print("📍 URL: http://localhost:8000")
    print("📚 Docs: http://localhost:8000/docs")
    print("=" * 50)
    
    # Iniciar servidor
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
    
except Exception as e:
    print(f"\n❌ Erro ao iniciar: {str(e)}")
    import traceback
    traceback.print_exc()
    print("\n💡 Verifique:")
    print("   1. Se todas as dependências estão instaladas")
    print("   2. Se as variáveis de ambiente estão configuradas")
    print("   3. Se o arquivo .env existe na pasta backend")