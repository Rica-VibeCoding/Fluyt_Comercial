#!/usr/bin/env python3
"""
Script para listar todas as tabelas do Supabase
"""
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

def listar_tabelas():
    """Lista todas as tabelas disponíveis"""
    try:
        url = os.getenv('SUPABASE_URL')
        service_key = os.getenv('SUPABASE_SERVICE_KEY')
        
        if not url or not service_key:
            print("❌ Erro: Variáveis de ambiente não encontradas")
            return
            
        supabase: Client = create_client(url, service_key)
        
        print("📋 Listando tabelas do Supabase...\n")
        
        # Query para listar todas as tabelas públicas
        query = """
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        ORDER BY tablename;
        """
        
        # Executar query usando RPC se disponível ou listar tabelas conhecidas
        tabelas_conhecidas = [
            'cad_equipe',
            'cad_setores',
            'cad_loja',
            'cad_lojas',
            'cadastro_lojas',
            'cadastro_loja',
            'lojas',
            'loja',
            'cad_empresa',
            'cad_empresas',
            'cadastro_empresas',
            'cad_clientes',
            'cad_funcionarios',
            'funcionarios',
            'equipe'
        ]
        
        print("🔍 Verificando tabelas conhecidas:\n")
        
        for tabela in tabelas_conhecidas:
            try:
                result = supabase.table(tabela).select('*').limit(1).execute()
                print(f"✅ {tabela} - existe ({len(result.data)} registro de teste)")
            except Exception as e:
                if "does not exist" in str(e):
                    print(f"❌ {tabela} - não existe")
                else:
                    print(f"⚠️  {tabela} - erro: {str(e)[:50]}...")
                    
    except Exception as e:
        print(f"❌ Erro geral: {str(e)}")

if __name__ == "__main__":
    listar_tabelas()