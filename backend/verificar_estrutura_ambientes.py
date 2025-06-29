"""
Verifica estrutura atual das tabelas de ambientes
"""
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print("🔍 Verificando estrutura das tabelas de ambientes...\n")

# 1. Verificar c_ambientes
print("📋 Tabela c_ambientes:")
try:
    # Buscar um registro para ver a estrutura
    result = supabase.table('c_ambientes').select("*").limit(1).execute()
    
    if result.data:
        print("   Colunas encontradas:")
        for key in result.data[0].keys():
            print(f"   - {key}")
    else:
        # Tentar inserir um registro dummy para ver a estrutura
        try:
            test_data = {
                "nome": "TESTE",
                "cliente_id": "00000000-0000-0000-0000-000000000000"
            }
            supabase.table('c_ambientes').insert(test_data).execute()
            print("   ✓ Tabela existe e aceita inserções")
            # Deletar o registro de teste
            supabase.table('c_ambientes').delete().eq('nome', 'TESTE').execute()
        except Exception as e:
            print(f"   ⚠️ Erro ao testar inserção: {e}")
            
except Exception as e:
    print(f"   ❌ Tabela não encontrada ou erro: {e}")

print("\n📋 Tabela c_ambientes_material:")
try:
    result = supabase.table('c_ambientes_material').select("*").limit(1).execute()
    print("   ✓ Tabela existe")
except Exception as e:
    print(f"   ❌ Tabela não encontrada: {e}")
    
print("\n💡 Conclusão:")
print("   - A tabela c_ambientes existe mas pode estar com estrutura antiga")
print("   - A tabela c_ambientes_material precisa ser criada")
print("   - Execute o SQL no Supabase Dashboard para garantir estrutura correta")