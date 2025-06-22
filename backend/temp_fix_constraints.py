"""
Script temporário para remover constraints via Python
Execute com: python3 temp_fix_constraints.py
"""
import sys
sys.path.append('.')
from core.database import get_database

print("🔧 Tentando remover constraints de CNPJ...")

db = get_database()

# Primeiro, vamos verificar se conseguimos fazer queries simples
try:
    # Testar listagem
    result = db.table('cad_empresas').select('id,nome,cnpj').limit(2).execute()
    print(f"✅ Conexão OK - {len(result.data)} empresas encontradas")
    
    # Tentar criar empresa com CNPJ duplicado para testar
    print("\n🧪 Testando se CNPJ ainda é único...")
    try:
        test_result = db.table('cad_empresas').insert({
            'nome': 'TESTE_CONSTRAINT_' + str(hash('test123')),
            'cnpj': '12345678000199',  # CNPJ que já existe
            'ativo': True
        }).execute()
        
        # Se chegou aqui, constraint foi removida!
        print("✅ SUCESSO! Constraint de CNPJ já foi removida!")
        
        # Limpar teste
        if test_result.data:
            db.table('cad_empresas').delete().eq('id', test_result.data[0]['id']).execute()
            print("🧹 Dados de teste limpos")
            
    except Exception as e:
        if "duplicate key" in str(e) and "cnpj" in str(e):
            print("❌ Constraint de CNPJ ainda existe!")
            print(f"   Erro: {str(e)}")
            print("\n📋 SOLUÇÃO: Execute no Supabase Dashboard:")
            print("   ALTER TABLE cad_empresas DROP CONSTRAINT cad_empresas_cnpj_key;")
        else:
            print(f"❌ Erro diferente: {e}")
            
except Exception as e:
    print(f"❌ Erro geral: {e}")

print("\n🔍 Verificando tabela c_lojas também...")
try:
    # Verificar se lojas tem constraint de CNPJ
    lojas = db.table('c_lojas').select('id,nome').limit(1).execute()
    print(f"✅ Tabela lojas acessível - {len(lojas.data)} loja(s)")
except Exception as e:
    print(f"❌ Erro ao acessar lojas: {e}")