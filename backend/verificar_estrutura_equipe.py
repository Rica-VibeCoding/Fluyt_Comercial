#!/usr/bin/env python3
"""
Script para verificar estrutura exata da tabela cad_equipe
"""
import os
from supabase import create_client, Client
from dotenv import load_dotenv
import json

# Carregar variáveis de ambiente
load_dotenv()

def verificar_estrutura():
    """Verifica estrutura e um registro da tabela cad_equipe"""
    try:
        url = os.getenv('SUPABASE_URL')
        service_key = os.getenv('SUPABASE_SERVICE_KEY')
        
        if not url or not service_key:
            print("❌ Erro: Variáveis de ambiente não encontradas")
            return
            
        supabase: Client = create_client(url, service_key)
        
        print("🔍 Verificando estrutura da tabela cad_equipe...\n")
        
        # Pegar um registro de exemplo
        result = supabase.table('cad_equipe').select('*').limit(1).execute()
        
        if result.data:
            print("📋 Estrutura de um registro (campos disponíveis):\n")
            registro = result.data[0]
            
            # Mostrar todos os campos
            for campo, valor in registro.items():
                tipo = type(valor).__name__
                print(f"   {campo}: {tipo} = {valor}")
                
            print("\n" + "="*60)
            print("\n📊 Resumo dos campos relacionados:")
            
            # Verificar campos de relacionamento
            campos_rel = ['loja_id', 'empresa_id', 'setor_id', 'user_id']
            for campo in campos_rel:
                if campo in registro:
                    print(f"✅ {campo} existe: {registro[campo]}")
                else:
                    print(f"❌ {campo} NÃO existe")
                    
            # Verificar se existe empresa com o ID da loja
            if 'loja_id' in registro and registro['loja_id']:
                print(f"\n🔍 Verificando se loja_id {registro['loja_id']} existe em cad_empresas...")
                empresa_result = supabase.table('cad_empresas').select('*').eq('id', registro['loja_id']).execute()
                if empresa_result.data:
                    print(f"✅ Encontrado em cad_empresas: {empresa_result.data[0].get('nome', 'N/A')}")
                else:
                    print(f"❌ Não encontrado em cad_empresas")
                    
        else:
            print("⚠️  Nenhum registro encontrado em cad_equipe")
            
    except Exception as e:
        print(f"❌ Erro: {str(e)}")

if __name__ == "__main__":
    verificar_estrutura()