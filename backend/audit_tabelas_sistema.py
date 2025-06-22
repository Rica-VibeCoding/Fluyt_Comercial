#!/usr/bin/env python3
"""
AUDITORIA ESPECÍFICA: Montadores, Transportadoras, Setores e Equipe
Execute com: python3 audit_tabelas_sistema.py
"""
import sys
sys.path.append('.')
from core.database import get_database
import time
import uuid

print("🔍 AUDITORIA: MONTADORES, TRANSPORTADORAS, SETORES E EQUIPE")
print("=" * 70)

db = get_database()

def verificar_tabela_existe(tabela):
    """Verifica se tabela existe e quantos registros tem"""
    try:
        result = db.table(tabela).select('id').execute()
        count = len(result.data) if result.data else 0
        return True, count
    except Exception as e:
        return False, str(e)

def testar_constraints_montadores():
    """Testa constraints na tabela montadores"""
    print("\n🔨 TESTANDO: c_montadores")
    print("-" * 50)
    
    existe, info = verificar_tabela_existe('c_montadores')
    if not existe:
        print(f"❌ Tabela não existe: {info}")
        return []
    
    print(f"✅ Tabela existe com {info} registros")
    
    problemas = []
    
    # Teste 1: CPF duplicado
    try:
        nome_teste = f"MONTADOR_TESTE_{int(time.time())}"
        dados1 = {
            'nome': nome_teste + "_1",
            'cpf': '11111111111',  # CPF de teste
            'telefone': '11999888777',
            'ativo': True
        }
        
        result1 = db.table('c_montadores').insert(dados1).execute()
        if result1.data:
            id1 = result1.data[0]['id']
            print(f"✅ Primeiro montador criado: {id1}")
            
            # Teste CPF duplicado
            dados2 = {
                'nome': nome_teste + "_2",
                'cpf': '11111111111',  # Mesmo CPF
                'telefone': '11888777666',
                'ativo': True
            }
            
            try:
                result2 = db.table('c_montadores').insert(dados2).execute()
                if result2.data:
                    id2 = result2.data[0]['id']
                    print(f"✅ CPF DUPLICADO PERMITIDO! ID: {id2}")
                    db.table('c_montadores').delete().eq('id', id2).execute()
                else:
                    print("❌ Falha no segundo insert")
                    
            except Exception as e:
                if 'duplicate key' in str(e) and 'cpf' in str(e):
                    print(f"❌ CONSTRAINT DE CPF EXISTE!")
                    problemas.append('cpf_constraint_montadores')
                else:
                    print(f"❌ Erro inesperado: {str(e)}")
            
            # Teste telefone duplicado
            dados3 = {
                'nome': nome_teste + "_3",
                'cpf': '22222222222',
                'telefone': '11999888777',  # Mesmo telefone do primeiro
                'ativo': True
            }
            
            try:
                result3 = db.table('c_montadores').insert(dados3).execute()
                if result3.data:
                    id3 = result3.data[0]['id']
                    print(f"✅ TELEFONE DUPLICADO PERMITIDO! ID: {id3}")
                    db.table('c_montadores').delete().eq('id', id3).execute()
                else:
                    print("❌ Falha no terceiro insert")
                    
            except Exception as e:
                if 'duplicate key' in str(e) and 'telefone' in str(e):
                    print(f"❌ CONSTRAINT DE TELEFONE EXISTE!")
                    problemas.append('telefone_constraint_montadores')
                else:
                    print(f"❌ Erro inesperado: {str(e)}")
            
            # Limpeza
            db.table('c_montadores').delete().eq('id', id1).execute()
            
    except Exception as e:
        print(f"❌ Erro no teste de montadores: {str(e)}")
        
    return problemas

