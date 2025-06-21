-- Para redefinir a senha de um usuário no Supabase
-- Execute este comando no SQL Editor do Supabase

-- Opção 1: Enviar email de recuperação de senha
SELECT auth.send_recovery('ricardo.nilton@hotmail.com');

-- Isso enviará um email com link para redefinir a senha