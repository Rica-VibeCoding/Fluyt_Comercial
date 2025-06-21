#!/usr/bin/env python3
"""
Script para verificar usuários existentes no Supabase
"""

import os
import sys
from pathlib import Path
from supabase import create_client, Client

# Adicionar o diretório backend ao path
sys.path.append(str(Path(__file__).parent))

# Carregar variáveis de ambiente
from dotenv import load_dotenv
load_dotenv()

def verificar_usuarios():
    """Verifica usuários existentes no Supabase"""
    try:
        # Criar cliente Supabase usando service role key para acesso total
        url = os.getenv('SUPABASE_URL')
        service_key = os.getenv('SUPABASE_SERVICE_KEY')
        
        if not url or not service_key:
            print("❌ Erro: Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_KEY não encontradas")
            return
            
        supabase: Client = create_client(url, service_key)
        
        print("🔍 Verificando usuários no Supabase...\n")
        
        # 1. Verificar usuários na tabela auth.users (via service role)
        print("📋 Usuários no Supabase Auth:")
        print("-" * 80)
        
        # Buscar usuários usando a API admin
        auth_users = supabase.auth.admin.list_users()
        
        if auth_users and len(auth_users) > 0:
            for user in auth_users:
                print(f"ID: {user.id}")
                print(f"Email: {user.email}")
                print(f"Criado em: {user.created_at}")
                print(f"Último login: {user.last_sign_in_at}")
                print(f"Confirmado: {'Sim' if user.email_confirmed_at else 'Não'}")
                print("-" * 40)
        else:
            print("Nenhum usuário encontrado no Auth")
        
        # 2. Verificar funcionários nas tabelas possíveis
        print("\n📋 Verificando tabelas de usuários/funcionários:")
        print("-" * 80)
        
        # Tentar tabela 'usuarios'
        try:
            usuarios = supabase.table('usuarios').select('*').execute()
            if usuarios.data:
                print("\n✅ Tabela 'usuarios' encontrada com dados:")
                for user in usuarios.data:
                    print(f"ID: {user.get('id')}")
                    print(f"Email: {user.get('email')}")
                    print(f"Nome: {user.get('nome')}")
                    print(f"Perfil: {user.get('perfil')}")
                    print("-" * 40)
        except:
            pass
            
        # Tentar tabela 'users'
        try:
            users = supabase.table('users').select('*').execute()
            if users.data:
                print("\n✅ Tabela 'users' encontrada com dados:")
                for user in users.data:
                    print(f"Campos disponíveis: {list(user.keys())}")
                    print(f"Dados: {user}")
                    print("-" * 40)
        except:
            pass
            
        # 3. Verificar se ricardo.nilton@hotmail.com existe
        print("\n🔍 Procurando por ricardo.nilton@hotmail.com:")
        print("-" * 80)
        
        # No auth
        ricardo_auth = None
        if auth_users:
            for user in auth_users:
                if user.email == 'ricardo.nilton@hotmail.com':
                    ricardo_auth = user
                    break
        
        if ricardo_auth:
            print(f"✅ Usuário encontrado no Auth!")
            print(f"   ID: {ricardo_auth.id}")
            print(f"   Use este ID para criar o registro na tabela funcionarios")
        else:
            print("❌ Usuário NÃO encontrado no Auth")
            print("   Você precisa criar o usuário primeiro no Supabase Dashboard")
            
        # Procurar nas tabelas existentes
        tabelas_usuario = ['usuarios', 'users']
        encontrado = False
        
        for tabela in tabelas_usuario:
            try:
                ricardo_data = supabase.table(tabela).select('*').eq('email', 'ricardo.nilton@hotmail.com').execute()
                if ricardo_data.data:
                    print(f"\n✅ Usuário encontrado na tabela '{tabela}'!")
                    print(f"   Dados: {ricardo_data.data[0]}")
                    encontrado = True
                    break
            except:
                pass
                
        if not encontrado:
            print("\n❌ Usuário NÃO encontrado nas tabelas de dados")
            if ricardo_auth:
                print(f"   Você precisa adicionar o usuário em uma tabela de dados")
                print(f"   ID do Auth: {ricardo_auth.id}")
            
    except Exception as e:
        print(f"❌ Erro ao verificar usuários: {str(e)}")
        print("\n💡 Dicas:")
        print("   - Certifique-se de que as variáveis de ambiente estão corretas")
        print("   - Verifique se o service_role key tem permissões adequadas")

if __name__ == "__main__":
    verificar_usuarios()