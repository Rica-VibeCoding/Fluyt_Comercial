#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para criar a estrutura de tabelas de ambientes no Supabase
"""
import os
import sys
from dotenv import load_dotenv
from pathlib import Path
import psycopg2
from urllib.parse import urlparse

# Carrega variáveis de ambiente
load_dotenv()

# Configuração do banco de dados
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("❌ Erro: DATABASE_URL deve estar definida no .env")
    print("Formato esperado: postgresql://user:password@host:port/database")
    sys.exit(1)

# Parse da URL do banco
parsed = urlparse(DATABASE_URL)

# Configuração da conexão
db_config = {
    'host': parsed.hostname,
    'port': parsed.port or 5432,
    'database': parsed.path[1:],  # Remove a barra inicial
    'user': parsed.username,
    'password': parsed.password
}

print("=" * 80)
print("CRIANDO ESTRUTURA DE TABELAS DE AMBIENTES NO SUPABASE")
print("=" * 80)
print(f"Host: {db_config['host']}")
print(f"Database: {db_config['database']}")
print("=" * 80)

try:
    # Conecta ao banco
    print("\n📡 Conectando ao banco de dados...")
    conn = psycopg2.connect(**db_config)
    conn.autocommit = True
    cursor = conn.cursor()
    print("✅ Conectado com sucesso!")
    
    # Lê o arquivo SQL
    sql_file = Path(__file__).parent / "sql" / "criar_tabela_ambientes.sql"
    if not sql_file.exists():
        print(f"❌ Erro: Arquivo SQL não encontrado: {sql_file}")
        sys.exit(1)
    
    print(f"\n📄 Lendo arquivo SQL: {sql_file}")
    with open(sql_file, 'r', encoding='utf-8') as f:
        sql_content = f.read()
    
    # Divide o SQL em comandos individuais (separados por ;)
    comandos = [cmd.strip() for cmd in sql_content.split(';') if cmd.strip()]
    
    print(f"\n🔧 Executando {len(comandos)} comandos SQL...")
    
    for i, comando in enumerate(comandos, 1):
        if comando.startswith('--') or not comando:
            continue
            
        try:
            print(f"\n[{i}/{len(comandos)}] Executando comando...")
            # Mostra os primeiros 60 caracteres do comando
            preview = comando[:60].replace('\n', ' ')
            if len(comando) > 60:
                preview += "..."
            print(f"    → {preview}")
            
            cursor.execute(comando)
            
            # Se for um SELECT, mostra os resultados
            if comando.upper().strip().startswith('SELECT'):
                results = cursor.fetchall()
                if results:
                    for row in results:
                        print(f"    ✓ {row}")
            else:
                print("    ✓ Comando executado com sucesso")
                
        except Exception as e:
            print(f"    ❌ Erro: {e}")
            # Continua com os próximos comandos mesmo se houver erro
    
    print("\n" + "=" * 80)
    print("✅ ESTRUTURA DE TABELAS CRIADA COM SUCESSO!")
    print("=" * 80)
    
    # Verifica a estrutura criada
    print("\n📊 Verificando estrutura criada:")
    print("-" * 50)
    
    # Lista as tabelas criadas
    cursor.execute("""
        SELECT table_name, 
               (SELECT COUNT(*) FROM information_schema.columns 
                WHERE table_name = t.table_name AND table_schema = 'public') as num_columns
        FROM information_schema.tables t
        WHERE table_schema = 'public' 
        AND table_name IN ('cad_ambientes', 'cad_ambiente_acabamentos')
        ORDER BY table_name;
    """)
    
    tabelas = cursor.fetchall()
    for tabela, num_colunas in tabelas:
        print(f"\n✓ Tabela: {tabela}")
        print(f"  → Número de colunas: {num_colunas}")
        
        # Lista as colunas de cada tabela
        cursor.execute(f"""
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = '{tabela}' AND table_schema = 'public'
            ORDER BY ordinal_position;
        """)
        
        colunas = cursor.fetchall()
        print("  → Colunas:")
        for col_name, col_type, nullable, default in colunas:
            nullable_str = "NULL" if nullable == 'YES' else "NOT NULL"
            default_str = f" DEFAULT {default[:30]}..." if default else ""
            print(f"    • {col_name}: {col_type} {nullable_str}{default_str}")
    
    # Verifica as constraints
    print("\n📐 Verificando constraints:")
    cursor.execute("""
        SELECT tc.table_name, tc.constraint_name, tc.constraint_type
        FROM information_schema.table_constraints tc
        WHERE tc.table_schema = 'public'
        AND tc.table_name IN ('cad_ambientes', 'cad_ambiente_acabamentos')
        ORDER BY tc.table_name, tc.constraint_type;
    """)
    
    constraints = cursor.fetchall()
    for tabela, constraint, tipo in constraints:
        print(f"  → {tabela}: {constraint} ({tipo})")
    
    # Verifica os índices
    print("\n🔍 Verificando índices:")
    cursor.execute("""
        SELECT tablename, indexname
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename IN ('cad_ambientes', 'cad_ambiente_acabamentos')
        ORDER BY tablename, indexname;
    """)
    
    indices = cursor.fetchall()
    for tabela, indice in indices:
        print(f"  → {tabela}: {indice}")
    
    print("\n✅ Estrutura de ambientes criada e verificada com sucesso!")
    
except psycopg2.Error as e:
    print(f"\n❌ Erro de banco de dados: {e}")
    print(f"Detalhes: {e.pgerror if hasattr(e, 'pgerror') else 'N/A'}")
    sys.exit(1)
except Exception as e:
    print(f"\n❌ Erro inesperado: {e}")
    sys.exit(1)
finally:
    if 'cursor' in locals():
        cursor.close()
    if 'conn' in locals():
        conn.close()
        print("\n🔌 Conexão fechada.")