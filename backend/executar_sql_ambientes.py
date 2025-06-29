"""
Script para executar a criação das tabelas de ambientes no Supabase
"""
import os
import sys
from pathlib import Path
from supabase import create_client, Client

# Adicionar o diretório raiz ao path
sys.path.append(str(Path(__file__).parent))

from core.config import settings

def executar_sql_ambientes():
    """Executa o script SQL para criar as tabelas de ambientes"""
    
    # Ler o arquivo SQL
    sql_file = Path(__file__).parent / 'sql' / 'criar_tabelas_ambientes.sql'
    
    if not sql_file.exists():
        print(f"❌ Arquivo SQL não encontrado: {sql_file}")
        return False
    
    with open(sql_file, 'r', encoding='utf-8') as f:
        sql_content = f.read()
    
    # Conectar ao banco usando credenciais service_role
    print("📊 Conectando ao Supabase...")
    supabase: Client = create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_SERVICE_KEY  # Usar service key para ter permissão total
    )
    
    try:
        # Dividir o SQL em statements individuais
        sql_statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]
        
        print(f"🔧 Executando {len(sql_statements)} comandos SQL...")
        
        # Executar cada statement via RPC
        for i, statement in enumerate(sql_statements):
            if statement:
                try:
                    # Usar postgrest para executar SQL direto
                    result = supabase.rpc('exec_sql', {'query': statement}).execute()
                    print(f"✓ Comando {i+1}/{len(sql_statements)} executado")
                except Exception as e:
                    # Se não tiver a função exec_sql, vamos criar
                    if "exec_sql" in str(e):
                        print("⚠️  Função exec_sql não encontrada. Criando...")
                        create_exec_sql = """
                        CREATE OR REPLACE FUNCTION exec_sql(query text)
                        RETURNS void
                        LANGUAGE plpgsql
                        SECURITY DEFINER
                        AS $$
                        BEGIN
                            EXECUTE query;
                        END;
                        $$;
                        """
                        # Não podemos executar este diretamente, então vamos usar outra abordagem
                        pass
                    raise e
        
        print("✅ Script SQL executado!")
        
        # Verificar se as tabelas foram criadas
        print("\n📋 Verificando tabelas criadas:")
        
        # Verificar c_ambientes
        try:
            check_ambientes = supabase.table('c_ambientes').select('count').limit(1).execute()
            print("✓ Tabela c_ambientes verificada")
        except:
            print("❌ Tabela c_ambientes não encontrada")
            return False
        
        # Verificar c_ambientes_material
        try:
            check_material = supabase.table('c_ambientes_material').select('count').limit(1).execute()
            print("✓ Tabela c_ambientes_material verificada")
        except:
            print("❌ Tabela c_ambientes_material não encontrada")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao executar SQL: {e}")
        print("\n💡 Dica: Execute o SQL diretamente no Supabase Dashboard:")
        print(f"   1. Acesse: {settings.SUPABASE_URL}")
        print("   2. Vá em SQL Editor")
        print(f"   3. Cole o conteúdo de: {sql_file}")
        print("   4. Execute o script")
        return False

if __name__ == "__main__":
    success = executar_sql_ambientes()
    if success:
        print("\n🎉 Estrutura do módulo Ambientes criada com sucesso!")
    else:
        print("\n❌ Requer execução manual no Supabase Dashboard")