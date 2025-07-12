"""
Script para encontrar onde está o trigger que referencia config_loja
"""

import os
import sys
from supabase import create_client, Client

# Configurações do Supabase
SUPABASE_URL = "https://momwbpxqnvgehotfmvde.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vbXdicHhxbnZnZWhvdGZtdmRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzAxNTIsImV4cCI6MjA2MzM0NjE1Mn0.n90ZweBT-o1ugerZJDZl8gx65WGe1eUrhph6VuSdSCs"

def conectar_supabase():
    """Conecta ao Supabase"""
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Conectado ao Supabase")
        return supabase
    except Exception as e:
        print(f"❌ Erro ao conectar: {e}")
        return None

def testar_insercao_simples(supabase: Client):
    """Testa inserção mais simples possível"""
    print("\n🔍 TESTE DE INSERÇÃO MÍNIMA")
    print("=" * 50)
    
    try:
        # Tentar inserir APENAS os campos obrigatórios
        dados_minimos = {
            'numero': 'debug-minimal-001'
        }
        
        print("🔄 Tentando inserir apenas número...")
        response = supabase.table('c_orcamentos').insert(dados_minimos).execute()
        
        if response.data:
            print("✅ Inserção minima funcionou!")
            # Limpar
            orcamento_id = response.data[0]['id']
            supabase.table('c_orcamentos').delete().eq('id', orcamento_id).execute()
            print("🧹 Limpeza feita")
        else:
            print("❌ Inserção minima falhou")
            
    except Exception as e:
        print(f"❌ Erro na inserção minima: {e}")
        
        # Testar com campos opcionais preenchidos
        try:
            print("\n🔄 Tentando com mais campos...")
            dados_completos = {
                'numero': 'debug-complete-001',
                'valor_ambientes': 100.00,
                'valor_final': 100.00,
                'necessita_aprovacao': False
            }
            
            response = supabase.table('c_orcamentos').insert(dados_completos).execute()
            
            if response.data:
                print("✅ Inserção completa funcionou!")
                # Limpar
                orcamento_id = response.data[0]['id']
                supabase.table('c_orcamentos').delete().eq('id', orcamento_id).execute()
                print("🧹 Limpeza feita")
            else:
                print("❌ Inserção completa falhou")
                
        except Exception as e2:
            print(f"❌ Erro na inserção completa: {e2}")

def verificar_campos_obrigatorios(supabase: Client):
    """Verifica quais campos são obrigatórios"""
    print("\n🔍 VERIFICANDO CAMPOS OBRIGATÓRIOS")
    print("=" * 50)
    
    try:
        # Tentar inserir vazio para ver quais campos são obrigatórios
        response = supabase.table('c_orcamentos').insert({}).execute()
        
        if response.data:
            print("✅ Inserção vazia funcionou (nenhum campo obrigatório)")
        else:
            print("❌ Inserção vazia falhou")
            
    except Exception as e:
        print(f"❌ Erro na inserção vazia: {e}")
        
        # Analisar a mensagem de erro
        error_msg = str(e)
        if 'null value in column' in error_msg:
            print("⚠️  Erro de campo obrigatório detectado:")
            print(f"   {error_msg}")
        elif 'config_loja' in error_msg.lower():
            print("⚠️  ERRO DE CONFIG_LOJA DETECTADO:")
            print(f"   {error_msg}")

def main():
    """Função principal"""
    print("🔍 ENCONTRANDO TRIGGER CONFIG_LOJA")
    print("=" * 50)
    
    supabase = conectar_supabase()
    if not supabase:
        sys.exit(1)
    
    verificar_campos_obrigatorios(supabase)
    testar_insercao_simples(supabase)
    
    print("\n✅ TESTE CONCLUÍDO")

if __name__ == "__main__":
    main()