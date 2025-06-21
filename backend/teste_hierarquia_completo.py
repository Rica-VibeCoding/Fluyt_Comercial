#!/usr/bin/env python3
"""
Teste completo da hierarquia - Ricardo (SUPER_ADMIN)
"""
import httpx
import asyncio
from datetime import datetime

BASE_URL = "http://localhost:8000/api/v1"

async def testar_hierarquia():
    print("🚀 TESTE COMPLETO DA HIERARQUIA - SUPER_ADMIN")
    print("=" * 60)
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        # 1. Login
        print("\n1️⃣ LOGIN")
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
        headers = {"Authorization": f"Bearer {token}"}
        
        print(f"✅ Logado como: {user['nome']}")
        print(f"   Perfil: {user['perfil']}")
        print(f"   Loja: {user.get('loja_id', 'N/A')}")
        
        # 2. Listar todos os clientes
        print("\n2️⃣ LISTAGEM DE CLIENTES")
        response = await client.get(f"{BASE_URL}/clientes/", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Total de clientes visíveis: {data['total']}")
            
            # Agrupar por loja
            lojas = {}
            for cliente in data['items']:
                loja_id = cliente.get('loja_id', 'SEM_LOJA')
                if loja_id not in lojas:
                    lojas[loja_id] = []
                lojas[loja_id].append(cliente)
            
            print("\nDistribuição por loja:")
            for loja_id, clientes in lojas.items():
                print(f"\n   Loja {str(loja_id)[:8]}...: {len(clientes)} clientes")
                for c in clientes[:2]:
                    print(f"      • {c['nome']} (ID: {c['id'][:8]}...)")
                if len(clientes) > 2:
                    print(f"      ... mais {len(clientes)-2}")
                    
            # Guardar um ID para testes
            if data['items']:
                cliente_teste_id = data['items'][0]['id']
            else:
                cliente_teste_id = None
        else:
            print(f"❌ Erro: {response.status_code}")
            cliente_teste_id = None
        
        # 3. Buscar cliente específico
        if cliente_teste_id:
            print(f"\n3️⃣ BUSCAR CLIENTE ESPECÍFICO")
            response = await client.get(
                f"{BASE_URL}/clientes/{cliente_teste_id}",
                headers=headers
            )
            
            if response.status_code == 200:
                cliente = response.json()
                print(f"✅ Cliente encontrado: {cliente['nome']}")
                print(f"   Loja: {cliente.get('loja_id', 'N/A')[:8]}...")
            else:
                print(f"❌ Erro ao buscar cliente: {response.status_code}")
        
        # 4. Criar novo cliente
        print("\n4️⃣ CRIAR NOVO CLIENTE")
        novo_cliente = {
            "nome": f"Cliente Teste Hierarquia - {datetime.now().strftime('%H:%M')}",
            "tipo_venda": "NORMAL",
            "email": f"teste_{datetime.now().timestamp()}@hierarquia.com"
        }
        
        response = await client.post(
            f"{BASE_URL}/clientes/",
            headers=headers,
            json=novo_cliente
        )
        
        if response.status_code in [200, 201]:
            cliente_criado = response.json()
            print(f"✅ Cliente criado com sucesso!")
            print(f"   ID: {cliente_criado['id']}")
            print(f"   Nome: {cliente_criado['nome']}")
            print(f"   Loja: {cliente_criado.get('loja_id', 'N/A')[:8]}...")
        else:
            print(f"❌ Erro ao criar: {response.status_code}")
            print(f"   {response.text}")
    
    print("\n" + "=" * 60)
    print("📊 RESUMO:")
    print("   Como SUPER_ADMIN, você deve:")
    print("   ✅ Ver TODOS os clientes de TODAS as lojas")
    print("   ✅ Poder buscar qualquer cliente")
    print("   ✅ Criar clientes em qualquer loja")
    print("   ✅ Atualizar/excluir qualquer cliente")

if __name__ == "__main__":
    asyncio.run(testar_hierarquia())