def testar_constraints_transportadoras():
    """Testa constraints na tabela transportadoras"""
    print("\n🚛 TESTANDO: c_transportadoras")
    print("-" * 50)
    
    existe, info = verificar_tabela_existe('c_transportadoras')
    if not existe:
        print(f"❌ Tabela não existe: {info}")
        return []
    
    print(f"✅ Tabela existe com {info} registros")
    
    problemas = []
    
    try:
        nome_teste = f"TRANSP_TESTE_{int(time.time())}"
        dados1 = {
            'nome': nome_teste + "_1",
            'cnpj': '99999999999999',  # CNPJ de teste
            'telefone': '11888999777',
            'ativo': True
        }
        
        result1 = db.table('c_transportadoras').insert(dados1).execute()
        if result1.data:
            id1 = result1.data[0]['id']
            print(f"✅ Primeira transportadora criada: {id1}")
            
            # Teste CNPJ duplicado
            dados2 = {
                'nome': nome_teste + "_2",
                'cnpj': '99999999999999',  # Mesmo CNPJ
                'telefone': '11777888999',
                'ativo': True
            }
            
            try:
                result2 = db.table('c_transportadoras').insert(dados2).execute()
                if result2.data:
                    id2 = result2.data[0]['id']
                    print(f"✅ CNPJ DUPLICADO PERMITIDO! ID: {id2}")
                    db.table('c_transportadoras').delete().eq('id', id2).execute()
                    
            except Exception as e:
                if 'duplicate key' in str(e) and 'cnpj' in str(e):
                    print(f"❌ CONSTRAINT DE CNPJ EXISTE!")
                    problemas.append('cnpj_constraint_transportadoras')
                else:
                    print(f"❌ Erro inesperado: {str(e)}")
            
            # Limpeza
            db.table('c_transportadoras').delete().eq('id', id1).execute()
            
    except Exception as e:
        print(f"❌ Erro no teste de transportadoras: {str(e)}")
        
    return problemas

def testar_constraints_setores():
    """Testa constraints na tabela setores"""
    print("\n🏭 TESTANDO: c_setores")
    print("-" * 50)
    
    existe, info = verificar_tabela_existe('c_setores')
    if not existe:
        print(f"❌ Tabela não existe: {info}")
        return []
    
    print(f"✅ Tabela existe com {info} registros")
    
    # Setores normalmente só tem nome, então teste é mais simples
    try:
        nome_teste = f"SETOR_TESTE_{int(time.time())}"
        dados1 = {
            'nome': nome_teste,
            'ativo': True
        }
        
        result1 = db.table('c_setores').insert(dados1).execute()
        if result1.data:
            id1 = result1.data[0]['id']
            print(f"✅ Setor criado: {id1}")
            
            # Limpeza
            db.table('c_setores').delete().eq('id', id1).execute()
            print(f"✅ Setor funciona normalmente")
            
    except Exception as e:
        print(f"❌ Erro no teste de setores: {str(e)}")
        
    return []

def testar_constraints_equipe():
    """Testa constraints na tabela equipe"""
    print("\n👥 TESTANDO: c_equipe")
    print("-" * 50)
    
    existe, info = verificar_tabela_existe('c_equipe')
    if not existe:
        print(f"❌ Tabela não existe: {info}")
        return []
    
    print(f"✅ Tabela existe com {info} registros")
    
    problemas = []
    
    # Precisamos de uma loja real para teste
    lojas = db.table('c_lojas').select('id').limit(1).execute()
    if not lojas.data:
        print("❌ Não há lojas para teste")
        return []
    
    loja_id = lojas.data[0]['id']
    
    try:
        nome_teste = f"FUNC_TESTE_{int(time.time())}"
        dados1 = {
            'nome': nome_teste + "_1",
            'email': 'teste1@teste.com',
            'cpf': '33333333333',
            'telefone': '11777666555',
            'loja_id': loja_id,
            'perfil': 'VENDEDOR',
            'ativo': True
        }
        
        result1 = db.table('c_equipe').insert(dados1).execute()
        if result1.data:
            id1 = result1.data[0]['id']
            print(f"✅ Primeiro funcionário criado: {id1}")
            
            # Teste EMAIL duplicado (este DEVE ser único para login)
            dados2 = {
                'nome': nome_teste + "_2",
                'email': 'teste1@teste.com',  # Mesmo email
                'cpf': '44444444444',
                'telefone': '11666555444',
                'loja_id': loja_id,
                'perfil': 'VENDEDOR',
                'ativo': True
            }
            
            try:
                result2 = db.table('c_equipe').insert(dados2).execute()
                if result2.data:
                    id2 = result2.data[0]['id']
                    print(f"⚠️  EMAIL DUPLICADO PERMITIDO! (pode ser problema) ID: {id2}")
                    db.table('c_equipe').delete().eq('id', id2).execute()
                    problemas.append('email_nao_unico_equipe')
                    
            except Exception as e:
                if 'duplicate key' in str(e) and 'email' in str(e):
                    print(f"✅ EMAIL É ÚNICO (correto para login)")
                else:
                    print(f"❌ Erro inesperado: {str(e)}")
            
            # Teste CPF duplicado
            dados3 = {
                'nome': nome_teste + "_3",
                'email': 'teste3@teste.com',
                'cpf': '33333333333',  # Mesmo CPF
                'telefone': '11555444333',
                'loja_id': loja_id,
                'perfil': 'VENDEDOR',
                'ativo': True
            }
            
            try:
                result3 = db.table('c_equipe').insert(dados3).execute()
                if result3.data:
                    id3 = result3.data[0]['id']
                    print(f"✅ CPF DUPLICADO PERMITIDO! ID: {id3}")
                    db.table('c_equipe').delete().eq('id', id3).execute()
                    
            except Exception as e:
                if 'duplicate key' in str(e) and 'cpf' in str(e):
                    print(f"❌ CONSTRAINT DE CPF EXISTE!")
                    problemas.append('cpf_constraint_equipe')
                else:
                    print(f"❌ Erro inesperado: {str(e)}")
            
            # Limpeza
            db.table('c_equipe').delete().eq('id', id1).execute()
            
    except Exception as e:
        print(f"❌ Erro no teste de equipe: {str(e)}")
        
    return problemas

