-- =====================================================
-- CRIAÇÃO DAS TABELAS DO MÓDULO AMBIENTES
-- Data: 2025-01-29
-- =====================================================

-- 1. REMOVER TABELAS ANTIGAS SE EXISTIREM
DROP TABLE IF EXISTS c_ambientes_material CASCADE;
DROP TABLE IF EXISTS c_ambientes CASCADE;
DROP TABLE IF EXISTS cad_ambientes CASCADE;
DROP TABLE IF EXISTS cad_ambiente_acabamentos CASCADE;

-- 2. CRIAR TABELA PRINCIPAL C_AMBIENTES
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

-- 3. CRIAR TABELA DE MATERIAIS COM JSONB
CREATE TABLE c_ambientes_material (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ambiente_id UUID NOT NULL REFERENCES c_ambientes(id) ON DELETE CASCADE,
    materiais_json JSONB NOT NULL,
    xml_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_ambiente_material UNIQUE(ambiente_id)
);

-- 4. CRIAR ÍNDICES PARA PERFORMANCE
-- Índices na tabela principal
CREATE INDEX idx_c_ambientes_cliente ON c_ambientes(cliente_id);
CREATE INDEX idx_c_ambientes_origem ON c_ambientes(origem);
CREATE INDEX idx_c_ambientes_data_importacao ON c_ambientes(data_importacao);

-- Índices para queries JSON
CREATE INDEX idx_c_ambientes_material_json ON c_ambientes_material USING GIN (materiais_json);
CREATE INDEX idx_c_ambientes_material_ambiente ON c_ambientes_material(ambiente_id);

-- 5. CRIAR FUNÇÃO PARA TRIGGER DE UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. CRIAR TRIGGERS
CREATE TRIGGER update_c_ambientes_updated_at 
    BEFORE UPDATE ON c_ambientes
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_c_ambientes_material_updated_at 
    BEFORE UPDATE ON c_ambientes_material
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 7. HABILITAR ROW LEVEL SECURITY
ALTER TABLE c_ambientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE c_ambientes_material ENABLE ROW LEVEL SECURITY;

-- 8. CRIAR POLÍTICAS RLS

-- Políticas para c_ambientes
CREATE POLICY "Ambientes são visíveis para todos os usuários autenticados" 
    ON c_ambientes FOR SELECT 
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem criar ambientes" 
    ON c_ambientes FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem atualizar ambientes" 
    ON c_ambientes FOR UPDATE 
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem deletar ambientes" 
    ON c_ambientes FOR DELETE 
    USING (auth.uid() IS NOT NULL);

-- Políticas para c_ambientes_material
CREATE POLICY "Materiais são visíveis para todos os usuários autenticados" 
    ON c_ambientes_material FOR SELECT 
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem criar materiais" 
    ON c_ambientes_material FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem atualizar materiais" 
    ON c_ambientes_material FOR UPDATE 
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem deletar materiais" 
    ON c_ambientes_material FOR DELETE 
    USING (auth.uid() IS NOT NULL);

-- 9. COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON TABLE c_ambientes IS 'Tabela principal de ambientes de móveis planejados';
COMMENT ON COLUMN c_ambientes.cliente_id IS 'Referência ao cliente proprietário do ambiente';
COMMENT ON COLUMN c_ambientes.valor_custo_fabrica IS 'Custo de fabricação extraído do XML';
COMMENT ON COLUMN c_ambientes.valor_venda IS 'Valor de venda final do ambiente';
COMMENT ON COLUMN c_ambientes.origem IS 'Origem do ambiente: xml (importado) ou manual (criado no sistema)';

COMMENT ON TABLE c_ambientes_material IS 'Detalhes dos materiais e acabamentos do ambiente em formato JSON';
COMMENT ON COLUMN c_ambientes_material.materiais_json IS 'JSON com todos os detalhes de materiais, cores, espessuras, etc';
COMMENT ON COLUMN c_ambientes_material.xml_hash IS 'Hash do XML original para evitar duplicatas na importação';

-- 10. GRANT PERMISSÕES PARA ANON E AUTHENTICATED
GRANT ALL ON c_ambientes TO anon, authenticated;
GRANT ALL ON c_ambientes_material TO anon, authenticated;
GRANT USAGE ON SEQUENCE c_ambientes_id_seq TO anon, authenticated;
GRANT USAGE ON SEQUENCE c_ambientes_material_id_seq TO anon, authenticated;

-- FIM DO SCRIPT