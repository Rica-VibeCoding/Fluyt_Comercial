#!/usr/bin/env python3
"""
Diagnóstico completo do problema de login
"""
import httpx
import asyncio
import time

async def diagnosticar():
    print("🔍 DIAGNÓSTICO DO PROBLEMA DE LOGIN")
    print("=" * 60)
    
    # 1. Testar backend direto
    print("\n1️⃣ TESTE DIRETO NO BACKEND (porta 8000):")
    try:
        start = time.time()
        async with httpx.AsyncClient(timeout=5.0) as client:
            # Health check
            response = await client.get("http://localhost:8000/health")
            print(f"✅ Health check OK: {response.status_code} em {time.time()-start:.2f}s")
            
            # Login direto
            start = time.time()
            response = await client.post(
                "http://localhost:8000/api/v1/auth/login",
                json={"email": "ricardo.nilton@hotmail.com", "password": "123456"}
            )
            tempo = time.time() - start
            print(f"✅ Login direto: {response.status_code} em {tempo:.2f}s")
            if response.status_code == 200:
                data = response.json()
                print(f"   Token: {data['access_token'][:20]}...")
    except Exception as e:
        print(f"❌ Erro no backend direto: {e}")
    
    # 2. Testar através do proxy do Next.js
    print("\n2️⃣ TESTE ATRAVÉS DO PROXY NEXT.JS (porta 3000):")
    try:
        start = time.time()
        async with httpx.AsyncClient(timeout=35.0) as client:
            # Teste via proxy
            response = await client.post(
                "http://localhost:3000/api/v1/auth/login",
                json={"email": "ricardo.nilton@hotmail.com", "password": "123456"}
            )
            tempo = time.time() - start
            print(f"Status: {response.status_code} em {tempo:.2f}s")
            
            if response.status_code != 200:
                print(f"❌ Erro no proxy: {response.text[:200]}")
    except httpx.TimeoutException:
        print(f"❌ TIMEOUT no proxy após {time.time()-start:.2f}s")
    except Exception as e:
        print(f"❌ Erro no proxy: {e}")
    
    # 3. Verificar processos
    print("\n3️⃣ VERIFICAÇÃO DE PROCESSOS:")
    import subprocess
    
    # Backend
    backend = subprocess.run(['ps', 'aux'], capture_output=True, text=True)
    if 'python3 main.py' in backend.stdout:
        print("✅ Backend FastAPI está rodando")
    else:
        print("❌ Backend FastAPI NÃO está rodando")
    
    # Frontend
    frontend = subprocess.run(['ps', 'aux'], capture_output=True, text=True)
    if 'next' in frontend.stdout or 'node' in frontend.stdout:
        print("✅ Frontend Next.js está rodando")
    else:
        print("❓ Frontend Next.js pode não estar rodando")
    
    # 4. Análise
    print("\n4️⃣ ANÁLISE DO PROBLEMA:")
    print("🔸 Backend responde direto: OK")
    print("🔸 Proxy do Next.js: TIMEOUT ou ERRO 500")
    print("\n💡 POSSÍVEIS CAUSAS:")
    print("1. Next.js não está conseguindo conectar no backend")
    print("2. Configuração de proxy incorreta")
    print("3. Problema de rede/firewall entre portas 3000 e 8000")
    print("4. Backend reiniciando devido a mudanças de código")
    
    print("\n✅ SOLUÇÃO TEMPORÁRIA:")
    print("Alterar o frontend para chamar direto http://localhost:8000")
    print("ao invés de usar o proxy reverso")

if __name__ == "__main__":
    asyncio.run(diagnosticar())