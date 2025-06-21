#!/usr/bin/env python3
"""
Teste simples de login
"""
import httpx
import asyncio

async def testar_login():
    print("🔐 Testando login...")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "http://localhost:8000/api/v1/auth/login",
                json={
                    "email": "ricardo.nilton@hotmail.com",
                    "password": "123456"
                },
                timeout=30.0
            )
            
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print("✅ Login funcionou!")
                print(f"   Token: {data['access_token'][:20]}...")
                print(f"   Usuário: {data['user']['nome']}")
                print(f"   Perfil: {data['user']['perfil']}")
                print(f"   Loja ID: {data['user']['loja_id']}")
            else:
                print(f"❌ Erro: {response.status_code}")
                print(f"   Resposta: {response.text}")
                
        except Exception as e:
            print(f"❌ Erro na conexão: {e}")

if __name__ == "__main__":
    asyncio.run(testar_login())