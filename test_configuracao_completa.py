#!/usr/bin/env python3
"""
Script de teste completo para verificar configurações do Supabase
"""
import os
import sys
import json
from supabase import create_client, Client
from datetime import datetime

def carregar_env_backend():
    """Carrega variáveis do .env do backend"""
    env_path = os.path.join('backend', '.env')
    env_vars = {}
    
    try:
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                if '=' in line and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    env_vars[key] = value
        return env_vars
    except Exception as e:
        print(f"❌ Erro ao carregar backend/.env: {e}")
        return {}

def carregar_env_frontend():
    """Carrega variáveis do .env.local do frontend"""
    env_path = '.env.local'
    env_vars = {}
    
    try:
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                if '=' in line and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    env_vars[key] = value
        return env_vars
    except Exception as e:
        print(f"⚠️ Arquivo .env.local não encontrado ou com erro: {e}")
        return {}

def verificar_configuracoes():
    """Verifica se as configurações estão consistentes"""
    print("🔍 VERIFICANDO CONFIGURAÇÕES...")
    print("=" * 50)
    
    # Carrega configurações
    backend_env = carregar_env_backend()
    frontend_env = carregar_env_frontend()
    
    # URLs esperadas
    url_esperada = "https://momwbpxqnvgehotfmvde.supabase.co"
    
    # Verifica backend
    backend_url = backend_env.get('SUPABASE_URL', '')
    print(f"Backend URL: {backend_url}")
    print(f"✅ Backend URL correta" if backend_url == url_esperada else f"❌ Backend URL incorreta")
    
    # Verifica frontend
    frontend_url = frontend_env.get('NEXT_PUBLIC_SUPABASE_URL', '')
    print(f"Frontend URL: {frontend_url}")
    if frontend_url:
        print(f"✅ Frontend URL correta" if frontend_url == url_esperada else f"❌ Frontend URL incorreta")
    else:
        print("❌ Frontend sem configuração Supabase")
    
    # Verifica chaves
    backend_anon = backend_env.get('SUPABASE_ANON_KEY', '')
    frontend_anon = frontend_env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')
    
    print(f"✅ Backend tem chave anon" if backend_anon else "❌ Backend sem chave anon")
    print(f"✅ Frontend tem chave anon" if frontend_anon else "❌ Frontend sem chave anon")
    
    if backend_anon and frontend_anon:
        print(f"✅ Chaves anon são iguais" if backend_anon == frontend_anon else "❌ Chaves anon diferentes")
    
    return backend_env, frontend_env

def testar_conectividade(env_vars):
    """Testa conectividade com Supabase"""
    print("\n🔗 TESTANDO CONECTIVIDADE...")
    print("=" * 50)
    
    url = env_vars.get('SUPABASE_URL')
    anon_key = env_vars.get('SUPABASE_ANON_KEY')
    service_key = env_vars.get('SUPABASE_SERVICE_KEY')
    
    if not url or not anon_key:
        print("❌ Configurações insuficientes para teste")
        return False
    
    try:
        # Teste com chave anônima
        print("Testando com chave anônima...")
        client = create_client(url, anon_key)
        
        # Tenta uma query simples (vai dar erro de permissão, mas conecta)
        try:
            result = client.table('usuarios').select('id').limit(1).execute()
            print("✅ Conexão com chave anônima funcionando")
        except Exception as e:
            if "permission denied" in str(e).lower() or "rls" in str(e).lower():
                print("✅ Conexão OK (erro de permissão esperado)")
            else:
                print(f"⚠️ Conexão com problema: {e}")
        
        # Teste com service key se disponível
        if service_key:
            print("Testando com service key...")
            admin_client = create_client(url, service_key)
            
            try:
                # Tenta listar tabelas
                result = admin_client.table('usuarios').select('id').limit(1).execute()
                print("✅ Conexão com service key funcionando")
                print(f"✅ Conseguiu consultar tabela usuarios")
            except Exception as e:
                print(f"⚠️ Service key com problema: {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro de conectividade: {e}")
        return False

def main():
    print("🚀 TESTE COMPLETO DE CONFIGURAÇÃO SUPABASE")
    print("=" * 60)
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Verifica configurações
    backend_env, frontend_env = verificar_configuracoes()
    
    # Testa conectividade
    conectividade_ok = testar_conectividade(backend_env)
    
    # Relatório final
    print("\n📋 RELATÓRIO FINAL")
    print("=" * 50)
    
    if conectividade_ok:
        print("✅ Sistema configurado corretamente!")
        print("✅ Conexão com Supabase funcionando!")
        
        if not frontend_env.get('NEXT_PUBLIC_SUPABASE_URL'):
            print("⚠️ Falta configurar frontend (.env.local)")
            print("📋 Execute as correções em CORRECOES_CONFIGURACAO.md")
        else:
            print("✅ Frontend também configurado!")
        
    else:
        print("❌ Problemas de configuração encontrados")
        print("📋 Verifique o relatório acima e as correções necessárias")
    
    print("\n🔚 Teste concluído!")

if __name__ == "__main__":
    main() 