# EXECUTAR TODOS OS TESTES
print("🚀 INICIANDO AUDITORIA DAS TABELAS DO SISTEMA...")

todos_problemas = []

# Teste montadores
problemas_montadores = testar_constraints_montadores()
todos_problemas.extend(problemas_montadores)

# Teste transportadoras
problemas_transportadoras = testar_constraints_transportadoras()
todos_problemas.extend(problemas_transportadoras)

# Teste setores
problemas_setores = testar_constraints_setores()
todos_problemas.extend(problemas_setores)

# Teste equipe
problemas_equipe = testar_constraints_equipe()
todos_problemas.extend(problemas_equipe)

print("\n" + "=" * 70)
print("📋 RELATÓRIO FINAL DA AUDITORIA")
print("=" * 70)

if todos_problemas:
    print(f"\n❌ PROBLEMAS ENCONTRADOS: {len(todos_problemas)}")
    
    sql_fixes = []
    
    for problema in todos_problemas:
        print(f"   - {problema}")
        
        if problema == 'cpf_constraint_montadores':
            sql_fixes.append("ALTER TABLE c_montadores DROP CONSTRAINT IF EXISTS c_montadores_cpf_key;")
        elif problema == 'telefone_constraint_montadores':
            sql_fixes.append("ALTER TABLE c_montadores DROP CONSTRAINT IF EXISTS c_montadores_telefone_key;")
        elif problema == 'cnpj_constraint_transportadoras':
            sql_fixes.append("ALTER TABLE c_transportadoras DROP CONSTRAINT IF EXISTS c_transportadoras_cnpj_key;")
        elif problema == 'cpf_constraint_equipe':
            sql_fixes.append("ALTER TABLE c_equipe DROP CONSTRAINT IF EXISTS c_equipe_cpf_key;")
        elif problema == 'email_nao_unico_equipe':
            print("   ⚠️  ATENÇÃO: Email deveria ser único para evitar problemas de login!")
            sql_fixes.append("ALTER TABLE c_equipe ADD CONSTRAINT c_equipe_email_key UNIQUE (email);")
    
    if sql_fixes:
        print(f"\n🔧 SQL PARA CORREÇÃO:")
        print("-" * 50)
        for sql in sql_fixes:
            print(f"   {sql}")
        
        # Salvar em arquivo
        with open('/mnt/c/Users/ricar/Projetos/Fluyt_Comercial/sql_correcao_sistema.sql', 'w') as f:
            f.write("-- SQL DE CORREÇÃO PARA TABELAS DO SISTEMA\\n")
            f.write("-- Execute no Supabase Dashboard\\n\\n")
            for sql in sql_fixes:
                f.write(sql + "\\n")
        
        print(f"\\n✅ Arquivo salvo: sql_correcao_sistema.sql")

else:
    print("\\n🎉 NENHUM PROBLEMA ENCONTRADO!")
    print("✅ Todas as tabelas estão configuradas corretamente")

print(f"\\n🎯 AUDITORIA DAS TABELAS DO SISTEMA CONCLUÍDA!")