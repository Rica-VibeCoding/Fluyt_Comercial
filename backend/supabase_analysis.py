#!/usr/bin/env python3
"""
Script para análise completa do Supabase
Analisa tabelas, estruturas, relacionamentos e campos obrigatórios
"""

import json
from supabase import create_client, Client
from typing import Dict, List, Any

# Credenciais fornecidas
SUPABASE_URL = "https://momwbpxqnvgehotfmvde.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vbXdicHhxbnZnZWhvdGZtdmRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzAxNTIsImV4cCI6MjA2MzM0NjE1Mn0.n90ZweBT-o1ugerZJDZl8gx65WGe1eUrhph6VuSdSCs"

def init_supabase():
    """Inicializa cliente Supabase"""
    return create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

def listar_todas_tabelas(supabase: Client) -> List[str]:
    """Lista todas as tabelas no schema public"""
    try:
        query = """
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
        """
        
        result = supabase.rpc('exec_sql', {'query': query}).execute()
        if result.data:
            return [row['table_name'] for row in result.data]
        else:
            # Fallback: tentar acessar tabelas conhecidas
            return descobrir_tabelas_conhecidas(supabase)
            
    except Exception as e:
        print(f"❌ Erro ao listar tabelas via SQL: {e}")
        return descobrir_tabelas_conhecidas(supabase)

def descobrir_tabelas_conhecidas(supabase: Client) -> List[str]:
    """Descobre tabelas tentando acessá-las"""
    tabelas_possiveis = [
        'cad_clientes', 'clientes', 'c_clientes',
        'usuarios', 'users', 'funcionarios', 'c_equipe', 'equipe',
        'lojas', 'c_lojas', 'empresas', 'c_empresas', 
        'c_comissoes', 'comissoes', 'setores', 'c_setores',
        'montadores', 'c_montadores', 'transportadoras', 'c_transportadoras',
        'ambientes', 'c_ambientes', 'orcamentos', 'c_orcamentos',
        'contratos', 'c_contratos', 'procedencias', 'c_procedencias',
        'status_orcamento', 'c_status_orcamento'
    ]
    
    tabelas_existentes = []
    
    for tabela in tabelas_possiveis:
        try:
            result = supabase.table(tabela).select('*').limit(1).execute()
            tabelas_existentes.append(tabela)
            print(f"✅ Tabela '{tabela}' encontrada!")
        except Exception as e:
            if "does not exist" in str(e).lower():
                print(f"❌ Tabela '{tabela}' não existe")
            else:
                print(f"⚠️  Tabela '{tabela}' - erro: {str(e)[:100]}...")
    
    return tabelas_existentes

def analisar_estrutura_tabela(supabase: Client, nome_tabela: str) -> Dict[str, Any]:
    """Analisa estrutura detalhada de uma tabela"""
    try:
        query = f"""
        SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default,
            character_maximum_length,
            numeric_precision,
            numeric_scale,
            udt_name
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = '{nome_tabela}'
        ORDER BY ordinal_position;
        """
        
        result = supabase.rpc('exec_sql', {'query': query}).execute()
        
        if result.data:
            colunas = []
            for col in result.data:
                colunas.append({
                    'nome': col['column_name'],
                    'tipo': col['data_type'],
                    'tipo_udt': col['udt_name'],
                    'obrigatorio': col['is_nullable'] == 'NO',
                    'default': col['column_default'],
                    'tamanho_maximo': col['character_maximum_length'],
                    'precisao_numerica': col['numeric_precision'],
                    'escala_numerica': col['numeric_scale']
                })
            
            return {
                'nome_tabela': nome_tabela,
                'total_colunas': len(colunas),
                'colunas': colunas
            }
        else:
            # Fallback: tentar obter dados da tabela
            return analisar_tabela_por_dados(supabase, nome_tabela)
            
    except Exception as e:
        print(f"❌ Erro ao analisar estrutura de '{nome_tabela}': {e}")
        return analisar_tabela_por_dados(supabase, nome_tabela)

def analisar_tabela_por_dados(supabase: Client, nome_tabela: str) -> Dict[str, Any]:
    """Analisa tabela obtendo alguns dados"""
    try:
        result = supabase.table(nome_tabela).select('*').limit(5).execute()
        
        if result.data and len(result.data) > 0:
            primeiro_registro = result.data[0]
            colunas = []
            
            for campo, valor in primeiro_registro.items():
                colunas.append({
                    'nome': campo,
                    'tipo': type(valor).__name__ if valor is not None else 'unknown',
                    'tipo_udt': 'inferido',
                    'obrigatorio': False,  # Não conseguimos determinar
                    'default': None,
                    'exemplo_valor': valor
                })
            
            return {
                'nome_tabela': nome_tabela,
                'total_colunas': len(colunas),
                'colunas': colunas,
                'total_registros': len(result.data),
                'metodo_analise': 'por_dados'
            }
        else:
            return {
                'nome_tabela': nome_tabela,
                'total_colunas': 0,
                'colunas': [],
                'observacao': 'Tabela vazia ou sem acesso'
            }
            
    except Exception as e:
        return {
            'nome_tabela': nome_tabela,
            'erro': str(e),
            'observacao': 'Não foi possível analisar a tabela'
        }

def buscar_relacionamentos(supabase: Client) -> List[Dict[str, Any]]:
    """Busca relacionamentos (foreign keys) entre tabelas"""
    try:
        query = """
        SELECT
            tc.constraint_name,
            tc.table_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        ORDER BY tc.table_name, tc.constraint_name;
        """
        
        result = supabase.rpc('exec_sql', {'query': query}).execute()
        
        if result.data:
            return result.data
        else:
            return []
            
    except Exception as e:
        print(f"❌ Erro ao buscar relacionamentos: {e}")
        return []

