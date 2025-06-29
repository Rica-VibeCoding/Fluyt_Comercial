#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para listar TODAS as tabelas do Supabase
"""
import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client
from datetime import datetime
import json

# Carrega vari�veis de ambiente
load_dotenv()

# Configura��o do Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("L Erro: SUPABASE_URL e SUPABASE_KEY devem estar definidos no .env")
    sys.exit(1)

# Cria cliente Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

print("=" * 80)
print("LISTANDO TODAS AS TABELAS DO SUPABASE")
print("=" * 80)
print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print(f"URL Supabase: {SUPABASE_URL}")
print("=" * 80)

# Lista de tabelas conhecidas para testar
tabelas_conhecidas = [
    # Sistema
    'usuarios', 'users', 'auth.users',
    'empresas', 'cad_empresas', 'tb_empresas',
    'lojas', 'cad_lojas', 'tb_lojas',
    'setores', 'cad_setores', 'tb_setores',
    'equipe', 'cad_equipe', 'funcionarios', 'cad_funcionarios',
    
    # Clientes
    'clientes', 'cad_clientes', 'tb_clientes',
    'cliente_telefone', 'cliente_telefones',
    'cliente_email', 'cliente_emails',
    
    # Ambientes - TODAS as possibilidades
    'ambientes', 'ambiente', 
    'cad_ambientes', 'cad_ambiente',
    'tb_ambientes', 'tb_ambiente',
    'orcamento_ambientes', 'orcamento_ambiente',
    'contrato_ambientes', 'contrato_ambiente',
    'itens_ambiente', 'ambiente_itens',
    'produtos_ambiente', 'ambiente_produtos',
    
    # Or�amentos
    'orcamentos', 'orcamento', 'cad_orcamentos',
    'orcamento_itens', 'itens_orcamento',
    'orcamento_pagamentos', 'pagamentos_orcamento',
    
    # Contratos
    'contratos', 'contrato', 'cad_contratos',
    
    # Outros
    'produtos', 'cad_produtos', 'tb_produtos',
    'categorias', 'cad_categorias',
    'fornecedores', 'cad_fornecedores',
    'transportadoras', 'cad_transportadoras',
    'montadores', 'cad_montadores',
    'comissoes', 'cad_comissoes',
    'status_orcamento', 'cad_status_orcamento',
    'formas_pagamento', 'cad_formas_pagamento',
    'procedencias', 'cad_procedencias'
]

print("\nTESTANDO TABELAS CONHECIDAS")
print("-" * 50)

tabelas_encontradas = []
tabelas_ambiente = []

for tabela in tabelas_conhecidas:
    try:
        # Tenta fazer um select limitado
        result = supabase.table(tabela).select('*').limit(1).execute()
        
        if result.data is not None:  # Tabela existe
            tabelas_encontradas.append(tabela)
            print(f" {tabela}")
            
            # Se for relacionada a ambientes, adiciona na lista especial
            if 'ambient' in tabela.lower():
                tabelas_ambiente.append(tabela)
                
                # Mostra a estrutura imediatamente
                if len(result.data) > 0:
                    print(f"   � Campos: {list(result.data[0].keys())}")
        
    except Exception as e:
        # S� mostra erro se for uma tabela de ambiente
        if 'ambient' in tabela.lower():
            erro = str(e)
            if 'relation' in erro and 'does not exist' in erro:
                print(f"L {tabela} - n�o existe")
            else:
                print(f"L {tabela} - {erro[:50]}...")

print(f"\nTotal de tabelas encontradas: {len(tabelas_encontradas)}")

if tabelas_ambiente:
    print(f"\n<� TABELAS DE AMBIENTE ENCONTRADAS: {len(tabelas_ambiente)}")
    print("-" * 50)
    
    for tabela in tabelas_ambiente:
        print(f"\n=� Analisando: {tabela}")
        print("-" * 30)
        
        try:
            # Pega at� 5 registros para an�lise
            result = supabase.table(tabela).select('*').limit(5).execute()
            
            if result.data and len(result.data) > 0:
                # Mostra estrutura detalhada
                primeiro = result.data[0]
                print("CAMPOS:")
                for campo, valor in primeiro.items():
                    tipo = type(valor).__name__
                    print(f"  • {campo}: {tipo}")
                
                print(f"\nREGISTROS: {len(result.data)} exemplos")
                
                # Mostra um exemplo completo
                print("\nEXEMPLO DE REGISTRO:")
                print(json.dumps(result.data[0], indent=2, ensure_ascii=False))
                
            else:
                print("  � Tabela vazia")
                
        except Exception as e:
            print(f"  � Erro ao analisar: {e}")

# Tenta buscar em tabelas relacionadas
print("\n\nBUSCANDO REFER�NCIAS A AMBIENTES EM OUTRAS TABELAS")
print("-" * 50)

for tabela in tabelas_encontradas:
    if 'ambient' not in tabela.lower():
        try:
            result = supabase.table(tabela).select('*').limit(1).execute()
            
            if result.data and len(result.data) > 0:
                # Verifica se algum campo referencia ambientes
                campos_ambiente = []
                for campo in result.data[0].keys():
                    if any(termo in campo.lower() for termo in ['ambient', 'ambiente', 'id_ambiente', 'ambiente_id']):
                        campos_ambiente.append(campo)
                
                if campos_ambiente:
                    print(f"\n {tabela}")
                    for campo in campos_ambiente:
                        print(f"  � {campo}")
                        
        except:
            pass

print("\n" + "=" * 80)
print("AN�LISE CONCLU�DA")
print("=" * 80)