#!/usr/bin/env python3
"""
AUDITORIA ESPECÍFICA: Tabelas CAD_ (cad_equipe, cad_montadores, etc.)
Execute com: python3 audit_tabelas_cad.py
"""
import sys
sys.path.append('.')
from core.database import get_database
import time
import uuid

print("🔍 AUDITORIA: TABELAS CAD_ (EQUIPE, MONTADORES, ETC.)")
print("=" * 70)

db = get_database()

def testar_constraints_equipe():
    """Testa constraints na tabela cad_equipe"""
    print("\n👥 TESTANDO: cad_equipe")
    print("-" * 50)
    
    try:
        # Verificar registros existentes
        result = db.table('cad_equipe').select('id,nome,email,cpf').execute()
        print(f"✅ Tabela existe com {len(result.data)} registros")
        
        if result.data:
            print("📋 Dados existentes:")
            for item in result.data[:3]:  # Mostrar apenas 3
                print(f"   - {item.get('nome')} | Email: {item.get('email')} | CPF: {item.get('cpf')}")
    except Exception as e:
        print(f"❌ Erro ao acessar tabela: {e}")
        return []
    
    problemas = []
    
    # Precisamos de uma loja real para teste
    try:
        lojas = db.table('c_lojas').select('id').limit(1).execute()
        if not lojas.data:
            print("❌ Não há lojas para teste")
            return []
        loja_id = lojas.data[0]['id']
    except:
        loja_id = str(uuid.uuid4())  # Usar UUID fake se não conseguir
    
    try:
        nome_teste = f"FUNC_TESTE_{int(time.time())}"
        
        # Teste 1: EMAIL duplicado (deve ser único para login)
        dados1 = {
            'nome': nome_teste + "_1",
            'email': 'teste_audit@teste.com',
            'cpf': '11111111111',
            'telefone': '11999888777',
            'loja_id': loja_id,
            'perfil': 'VENDEDOR',
            'ativo': True
        }
        
        result1 = db.table('cad_equipe').insert(dados1).execute()
        if result1.data:
            id1 = result1.data[0]['id']
            print(f"✅ Funcionário 1 criado: {id1}")
            
            # Tentar email duplicado
            dados2 = {
                'nome': nome_teste + "_2",
                'email': 'teste_audit@teste.com',  # MESMO EMAIL
                'cpf': '22222222222',
                'telefone': '11888777666',
                'loja_id': loja_id,
                'perfil': 'VENDEDOR',
                'ativo': True
            }
            
            try:
                result2 = db.table('cad_equipe').insert(dados2).execute()
                if result2.data:
                    id2 = result2.data[0]['id']
                    print(f"⚠️  EMAIL DUPLICADO PERMITIDO! (problema para login) ID: {id2}")
                    problemas.append('email_nao_unico_equipe')
                    db.table('cad_equipe').delete().eq('id', id2).execute()
            except Exception as e:
                if 'duplicate key' in str(e) and 'email' in str(e):
                    print(f"✅ EMAIL É ÚNICO (correto para login)")
                else:
                    print(f"❌ Erro inesperado: {str(e)}")
            
            # Teste 2: CPF duplicado
            dados3 = {
                'nome': nome_teste + "_3",
                'email': 'teste_audit3@teste.com',
                'cpf': '11111111111',  # MESMO CPF
                'telefone': '11777666555',
                'loja_id': loja_id,
                'perfil': 'GERENTE',
                'ativo': True
            }
            
            try:
                result3 = db.table('cad_equipe').insert(dados3).execute()
                if result3.data:
                    id3 = result3.data[0]['id']
                    print(f"✅ CPF DUPLICADO PERMITIDO! ID: {id3}")
                    db.table('cad_equipe').delete().eq('id', id3).execute()
            except Exception as e:
                if 'duplicate key' in str(e) and 'cpf' in str(e):
                    print(f"❌ CONSTRAINT DE CPF EXISTE!")
                    problemas.append('cpf_constraint_equipe')
                else:
                    print(f"❌ Erro inesperado: {str(e)}")
            
            # Limpeza
            db.table('cad_equipe').delete().eq('id', id1).execute()
            
    except Exception as e:
        print(f"❌ Erro no teste de equipe: {str(e)}")
    
    return problemas

