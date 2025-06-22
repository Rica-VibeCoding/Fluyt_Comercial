-- SQL PREVENTIVO PARA REMOVER CONSTRAINTS PROBLEMÁTICAS
-- Execute no Supabase Dashboard

-- EMPRESAS
ALTER TABLE cad_empresas DROP CONSTRAINT IF EXISTS cad_empresas_cnpj_key;

-- LOJAS  
ALTER TABLE c_lojas DROP CONSTRAINT IF EXISTS c_lojas_cnpj_key;

-- CLIENTES
ALTER TABLE c_clientes DROP CONSTRAINT IF EXISTS c_clientes_cpf_key;
ALTER TABLE c_clientes DROP CONSTRAINT IF EXISTS c_clientes_cpf_cnpj_key;
ALTER TABLE c_clientes DROP CONSTRAINT IF EXISTS c_clientes_rg_key;
ALTER TABLE c_clientes DROP CONSTRAINT IF EXISTS c_clientes_rg_ie_key;
ALTER TABLE c_clientes DROP CONSTRAINT IF EXISTS c_clientes_telefone_key;
ALTER TABLE c_clientes DROP CONSTRAINT IF EXISTS c_clientes_email_key;

-- EQUIPE
ALTER TABLE c_equipe DROP CONSTRAINT IF EXISTS c_equipe_cpf_key;
ALTER TABLE c_equipe DROP CONSTRAINT IF EXISTS c_equipe_telefone_key;
-- Manter email único para evitar login duplicado

-- MONTADORES
ALTER TABLE c_montadores DROP CONSTRAINT IF EXISTS c_montadores_cpf_key;
ALTER TABLE c_montadores DROP CONSTRAINT IF EXISTS c_montadores_cnpj_key;
ALTER TABLE c_montadores DROP CONSTRAINT IF EXISTS c_montadores_telefone_key;

-- TRANSPORTADORAS
ALTER TABLE c_transportadoras DROP CONSTRAINT IF EXISTS c_transportadoras_cnpj_key;
ALTER TABLE c_transportadoras DROP CONSTRAINT IF EXISTS c_transportadoras_telefone_key;

-- VERIFICAR CONSTRAINTS RESTANTES
SELECT 
    t.table_name,
    c.constraint_name,
    c.constraint_type
FROM information_schema.table_constraints c
JOIN information_schema.tables t 
    ON t.table_name = c.table_name
WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND c.constraint_type = 'UNIQUE'
    AND t.table_name IN (
        'cad_empresas', 'c_lojas', 'c_clientes', 
        'c_equipe', 'c_montadores', 'c_transportadoras'
    )
ORDER BY t.table_name, c.constraint_name;
