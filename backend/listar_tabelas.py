#!/usr/bin/env python3
"""
Script para listar todas as tabelas no Supabase
"""

import os
import sys
from pathlib import Path
from supabase import create_client, Client

# Adicionar o diretório backend ao path
sys.path.append(str(Path(__file__).parent))

# Carregar variáveis de ambiente
from dotenv import load_dotenv
load_dotenv()

def listar_tabelas():
    """Lista todas as tabelas disponíveis no Supabase"""
    try:
        url = os.getenv('SUPABASE_URL')
        service_key = os.getenv('SUPABASE_SERVICE_KEY')
        
        if not url or not service_key:
            print("❌ Erro: Variáveis de ambiente não encontradas")
            return
            
        supabase: Client = create_client(url, service_key)
        
        print("📋 Listando tabelas no Supabase...\n")
        
        # Query para listar todas as tabelas públicas
        query = """
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
        """
        
        result = supabase.rpc('', {'query': query}).execute()
        print("Resultado da query:", result)
        
    except Exception as e:
        # Vamos tentar listar algumas tabelas conhecidas
        print("Tentando acessar tabelas conhecidas...\n")
        
        tabelas_possiveis = [
            'funcionarios', 'c_equipe', 'equipe', 'usuarios', 'users',
            'clientes', 'c_clientes', 'lojas', 'c_lojas', 
            'empresas', 'c_empresas', 'c_comissoes'
        ]
        
        for tabela in tabelas_possiveis:
            try:
                result = supabase.table(tabela).select('*').limit(1).execute()
                print(f"✅ Tabela '{tabela}' existe!")
            except Exception as e:
                if "does not exist" not in str(e):
                    print(f"⚠️  Tabela '{tabela}' - erro diferente: {str(e)[:50]}...")

if __name__ == "__main__":
    listar_tabelas()