#!/usr/bin/env python3
"""
Script para verificar tabela c_lojas
"""
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

def verificar_lojas():
    """Verifica tabela c_lojas"""
    try:
        url = os.getenv('SUPABASE_URL')
        service_key = os.getenv('SUPABASE_SERVICE_KEY')
        
        if not url or not service_key:
            print("❌ Erro: Variáveis de ambiente não encontradas")
            return
            
        supabase: Client = create_client(url, service_key)
        
        print("🔍 Verificando tabela c_lojas...\n")
        
        # Verificar se existe
        try:
            result = supabase.table('c_lojas').select('*').execute()
            print(f"✅ Tabela c_lojas existe! Total de registros: {len(result.data)}")
            
            if result.data:
                print("\n🏢 Lojas cadastradas:")
                for loja in result.data:
                    print(f"\n   Nome: {loja.get('nome', 'N/A')}")
                    print(f"   ID: {loja.get('id')}")
                    print(f"   CNPJ: {loja.get('cnpj', 'N/A')}")
                    print(f"   Ativa: {loja.get('ativa', 'N/A')}")
                    
                # Verificar se o ID 317c3115-e071-40a6-9bc5-7c3227e0d82c existe
                loja_id_procurado = "317c3115-e071-40a6-9bc5-7c3227e0d82c"
                print(f"\n🔍 Procurando loja com ID {loja_id_procurado}...")
                
                loja_especifica = supabase.table('c_lojas').select('*').eq('id', loja_id_procurado).execute()
                if loja_especifica.data:
                    print(f"✅ Loja encontrada: {loja_especifica.data[0].get('nome')}")
                else:
                    print(f"❌ Loja com ID {loja_id_procurado} não encontrada")
                    
        except Exception as e:
            if "does not exist" in str(e):
                print("❌ Tabela c_lojas não existe")
            else:
                print(f"❌ Erro ao verificar c_lojas: {str(e)}")
                
        # Verificar também cadastro_loja
        print("\n🔍 Verificando tabela cadastro_loja...")
        try:
            result = supabase.table('cadastro_loja').select('*').limit(1).execute()
            print(f"✅ Tabela cadastro_loja existe! Total: {len(result.data)}")
        except:
            print("❌ Tabela cadastro_loja não existe")
            
    except Exception as e:
        print(f"❌ Erro geral: {str(e)}")

if __name__ == "__main__":
    verificar_lojas()