"""
Script para popular a tabela cad_procedencias no Supabase
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Adiciona o diretório backend ao path
sys.path.append(str(Path(__file__).parent.parent.parent))

from supabase import create_client, Client
from uuid import uuid4

# Carrega variáveis de ambiente
load_dotenv()

# Configuração do Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Erro: Configure SUPABASE_URL e SUPABASE_KEY no arquivo .env")
    sys.exit(1)

# Cria cliente Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Procedências padrão
PROCEDENCIAS_PADRAO = [
    'Indicação Amigo',
    'Facebook',
    'Google',
    'Site',
    'WhatsApp',
    'Loja Física',
    'Outros'
]

def criar_procedencias():
    """Cria as procedências padrão no banco"""
    print("🚀 Iniciando criação de procedências...")
    
    for nome in PROCEDENCIAS_PADRAO:
        try:
            # Verifica se já existe
            result = supabase.table('cad_procedencias').select('*').eq('nome', nome).execute()
            
            if result.data:
                print(f"✓ Procedência '{nome}' já existe")
                continue
            
            # Cria nova procedência
            nova_procedencia = {
                'id': str(uuid4()),
                'nome': nome,
                'ativo': True
            }
            
            supabase.table('cad_procedencias').insert(nova_procedencia).execute()
            print(f"✅ Procedência '{nome}' criada com sucesso")
            
        except Exception as e:
            print(f"❌ Erro ao criar procedência '{nome}': {str(e)}")
    
    # Lista todas as procedências criadas
    print("\n📋 Procedências no banco:")
    result = supabase.table('cad_procedencias').select('*').order('nome').execute()
    
    for proc in result.data:
        print(f"  - {proc['nome']} (ID: {proc['id']})")

if __name__ == "__main__":
    criar_procedencias() 