def testar_constraints_montadores():
    """Testa constraints na tabela cad_montadores"""
    print("\n🔨 TESTANDO: cad_montadores")
    print("-" * 50)
    
    try:
        result = db.table('cad_montadores').select('id').execute()
        print(f"✅ Tabela existe com {len(result.data)} registros")
    except Exception as e:
        print(f"❌ Erro ao acessar tabela: {e}")
        return []
    
    problemas = []
    
    try:
        nome_teste = f"MONTADOR_TESTE_{int(time.time())}"
        dados1 = {
            'nome': nome_teste + "_1",
            'cpf': '33333333333',
            'telefone': '11999888777',
            'endereco': 'Rua Teste, 123',
            'ativo': True
        }
        
        result1 = db.table('cad_montadores').insert(dados1).execute()
        if result1.data:
            id1 = result1.data[0]['id']
            print(f"✅ Montador 1 criado: {id1}")
            
            # Teste CPF duplicado
            dados2 = {
                'nome': nome_teste + "_2",
                'cpf': '33333333333',  # MESMO CPF
                'telefone': '11888777666',
                'endereco': 'Rua Teste, 456',
                'ativo': True
            }
            
            try:
                result2 = db.table('cad_montadores').insert(dados2).execute()
                if result2.data:
                    id2 = result2.data[0]['id']
                    print(f"✅ CPF DUPLICADO PERMITIDO! ID: {id2}")
                    db.table('cad_montadores').delete().eq('id', id2).execute()
            except Exception as e:
                if 'duplicate key' in str(e) and 'cpf' in str(e):
                    print(f"❌ CONSTRAINT DE CPF EXISTE!")
                    problemas.append('cpf_constraint_montadores')
                else:
                    print(f"❌ Erro inesperado: {str(e)}")
            
            # Limpeza
            db.table('cad_montadores').delete().eq('id', id1).execute()
            
    except Exception as e:
        print(f"❌ Erro no teste de montadores: {str(e)}")
    
    return problemas

def testar_constraints_transportadoras():
    """Testa constraints na tabela cad_transportadoras"""
    print("\n🚛 TESTANDO: cad_transportadoras")
    print("-" * 50)
    
    try:
        result = db.table('cad_transportadoras').select('id').execute()
        print(f"✅ Tabela existe com {len(result.data)} registros")
    except Exception as e:
        print(f"❌ Erro ao acessar tabela: {e}")
        return []
    
    problemas = []
    
    try:
        nome_teste = f"TRANSP_TESTE_{int(time.time())}"
        dados1 = {
            'nome': nome_teste + "_1",
            'cnpj': '44444444444444',
            'telefone': '11777888999',
            'endereco': 'Av. Transporte, 789',
            'ativo': True
        }
        
        result1 = db.table('cad_transportadoras').insert(dados1).execute()
        if result1.data:
            id1 = result1.data[0]['id']
            print(f"✅ Transportadora 1 criada: {id1}")
            
            # Teste CNPJ duplicado
            dados2 = {
                'nome': nome_teste + "_2",
                'cnpj': '44444444444444',  # MESMO CNPJ
                'telefone': '11666777888',
                'endereco': 'Av. Transporte, 101',
                'ativo': True
            }
            
            try:
                result2 = db.table('cad_transportadoras').insert(dados2).execute()
                if result2.data:
                    id2 = result2.data[0]['id']
                    print(f"✅ CNPJ DUPLICADO PERMITIDO! ID: {id2}")
                    db.table('cad_transportadoras').delete().eq('id', id2).execute()
            except Exception as e:
                if 'duplicate key' in str(e) and 'cnpj' in str(e):
                    print(f"❌ CONSTRAINT DE CNPJ EXISTE!")
                    problemas.append('cnpj_constraint_transportadoras')
                else:
                    print(f"❌ Erro inesperado: {str(e)}")
            
            # Limpeza
            db.table('cad_transportadoras').delete().eq('id', id1).execute()
            
    except Exception as e:
        print(f"❌ Erro no teste de transportadoras: {str(e)}")
    
    return problemas

