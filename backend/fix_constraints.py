#!/usr/bin/env python3
"""
Script para remover constraint de CNPJ da tabela empresas
Execute com: python3 fix_constraints.py
"""
import sys
sys.path.append('.')

from core.database import get_database
import requests
import os
from dotenv import load_dotenv

load_dotenv()

print("🔧 Tentando remover constraint de CNPJ...")

# Pegar credenciais do Supabase
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("❌ Credenciais do Supabase não encontradas no .env")
    sys.exit(1)

# SQL para remover constraint
sql = "ALTER TABLE cad_empresas DROP CONSTRAINT IF EXISTS cad_empresas_cnpj_key;"

# Fazer request direto para Supabase REST API
url = f"{SUPABASE_URL}/rest/v1/rpc/sql"
headers = {
    "apikey": SUPABASE_SERVICE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    "Content-Type": "application/json"
}
data = {"query": sql}

try:
    # Tentar via RPC se disponível
    response = requests.post(url, json=data, headers=headers)
    
    if response.status_code == 200:
        print("✅ Constraint removida com sucesso!")
    else:
        print(f"❌ Erro ao executar SQL: {response.status_code}")
        print(f"Resposta: {response.text}")
        print("\n⚠️ Execute o SQL manualmente no Supabase Dashboard:")
        print(f"   {sql}")
        
except Exception as e:
    print(f"❌ Erro: {e}")
    print("\n⚠️ Execute o SQL manualmente no Supabase Dashboard:")
    print(f"   {sql}")

print("\n📋 Para verificar, execute no Supabase Dashboard:")
print("   SELECT constraint_name FROM information_schema.table_constraints")
print("   WHERE table_name = 'cad_empresas';")