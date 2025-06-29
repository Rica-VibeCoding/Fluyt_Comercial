"""
Executa criação das tabelas de ambientes diretamente no Supabase
"""
from supabase import create_client
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Configuração do Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# Conectar ao Supabase
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print("🔄 Verificando e removendo tabelas antigas...")

# Lista de tabelas para verificar e remover
tabelas_antigas = [
    'c_ambientes_material',
    'c_ambientes', 
    'cad_ambiente_acabamentos',
    'cad_ambientes'
]

# Verificar quais tabelas existem
for tabela in tabelas_antigas:
    try:
        result = supabase.table(tabela).select("count").limit(1).execute()
        print(f"   ✓ Tabela '{tabela}' existe - será removida")
    except:
        print(f"   - Tabela '{tabela}' não existe")

print("\n📊 Criando novas tabelas...")

# SQL separado em comandos individuais para executar via supabase-py
sqls = [
    # Remover tabelas antigas
    "DROP TABLE IF EXISTS c_ambientes_material CASCADE",
    "DROP TABLE IF EXISTS c_ambientes CASCADE", 
    "DROP TABLE IF EXISTS cad_ambiente_acabamentos CASCADE",
    "DROP TABLE IF EXISTS cad_ambientes CASCADE",
    
    # Criar tabela c_ambientes
    """
    CREATE TABLE c_ambientes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        cliente_id UUID NOT NULL REFERENCES cad_clientes(id) ON DELETE CASCADE,
        nome TEXT NOT NULL,
        valor_custo_fabrica DECIMAL(10,2) DEFAULT 0,
        valor_venda DECIMAL(10,2) DEFAULT 0,
        data_importacao DATE,
        hora_importacao TIME,
        origem VARCHAR(20) CHECK (origem IN ('xml', 'manual')) DEFAULT 'manual',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    )
    """,
    
    # Criar tabela c_ambientes_material
    """
    CREATE TABLE c_ambientes_material (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ambiente_id UUID NOT NULL REFERENCES c_ambientes(id) ON DELETE CASCADE,
        materiais_json JSONB NOT NULL,
        xml_hash TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT unique_ambiente_material UNIQUE(ambiente_id)
    )
    """,
    
    # Criar índices
    "CREATE INDEX idx_c_ambientes_cliente ON c_ambientes(cliente_id)",
    "CREATE INDEX idx_c_ambientes_origem ON c_ambientes(origem)",
    "CREATE INDEX idx_c_ambientes_data_importacao ON c_ambientes(data_importacao)",
    "CREATE INDEX idx_c_ambientes_material_json ON c_ambientes_material USING GIN (materiais_json)",
    "CREATE INDEX idx_c_ambientes_material_ambiente ON c_ambientes_material(ambiente_id)",
    
    # Criar função para trigger
    """
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql
    """,
    
    # Criar triggers
    """
    CREATE TRIGGER update_c_ambientes_updated_at 
        BEFORE UPDATE ON c_ambientes
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column()
    """,
    
    """
    CREATE TRIGGER update_c_ambientes_material_updated_at 
        BEFORE UPDATE ON c_ambientes_material
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column()
    """,
    
    # Habilitar RLS
    "ALTER TABLE c_ambientes ENABLE ROW LEVEL SECURITY",
    "ALTER TABLE c_ambientes_material ENABLE ROW LEVEL SECURITY",
    
    # Políticas RLS para c_ambientes
    """
    CREATE POLICY "Ambientes visíveis para autenticados" 
        ON c_ambientes FOR SELECT 
        USING (auth.uid() IS NOT NULL)
    """,
    
    """
    CREATE POLICY "Criar ambientes para autenticados" 
        ON c_ambientes FOR INSERT 
        WITH CHECK (auth.uid() IS NOT NULL)
    """,
    
    """
    CREATE POLICY "Atualizar ambientes para autenticados" 
        ON c_ambientes FOR UPDATE 
        USING (auth.uid() IS NOT NULL)
    """,
    
    """
    CREATE POLICY "Deletar ambientes para autenticados" 
        ON c_ambientes FOR DELETE 
        USING (auth.uid() IS NOT NULL)
    """,
    
    # Políticas RLS para c_ambientes_material
    """
    CREATE POLICY "Materiais visíveis para autenticados" 
        ON c_ambientes_material FOR SELECT 
        USING (auth.uid() IS NOT NULL)
    """,
    
    """
    CREATE POLICY "Criar materiais para autenticados" 
        ON c_ambientes_material FOR INSERT 
        WITH CHECK (auth.uid() IS NOT NULL)
    """,
    
    """
    CREATE POLICY "Atualizar materiais para autenticados" 
        ON c_ambientes_material FOR UPDATE 
        USING (auth.uid() IS NOT NULL)
    """,
    
    """
    CREATE POLICY "Deletar materiais para autenticados" 
        ON c_ambientes_material FOR DELETE 
        USING (auth.uid() IS NOT NULL)
    """
]

# Executar cada SQL
# Como não temos acesso direto ao execute SQL, vamos criar um arquivo para execução manual
sql_completo = ";\n\n".join(sqls) + ";"

# Salvar SQL para execução manual
with open("sql_para_executar_no_supabase.sql", "w", encoding="utf-8") as f:
    f.write(sql_completo)

print("\n⚠️  SQL salvo em: sql_para_executar_no_supabase.sql")
print("📝 Execute este SQL no Supabase Dashboard:")
print(f"   1. Acesse: {SUPABASE_URL}")
print("   2. Vá em SQL Editor")
print("   3. Cole o conteúdo do arquivo sql_para_executar_no_supabase.sql")
print("   4. Clique em RUN")

print("\n🔍 Verificando se as tabelas foram criadas...")

# Tentar verificar se as tabelas existem
try:
    result = supabase.table('c_ambientes').select("count").limit(1).execute()
    print("✅ Tabela c_ambientes encontrada!")
except:
    print("❌ Tabela c_ambientes não encontrada - execute o SQL manualmente")

try:
    result = supabase.table('c_ambientes_material').select("count").limit(1).execute()
    print("✅ Tabela c_ambientes_material encontrada!")
except:
    print("❌ Tabela c_ambientes_material não encontrada - execute o SQL manualmente")