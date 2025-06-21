#!/usr/bin/env python3
"""
Teste do sistema de hierarquia atual
"""
import httpx
import asyncio

async def testar():
    print("🔍 TESTE DE HIERARQUIA - VERIFICANDO SE ESTÁ FUNCIONANDO")
    print("=" * 60)
    
    async with httpx.AsyncClient() as client:
        # 1. Login
        print("\n1️⃣ Fazendo login como Ricardo (SUPER_ADMIN)...")
        response = await client.post(
            "http://localhost:8000/api/v1/auth/login",
            json={"email": "ricardo.nilton@hotmail.com", "password": "123456"}
        )
        
        if response.status_code != 200:
            print(f"❌ Erro no login: {response.status_code}")
            return
            
        data = response.json()
        token = data['access_token']
        user = data['user']
        
        print(f"✅ Logado como: {user['nome']}")
        print(f"   Perfil: {user['perfil']}")
        print(f"   Loja: {user['loja_id']}")
        
        # 2. Listar clientes
        print("\n2️⃣ Listando clientes...")
        headers = {"Authorization": f"Bearer {token}"}
        response = await client.get(
            "http://localhost:8000/api/v1/clientes/",
            headers=headers
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n✅ TOTAL DE CLIENTES VISÍVEIS: {data['total']}")
            
            # Agrupar por loja
            lojas = {}
            for cliente in data['items']:
                loja_id = cliente.get('loja_id', 'SEM_LOJA')
                if loja_id not in lojas:
                    lojas[loja_id] = []
                lojas[loja_id].append(cliente['nome'])
            
            print("\n📊 Distribuição por loja:")
            for loja_id, nomes in lojas.items():
                print(f"\n   Loja {str(loja_id)[:8]}...: {len(nomes)} clientes")
                for nome in nomes:
                    print(f"      • {nome}")
        else:
            print(f"❌ Erro: {response.status_code}")
    
    print("\n" + "=" * 60)
    print("💡 RESULTADO ESPERADO:")
    print("   - SUPER_ADMIN deve ver TODOS os 7 clientes")
    print("   - Se está vendo apenas 1 ou 4, a hierarquia ainda não está funcionando")

if __name__ == "__main__":
    asyncio.run(testar())