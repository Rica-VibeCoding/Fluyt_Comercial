-- Função RPC otimizada para listar setores com contagem de funcionários
-- SETORES SÃO GLOBAIS - conta funcionários de todas as lojas
-- Evita problema de N+1 queries usando agregação no banco

CREATE OR REPLACE FUNCTION listar_setores_com_funcionarios(
    filtro_busca TEXT DEFAULT NULL,
    filtro_ativo BOOLEAN DEFAULT TRUE,
    data_inicio TIMESTAMP DEFAULT NULL,
    data_fim TIMESTAMP DEFAULT NULL,
    pagina INTEGER DEFAULT 1,
    limite INTEGER DEFAULT 20
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    resultado JSON;
    total_registros INTEGER;
    offset_calc INTEGER;
BEGIN
    -- Calcula offset
    offset_calc := (pagina - 1) * limite;
    
    -- Conta total de registros (sem paginação)
    -- Conta total de setores (globais)
    SELECT COUNT(*)::int INTO total_registros
    FROM cad_setores s
    WHERE 
        (filtro_ativo IS NULL OR s.ativo = filtro_ativo)
        AND (filtro_busca IS NULL OR (
            s.nome ILIKE '%' || filtro_busca || '%' 
            OR s.descricao ILIKE '%' || filtro_busca || '%'
        ))
        AND (data_inicio IS NULL OR s.created_at >= data_inicio)
        AND (data_fim IS NULL OR s.created_at <= data_fim);
    
    -- Busca registros com contagem de funcionários
    SELECT json_build_object(
        'items', COALESCE(json_agg(setor_data ORDER BY nome), '[]'::json),
        'total', total_registros,
        'page', pagina,
        'limit', limite,
        'pages', CEILING(total_registros::float / limite)::int
    ) INTO resultado
    FROM (
        SELECT 
            s.id,
            s.nome,
            s.descricao,
            s.ativo,
            s.created_at,
            s.updated_at,
            COUNT(e.id)::int as total_funcionarios
        FROM cad_setores s
        LEFT JOIN cad_equipe e ON e.setor_id = s.id AND e.ativo = true
        WHERE 
            (filtro_ativo IS NULL OR s.ativo = filtro_ativo)
            AND (filtro_busca IS NULL OR (
                s.nome ILIKE '%' || filtro_busca || '%' 
                OR s.descricao ILIKE '%' || filtro_busca || '%'
            ))
            AND (data_inicio IS NULL OR s.created_at >= data_inicio)
            AND (data_fim IS NULL OR s.created_at <= data_fim)
        GROUP BY s.id, s.nome, s.descricao, s.ativo, s.created_at, s.updated_at
        ORDER BY s.nome
        LIMIT limite
        OFFSET offset_calc
    ) as setor_data;
    
    RETURN resultado;
END;
$$;

-- Conceder permissão para usuários autenticados
GRANT EXECUTE ON FUNCTION listar_setores_com_funcionarios TO authenticated;

-- Comentário da função
COMMENT ON FUNCTION listar_setores_com_funcionarios IS 
'Lista setores com contagem de funcionários de forma otimizada, evitando N+1 queries'; 