-- ============================================================
-- CORREÇÃO RLS PARA TABELA CAD_SETORES
-- Objetivo: Alinhar com outras tabelas do sistema
-- Data: 2025-01-26
-- ============================================================

-- 1. VERIFICAR POLÍTICAS ATUAIS
-- Execute primeiro para ver o estado atual:
/*
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'cad_setores';
*/

-- 2. REMOVER POLÍTICAS ANTIGAS (se existirem)
DROP POLICY IF EXISTS "public_read_cad_setores" ON cad_setores;
DROP POLICY IF EXISTS "Enable read access for all users" ON cad_setores;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON cad_setores;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON cad_setores;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON cad_setores;

-- 3. CRIAR NOVAS POLÍTICAS (alinhadas com outras tabelas)

-- Política de LEITURA: Permite leitura para usuários anônimos e autenticados
CREATE POLICY "allow_public_read" ON cad_setores
FOR SELECT
TO anon, authenticated
USING (true);

-- Política de INSERÇÃO: Apenas usuários autenticados
CREATE POLICY "allow_authenticated_insert" ON cad_setores
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política de ATUALIZAÇÃO: Apenas usuários autenticados
CREATE POLICY "allow_authenticated_update" ON cad_setores
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Política de EXCLUSÃO: Apenas usuários autenticados
CREATE POLICY "allow_authenticated_delete" ON cad_setores
FOR DELETE
TO authenticated
USING (true);

-- 4. VERIFICAR SE FUNCIONOU
-- Teste com chave anônima:
SELECT COUNT(*) as total_setores FROM cad_setores;

-- 5. CONFIRMAR POLÍTICAS CRIADAS
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'cad_setores'
ORDER BY cmd;

-- ============================================================
-- RESULTADO ESPERADO:
-- - Chave anônima consegue LER todos os setores
-- - Apenas autenticados podem INSERIR/ATUALIZAR/DELETAR
-- - Backend com get_database() funcionará normalmente
-- ============================================================