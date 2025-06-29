
-- Função para executar comandos DDL
CREATE OR REPLACE FUNCTION exec_ddl(command text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE command;
  RETURN 'OK';
EXCEPTION
  WHEN OTHERS THEN
    RETURN SQLERRM;
END;
$$;

-- Dar permissão para service role
GRANT EXECUTE ON FUNCTION exec_ddl TO service_role;
