#!/usr/bin/env python3
"""
AUDITORIA COMPLETA DAS TABELAS SUPABASE - 2025
Depura todas as tabelas para evitar bugs de constraints futuras
Execute com: python3 supabase_audit_completo.py
"""
import sys
sys.path.append('.')
from core.database import get_database
import json

print("🔍 AUDITORIA COMPLETA SUPABASE - DETECÇÃO PREVENTIVA DE BUGS")
print("=" * 70)

db = get_database()

# Lista todas as tabelas do sistema
def listar_todas_tabelas():
    """Lista todas as tabelas do projeto"""
    try:
        # Query para listar todas as tabelas
        result = db.rpc('sql', {
            'query': '''
            SELECT 
                table_name,
                table_type
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
                AND table_type = 'BASE TABLE'
            ORDER BY table_name;
            '''
        }).execute()
        
        if result.data:
            return [row['table_name'] for row in result.data]
        return []
    except:
        # Fallback: listar tabelas conhecidas + tentar descobrir outras
        tabelas_conhecidas = [
            'cad_empresas', 'c_lojas', 'c_clientes', 'c_equipe', 
            'c_montadores', 'c_transportadoras', 'c_setores', 
            'c_procedencias', 'c_formas_pagamento', 'c_status_orcamento',
            'c_comissoes', 'c_orcamentos', 'c_ambientes'
        ]
        
        tabelas_existentes = []
        for tabela in tabelas_conhecidas:
            try:
                db.table(tabela).select('*').limit(1).execute()
                tabelas_existentes.append(tabela)
            except:
                pass
                
        return tabelas_existentes

def verificar_constraints_tabela(tabela):
    """Verifica constraints de uma tabela específica"""
    try:
        result = db.rpc('sql', {
            'query': f'''
            SELECT 
                c.constraint_name,
                c.constraint_type,
                kcu.column_name
            FROM information_schema.table_constraints c
            LEFT JOIN information_schema.key_column_usage kcu 
                ON c.constraint_name = kcu.constraint_name
            WHERE c.table_name = '{tabela}'
                AND c.table_schema = 'public'
            ORDER BY c.constraint_type, c.constraint_name;
            '''
        }).execute()
        
        if result.data:
            return result.data
        return []
    except:
        return []

def verificar_estrutura_tabela(tabela):
    """Verifica estrutura/colunas de uma tabela"""
    try:
        result = db.rpc('sql', {
            'query': f'''
            SELECT 
                column_name,
                data_type,
                is_nullable,
                column_default
            FROM information_schema.columns
            WHERE table_name = '{tabela}'
                AND table_schema = 'public'
            ORDER BY ordinal_position;
            '''
        }).execute()
        
        if result.data:
            return result.data
        return []
    except:
        return []

def testar_dados_duplicados(tabela, campos_suspeitos):
    """Testa se tabela aceita dados duplicados em campos suspeitos"""
    problemas = []
    
    for campo in campos_suspeitos:
        try:
            # Tentar inserir dados de teste duplicados
            dados_teste = {
                'nome': f'TESTE_AUDIT_{hash(tabela + campo)}',
                campo: 'TESTE_DUPLICADO_123',
                'ativo': True
            }
            
            # Primeiro insert
            result1 = db.table(tabela).insert(dados_teste).execute()
            if not result1.data:
                continue
                
            id1 = result1.data[0]['id']
            
            # Segundo insert (para testar duplicação)
            dados_teste['nome'] = f'TESTE_AUDIT_2_{hash(tabela + campo)}'
            try:
                result2 = db.table(tabela).insert(dados_teste).execute()
                if result2.data:
                    id2 = result2.data[0]['id']
                    # Limpeza
                    db.table(tabela).delete().eq('id', id2).execute()
                    
            except Exception as e:
                if 'duplicate key' in str(e) and campo in str(e):
                    problemas.append({
                        'campo': campo,
                        'erro': str(e),
                        'tipo': 'constraint_unique'
                    })
            
            # Limpeza do primeiro insert
            db.table(tabela).delete().eq('id', id1).execute()
            
        except Exception as e:
            if 'duplicate key' in str(e):
                problemas.append({
                    'campo': campo,
                    'erro': str(e),
                    'tipo': 'constraint_unique'
                })
    
    return problemas

# EXECUTAR AUDITORIA
print("\n📋 DESCOBRINDO TABELAS EXISTENTES...")
tabelas = listar_todas_tabelas()

if not tabelas:
    print("❌ Não foi possível listar tabelas")
    sys.exit(1)

print(f"✅ Encontradas {len(tabelas)} tabelas:")
for i, tabela in enumerate(tabelas, 1):
    print(f"   {i:2d}. {tabela}")

print("\n" + "=" * 70)
print("🔍 AUDITORIA DETALHADA POR TABELA")
print("=" * 70)

# Campos que podem causar problemas
CAMPOS_SUSPEITOS = ['cpf', 'cnpj', 'cpf_cnpj', 'rg', 'rg_ie', 'telefone', 'email']

relatorio_completo = {
    'total_tabelas': len(tabelas),
    'tabelas_com_problemas': [],
    'tabelas_seguras': [],
    'constraints_problematicas': [],
    'recomendacoes': []
}

