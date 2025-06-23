-- Script para criar tabela cad_setores
-- Necessária para funcionamento correto da tabela cad_equipe

-- Criar tabela se não existir
CREATE TABLE IF NOT EXISTS cad_setores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL UNIQUE,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_setores_ativo ON cad_setores(ativo);
CREATE INDEX IF NOT EXISTS idx_setores_nome ON cad_setores(nome);

-- Popular com dados básicos se a tabela estiver vazia
INSERT INTO cad_setores (nome, descricao)
SELECT * FROM (VALUES
    ('Vendas', 'Equipe de vendas'),
    ('Administrativo', 'Equipe administrativa'),
    ('Medição', 'Equipe de medição'),
    ('Gerência', 'Gerência geral'),
    ('Financeiro', 'Equipe financeira'),
    ('Marketing', 'Equipe de marketing')
) AS v(nome, descricao)
WHERE NOT EXISTS (SELECT 1 FROM cad_setores);

-- Verificar se os dados foram inseridos
SELECT COUNT(*) as total_setores FROM cad_setores;
SELECT * FROM cad_setores ORDER BY nome;