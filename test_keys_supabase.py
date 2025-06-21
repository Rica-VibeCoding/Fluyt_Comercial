#!/usr/bin/env python3
"""
Script para testar se as API keys do Supabase estão funcionando
"""
import os
from supabase import create_client, Client
import json

# Carregar variáveis do .env
def load_env():
    env_path = os.path.join(os.path.dirname(__file__), 'backend', '.env')
    env_vars = {}
    try:
        with open(env_path, 'r') as f:
            for line in f:
                if '=' in line and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    env_vars[key] = value
        return env_vars
    except Exception as e:
        print(f"❌ Erro ao carregar .env: {e}")
        return {}

def main():
    print("🔍 TESTE DE API KEYS SUPABASE")
    print("=" * 50)
    
    # Carregar configurações
    env_vars = load_env()
    
    url = env_vars.get('SUPABASE_URL')
    anon_key = env_vars.get('SUPABASE_ANON_KEY')
    service_key = env_vars.get('SUPABASE_SERVICE_KEY')
    
    print(f"📍 URL: {url}")
    print()
    
    # Teste 1: ANON KEY
    print("🔑 TESTANDO ANON KEY...")
    try:
        client_anon = create_client(url, anon_key)
        # Tenta uma query simples
        result = client_anon.table('c_clientes').select('id').limit(1).execute()
        print("✅ ANON KEY funcionando!")
        print(f"   Query retornou: {len(result.data) if result.data else 0} registros")
    except Exception as e:
        print(f"❌ ANON KEY com erro: {e}")
    
    print()
    
    # Teste 2: SERVICE KEY
    print("🔐 TESTANDO SERVICE KEY...")
    try:
        client_service = create_client(url, service_key)
        # Tenta uma query simples
        result = client_service.table('c_clientes').select('id').limit(1).execute()
        print("✅ SERVICE KEY funcionando!")
        print(f"   Query retornou: {len(result.data) if result.data else 0} registros")
        
        # Tenta contar total
        count_result = client_service.table('c_clientes').select('id', count='exact').execute()
        print(f"📊 Total de clientes na tabela: {count_result.count}")
        
    except Exception as e:
        print(f"❌ SERVICE KEY com erro: {e}")
    
    print()
    print("🔍 SUGESTÕES:")
    print("1. Se ambas falharam: Verifique se as keys são do projeto correto")
    print("2. Se ANON funcionou mas SERVICE não: Regenere a SERVICE KEY")
    print("3. Se nenhuma funcionou: Confirme a URL do projeto")

if __name__ == "__main__":
    main()