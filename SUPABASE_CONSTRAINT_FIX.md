# COMANDO URGENTE PARA EXECUTAR NO SUPABASE

## CONTEXTO
Preciso remover constraints de CNPJ único das tabelas `cad_empresas` e `c_lojas` no Supabase. Atualmente apenas o campo `nome` deve ser único em cada tabela, mas o banco ainda tem constraints antigas de CNPJ que precisam ser removidas.

## COMANDOS SQL PARA EXECUTAR

Execute os seguintes comandos SQL no SQL Editor do Supabase Dashboard:

```sql
-- 1. REMOVER CONSTRAINT DE CNPJ DA TABELA EMPRESAS
ALTER TABLE cad_empresas DROP CONSTRAINT IF EXISTS cad_empresas_cnpj_key;

-- 2. REMOVER CONSTRAINT DE CNPJ DA TABELA LOJAS (se existir)
ALTER TABLE c_lojas DROP CONSTRAINT IF EXISTS c_lojas_cnpj_key;

-- 3. VERIFICAR CONSTRAINTS RESTANTES EM EMPRESAS
SELECT 
    constraint_name, 
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'cad_empresas'
ORDER BY constraint_name;

-- 4. VERIFICAR CONSTRAINTS RESTANTES EM LOJAS
SELECT 
    constraint_name, 
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'c_lojas'
ORDER BY constraint_name;
```

## RESULTADO ESPERADO

Após executar os comandos, as tabelas devem ter apenas estas constraints:

### Para `cad_empresas`:
- ✅ `cad_empresas_pkey` (PRIMARY KEY)
- ✅ `cad_empresas_nome_key` (UNIQUE no campo nome)
- ❌ `cad_empresas_cnpj_key` (NÃO DEVE EXISTIR - deve ser removida)

### Para `c_lojas`:
- ✅ `c_lojas_pkey` (PRIMARY KEY)
- ✅ `c_lojas_nome_key` (UNIQUE no campo nome)
- ❌ `c_lojas_cnpj_key` (NÃO DEVE EXISTIR - se existir, deve ser removida)

## INSTRUÇÕES
1. Acesse o Supabase Dashboard
2. Vá em "SQL Editor"
3. Cole e execute TODOS os comandos acima
4. Confirme que as constraints de CNPJ foram removidas
5. Retorne confirmando se deu certo ou se houve algum erro

## IMPORTANTE
- Execute TODOS os comandos, não apenas o primeiro
- As verificações (comandos 3 e 4) são importantes para confirmar que funcionou
- Se houver erro, copie a mensagem completa do erro