def main():
    """Função principal de análise"""
    print("🔍 ANÁLISE COMPLETA DO SUPABASE")
    print("=" * 50)
    
    # Inicializar Supabase
    supabase = init_supabase()
    print(f"✅ Conectado ao Supabase: {SUPABASE_URL}")
    
    # 1. Listar todas as tabelas
    print("\n1️⃣ LISTANDO TODAS AS TABELAS")
    print("-" * 30)
    tabelas = listar_todas_tabelas(supabase)
    
    if tabelas:
        print(f"📋 Total de tabelas encontradas: {len(tabelas)}")
        for i, tabela in enumerate(tabelas, 1):
            print(f"   {i:2d}. {tabela}")
    else:
        print("❌ Nenhuma tabela encontrada")
        return
    
    # 2. Análise detalhada da tabela cad_clientes
    print("\n2️⃣ ESTRUTURA DA TABELA 'cad_clientes'")
    print("-" * 40)
    
    if 'cad_clientes' in tabelas:
        estrutura_clientes = analisar_estrutura_tabela(supabase, 'cad_clientes')
        print(f"📊 Tabela: {estrutura_clientes['nome_tabela']}")
        print(f"📈 Total de colunas: {estrutura_clientes['total_colunas']}")
        
        if 'colunas' in estrutura_clientes:
            print("\n📋 ESTRUTURA DE CAMPOS:")
            print(f"{'Campo':<25} {'Tipo':<15} {'Obrigatório':<12} {'Default':<15}")
            print("-" * 70)
            
            for col in estrutura_clientes['colunas']:
                nome = col['nome'][:24]
                tipo = col['tipo'][:14] if col['tipo'] else 'N/A'
                obrig = 'SIM' if col.get('obrigatorio') else 'NÃO'
                default = str(col.get('default', ''))[:14] if col.get('default') else '-'
                
                print(f"{nome:<25} {tipo:<15} {obrig:<12} {default:<15}")
    else:
        print("❌ Tabela 'cad_clientes' não encontrada!")
        # Verificar se existe com outro nome
        clientes_alternativas = [t for t in tabelas if 'cliente' in t.lower()]
        if clientes_alternativas:
            print(f"🔍 Tabelas relacionadas a clientes encontradas: {clientes_alternativas}")
            # Analisar a primeira encontrada
            primeira_clientes = clientes_alternativas[0]
            print(f"\n📊 Analisando '{primeira_clientes}' como alternativa:")
            estrutura_clientes = analisar_estrutura_tabela(supabase, primeira_clientes)
            
            if 'colunas' in estrutura_clientes:
                print(f"📈 Total de colunas: {estrutura_clientes['total_colunas']}")
                print("\n📋 ESTRUTURA DE CAMPOS:")
                print(f"{'Campo':<25} {'Tipo':<15} {'Obrigatório':<12}")
                print("-" * 55)
                
                for col in estrutura_clientes['colunas']:
                    nome = col['nome'][:24]
                    tipo = col['tipo'][:14] if col['tipo'] else 'N/A'
                    obrig = 'SIM' if col.get('obrigatorio') else 'NÃO'
                    
                    print(f"{nome:<25} {tipo:<15} {obrig:<12}")
    
    # 3. Buscar relacionamentos
    print("\n3️⃣ RELACIONAMENTOS ENTRE TABELAS")
    print("-" * 35)
    
    relacionamentos = buscar_relacionamentos(supabase)
    
    if relacionamentos:
        print(f"🔗 Total de relacionamentos encontrados: {len(relacionamentos)}")
        print(f"{'Tabela Origem':<20} {'Campo':<20} {'Tabela Destino':<20} {'Campo Destino':<20}")
        print("-" * 85)
        
        for rel in relacionamentos:
            tabela_orig = rel['table_name'][:19]
            campo_orig = rel['column_name'][:19]
            tabela_dest = rel['foreign_table_name'][:19]
            campo_dest = rel['foreign_column_name'][:19]
            
            print(f"{tabela_orig:<20} {campo_orig:<20} {tabela_dest:<20} {campo_dest:<20}")
    else:
        print("❌ Nenhum relacionamento encontrado ou erro ao buscar")
    
    # 4. Análise resumida de todas as tabelas
    print("\n4️⃣ RESUMO DE TODAS AS TABELAS")
    print("-" * 30)
    
    resumo_tabelas = []
    
    for tabela in tabelas[:10]:  # Limitar para não sobrecarregar
        print(f"📊 Analisando {tabela}...")
        estrutura = analisar_estrutura_tabela(supabase, tabela)
        
        resumo = {
            'nome': tabela,
            'total_colunas': estrutura.get('total_colunas', 0),
            'campos_obrigatorios': len([c for c in estrutura.get('colunas', []) if c.get('obrigatorio')]),
            'campos_opcionais': len([c for c in estrutura.get('colunas', []) if not c.get('obrigatorio')])
        }
        resumo_tabelas.append(resumo)
    
    print(f"\n{'Tabela':<25} {'Total Campos':<12} {'Obrigatórios':<12} {'Opcionais':<10}")
    print("-" * 65)
    
    for resumo in resumo_tabelas:
        nome = resumo['nome'][:24]
        total = resumo['total_colunas']
        obrig = resumo['campos_obrigatorios']
        opcio = resumo['campos_opcionais']
        
        print(f"{nome:<25} {total:<12} {obrig:<12} {opcio:<10}")
    
    print("\n" + "=" * 50)
    print("✅ ANÁLISE CONCLUÍDA!")
    print("📝 Para mais detalhes de uma tabela específica, execute:")
    print("   python supabase_analysis.py [nome_da_tabela]")

if __name__ == "__main__":
    main()