for tabela in tabelas:
    print(f"\n🔍 TABELA: {tabela}")
    print("-" * 50)
    
    # 1. Verificar estrutura
    colunas = verificar_estrutura_tabela(tabela)
    print(f"   📊 Colunas: {len(colunas)}")
    
    # 2. Verificar constraints
    constraints = verificar_constraints_tabela(tabela)
    unique_constraints = [c for c in constraints if c['constraint_type'] == 'UNIQUE']
    
    print(f"   🔒 Constraints UNIQUE: {len(unique_constraints)}")
    
    # 3. Identificar constraints problemáticas
    constraints_problematicas = []
    for constraint in unique_constraints:
        coluna = constraint['column_name']
        if coluna in CAMPOS_SUSPEITOS:
            constraints_problematicas.append(constraint)
            print(f"   ⚠️  PROBLEMA: {constraint['constraint_name']} em '{coluna}'")
            
    # 4. Testar dados duplicados
    colunas_suspeitas = [col['column_name'] for col in colunas if col['column_name'] in CAMPOS_SUSPEITOS]
    if colunas_suspeitas:
        print(f"   🧪 Testando duplicação em: {', '.join(colunas_suspeitas)}")
        problemas_teste = testar_dados_duplicados(tabela, colunas_suspeitas)
        
        if problemas_teste:
            print(f"   ❌ Problemas encontrados: {len(problemas_teste)}")
            for problema in problemas_teste:
                print(f"      - {problema['campo']}: {problema['tipo']}")
        else:
            print(f"   ✅ Nenhum problema de duplicação detectado")
    
    # 5. Compilar relatório
    if constraints_problematicas or (colunas_suspeitas and problemas_teste):
        relatorio_completo['tabelas_com_problemas'].append({
            'tabela': tabela,
            'constraints_problematicas': constraints_problematicas,
            'problemas_teste': problemas_teste if colunas_suspeitas else []
        })
    else:
        relatorio_completo['tabelas_seguras'].append(tabela)

# GERAR RELATÓRIO FINAL
print("\n" + "=" * 70)
print("📊 RELATÓRIO FINAL DA AUDITORIA")
print("=" * 70)

print(f"\n✅ TABELAS SEGURAS: {len(relatorio_completo['tabelas_seguras'])}")
for tabela in relatorio_completo['tabelas_seguras']:
    print(f"   ✓ {tabela}")

print(f"\n⚠️  TABELAS COM PROBLEMAS: {len(relatorio_completo['tabelas_com_problemas'])}")

sql_fixes = []
for item in relatorio_completo['tabelas_com_problemas']:
    tabela = item['tabela']
    print(f"\n   📌 {tabela}:")
    
    for constraint in item['constraints_problematicas']:
        constraint_name = constraint['constraint_name']
        coluna = constraint['column_name']
        print(f"      ❌ {constraint_name} (coluna: {coluna})")
        sql_fixes.append(f"ALTER TABLE {tabela} DROP CONSTRAINT IF EXISTS {constraint_name};")
    
    for problema in item['problemas_teste']:
        print(f"      ❌ Teste falhou: {problema['campo']} - {problema['tipo']}")

# GERAR SQL DE CORREÇÃO
if sql_fixes:
    print(f"\n🔧 SQL PARA CORREÇÃO ({len(sql_fixes)} comandos):")
    print("-" * 50)
    for sql in sql_fixes:
        print(f"   {sql}")
    
    # Salvar em arquivo
    with open('/mnt/c/Users/ricar/Projetos/Fluyt_Comercial/sql_correcao_constraints.sql', 'w') as f:
        f.write("-- SQL GERADO PELA AUDITORIA AUTOMÁTICA\\n")
        f.write("-- Execute no Supabase Dashboard\\n\\n")
        for sql in sql_fixes:
            f.write(sql + "\\n")
        f.write("\\n-- Verificar resultado:\\n")
        f.write('''SELECT 
    t.table_name,
    c.constraint_name,
    c.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints c
LEFT JOIN information_schema.key_column_usage kcu 
    ON c.constraint_name = kcu.constraint_name
JOIN information_schema.tables t 
    ON t.table_name = c.table_name
WHERE t.table_schema = 'public'
    AND c.constraint_type = 'UNIQUE'
    AND kcu.column_name IN ('cpf', 'cnpj', 'cpf_cnpj', 'rg', 'rg_ie', 'telefone', 'email')
ORDER BY t.table_name, c.constraint_name;''')
    
    print(f"\\n✅ Arquivo salvo: sql_correcao_constraints.sql")

else:
    print("\\n🎉 NENHUMA CORREÇÃO NECESSÁRIA!")

# Salvar relatório completo
with open('/mnt/c/Users/ricar/Projetos/Fluyt_Comercial/relatorio_auditoria_supabase.json', 'w') as f:
    json.dump(relatorio_completo, f, indent=2, ensure_ascii=False)

print(f"\\n📋 Relatório completo salvo: relatorio_auditoria_supabase.json")
print("\\n🎯 AUDITORIA CONCLUÍDA!")