def testar_tabelas_simples():
    """Testa tabelas mais simples (setores, bancos, procedencias)"""
    print("\n🏭 TESTANDO: Tabelas simples (setores, bancos, procedencias)")
    print("-" * 70)
    
    tabelas_simples = ['cad_setores', 'cad_bancos', 'cad_procedencias']
    
    for tabela in tabelas_simples:
        try:
            result = db.table(tabela).select('id,nome').execute()
            print(f"✅ {tabela}: {len(result.data)} registros")
            
            # Teste básico de inserção
            nome_teste = f"TESTE_{tabela}_{int(time.time())}"
            dados = {
                'nome': nome_teste,
                'ativo': True
            }
            
            insert_result = db.table(tabela).insert(dados).execute()
            if insert_result.data:
                id_teste = insert_result.data[0]['id']
                print(f"   ✅ Teste de inserção OK: {id_teste}")
                # Limpeza
                db.table(tabela).delete().eq('id', id_teste).execute()
            
        except Exception as e:
            print(f"❌ {tabela}: {str(e)}")

# EXECUTAR TODOS OS TESTES
print("🚀 INICIANDO AUDITORIA DAS TABELAS CAD_...")

todos_problemas = []

# Teste equipe
problemas_equipe = testar_constraints_equipe()
todos_problemas.extend(problemas_equipe)

# Teste montadores
problemas_montadores = testar_constraints_montadores()
todos_problemas.extend(problemas_montadores)

# Teste transportadoras
problemas_transportadoras = testar_constraints_transportadoras()
todos_problemas.extend(problemas_transportadoras)

# Teste tabelas simples
testar_tabelas_simples()

print("\n" + "=" * 70)
print("📋 RELATÓRIO FINAL DA AUDITORIA CAD_")
print("=" * 70)

if todos_problemas:
    print(f"\n❌ PROBLEMAS ENCONTRADOS: {len(todos_problemas)}")
    
    sql_fixes = []
    
    for problema in todos_problemas:
        print(f"   - {problema}")
        
        if problema == 'email_nao_unico_equipe':
            print("   ⚠️  CRÍTICO: Email deve ser único para evitar problemas de login!")
            sql_fixes.append("ALTER TABLE cad_equipe ADD CONSTRAINT cad_equipe_email_key UNIQUE (email);")
        elif problema == 'cpf_constraint_equipe':
            sql_fixes.append("ALTER TABLE cad_equipe DROP CONSTRAINT IF EXISTS cad_equipe_cpf_key;")
        elif problema == 'cpf_constraint_montadores':
            sql_fixes.append("ALTER TABLE cad_montadores DROP CONSTRAINT IF EXISTS cad_montadores_cpf_key;")
        elif problema == 'cnpj_constraint_transportadoras':
            sql_fixes.append("ALTER TABLE cad_transportadoras DROP CONSTRAINT IF EXISTS cad_transportadoras_cnpj_key;")
    
    if sql_fixes:
        print(f"\n🔧 SQL PARA CORREÇÃO:")
        print("-" * 50)
        for sql in sql_fixes:
            print(f"   {sql}")
        
        # Salvar em arquivo
        with open('/mnt/c/Users/ricar/Projetos/Fluyt_Comercial/sql_correcao_cad.sql', 'w') as f:
            f.write("-- SQL DE CORREÇÃO PARA TABELAS CAD_\\n")
            f.write("-- Execute no Supabase Dashboard\\n\\n")
            for sql in sql_fixes:
                f.write(sql + "\\n")
        
        print(f"\\n✅ Arquivo salvo: sql_correcao_cad.sql")

else:
    print("\\n🎉 NENHUM PROBLEMA ENCONTRADO!")
    print("✅ Todas as tabelas CAD_ estão configuradas corretamente")

print(f"\\n🎯 AUDITORIA DAS TABELAS CAD_ CONCLUÍDA!")