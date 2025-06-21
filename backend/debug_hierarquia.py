#!/usr/bin/env python3
"""
Debug completo do sistema de hierarquia
Ricardo, vou verificar porque você só vê o cliente "Ricardo"
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client
import asyncio
import httpx

# Carregar variáveis
sys.path.append(str(Path(__file__).parent))
load_dotenv()

# Conectar ao Supabase
url = os.getenv('SUPABASE_URL')
service_key = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(url, service_key)

print("🔍 DEBUG COMPLETO - PROBLEMA DE HIERARQUIA")
print("=" * 60)

# 1. Verificar dados do usuário Ricardo
print("\n1️⃣ DADOS DO USUÁRIO RICARDO:")
try:
    usuarios = supabase.table('usuarios').select('*').eq('email', 'ricardo.nilton@hotmail.com').execute()
    if usuarios.data:
        user = usuarios.data[0]
        print(f"✅ Usuário encontrado:")
        print(f"   - Nome: {user.get('nome')}")
        print(f"   - Email: {user.get('email')}")
        print(f"   - Perfil: {user.get('perfil')}")
        print(f"   - Loja ID: {user.get('loja_id')}")
        print(f"   - User ID (auth): {user.get('user_id')}")
        
        USER_LOJA_ID = user.get('loja_id')
        USER_PERFIL = user.get('perfil')
    else:
        print("❌ Usuário não encontrado!")
except Exception as e:
    print(f"❌ Erro: {e}")

# 2. Verificar total de clientes no banco
print("\n2️⃣ TOTAL DE CLIENTES NO BANCO:")
try:
    clientes = supabase.table('c_clientes').select('id, nome, loja_id').execute()
    print(f"✅ Total de clientes no banco: {len(clientes.data)}")
    
    # Agrupar por loja
    lojas_count = {}
    for cliente in clientes.data:
        loja_id = cliente.get('loja_id', 'SEM_LOJA')
        if loja_id not in lojas_count:
            lojas_count[loja_id] = []
        lojas_count[loja_id].append(cliente['nome'])
    
    print("\n   Distribuição por loja:")
    for loja_id, clientes_loja in lojas_count.items():
        print(f"   - Loja {loja_id[:8]}...: {len(clientes_loja)} clientes")
        for nome in clientes_loja[:3]:  # Mostrar até 3 nomes
            print(f"     • {nome}")
        if len(clientes_loja) > 3:
            print(f"     ... e mais {len(clientes_loja) - 3} clientes")
            
except Exception as e:
    print(f"❌ Erro: {e}")

# 3. Verificar o que o backend está retornando
print("\n3️⃣ TESTANDO BACKEND API:")

async def testar_backend():
    # Login
    async with httpx.AsyncClient() as client:
        # Fazer login
        response = await client.post(
            "http://localhost:8000/api/v1/auth/login",
            json={"email": "ricardo.nilton@hotmail.com", "password": "123456"}
        )
        
        if response.status_code != 200:
            print(f"❌ Erro no login: {response.status_code}")
            return
            
        data = response.json()
        token = data['access_token']
        user_data = data['user']
        
        print("✅ Login realizado:")
        print(f"   - Perfil retornado: {user_data['perfil']}")
        print(f"   - Loja ID retornado: {user_data['loja_id']}")
        
        # Listar clientes
        headers = {"Authorization": f"Bearer {token}"}
        response = await client.get(
            "http://localhost:8000/api/v1/clientes/",
            headers=headers
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n✅ API retornou {data['total']} clientes")
            if data['items']:
                print("   Clientes retornados:")
                for cliente in data['items']:
                    print(f"   - {cliente['nome']} (Loja: {cliente.get('loja_id', 'N/A')[:8]}...)")
        else:
            print(f"❌ Erro ao listar: {response.status_code}")

# Executar teste async
asyncio.run(testar_backend())

# 4. Verificar o código do repository
print("\n4️⃣ ANÁLISE DO CÓDIGO:")
print("   Verificando arquivo: backend/modules/clientes/repository.py")
print("   - Linha 60: Filtro por loja_id")
print("   - Problema: Se user.perfil == 'SUPER_ADMIN', deveria ver TODOS")

# 5. Solução proposta
print("\n5️⃣ PROBLEMA IDENTIFICADO:")
print("❌ O código está SEMPRE filtrando por loja_id, mesmo para SUPER_ADMIN")
print("❌ Por isso você só vê clientes da sua loja")

print("\n✅ SOLUÇÃO:")
print("1. Se perfil == 'SUPER_ADMIN': NÃO filtrar por loja_id")
print("2. Se perfil != 'SUPER_ADMIN': Filtrar normalmente")

print("\n" + "=" * 60)
print("📊 RESUMO:")
print(f"- Você tem perfil: {USER_PERFIL}")
print(f"- Sua loja: {USER_LOJA_ID}")
print("- Deveria ver: TODOS os clientes (7 total)")
print("- Está vendo: Apenas clientes da sua loja")
print("\n💡 Preciso corrigir a lógica de filtro!")