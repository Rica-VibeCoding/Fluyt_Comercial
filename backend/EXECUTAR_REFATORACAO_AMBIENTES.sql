
-- =====================================================
-- REFATORAÇÃO COMPLETA DAS TABELAS DE AMBIENTES
-- Data: 2025-06-29 01:25:08
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
