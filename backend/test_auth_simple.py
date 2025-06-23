#!/usr/bin/env python3
"""
Script para testar autenticação diretamente
"""
import os
import sys
from pathlib import Path
from supabase import create_client, Client
from dotenv import load_dotenv

# Adicionar o diretório backend ao path
sys.path.append(str(Path(__file__).parent.parent))

# Carregar variáveis de ambiente
load_dotenv()

def testar_auth():
    """Testa autenticação e lista usuários"""
    try:
        url = os.getenv('SUPABASE_URL')
        anon_key = os.getenv('SUPABASE_ANON_KEY')
        service_key = os.getenv('SUPABASE_SERVICE_KEY')
        
        if not url or not anon_key:
            print("❌ Erro: Variáveis de ambiente não encontradas")
            return
            
        # Teste 1: Login com credenciais conhecidas
        print("🔐 Teste de Login Direto no Supabase")
        print("-" * 40)
        
        supabase_anon: Client = create_client(url, anon_key)
        
        # Tentar fazer login
        try:
            response = supabase_anon.auth.sign_in_with_password({
                "email": "admin@fluyt.com.br",
                "password": "Admin@123"
            })
            print("✅ Login bem-sucedido!")
            print(f"   User ID: {response.user.id}")
            print(f"   Email: {response.user.email}")
            print(f"   Token: {response.session.access_token[:20]}...")
        except Exception as e:
            print(f"❌ Erro no login: {str(e)}")
            
            # Se login falhou, listar usuários usando service key
            if service_key:
                print("\n📋 Listando usuários existentes...")
                supabase_admin: Client = create_client(url, service_key)
                
                try:
                    users = supabase_admin.auth.admin.list_users()
                    print(f"\nTotal de usuários: {len(users)}")
                    
                    for i, user in enumerate(users[:5]):  # Mostrar até 5 usuários
                        print(f"\n{i+1}. Email: {user.email}")
                        print(f"   ID: {user.id}")
                        print(f"   Created: {user.created_at}")
                        
                        # Verificar se tem dados em cad_funcionarios
                        func_result = supabase_admin.table('cad_funcionarios').select('*').eq('user_id', user.id).execute()
                        if func_result.data:
                            print(f"   Nome: {func_result.data[0].get('nome', 'N/A')}")
                            print(f"   Perfil: {func_result.data[0].get('perfil', 'N/A')}")
                        else:
                            print("   ⚠️  Sem dados em cad_funcionarios")
                            
                except Exception as admin_e:
                    print(f"❌ Erro ao listar usuários: {str(admin_e)}")
                    
    except Exception as e:
        print(f"❌ Erro geral: {str(e)}")

if __name__ == "__main__":
    testar_auth()