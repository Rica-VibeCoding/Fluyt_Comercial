#!/usr/bin/env python3
"""
Script para descobrir a estrutura da tabela de ambientes no Supabase
"""
import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client
from datetime import datetime

# Carrega variáveis de ambiente
load_dotenv()

# Configuração do Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Erro: SUPABASE_URL e SUPABASE_ANON_KEY devem estar definidos no .env")
    sys.exit(1)

# Cria cliente Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

print("=" * 80)
print("DESCOBRINDO ESTRUTURA DA TABELA DE AMBIENTES")
print("=" * 80)
print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print(f"URL Supabase: {SUPABASE_URL}")
print("=" * 80)

def executar_query(query, params=None):
    """Executa uma query RPC no Supabase"""
    try:
        if params:
            result = supabase.rpc('sql_query', {'query': query, 'params': params}).execute()
        else:
            # Tenta executar como RPC simples
            result = supabase.rpc('sql_query', {'query': query}).execute()
        return result.data
    except Exception as e:
        # Se falhar, tenta executar diretamente
        try:
            # Remove o schema public. se existir
            query_limpa = query.replace('public.', '')
            result = supabase.from_('pg_catalog.pg_tables').select('*').execute()
            return None
        except:
            print(f"❌ Erro ao executar query: {e}")
            return None

# 1. Descobrir o nome real da tabela
print("\n1. PROCURANDO TABELAS DE AMBIENTES")
print("-" * 50)

# Busca tabelas que contenham 'ambient' no nome
query_tabelas = """
    SELECT 
        schemaname as schema,
        tablename as tabela,
        tableowner as owner
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND (
        tablename LIKE '%ambient%' OR 
        tablename LIKE '%ambiente%' OR
        tablename LIKE '%cad_amb%'
    )
    ORDER BY tablename;
"""

# Tenta buscar diretamente nas tabelas
try:
    # Lista todas as tabelas públicas
    response = supabase.table('pg_tables').select('*').execute()
    print(f"✓ Resposta recebida (tentativa direta)")
except:
    try:
        # Tenta listar tabelas de outra forma
        print("Tentando método alternativo...")
        
        # Vamos tentar acessar diretamente algumas tabelas prováveis
        tabelas_possiveis = [
            'ambientes',
            'cad_ambientes', 
            'ambiente',
            'cad_ambiente',
            'tb_ambientes',
            'tb_ambiente'
        ]
        
        tabela_encontrada = None
        for nome_tabela in tabelas_possiveis:
            try:
                # Tenta fazer um select limitado
                result = supabase.table(nome_tabela).select('*').limit(1).execute()
                print(f"✅ Tabela encontrada: {nome_tabela}")
                tabela_encontrada = nome_tabela
                break
            except Exception as e:
                continue
        
        if not tabela_encontrada:
            print("❌ Nenhuma tabela de ambientes encontrada com os nomes comuns")
            
            # Vamos tentar descobrir através da estrutura de outras tabelas
            print("\nTentando descobrir através de foreign keys...")
            
            # Busca em tabelas conhecidas por referências
            tabelas_conhecidas = ['orcamentos', 'orcamento', 'contratos', 'contrato']
            for tabela in tabelas_conhecidas:
                try:
                    result = supabase.table(tabela).select('*').limit(1).execute()
                    if result.data:
                        print(f"Analisando estrutura de {tabela}...")
                        # Verifica campos que possam referenciar ambientes
                        for key in result.data[0].keys():
                            if 'ambient' in key.lower():
                                print(f"  → Campo encontrado: {key}")
                except:
                    continue
        else:
            # Se encontrou a tabela, vamos obter sua estrutura
            print(f"\n2. ESTRUTURA DA TABELA: {tabela_encontrada}")
            print("-" * 50)
            
            # Obtém um registro para analisar a estrutura
            try:
                result = supabase.table(tabela_encontrada).select('*').limit(5).execute()
                
                if result.data and len(result.data) > 0:
                    print("\nCAMPOS ENCONTRADOS:")
                    print("-" * 30)
                    
                    # Analisa o primeiro registro para obter os campos
                    primeiro_registro = result.data[0]
                    for campo, valor in primeiro_registro.items():
                        tipo_python = type(valor).__name__
                        print(f"  • {campo}: {tipo_python} (exemplo: {valor})")
                    
                    print(f"\nNúmero de registros de exemplo: {len(result.data)}")
                    
                    # Mostra alguns registros de exemplo
                    print("\nEXEMPLOS DE REGISTROS:")
                    print("-" * 30)
                    for i, registro in enumerate(result.data[:3], 1):
                        print(f"\nRegistro {i}:")
                        for campo, valor in registro.items():
                            print(f"  {campo}: {valor}")
                else:
                    print("Tabela encontrada mas está vazia")
                    
                    # Tenta obter estrutura de outra forma
                    print("\nTentando obter estrutura através de insert vazio...")
                    try:
                        # Tenta inserir registro vazio para ver erro e descobrir campos obrigatórios
                        result = supabase.table(tabela_encontrada).insert({}).execute()
                    except Exception as e:
                        erro_str = str(e)
                        print(f"Erro esperado: {erro_str[:200]}...")
                        # O erro geralmente mostra os campos obrigatórios
                        
            except Exception as e:
                print(f"Erro ao obter estrutura: {e}")
                
            # Tenta descobrir relacionamentos
            print("\n3. BUSCANDO RELACIONAMENTOS")
            print("-" * 50)
            
            # Verifica tabelas que podem referenciar ambientes
            tabelas_relacionadas = [
                'orcamentos',
                'orcamento_ambientes',
                'contratos',
                'contrato_ambientes',
                'itens_ambiente',
                'ambiente_itens'
            ]
            
            for tabela_rel in tabelas_relacionadas:
                try:
                    result = supabase.table(tabela_rel).select('*').limit(1).execute()
                    if result.data:
                        print(f"\n✓ Tabela relacionada encontrada: {tabela_rel}")
                        # Verifica campos que referenciam ambientes
                        for campo in result.data[0].keys():
                            if 'ambient' in campo.lower() or campo in ['id_ambiente', 'ambiente_id', 'fk_ambiente']:
                                print(f"  → Referência: {campo}")
                except:
                    continue
                    
    except Exception as e:
        print(f"❌ Erro geral: {e}")

# Tenta verificar políticas RLS
print("\n4. VERIFICANDO POLÍTICAS RLS")
print("-" * 50)

if tabela_encontrada:
    print(f"Verificando políticas para: {tabela_encontrada}")
    
    # Tenta fazer operações CRUD para testar RLS
    print("\nTestando operações:")
    
    # SELECT
    try:
        result = supabase.table(tabela_encontrada).select('*').limit(1).execute()
        print("✓ SELECT: Permitido")
    except Exception as e:
        print(f"✗ SELECT: Bloqueado - {str(e)[:100]}")
    
    # INSERT (teste sem executar)
    print("✓ INSERT: Não testado (evitar criar dados)")
    
    # UPDATE (teste sem executar) 
    print("✓ UPDATE: Não testado (evitar modificar dados)")
    
    # DELETE (teste sem executar)
    print("✓ DELETE: Não testado (evitar remover dados)")

print("\n" + "=" * 80)
print("ANÁLISE CONCLUÍDA")
print("=" * 80)