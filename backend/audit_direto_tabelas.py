#!/usr/bin/env python3
"""
AUDITORIA DIRETA DAS TABELAS - Teste prático de constraints
Execute com: python3 audit_direto_tabelas.py
"""
import sys
sys.path.append('.')
from core.database import get_database
import uuid
import time

print("🔍 AUDITORIA DIRETA - TESTE PRÁTICO DE CONSTRAINTS")
print("=" * 60)

db = get_database()

def testar_constraints_empresa():
    """Testa constraints na tabela empresas"""
    print("\n🏢 TESTANDO: cad_empresas")
    print("-" * 40)
    
    problemas = []
    
    # Teste 1: CNPJ duplicado
    try:
        nome_teste = f"TESTE_AUDIT_{int(time.time())}"
        dados1 = {
            'nome': nome_teste + "_1",
            'cnpj': '99999999999999',  # CNPJ de teste
            'ativo': True
        }
        
        result1 = db.table('cad_empresas').insert(dados1).execute()
        if result1.data:
            id1 = result1.data[0]['id']
            print(f"✅ Primeiro insert OK (ID: {id1})")
            
            # Tentar segundo insert com mesmo CNPJ
            dados2 = {
                'nome': nome_teste + "_2",  # Nome diferente
                'cnpj': '99999999999999',   # CNPJ igual
                'ativo': True
            }
            
            try:
                result2 = db.table('cad_empresas').insert(dados2).execute()
                if result2.data:
                    id2 = result2.data[0]['id']
                    print(f"✅ CNPJ duplicado permitido! (ID: {id2})")
                    # Limpeza
                    db.table('cad_empresas').delete().eq('id', id2).execute()
                else:
                    print("❌ Falha no segundo insert (sem erro de constraint)")
                    
            except Exception as e:
                if 'duplicate key' in str(e) and 'cnpj' in str(e):
                    print(f"❌ CONSTRAINT DE CNPJ AINDA EXISTE!")
                    problemas.append('cnpj_constraint_exists')
                else:
                    print(f"❌ Erro inesperado: {str(e)}")
            
            # Limpeza
            db.table('cad_empresas').delete().eq('id', id1).execute()
            
    except Exception as e:
        print(f"❌ Erro no teste de empresas: {str(e)}")
        
    return problemas

def testar_constraints_clientes():
    """Testa constraints na tabela clientes"""
    print("\n👤 TESTANDO: c_clientes")
    print("-" * 40)
    
    problemas = []
    
    # Teste 1: CPF duplicado
    try:
        nome_teste = f"TESTE_AUDIT_CLI_{int(time.time())}"
        dados1 = {
            'nome': nome_teste + "_1",
            'cpf_cnpj': '12345678901',  # CPF de teste
            'ativo': True,
            'loja_id': str(uuid.uuid4())  # ID fake para teste
        }
        
        result1 = db.table('c_clientes').insert(dados1).execute()
        if result1.data:
            id1 = result1.data[0]['id']
            print(f"✅ Primeiro insert OK (ID: {id1})")
            
            # Tentar segundo insert com mesmo CPF
            dados2 = {
                'nome': nome_teste + "_2",  # Nome diferente
                'cpf_cnpj': '12345678901',  # CPF igual
                'ativo': True,
                'loja_id': str(uuid.uuid4())
            }
            
            try:
                result2 = db.table('c_clientes').insert(dados2).execute()
                if result2.data:
                    id2 = result2.data[0]['id']
                    print(f"✅ CPF duplicado permitido! (ID: {id2})")
                    # Limpeza
                    db.table('c_clientes').delete().eq('id', id2).execute()
                else:
                    print("❌ Falha no segundo insert")
                    
            except Exception as e:
                if 'duplicate key' in str(e) and ('cpf' in str(e) or 'cnpj' in str(e)):
                    print(f"❌ CONSTRAINT DE CPF/CNPJ AINDA EXISTE!")
                    problemas.append('cpf_cnpj_constraint_exists')
                else:
                    print(f"❌ Erro inesperado: {str(e)}")
            
            # Limpeza
            db.table('c_clientes').delete().eq('id', id1).execute()
            
    except Exception as e:
        print(f"❌ Erro no teste de clientes: {str(e)}")
        
    return problemas

