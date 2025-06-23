"""
Script para popular a tabela cad_setores no Supabase
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

# Setores padrão
SETORES_PADRAO = [
    'Vendas',
    'Administrativo',
    'Medição',
    'Gerência',
    'Montagem',
    'Financeiro',
    'Marketing'
]

def criar_setores():
    """Cria os setores padrão no banco"""
    print("🚀 Iniciando criação de setores...")
    
    for nome in SETORES_PADRAO:
        try:
            # Verifica se já existe
            result = supabase.table('cad_setores').select('*').eq('nome', nome).execute()
            
            if result.data:
                print(f"✓ Setor '{nome}' já existe")
                continue
            
            # Cria novo setor
            novo_setor = {
                'id': str(uuid4()),
                'nome': nome,
                'ativo': True
            }
            
            supabase.table('cad_setores').insert(novo_setor).execute()
            print(f"✅ Setor '{nome}' criado com sucesso")
            
        except Exception as e:
            print(f"❌ Erro ao criar setor '{nome}': {str(e)}")
    
    # Lista todos os setores criados
    print("\n📋 Setores no banco:")
    result = supabase.table('cad_setores').select('*').order('nome').execute()
    
    for setor in result.data:
        print(f"  - {setor['nome']} (ID: {setor['id']})")

def analisar_funcionarios_setores():
    """Analisa relação entre funcionários e setores"""
    print("\n🔍 ANALISANDO FUNCIONÁRIOS E SETORES...")
    
    # Buscar funcionários
    funcionarios = supabase.table('cad_equipe').select('*').execute()
    setores = supabase.table('cad_setores').select('*').execute()
    
    print(f"👥 Total funcionários: {len(funcionarios.data)}")
    print(f"🏢 Total setores: {len(setores.data)}")
    
    # Mapear setores por ID
    setores_map = {s['id']: s['nome'] for s in setores.data}
    
    print("\n👥 FUNCIONÁRIOS E SEUS SETORES:")
    for func in funcionarios.data:
        setor_id = func.get('setor_id')
        setor_nome = setores_map.get(setor_id, 'SETOR NÃO ENCONTRADO') if setor_id else 'SEM SETOR'
        
        print(f"  - {func['nome']} ({func['perfil']}) → {setor_nome}")
        if setor_id and setor_id not in setores_map:
            print(f"    ⚠️  SETOR ID INVÁLIDO: {setor_id}")

if __name__ == "__main__":
    criar_setores()
    analisar_funcionarios_setores()