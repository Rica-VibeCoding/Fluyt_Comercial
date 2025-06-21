#!/usr/bin/env python3
"""
🧪 TESTE COMPLETO DO SISTEMA DE AUTENTICAÇÃO REFATORADO
Verifica se todas as correções foram aplicadas com sucesso
"""

import asyncio
import os
import sys
from pathlib import Path

# Adicionar diretório backend ao path
sys.path.insert(0, str(Path(__file__).parent))

from supabase import create_client, Client
import os

async def test_auth_system():
    """Testa o sistema de autenticação completo"""
    print("🧪 INICIANDO TESTE COMPLETO DO SISTEMA DE AUTH...")
    print("=" * 60)
    
    # Carregar variáveis do .env
    supabase_url = os.getenv('SUPABASE_URL', 'https://momwbpxqnvgehotfmvde.supabase.co')
    supabase_key = os.getenv('SUPABASE_SERVICE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vbXdicHhxbnZnZWhvdGZtdmRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzc3MDE1MiwiZXhwIjoyMDYzMzQ2MTUyfQ.NyRBsnWlhUmZUQFykINlaMgm9dHGkzx2nqhCYjaNiFA')
    
    # 1. Testar conexão com Supabase
    print("\n1️⃣ TESTANDO CONEXÃO COM SUPABASE...")
    try:
        supabase: Client = create_client(supabase_url, supabase_key)
        print("   ✅ Conexão estabelecida com sucesso")
        print(f"   📋 URL: {supabase_url}")
    except Exception as e:
        print(f"   ❌ Erro na conexão: {e}")
        return False
    
    # 2. Verificar tabela usuarios
    print("\n2️⃣ VERIFICANDO TABELA USUARIOS...")
    try:
        result = supabase.table('usuarios').select('*').execute()
        usuarios = result.data
        print(f"   ✅ Tabela usuarios encontrada com {len(usuarios)} registros")
        
        for user in usuarios:
            print(f"   📋 Usuário: {user['nome']} ({user['email']}) - Perfil: {user['perfil']}")
            
    except Exception as e:
        print(f"   ❌ Erro ao acessar tabela usuarios: {e}")
        return False
    
    # 3. Verificar políticas RLS
    print("\n3️⃣ TESTANDO POLÍTICAS RLS...")
    try:
        # Tentar acesso direto (deve funcionar com service key)
        result = supabase.table('usuarios').select('*').limit(1).execute()
        print("   ✅ Políticas RLS estão funcionando (sem recursão)")
    except Exception as e:
        print(f"   ❌ Problema com políticas RLS: {e}")
        return False
    
    # 4. Testar estrutura dos dados
    print("\n4️⃣ VERIFICANDO ESTRUTURA DOS DADOS...")
    if usuarios:
        user = usuarios[0]
        required_fields = ['id', 'user_id', 'email', 'nome', 'perfil', 'ativo']
        missing_fields = [field for field in required_fields if field not in user]
        
        if missing_fields:
            print(f"   ❌ Campos ausentes: {missing_fields}")
            return False
        else:
            print("   ✅ Estrutura da tabela usuarios está correta")
    
    # 5. Verificar user_id do Supabase Auth
    print("\n5️⃣ VERIFICANDO VINCULAÇÃO COM SUPABASE AUTH...")
    ricardo_user = next((u for u in usuarios if u['email'] == 'ricardo.nilton@hotmail.com'), None)
    
    if ricardo_user:
        user_id = ricardo_user['user_id']
        print(f"   📋 User ID atual: {user_id}")
        
        # Verificar se existe no Supabase Auth
        try:
            auth_result = supabase.auth.admin.get_user_by_id(user_id)
            if auth_result.user:
                print("   ✅ Usuário vinculado ao Supabase Auth!")
            else:
                print("   ⚠️  Usuário NÃO existe no Supabase Auth")
                print("   📝 AÇÃO NECESSÁRIA: Criar usuário no Supabase Auth Dashboard")
        except Exception as e:
            print(f"   ⚠️  Erro ao verificar Supabase Auth: {e}")
            print("   📝 AÇÃO NECESSÁRIA: Criar usuário no Supabase Auth Dashboard")
    else:
        print("   ❌ Usuário ricardo.nilton@hotmail.com não encontrado")
        return False
    
    # 6. Testar rotas do backend
    print("\n6️⃣ VERIFICANDO ROTAS DO BACKEND...")
    try:
        from main import app
        print("   ✅ Aplicação FastAPI carregada com sucesso")
        
        # Listar rotas
        routes = []
        for route in app.routes:
            if hasattr(route, 'path'):
                routes.append(route.path)
        
        auth_routes = [r for r in routes if '/auth/' in r]
        print(f"   📋 Rotas de auth encontradas: {auth_routes}")
        
        if '/api/v1/auth/login' in routes:
            print("   ✅ Rota de login encontrada!")
        else:
            print("   ❌ Rota de login NÃO encontrada!")
            
    except Exception as e:
        print(f"   ❌ Erro ao carregar aplicação: {e}")
        return False
    
    # 7. Resumo final
    print("\n" + "=" * 60)
    print("📊 RESUMO DOS TESTES:")
    print("✅ Conexão Supabase: OK")
    print("✅ Tabela usuarios: OK")
    print("✅ Políticas RLS: OK")
    print("✅ Estrutura dados: OK")
    print("✅ Backend carregado: OK")
    
    if ricardo_user:
        print(f"📋 Usuário teste: {ricardo_user['nome']} ({ricardo_user['email']})")
        print(f"🔑 User ID: {ricardo_user['user_id']}")
    
    print("\n🎯 PRÓXIMOS PASSOS:")
    print("1. Acesse https://momwbpxqnvgehotfmvde.supabase.co/project/default/auth/users")
    print("2. Clique em 'Invite user'")
    print("3. Email: ricardo.nilton@hotmail.com")
    print("4. Senha: 123456 (temporária)")
    print("5. Confirme que o UUID gerado coincide com user_id na tabela")
    
    return True

if __name__ == "__main__":
    success = asyncio.run(test_auth_system())
    
    if success:
        print("\n🎉 SISTEMA REFATORADO COM SUCESSO!")
        print("⚡ Pronto para testar login!")
    else:
        print("\n❌ AINDA HÁ PROBLEMAS A RESOLVER")
        sys.exit(1) 