#!/usr/bin/env python3
"""
Script para verificar e criar tabela cad_setores no Supabase
"""
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

def verificar_e_criar_setores():
    """Verifica se tabela cad_setores existe e cria se necessário"""
    try:
        url = os.getenv('SUPABASE_URL')
        service_key = os.getenv('SUPABASE_SERVICE_KEY')
        
        if not url or not service_key:
            print("❌ Erro: Variáveis de ambiente não encontradas")
            return
            
        # Criar cliente com service key (tem permissões administrativas)
        supabase: Client = create_client(url, service_key)
        
        print("🔍 Verificando tabela cad_setores...")
        
        # Tentar consultar a tabela
        try:
            result = supabase.table('cad_setores').select('*').limit(1).execute()
            print(f"✅ Tabela cad_setores existe! Total de registros: {len(result.data)}")
            
            # Se não tem dados, popular com dados básicos
            if len(result.data) == 0:
                print("📝 Populando tabela com dados básicos...")
                
                setores = [
                    {'nome': 'Vendas', 'descricao': 'Equipe de vendas'},
                    {'nome': 'Administrativo', 'descricao': 'Equipe administrativa'},
                    {'nome': 'Medição', 'descricao': 'Equipe de medição'},
                    {'nome': 'Gerência', 'descricao': 'Gerência geral'},
                    {'nome': 'Financeiro', 'descricao': 'Equipe financeira'},
                    {'nome': 'Marketing', 'descricao': 'Equipe de marketing'}
                ]
                
                for setor in setores:
                    supabase.table('cad_setores').insert(setor).execute()
                
                print("✅ Setores criados com sucesso!")
            
            # Listar setores existentes
            all_setores = supabase.table('cad_setores').select('*').execute()
            print(f"\n📋 Setores cadastrados ({len(all_setores.data)}):")
            for setor in all_setores.data:
                print(f"   - {setor['nome']} (ID: {setor['id']})")
                
        except Exception as e:
            if "relation" in str(e) and "does not exist" in str(e):
                print("❌ Tabela cad_setores não existe!")
                print("⚠️  Execute o script SQL no Supabase Dashboard:")
                print("\n" + "="*50)
                with open('sql/criar_tabela_setores.sql', 'r') as f:
                    print(f.read())
                print("="*50 + "\n")
            else:
                print(f"❌ Erro ao verificar tabela: {str(e)}")
                
    except Exception as e:
        print(f"❌ Erro geral: {str(e)}")

if __name__ == "__main__":
    verificar_e_criar_setores()