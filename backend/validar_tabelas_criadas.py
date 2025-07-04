#!/usr/bin/env python3
"""
Script para validar se as tabelas foram criadas corretamente no Supabase
Execute após rodar o SQL no dashboard do Supabase
"""

from supabase import create_client

# Configuração
SUPABASE_URL = 'https://momwbpxqnvgehotfmvde.supabase.co'
SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vbXdicHhxbnZnZWhvdGZtdmRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzc3MDE1MiwiZXhwIjoyMDYzMzQ2MTUyfQ.NyRBsnWlhUmZUQFykINlaMgm9dHGkzx2nqhCYjaNiFA'

def main():
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    print("🔍 VALIDANDO TABELAS CRIADAS")
    print("=" * 50)
    
    # 1. Verificar c_status_orcamento
    try:
        status_result = supabase.table('c_status_orcamento').select('*').execute()
        print(f"✅ c_status_orcamento: {len(status_result.data)} registros")
        
        for status in status_result.data:
            print(f"   {status['ordem']}. {status['nome']} ({status['cor']})")
            
    except Exception as e:
        print(f"❌ c_status_orcamento: {e}")
    
    # 2. Verificar c_formas_pagamento
    try:
        formas_result = supabase.table('c_formas_pagamento').select('*', count='exact').execute()
        print(f"✅ c_formas_pagamento: {formas_result.count} registros")
        
    except Exception as e:
        print(f"❌ c_formas_pagamento: {e}")
    
    # 3. Verificar c_orcamentos (se tem campo status_id)
    try:
        orcamentos_result = supabase.table('c_orcamentos').select('id, numero, status_id', count='exact').execute()
        print(f"✅ c_orcamentos: {orcamentos_result.count} registros")
        
        # Verificar se tem campo status_id
        has_status = any('status_id' in str(orc) for orc in orcamentos_result.data)
        if has_status:
            print("✅ Campo status_id adicionado com sucesso")
        else:
            print("⚠️  Campo status_id não encontrado")
            
    except Exception as e:
        print(f"❌ c_orcamentos: {e}")
    
    print("\n📊 RESUMO:")
    print("- c_status_orcamento: Controla fases do orçamento")
    print("- c_formas_pagamento: Armazena como cliente vai pagar")
    print("- c_orcamentos: Atualizada com referência ao status")

if __name__ == "__main__":
    main()