-- Função para criar ambiente e materiais em uma transação
CREATE OR REPLACE FUNCTION criar_ambiente_com_materiais(
    p_ambiente_data jsonb,
    p_materiais_data jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_ambiente_id uuid;
    v_result jsonb;
BEGIN
    -- Iniciar transação implícita
    
    -- Inserir ambiente
    INSERT INTO c_ambientes (
        cliente_id,
        nome,
        valor_custo_fabrica,
        valor_venda,
        origem,
        data_importacao,
        hora_importacao,
        created_at,
        updated_at
    )
    SELECT 
        (p_ambiente_data->>'cliente_id')::uuid,
        p_ambiente_data->>'nome',
        (p_ambiente_data->>'valor_custo_fabrica')::numeric,
        (p_ambiente_data->>'valor_venda')::numeric,
        p_ambiente_data->>'origem',
        (p_ambiente_data->>'data_importacao')::date,
        (p_ambiente_data->>'hora_importacao')::time,
        NOW(),
        NOW()
    RETURNING id INTO v_ambiente_id;
    
    -- Inserir materiais se fornecidos
    IF p_materiais_data IS NOT NULL THEN
        INSERT INTO c_ambientes_material (
            ambiente_id,
            materiais_json,
            xml_hash,
            created_at,
            updated_at
        )
        VALUES (
            v_ambiente_id,
            p_materiais_data->>'materiais_json',
            p_materiais_data->>'xml_hash',
            NOW(),
            NOW()
        );
    END IF;
    
    -- Retornar resultado
    SELECT jsonb_build_object(
        'success', true,
        'ambiente_id', v_ambiente_id
    ) INTO v_result;
    
    RETURN v_result;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Em caso de erro, a transação é automaticamente revertida
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Conceder permissão para usuários autenticados
GRANT EXECUTE ON FUNCTION criar_ambiente_com_materiais TO authenticated;