-- Script SQL para adicionar funcionário após criar usuário no Supabase Auth
-- Execute este SQL no Supabase SQL Editor após criar o usuário

-- Substitua 'SEU_USER_ID_AQUI' pelo ID do usuário criado no Supabase Auth
-- Você pode encontrar o ID na aba Authentication → Users

INSERT INTO funcionarios (
    id,
    email,
    nome,
    perfil,
    loja_id,
    empresa_id,
    ativo,
    funcao
) VALUES (
    'SEU_USER_ID_AQUI', -- Copie o ID do usuário do Supabase Auth
    'ricardo.nilton@hotmail.com',
    'Ricardo Nilton',
    'ADMIN',
    'loja-001',
    'empresa-001',
    true,
    'Administrador'
);