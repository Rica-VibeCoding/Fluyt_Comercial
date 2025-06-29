
-- Migration: Refatorar tabelas de ambientes
-- Descrição: Cria nova estrutura para c_ambientes e c_ambientes_material

-- 1. Fazer backup dos dados existentes em tabela temporária
CREATE TABLE IF NOT EXISTS c_ambientes_backup AS 
SELECT * FROM c_ambientes;

-- 2. Remover tabelas antigas
DROP TABLE IF EXISTS c_ambientes_material CASCADE;
DROP TABLE IF EXISTS c_ambientes CASCADE;

-- 3. Criar nova estrutura de c_ambientes
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

-- 4. Criar tabela c_ambientes_material
CREATE TABLE c_ambientes_material (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ambiente_id UUID NOT NULL REFERENCES c_ambientes(id) ON DELETE CASCADE,
    materiais_json JSONB NOT NULL,
    xml_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_ambiente_material UNIQUE(ambiente_id)
);

-- 5. Criar índices
CREATE INDEX idx_c_ambientes_cliente ON c_ambientes(cliente_id);
CREATE INDEX idx_c_ambientes_origem ON c_ambientes(origem);
CREATE INDEX idx_c_ambientes_data_importacao ON c_ambientes(data_importacao);
CREATE INDEX idx_c_ambientes_material_json ON c_ambientes_material USING GIN (materiais_json);
CREATE INDEX idx_c_ambientes_material_ambiente ON c_ambientes_material(ambiente_id);

-- 6. Criar função para trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Criar triggers
CREATE TRIGGER update_c_ambientes_updated_at 
    BEFORE UPDATE ON c_ambientes
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_c_ambientes_material_updated_at 
    BEFORE UPDATE ON c_ambientes_material
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Habilitar RLS
ALTER TABLE c_ambientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE c_ambientes_material ENABLE ROW LEVEL SECURITY;

-- 9. Criar políticas RLS
-- Para c_ambientes
CREATE POLICY "select_ambientes" ON c_ambientes 
    FOR SELECT USING (auth.uid() IS NOT NULL);
    
CREATE POLICY "insert_ambientes" ON c_ambientes 
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
    
CREATE POLICY "update_ambientes" ON c_ambientes 
    FOR UPDATE USING (auth.uid() IS NOT NULL);
    
CREATE POLICY "delete_ambientes" ON c_ambientes 
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Para c_ambientes_material
CREATE POLICY "select_material" ON c_ambientes_material 
    FOR SELECT USING (auth.uid() IS NOT NULL);
    
CREATE POLICY "insert_material" ON c_ambientes_material 
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
    
CREATE POLICY "update_material" ON c_ambientes_material 
    FOR UPDATE USING (auth.uid() IS NOT NULL);
    
CREATE POLICY "delete_material" ON c_ambientes_material 
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- 10. Migrar dados do backup (se houver)
-- Analisar estrutura antiga e adaptar conforme necessário
DO $$
BEGIN
    -- Verificar se existe backup
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'c_ambientes_backup') THEN
        -- Tentar migrar dados básicos
        INSERT INTO c_ambientes (
            nome,
            cliente_id,
            valor_venda,
            created_at,
            updated_at
        )
        SELECT 
            COALESCE(nome_ambiente, 'Ambiente Importado'),
            cliente_id,
            COALESCE(valor_total, 0),
            created_at,
            updated_at
        FROM c_ambientes_backup
        WHERE cliente_id IS NOT NULL;
        
        -- Se houver detalhes_xml, migrar para c_ambientes_material
        INSERT INTO c_ambientes_material (
            ambiente_id,
            materiais_json
        )
        SELECT 
            a.id,
            COALESCE(b.detalhes_xml::jsonb, '{}'::jsonb)
        FROM c_ambientes a
        INNER JOIN c_ambientes_backup b ON a.nome = b.nome_ambiente
        WHERE b.detalhes_xml IS NOT NULL;
    END IF;
END $$;

-- 11. Comentários
COMMENT ON TABLE c_ambientes IS 'Ambientes de móveis planejados';
COMMENT ON COLUMN c_ambientes.valor_custo_fabrica IS 'Custo de fabricação extraído do XML';
COMMENT ON COLUMN c_ambientes.valor_venda IS 'Valor de venda para orçamento';
COMMENT ON COLUMN c_ambientes.origem IS 'Origem: xml (importado) ou manual';

COMMENT ON TABLE c_ambientes_material IS 'Materiais e acabamentos em formato JSON';
COMMENT ON COLUMN c_ambientes_material.materiais_json IS 'JSON com detalhes de materiais';
COMMENT ON COLUMN c_ambientes_material.xml_hash IS 'Hash do XML para evitar duplicatas';

-- 12. Limpar backup após migração bem sucedida
-- DROP TABLE IF EXISTS c_ambientes_backup;
