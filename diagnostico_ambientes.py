#!/usr/bin/env python3
"""
Diagnóstico ETAPA 1 - Verificar dados de ambientes no Supabase
"""
import os
import sys
import json
from supabase import create_client, Client

# Configurações do Supabase
SUPABASE_URL = "https://momwbpxqnvgehotfmvde.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vbXdicHhxbnZnZWhvdGZtdmRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzc3MDE1MiwiZXhwIjoyMDYzMzQ2MTUyfQ.NyRBsnWlhUmZUQFykINlaMgm9dHGkzx2nqhCYjaNiFA"

def main():
    try:
        # Conectar ao Supabase
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        print("🔍 DIAGNÓSTICO ETAPA 1 - DADOS AMBIENTES")
        print("=" * 50)
        
        # 1. Verificar tabela c_ambientes
        print("\n📊 TABELA c_ambientes:")
        result = supabase.table("c_ambientes").select("*").limit(5).execute()
        
        if result.data:
            print(f"✅ {len(result.data)} registros encontrados")
            for amb in result.data:
                print(f"\n🏠 ID: {amb['id'][:8]}...")
                print(f"   Nome: {amb.get('nome', 'N/A')}")
                print(f"   Cliente: {amb.get('cliente_id', 'N/A')[:8]}...")
                print(f"   Origem: {amb.get('origem', 'N/A')}")
                print(f"   Valor Venda: R$ {amb.get('valor_venda', 0)}")
        else:
            print("❌ Nenhum ambiente encontrado")
        
        # 2. Verificar tabela c_ambientes_material
        print("\n\n📦 TABELA c_ambientes_material:")
        result_mat = supabase.table("c_ambientes_material").select("*").limit(3).execute()
        
        if result_mat.data:
            print(f"✅ {len(result_mat.data)} registros de materiais")
            for mat in result_mat.data:
                print(f"\n📋 Material ID: {mat['id'][:8]}...")
                print(f"   Ambiente: {mat.get('ambiente_id', 'N/A')[:8]}...")
                
                # Analisar estrutura do JSON
                materiais_json = mat.get('materiais_json', {})
                if materiais_json:
                    print(f"   Linha detectada: {materiais_json.get('linha_detectada', 'N/A')}")
                    
                    # Contar seções disponíveis
                    secoes = ['caixa', 'portas', 'ferragens', 'paineis', 'porta_perfil', 'brilhart_color']
                    secoes_presentes = [s for s in secoes if materiais_json.get(s)]
                    print(f"   Seções: {len(secoes_presentes)} ({', '.join(secoes_presentes)})")
                    
                    # Mostrar exemplo de dados de caixa se existir
                    if materiais_json.get('caixa'):
                        caixa = materiais_json['caixa']
                        print(f"   Exemplo Caixa: {caixa}")
                else:
                    print("   ⚠️ JSON materiais vazio")
        else:
            print("❌ Nenhum material encontrado")
        
        # 3. Verificar relacionamento
        print("\n\n🔗 VERIFICAÇÃO DE RELACIONAMENTO:")
        if result.data and result_mat.data:
            amb_ids = {amb['id'] for amb in result.data}
            mat_amb_ids = {mat['ambiente_id'] for mat in result_mat.data}
            
            # Ambientes com materiais
            com_materiais = amb_ids & mat_amb_ids
            sem_materiais = amb_ids - mat_amb_ids
            
            print(f"✅ Ambientes COM materiais: {len(com_materiais)}")
            print(f"⚠️ Ambientes SEM materiais: {len(sem_materiais)}")
            
        print("\n" + "=" * 50)
        print("✅ DIAGNÓSTICO CONCLUÍDO")
        
    except Exception as e:
        print(f"❌ ERRO: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    main()