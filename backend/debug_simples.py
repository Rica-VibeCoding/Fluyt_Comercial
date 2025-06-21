#!/usr/bin/env python3
"""
Debug simples focado no problema de hierarquia
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

# Carregar variáveis
sys.path.append(str(Path(__file__).parent))
load_dotenv()

# Conectar ao Supabase
url = os.getenv('SUPABASE_URL')
service_key = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(url, service_key)

print("🔍 DEBUG HIERARQUIA - ANÁLISE SIMPLES")
print("=" * 60)

# 1. Dados do Ricardo
print("\n1️⃣ USUÁRIO RICARDO:")
usuarios = supabase.table('usuarios').select('*').eq('email', 'ricardo.nilton@hotmail.com').execute()
if usuarios.data:
    user = usuarios.data[0]
    print(f"   Perfil: {user.get('perfil')}")
    print(f"   Loja ID: {user.get('loja_id')}")
    LOJA_RICARDO = user.get('loja_id')

# 2. Total de clientes
print("\n2️⃣ CLIENTES NO BANCO:")
clientes = supabase.table('c_clientes').select('id, nome, loja_id').execute()
print(f"   Total geral: {len(clientes.data)} clientes")

# Contar por loja
lojas = {}
for c in clientes.data:
    loja = c.get('loja_id', 'SEM_LOJA')
    if loja not in lojas:
        lojas[loja] = []
    lojas[loja].append(c['nome'])

print("\n   Por loja:")
for loja_id, nomes in lojas.items():
    marca = "👉" if loja_id == LOJA_RICARDO else "  "
    print(f"   {marca} Loja {str(loja_id)[:8]}...: {len(nomes)} clientes")
    for nome in nomes[:2]:
        print(f"      - {nome}")
    if len(nomes) > 2:
        print(f"      ... mais {len(nomes)-2}")

# 3. Verificar código
print("\n3️⃣ ANÁLISE DO CÓDIGO:")
print("   📁 backend/modules/clientes/repository.py")
print("   ❌ Linha 60: query.eq('loja_id', loja_id)")
print("   ❌ SEMPRE filtra por loja, mesmo para SUPER_ADMIN")

print("\n4️⃣ PROBLEMA:")
print("   Você é SUPER_ADMIN mas o código não está respeitando isso!")
print("   Por isso só vê clientes da sua loja.")

print("\n5️⃣ SOLUÇÃO:")
print("   ✅ Já implementei a correção nos arquivos:")
print("   - services.py: Define loja_id = None para SUPER_ADMIN")
print("   - repository.py: Se loja_id = None, não filtra")
print("\n   Mas parece que a restauração do GitHub perdeu essas alterações!")

print("\n" + "="*60)
print("💡 Vou verificar se as correções ainda estão lá...")