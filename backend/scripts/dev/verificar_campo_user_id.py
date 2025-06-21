#!/usr/bin/env python3
"""
Verifica qual campo conecta usuarios com auth
"""
import os
import sys
from pathlib import Path
from supabase import create_client

sys.path.append(str(Path(__file__).parent))
from dotenv import load_dotenv
load_dotenv()

# Conectar ao Supabase
url = os.getenv('SUPABASE_URL')
service_key = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(url, service_key)

print("🔍 Verificando estrutura da tabela usuarios...\n")

# Buscar um registro para ver os campos
usuarios = supabase.table('usuarios').select('*').limit(1).execute()

if usuarios.data:
    usuario = usuarios.data[0]
    print("Campos disponíveis na tabela usuarios:")
    for campo, valor in usuario.items():
        print(f"  - {campo}: {valor}")
    
    print("\n🔍 Verificando qual campo corresponde ao user_id do auth...")
    
    # ID do auth que conhecemos
    auth_id = "03de5532-db40-4f78-aa66-63d30060ea4e"
    
    # Tentar encontrar por diferentes campos
    campos_possiveis = ['user_id', 'auth_id', 'id', 'usuario_id']
    
    for campo in campos_possiveis:
        if campo in usuario:
            print(f"\n✅ Campo '{campo}' existe!")
            # Verificar se corresponde
            result = supabase.table('usuarios').select('*').eq(campo, auth_id).execute()
            if result.data:
                print(f"   ✅ ENCONTRADO! O campo correto é: '{campo}'")
                print(f"   Dados: {result.data[0]}")
                break
else:
    print("❌ Nenhum usuário encontrado na tabela")