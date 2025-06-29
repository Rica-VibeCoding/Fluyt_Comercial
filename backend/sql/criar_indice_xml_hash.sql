-- Adicionar índice único para xml_hash na tabela c_ambientes_material
-- Isso evita importação duplicada do mesmo XML

-- Primeiro, verificar se já existe o índice
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = 'c_ambientes_material'
        AND indexname = 'idx_c_ambientes_material_xml_hash'
    ) THEN
        -- Criar índice único apenas para registros com hash não nulo
        CREATE UNIQUE INDEX idx_c_ambientes_material_xml_hash 
        ON c_ambientes_material(xml_hash) 
        WHERE xml_hash IS NOT NULL;
        
        RAISE NOTICE 'Índice único criado para xml_hash';
    ELSE
        RAISE NOTICE 'Índice já existe';
    END IF;
END $$;

-- Adicionar comentário explicativo
COMMENT ON INDEX idx_c_ambientes_material_xml_hash IS 
'Índice único para evitar importação duplicada do mesmo arquivo XML';