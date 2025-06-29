DROP TABLE IF EXISTS c_ambientes_material CASCADE;

DROP TABLE IF EXISTS c_ambientes CASCADE;

DROP TABLE IF EXISTS cad_ambiente_acabamentos CASCADE;

DROP TABLE IF EXISTS cad_ambientes CASCADE;


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
    ;


    CREATE TABLE c_ambientes_material (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ambiente_id UUID NOT NULL REFERENCES c_ambientes(id) ON DELETE CASCADE,
        materiais_json JSONB NOT NULL,
        xml_hash TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT unique_ambiente_material UNIQUE(ambiente_id)
    )
    ;

CREATE INDEX idx_c_ambientes_cliente ON c_ambientes(cliente_id);

CREATE INDEX idx_c_ambientes_origem ON c_ambientes(origem);

CREATE INDEX idx_c_ambientes_data_importacao ON c_ambientes(data_importacao);

CREATE INDEX idx_c_ambientes_material_json ON c_ambientes_material USING GIN (materiais_json);

CREATE INDEX idx_c_ambientes_material_ambiente ON c_ambientes_material(ambiente_id);


    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql
    ;


    CREATE TRIGGER update_c_ambientes_updated_at 
        BEFORE UPDATE ON c_ambientes
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column()
    ;


    CREATE TRIGGER update_c_ambientes_material_updated_at 
        BEFORE UPDATE ON c_ambientes_material
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column()
    ;

ALTER TABLE c_ambientes ENABLE ROW LEVEL SECURITY;

ALTER TABLE c_ambientes_material ENABLE ROW LEVEL SECURITY;


    CREATE POLICY "Ambientes visíveis para autenticados" 
        ON c_ambientes FOR SELECT 
        USING (auth.uid() IS NOT NULL)
    ;


    CREATE POLICY "Criar ambientes para autenticados" 
        ON c_ambientes FOR INSERT 
        WITH CHECK (auth.uid() IS NOT NULL)
    ;


    CREATE POLICY "Atualizar ambientes para autenticados" 
        ON c_ambientes FOR UPDATE 
        USING (auth.uid() IS NOT NULL)
    ;


    CREATE POLICY "Deletar ambientes para autenticados" 
        ON c_ambientes FOR DELETE 
        USING (auth.uid() IS NOT NULL)
    ;


    CREATE POLICY "Materiais visíveis para autenticados" 
        ON c_ambientes_material FOR SELECT 
        USING (auth.uid() IS NOT NULL)
    ;


    CREATE POLICY "Criar materiais para autenticados" 
        ON c_ambientes_material FOR INSERT 
        WITH CHECK (auth.uid() IS NOT NULL)
    ;


    CREATE POLICY "Atualizar materiais para autenticados" 
        ON c_ambientes_material FOR UPDATE 
        USING (auth.uid() IS NOT NULL)
    ;


    CREATE POLICY "Deletar materiais para autenticados" 
        ON c_ambientes_material FOR DELETE 
        USING (auth.uid() IS NOT NULL)
    ;