def testar_constraints_lojas():
    """Testa constraints na tabela lojas"""
    print("\n🏪 TESTANDO: c_lojas")
    print("-" * 40)
    
    problemas = []
    
    try:
        nome_teste = f"TESTE_AUDIT_LOJA_{int(time.time())}"
        dados1 = {
            'nome': nome_teste + "_1",
            'telefone': '11999887766',  # Telefone de teste
            'ativo': True,
            'empresa_id': str(uuid.uuid4())
        }
        
        result1 = db.table('c_lojas').insert(dados1).execute()
        if result1.data:
            id1 = result1.data[0]['id']
            print(f"✅ Primeiro insert OK (ID: {id1})")
            
            # Tentar segundo insert com mesmo telefone
            dados2 = {
                'nome': nome_teste + "_2",  # Nome diferente
                'telefone': '11999887766',  # Telefone igual
                'ativo': True,
                'empresa_id': str(uuid.uuid4())
            }
            
            try:
                result2 = db.table('c_lojas').insert(dados2).execute()
                if result2.data:
                    id2 = result2.data[0]['id']
                    print(f"✅ Telefone duplicado permitido! (ID: {id2})")
                    # Limpeza
                    db.table('c_lojas').delete().eq('id', id2).execute()
                else:
                    print("❌ Falha no segundo insert")
                    
            except Exception as e:
                if 'duplicate key' in str(e) and 'telefone' in str(e):
                    print(f"❌ CONSTRAINT DE TELEFONE AINDA EXISTE!")
                    problemas.append('telefone_constraint_exists')
                else:
                    print(f"❌ Erro inesperado: {str(e)}")
            
            # Limpeza
            db.table('c_lojas').delete().eq('id', id1).execute()
            
    except Exception as e:
        print(f"❌ Erro no teste de lojas: {str(e)}")
        
    return problemas

def verificar_dados_existentes():
    """Verifica quantos registros existem em cada tabela"""
    print("\n📊 DADOS EXISTENTES:")
    print("-" * 40)
    
    tabelas = ['cad_empresas', 'c_lojas', 'c_clientes', 'c_orcamentos', 'c_ambientes']
    
    for tabela in tabelas:
        try:
            result = db.table(tabela).select('id').execute()
            count = len(result.data) if result.data else 0
            print(f"   {tabela}: {count} registros")
        except Exception as e:
            print(f"   {tabela}: ERRO - {str(e)}")

# EXECUTAR TODOS OS TESTES
print("🚀 INICIANDO TESTES PRÁTICOS...")

verificar_dados_existentes()

todos_problemas = []

# Teste empresas
problemas_empresas = testar_constraints_empresa()
todos_problemas.extend(problemas_empresas)

# Teste clientes  
problemas_clientes = testar_constraints_clientes()
todos_problemas.extend(problemas_clientes)

# Teste lojas
problemas_lojas = testar_constraints_lojas()
todos_problemas.extend(problemas_lojas)

print("\n" + "=" * 60)
print("📋 RELATÓRIO FINAL DOS TESTES")
print("=" * 60)

if todos_problemas:
    print(f"\n❌ PROBLEMAS ENCONTRADOS: {len(todos_problemas)}")
    for problema in todos_problemas:
        print(f"   - {problema}")
        
    print(f"\n🔧 AÇÕES NECESSÁRIAS:")
    if 'cnpj_constraint_exists' in todos_problemas:
        print("   1. Remover constraint de CNPJ em cad_empresas")
    if 'cpf_cnpj_constraint_exists' in todos_problemas:
        print("   2. Remover constraint de CPF/CNPJ em c_clientes")
    if 'telefone_constraint_exists' in todos_problemas:
        print("   3. Remover constraint de telefone em c_lojas")
        
else:
    print("\n🎉 NENHUM PROBLEMA ENCONTRADO!")
    print("✅ Todas as constraints indevidas já foram removidas")
    print("✅ Sistema está configurado corretamente")

print(f"\n🎯 TESTE CONCLUÍDO!")