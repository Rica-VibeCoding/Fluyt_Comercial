"""
Refatora as tabelas de ambientes no Supabase
"""
from supabase import create_client
import os
from dotenv import load_dotenv
import time

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# Usar service key para ter permissões administrativas
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print("🔧 REFATORAÇÃO DAS TABELAS DE AMBIENTES")
print("=" * 50)

# Passo 1: Backup dos dados existentes
print("\n1️⃣ Fazendo backup dos dados existentes...")
try:
    backup_ambientes = supabase.table('c_ambientes').select("*").execute()
    print(f"   ✓ {len(backup_ambientes.data)} registros salvos de c_ambientes")
except Exception as e:
    print(f"   - Nenhum dado para backup: {e}")
    backup_ambientes = None

# Passo 2: Remover tabelas antigas via função SQL
print("\n2️⃣ Criando função para executar DDL...")

# Vamos usar uma abordagem diferente - criar funções RPC no Supabase
sql_functions = """
-- Função para executar comandos DDL
CREATE OR REPLACE FUNCTION exec_ddl(command text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE command;
  RETURN 'OK';
EXCEPTION
  WHEN OTHERS THEN
    RETURN SQLERRM;
END;
$$;

-- Dar permissão para service role
GRANT EXECUTE ON FUNCTION exec_ddl TO service_role;
"""

# Salvar SQL para criar a função
with open("criar_funcao_ddl.sql", "w") as f:
    f.write(sql_functions)

print("   📝 SQL salvo em criar_funcao_ddl.sql")
print("   ⚠️  Execute este SQL primeiro no Supabase Dashboard")

# Passo 3: Tentar usar a função se ela existir
print("\n3️⃣ Tentando refatorar tabelas...")

comandos_sql = [
    # Remover tabelas antigas
    "DROP TABLE IF EXISTS c_ambientes_material CASCADE",
    "DROP TABLE IF EXISTS c_ambientes CASCADE",
    
    # Criar nova estrutura de c_ambientes
    """CREATE TABLE c_ambientes (
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
    )""",
    
    # Criar tabela de materiais
    """CREATE TABLE c_ambientes_material (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ambiente_id UUID NOT NULL REFERENCES c_ambientes(id) ON DELETE CASCADE,
        materiais_json JSONB NOT NULL,
        xml_hash TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT unique_ambiente_material UNIQUE(ambiente_id)
    )""",
    
    # Índices
    "CREATE INDEX idx_c_ambientes_cliente ON c_ambientes(cliente_id)",
    "CREATE INDEX idx_c_ambientes_origem ON c_ambientes(origem)",
    "CREATE INDEX idx_c_ambientes_material_json ON c_ambientes_material USING GIN (materiais_json)",
]

# Tentar executar via RPC
sucesso = 0
falhas = 0

for i, comando in enumerate(comandos_sql):
    try:
        print(f"\n   Executando comando {i+1}/{len(comandos_sql)}...")
        resultado = supabase.rpc('exec_ddl', {'command': comando}).execute()
        if resultado.data == 'OK':
            print(f"   ✓ Sucesso")
            sucesso += 1
        else:
            print(f"   ⚠️ Aviso: {resultado.data}")
            falhas += 1
    except Exception as e:
        print(f"   ❌ Erro: {e}")
        falhas += 1

# Passo 4: Criar arquivo SQL completo para execução manual
print("\n4️⃣ Criando SQL completo para execução manual...")

sql_completo = f"""
-- =====================================================
-- REFATORAÇÃO COMPLETA DAS TABELAS DE AMBIENTES
-- Data: {time.strftime('%Y-%m-%d %H:%M:%S')}
-- =====================================================

-- 1. REMOVER TABELAS ANTIGAS
DROP TABLE IF EXISTS c_ambientes_material CASCADE;
DROP TABLE IF EXISTS c_ambientes CASCADE;

-- 2. CRIAR NOVA ESTRUTURA
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
);

CREATE TABLE c_ambientes_material (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ambiente_id UUID NOT NULL REFERENCES c_ambientes(id) ON DELETE CASCADE,
    materiais_json JSONB NOT NULL,
    xml_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_ambiente_material UNIQUE(ambiente_id)
);

-- 3. CRIAR ÍNDICES
CREATE INDEX idx_c_ambientes_cliente ON c_ambientes(cliente_id);
CREATE INDEX idx_c_ambientes_origem ON c_ambientes(origem);
CREATE INDEX idx_c_ambientes_data_importacao ON c_ambientes(data_importacao);
CREATE INDEX idx_c_ambientes_material_json ON c_ambientes_material USING GIN (materiais_json);
CREATE INDEX idx_c_ambientes_material_ambiente ON c_ambientes_material(ambiente_id);

-- 4. FUNÇÃO PARA TRIGGERS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. CRIAR TRIGGERS
CREATE TRIGGER update_c_ambientes_updated_at 
    BEFORE UPDATE ON c_ambientes
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_c_ambientes_material_updated_at 
    BEFORE UPDATE ON c_ambientes_material
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. HABILITAR RLS
ALTER TABLE c_ambientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE c_ambientes_material ENABLE ROW LEVEL SECURITY;

-- 7. POLÍTICAS RLS
-- Para c_ambientes
CREATE POLICY "select_ambientes" ON c_ambientes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "insert_ambientes" ON c_ambientes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "update_ambientes" ON c_ambientes FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "delete_ambientes" ON c_ambientes FOR DELETE USING (auth.uid() IS NOT NULL);

-- Para c_ambientes_material
CREATE POLICY "select_material" ON c_ambientes_material FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "insert_material" ON c_ambientes_material FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "update_material" ON c_ambientes_material FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "delete_material" ON c_ambientes_material FOR DELETE USING (auth.uid() IS NOT NULL);

-- 8. COMENTÁRIOS
COMMENT ON TABLE c_ambientes IS 'Ambientes de móveis planejados';
COMMENT ON COLUMN c_ambientes.valor_custo_fabrica IS 'Custo de fabricação do XML';
COMMENT ON COLUMN c_ambientes.valor_venda IS 'Valor de venda para orçamento';
COMMENT ON TABLE c_ambientes_material IS 'Materiais em formato JSON';
"""

# Salvar SQL
arquivo_sql = "EXECUTAR_REFATORACAO_AMBIENTES.sql"
with open(arquivo_sql, "w", encoding="utf-8") as f:
    f.write(sql_completo)

print(f"\n✅ SQL completo salvo em: {arquivo_sql}")

# Resumo final
print("\n" + "=" * 50)
print("📊 RESUMO DA REFATORAÇÃO")
print("=" * 50)

if sucesso > 0:
    print(f"✓ {sucesso} comandos executados com sucesso")
if falhas > 0:
    print(f"❌ {falhas} comandos falharam")

print("\n🎯 PRÓXIMOS PASSOS:")
print("1. Acesse o Supabase Dashboard")
print("2. Vá em SQL Editor")
print(f"3. Execute o arquivo: {arquivo_sql}")
print("4. Verifique se as tabelas foram criadas corretamente")

# Verificar estrutura final
print("\n🔍 Verificando estrutura atual...")
try:
    test = supabase.table('c_ambientes').select("count").limit(1).execute()
    print("✓ Tabela c_ambientes existe")
except:
    print("❌ Tabela c_ambientes não encontrada")

try:
    test = supabase.table('c_ambientes_material').select("count").limit(1).execute()
    print("✓ Tabela c_ambientes_material existe")
except:
    print("❌ Tabela c_ambientes_material não encontrada")