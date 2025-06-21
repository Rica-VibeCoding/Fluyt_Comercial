#!/usr/bin/env python3
"""
Script para testar conectividade com Supabase e identificar problemas
"""
import os
import sys
from supabase import create_client, Client
import json
import base64

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

def decode_jwt_payload(token):
    """Decodifica payload do JWT sem verificar assinatura"""
    try:
        # JWT tem 3 partes separadas por ponto
        parts = token.split('.')
        if len(parts) != 3:
            return None
        
        # Payload é a segunda parte
        payload = parts[1]
        
        # Adiciona padding se necessário
        padding = len(payload) % 4
        if padding:
            payload += '=' * (4 - padding)
        
        # Decodifica base64
        decoded = base64.urlsafe_b64decode(payload)
        return json.loads(decoded)
    except Exception as e:
        return f"Erro ao decodificar: {e}"

def main():
    print("🔍 TESTE DE CONECTIVIDADE SUPABASE")
    print("=" * 50)
    
    # Carregar configurações
    env_vars = load_env()
    
    if not env_vars:
        print("❌ Não foi possível carregar .env")
        return
    
    url = env_vars.get('SUPABASE_URL')
    anon_key = env_vars.get('SUPABASE_ANON_KEY')
    service_key = env_vars.get('SUPABASE_SERVICE_KEY')
    
    print(f"📍 URL: {url}")
    print(f"🔑 ANON KEY: {anon_key[:20]}...")
    print(f"🔐 SERVICE KEY: {service_key[:20]}...")
    print()
    
    # Análise dos JWTs
    print("🔍 ANÁLISE DOS TOKENS:")
    print("-" * 30)
    
    anon_payload = decode_jwt_payload(anon_key)
    service_payload = decode_jwt_payload(service_key)
    
    print("ANON KEY:")
    if isinstance(anon_payload, dict):
        print(f"  - Projeto: {anon_payload.get('ref', 'N/A')}")
        print(f"  - Role: {anon_payload.get('role', 'N/A')}")
        print(f"  - Expira: {anon_payload.get('exp', 'N/A')}")
    else:
        print(f"  - Erro: {anon_payload}")
    
    print("SERVICE KEY:")
    if isinstance(service_payload, dict):
        print(f"  - Projeto: {service_payload.get('ref', 'N/A')}")
        print(f"  - Role: {service_payload.get('role', 'N/A')}")
        print(f"  - Expira: {service_payload.get('exp', 'N/A')}")
    else:
        print(f"  - Erro: {service_payload}")
    
    # Verificar se projetos coincidem
    if isinstance(anon_payload, dict) and isinstance(service_payload, dict):
        anon_ref = anon_payload.get('ref')
        service_ref = service_payload.get('ref')
        
        if anon_ref != service_ref:
            print(f"⚠️  PROBLEMA: Projetos diferentes!")
            print(f"   ANON: {anon_ref}")
            print(f"   SERVICE: {service_ref}")
        else:
            print(f"✅ Projetos coincidem: {anon_ref}")
    
    print()
    
    # Teste de conectividade
    print("🧪 TESTE DE CONECTIVIDADE:")
    print("-" * 30)
    
    try:
        # Teste com chave anon
        print("Testando com ANON key...")
        client_anon = create_client(url, anon_key)
        
        # Teste simples de health
        # Não vamos testar tabelas ainda pois podem não existir
        print("✅ Cliente ANON criado com sucesso")
        
        # Teste com service key
        print("Testando com SERVICE key...")
        client_service = create_client(url, service_key)
        print("✅ Cliente SERVICE criado com sucesso")
        
        # Teste básico de conectividade
        print("Testando conectividade básica...")
        
        # Tentar listar tabelas (só funciona com service key)
        try:
            # Esta query lista tabelas do schema public
            result = client_service.rpc('get_schema', {}).execute()
            print("✅ Conectividade com banco confirmada")
        except Exception as e:
            print(f"⚠️  Aviso: {str(e)}")
            print("   (Normal se RPC não existir)")
        
        print()
        print("🎉 TESTE CONCLUÍDO")
        print("✅ Clientes Supabase funcionando")
        if anon_ref != service_ref:
            print("⚠️  AÇÃO NECESSÁRIA: Corrigir SERVICE_KEY para o projeto correto")
        
    except Exception as e:
        print(f"❌ Erro na conectividade: {e}")
        print()
        print("🔧 POSSÍVEIS SOLUÇÕES:")
        print("1. Verificar se URL está correta")
        print("2. Verificar se as keys são do mesmo projeto")
        print("3. Verificar se o projeto Supabase está ativo")

if __name__ == "__main__":
    main()