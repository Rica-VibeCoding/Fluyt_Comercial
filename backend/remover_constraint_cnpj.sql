-- Script para remover constraint de CNPJ único
-- Execute este SQL no Supabase Dashboard

-- 1. Remover constraint de CNPJ
ALTER TABLE cad_empresas DROP CONSTRAINT IF EXISTS cad_empresas_cnpj_key;

-- 2. Verificar constraints restantes
SELECT 
    constraint_name, 
    constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'cad_empresas';

-- Resultado esperado:
-- ✅ cad_empresas_pkey (PRIMARY KEY)
-- ✅ cad_empresas_nome_key (UNIQUE no nome)
-- ❌ cad_empresas_cnpj_key (NÃO DEVE APARECER)