#!/usr/bin/env python3
"""
Teste simples do sistema de autenticação
"""
import asyncio
import os
import sys
from pathlib import Path

# Setup do path
sys.path.append(str(Path(__file__).parent))

# Carregar variáveis de ambiente
from dotenv import load_dotenv
load_dotenv()

async def testar_auth():
    """Testa o login diretamente"""
    try:
        print("🔍 Testando sistema de autenticação...\n")
        
        # Importar serviços
        from modules.auth.services import AuthService
        from core.database import get_supabase
        
        # Verificar conexão com Supabase
        print("1️⃣ Verificando conexão com Supabase...")
        supabase = get_supabase()
        print("✅ Conexão OK\n")
        
        # Criar serviço de auth
        print("2️⃣ Criando serviço de autenticação...")
        auth_service = AuthService()
        print("✅ Serviço criado\n")
        
        # Testar login
        print("3️⃣ Testando login...")
        email = "ricardo.nilton@hotmail.com"
        senha = "senha123"
        
        try:
            result = await auth_service.login(email, senha)
            print("✅ Login bem-sucedido!")
            print(f"   Token: {result.access_token[:50]}...")
            print(f"   Usuário: {result.user.nome} ({result.user.email})")
            print(f"   Perfil: {result.user.perfil}")
        except Exception as e:
            print(f"❌ Erro no login: {str(e)}")
            print(f"   Tipo: {type(e).__name__}")
            
            # Tentar entender o erro
            if "Invalid login credentials" in str(e):
                print("\n💡 Credenciais inválidas. Verificando usuário no Supabase Auth...")
                
                # Verificar se o usuário existe
                from supabase import create_client
                url = os.getenv('SUPABASE_URL')
                service_key = os.getenv('SUPABASE_SERVICE_KEY')
                admin_client = create_client(url, service_key)
                
                users = admin_client.auth.admin.list_users()
                found = False
                for user in users:
                    if user.email == email:
                        found = True
                        print(f"✅ Usuário encontrado: {user.email}")
                        print(f"   ID: {user.id}")
                        print(f"   Criado em: {user.created_at}")
                        break
                
                if not found:
                    print("❌ Usuário não encontrado no Supabase Auth")
                else:
                    print("\n⚠️  Usuário existe mas senha está incorreta")
                    print("   Execute: python3 reset_senha_direto.py")
                    
    except ImportError as e:
        print(f"❌ Erro de importação: {str(e)}")
        print("   Verifique se todas as dependências estão instaladas")
    except Exception as e:
        print(f"❌ Erro geral: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(testar_auth())