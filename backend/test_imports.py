#!/usr/bin/env python3
"""
Teste de importação das dependências principais
"""

print("Testando importações...")

try:
    import fastapi
    print("✅ FastAPI OK")
except ImportError as e:
    print(f"❌ FastAPI: {e}")

try:
    import supabase
    print("✅ Supabase OK")
except ImportError as e:
    print(f"❌ Supabase: {e}")

try:
    import pydantic
    print("✅ Pydantic OK")
except ImportError as e:
    print(f"❌ Pydantic: {e}")

try:
    import uvicorn
    print("✅ Uvicorn OK")
except ImportError as e:
    print(f"❌ Uvicorn: {e}")

try:
    import jose
    print("✅ Jose OK")
except ImportError as e:
    print(f"❌ Jose: {e}")

print("\nTeste de importação dos módulos locais...")

try:
    from core.config import settings
    print("✅ Core.config OK")
    print(f"   Environment: {settings.environment}")
except Exception as e:
    print(f"❌ Core.config: {e}")

try:
    from core.database import get_supabase
    print("✅ Core.database OK")
except Exception as e:
    print(f"❌ Core.database: {e}")

try:
    from modules.auth.controller import router
    print("✅ Auth.controller OK")
except Exception as e:
    print(f"❌ Auth.controller: {e}")

print("\nTeste concluído!")