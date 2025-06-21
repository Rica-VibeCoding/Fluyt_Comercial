#!/usr/bin/env python3
"""
Teste final após correções de hierarquia
Ricardo, vamos testar se agora você vê todos os clientes!
"""
import httpx
import asyncio

BASE_URL = "http://localhost:8000/api/v1"

async def testar_sistema():
    print("🚀 TESTE FINAL - SISTEMA DE HIERARQUIA CORRIGIDO")
    print("=" * 60)
    
    async with httpx.AsyncClient() as client:
        # 1. Login
        print("\n1️⃣ Fazendo login...")
        response = await client.post(
            f"{BASE_URL}/auth/login",
            json={"email": "ricardo.nilton@hotmail.com", "password": "123456"}
        )
        
        if response.status_code != 200:
            print(f"❌ Erro no login: {response.status_code}")
            return
            
        data = response.json()
        token = data['access_token']
        user = data['user']
        
        print(f"✅ Login OK!")
        print(f"   - Nome: {user['nome']}")
        print(f"   - Perfil: {user['perfil']}")
        print(f"   - Loja ID: {user['loja_id']}")
        
        # 2. Listar clientes
        print("\n2️⃣ Listando clientes...")
        headers = {"Authorization": f"Bearer {token}"}
        response = await client.get(
            f"{BASE_URL}/clientes/",
            headers=headers
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API retornou {data['total']} clientes!")
            
            # Mostrar distribuição por loja
            lojas = {}
            for cliente in data['items']:
                loja_id = cliente.get('loja_id', 'SEM_LOJA')
                if loja_id not in lojas:
                    lojas[loja_id] = []
                lojas[loja_id].append(cliente['nome'])
            
            print("\n📊 Distribuição por loja:")
            for loja_id, nomes in lojas.items():
                print(f"   Loja {str(loja_id)[:8]}...: {len(nomes)} clientes")
                for nome in nomes[:2]:
                    print(f"      - {nome}")
                if len(nomes) > 2:
                    print(f"      ... mais {len(nomes)-2}")
        else:
            print(f"❌ Erro ao listar: {response.status_code}")
            print(response.text)
    
    print("\n" + "=" * 60)
    print("✅ RESULTADO ESPERADO:")
    print("   Como SUPER_ADMIN, você deve ver TODOS os 7 clientes!")
    print("   - 4 da loja 317c3115...")
    print("   - 3 da loja a3579ff1...")

if __name__ == "__main__":
    asyncio.run(testar_sistema())