"""
Script de auditoria preventiva de constraints em todas as tabelas
Execute com: python3 audit_all_constraints.py
"""
import sys
sys.path.append('.')
from core.database import get_database

print("🔍 AUDITORIA PREVENTIVA DE CONSTRAINTS")
print("=" * 50)

db = get_database()

# Tabelas principais do sistema
TABELAS_PRINCIPAIS = [
    'cad_empresas',
    'c_lojas', 
    'c_clientes',
    'c_equipe',
    'c_montadores',
    'c_transportadoras',
    'c_setores',
    'c_procedencias',
    'c_formas_pagamento',
    'c_status_orcamento'
]

# Campos que devem ser únicos segundo nossa regra
CAMPOS_UNICOS_ESPERADOS = {
    'cad_empresas': ['nome'],
    'c_lojas': ['nome'],
    'c_clientes': ['nome'],
    'c_equipe': ['nome', 'email'],  # email pode ser único
    'c_montadores': ['nome'],
    'c_transportadoras': ['nome'],
    'c_setores': ['nome'],
    'c_procedencias': ['nome'],
    'c_formas_pagamento': ['nome'],
    'c_status_orcamento': ['nome']
}

# Campos que NÃO devem ser únicos (mas podem ter constraint no banco)
CAMPOS_PROBLEMATICOS = ['cpf', 'cnpj', 'cpf_cnpj', 'rg', 'ie', 'telefone']

print("\n📋 VERIFICANDO TABELAS PRINCIPAIS:\n")

problemas_encontrados = []

for tabela in TABELAS_PRINCIPAIS:
    print(f"\n🔍 Tabela: {tabela}")
    print("-" * 30)
    
    try:
        # Verificar se tabela existe
        result = db.table(tabela).select('*').limit(1).execute()
        print(f"✅ Tabela acessível")
        
        # Simular teste de campos problemáticos
        campos_unicos_esperados = CAMPOS_UNICOS_ESPERADOS.get(tabela, ['nome'])
        
        # Verificar se há possíveis constraints problemáticas
        for campo in CAMPOS_PROBLEMATICOS:
            # Aqui idealmente verificaríamos as constraints reais
            # Por ora, vamos listar os campos suspeitos
            if campo in ['cpf', 'cnpj', 'cpf_cnpj']:
                print(f"⚠️  ATENÇÃO: Campo '{campo}' pode ter constraint UNIQUE")
                problemas_encontrados.append({
                    'tabela': tabela,
                    'campo': campo,
                    'tipo': 'possível constraint única'
                })
                
    except Exception as e:
        print(f"❌ Erro ao acessar tabela: {str(e)}")

print("\n\n📊 RESUMO DA AUDITORIA")
print("=" * 50)

if problemas_encontrados:
    print(f"\n⚠️  PROBLEMAS POTENCIAIS ENCONTRADOS: {len(problemas_encontrados)}\n")
    
    # Agrupar por tabela
    tabelas_com_problemas = {}
    for problema in problemas_encontrados:
        tabela = problema['tabela']
        if tabela not in tabelas_com_problemas:
            tabelas_com_problemas[tabela] = []
        tabelas_com_problemas[tabela].append(problema['campo'])
    
    print("TABELAS QUE PODEM TER CONSTRAINTS INDEVIDAS:\n")
    for tabela, campos in tabelas_com_problemas.items():
        print(f"  📌 {tabela}:")
        for campo in campos:
            print(f"     - {campo} (pode ter UNIQUE)")
            
    print("\n🔧 SQL PREVENTIVO PARA EXECUTAR NO SUPABASE:\n")
    for tabela, campos in tabelas_com_problemas.items():
        for campo in campos:
            print(f"-- Remover constraint de {campo} em {tabela}")
            print(f"ALTER TABLE {tabela} DROP CONSTRAINT IF EXISTS {tabela}_{campo}_key;")
    print()
else:
    print("\n✅ Nenhum problema óbvio detectado!")
    
print("\n💡 RECOMENDAÇÕES:")
print("1. Execute o SQL preventivo no Supabase Dashboard")
print("2. Teste cadastros com dados duplicados em CPF/CNPJ")
print("3. Mantenha apenas constraints de 'nome' único")
print("4. Documente as mudanças realizadas")

# Criar arquivo SQL com comandos preventivos
sql_content = """-- SQL PREVENTIVO PARA REMOVER CONSTRAINTS PROBLEMÁTICAS
-- Execute no Supabase Dashboard

-- EMPRESAS
ALTER TABLE cad_empresas DROP CONSTRAINT IF EXISTS cad_empresas_cnpj_key;

-- LOJAS  
ALTER TABLE c_lojas DROP CONSTRAINT IF EXISTS c_lojas_cnpj_key;

-- CLIENTES
ALTER TABLE c_clientes DROP CONSTRAINT IF EXISTS c_clientes_cpf_key;
ALTER TABLE c_clientes DROP CONSTRAINT IF EXISTS c_clientes_cpf_cnpj_key;
ALTER TABLE c_clientes DROP CONSTRAINT IF EXISTS c_clientes_rg_key;
ALTER TABLE c_clientes DROP CONSTRAINT IF EXISTS c_clientes_rg_ie_key;
ALTER TABLE c_clientes DROP CONSTRAINT IF EXISTS c_clientes_telefone_key;
ALTER TABLE c_clientes DROP CONSTRAINT IF EXISTS c_clientes_email_key;

-- EQUIPE
ALTER TABLE c_equipe DROP CONSTRAINT IF EXISTS c_equipe_cpf_key;
ALTER TABLE c_equipe DROP CONSTRAINT IF EXISTS c_equipe_telefone_key;
-- Manter email único para evitar login duplicado

-- MONTADORES
ALTER TABLE c_montadores DROP CONSTRAINT IF EXISTS c_montadores_cpf_key;
ALTER TABLE c_montadores DROP CONSTRAINT IF EXISTS c_montadores_cnpj_key;
ALTER TABLE c_montadores DROP CONSTRAINT IF EXISTS c_montadores_telefone_key;

-- TRANSPORTADORAS
ALTER TABLE c_transportadoras DROP CONSTRAINT IF EXISTS c_transportadoras_cnpj_key;
ALTER TABLE c_transportadoras DROP CONSTRAINT IF EXISTS c_transportadoras_telefone_key;

-- VERIFICAR CONSTRAINTS RESTANTES
SELECT 
    t.table_name,
    c.constraint_name,
    c.constraint_type
FROM information_schema.table_constraints c
JOIN information_schema.tables t 
    ON t.table_name = c.table_name
WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND c.constraint_type = 'UNIQUE'
    AND t.table_name IN (
        'cad_empresas', 'c_lojas', 'c_clientes', 
        'c_equipe', 'c_montadores', 'c_transportadoras'
    )
ORDER BY t.table_name, c.constraint_name;
"""

with open('sql_preventivo_constraints.sql', 'w') as f:
    f.write(sql_content)
    
print(f"\n✅ Arquivo 'sql_preventivo_constraints.sql' criado com comandos SQL!")