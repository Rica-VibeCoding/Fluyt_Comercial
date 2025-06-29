-- Script para refatorar estrutura de colaboradores
-- Criação de duas tabelas: tipos e colaboradores individuais

-- ========================================
-- TABELA 1: TIPOS DE COLABORADORES
-- ========================================
CREATE TABLE IF NOT EXISTS c_tipo_de_colaborador (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL UNIQUE,
    categoria VARCHAR(20) NOT NULL CHECK (categoria IN ('FUNCIONARIO', 'PARCEIRO')),
    
    -- Configurações padrão de remuneração
    percentual_sobre_venda DECIMAL(5,2) DEFAULT 0.00 CHECK (percentual_sobre_venda >= 0 AND percentual_sobre_venda <= 100),
    percentual_sobre_custo DECIMAL(5,2) DEFAULT 0.00 CHECK (percentual_sobre_custo >= 0 AND percentual_sobre_custo <= 100),
    minimo_garantido DECIMAL(10,2) DEFAULT 0.00 CHECK (minimo_garantido >= 0),
    salario_base DECIMAL(10,2) DEFAULT 0.00 CHECK (salario_base >= 0),
    valor_por_servico DECIMAL(10,2) DEFAULT 0.00 CHECK (valor_por_servico >= 0),
    
    -- Configurações operacionais
    opcional_no_orcamento BOOLEAN DEFAULT false,
    ativo BOOLEAN DEFAULT true,
    ordem_exibicao INTEGER DEFAULT 0,
    descricao TEXT,
    
    -- Auditoria
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint: pelo menos um tipo de remuneração deve estar preenchido
    CONSTRAINT check_remuneracao_tipo CHECK (
        percentual_sobre_venda > 0 OR 
        percentual_sobre_custo > 0 OR 
        salario_base > 0 OR 
        valor_por_servico > 0
    )
);

-- ========================================
-- TABELA 2: COLABORADORES INDIVIDUAIS
-- ========================================
CREATE TABLE IF NOT EXISTS c_colaboradores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(200) NOT NULL,
    tipo_colaborador_id UUID NOT NULL REFERENCES c_tipo_de_colaborador(id) ON DELETE RESTRICT,
    
    -- Dados pessoais
    cpf VARCHAR(14) UNIQUE,
    telefone VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    endereco TEXT,
    
    -- Configurações específicas (sobrescreve padrão do tipo se preenchido)
    percentual_sobre_venda_personalizado DECIMAL(5,2) CHECK (percentual_sobre_venda_personalizado >= 0 AND percentual_sobre_venda_personalizado <= 100),
    percentual_sobre_custo_personalizado DECIMAL(5,2) CHECK (percentual_sobre_custo_personalizado >= 0 AND percentual_sobre_custo_personalizado <= 100),
    minimo_garantido_personalizado DECIMAL(10,2) CHECK (minimo_garantido_personalizado >= 0),
    salario_personalizado DECIMAL(10,2) CHECK (salario_personalizado >= 0),
    valor_por_servico_personalizado DECIMAL(10,2) CHECK (valor_por_servico_personalizado >= 0),
    
    -- Controle operacional
    data_admissao DATE,
    ativo BOOLEAN DEFAULT true,
    observacoes TEXT,
    
    -- Auditoria
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- ÍNDICES PARA PERFORMANCE
-- ========================================

-- Índices para tipos de colaboradores
CREATE INDEX IF NOT EXISTS idx_tipo_colaborador_categoria ON c_tipo_de_colaborador(categoria);
CREATE INDEX IF NOT EXISTS idx_tipo_colaborador_ativo ON c_tipo_de_colaborador(ativo);
CREATE INDEX IF NOT EXISTS idx_tipo_colaborador_ordem ON c_tipo_de_colaborador(ordem_exibicao);
CREATE INDEX IF NOT EXISTS idx_tipo_colaborador_nome ON c_tipo_de_colaborador(nome);

-- Índices para colaboradores
CREATE INDEX IF NOT EXISTS idx_colaboradores_tipo ON c_colaboradores(tipo_colaborador_id);
CREATE INDEX IF NOT EXISTS idx_colaboradores_ativo ON c_colaboradores(ativo);
CREATE INDEX IF NOT EXISTS idx_colaboradores_nome ON c_colaboradores(nome);
CREATE INDEX IF NOT EXISTS idx_colaboradores_cpf ON c_colaboradores(cpf);
CREATE INDEX IF NOT EXISTS idx_colaboradores_email ON c_colaboradores(email);

-- ========================================
-- TRIGGERS PARA UPDATED_AT
-- ========================================

-- Trigger para tipos de colaboradores
CREATE OR REPLACE FUNCTION update_tipo_colaborador_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_tipo_colaborador_updated_at
    BEFORE UPDATE ON c_tipo_de_colaborador
    FOR EACH ROW
    EXECUTE FUNCTION update_tipo_colaborador_updated_at();

-- Trigger para colaboradores
CREATE OR REPLACE FUNCTION update_colaboradores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_colaboradores_updated_at
    BEFORE UPDATE ON c_colaboradores
    FOR EACH ROW
    EXECUTE FUNCTION update_colaboradores_updated_at();

-- ========================================
-- POPULAR TIPOS DE COLABORADORES
-- ========================================
INSERT INTO c_tipo_de_colaborador (nome, categoria, percentual_sobre_venda, percentual_sobre_custo, minimo_garantido, salario_base, valor_por_servico, opcional_no_orcamento, ordem_exibicao, descricao)
VALUES 
    -- FUNCIONÁRIOS (sempre incluídos)
    ('Vendedor', 'FUNCIONARIO', 3.00, 0.00, 0.00, 4000.00, 0.00, false, 1, 'Vendedor interno - comissão sobre vendas + salário'),
    ('Gerente', 'FUNCIONARIO', 2.00, 0.00, 1500.00, 8000.00, 0.00, false, 2, 'Gerente - comissão + salário + mínimo garantido'),
    ('Administrativo', 'FUNCIONARIO', 0.00, 0.00, 0.00, 3500.00, 0.00, false, 3, 'Equipe administrativa - apenas salário fixo'),
    ('Medidor Interno', 'FUNCIONARIO', 0.00, 0.00, 0.00, 0.00, 80.00, false, 4, 'Medidor interno - valor por medição'),
    
    -- PARCEIROS (opcionais no orçamento)
    ('Montador', 'PARCEIRO', 0.00, 8.00, 0.00, 0.00, 150.00, true, 5, 'Montador externo - percentual sobre custo + valor fixo'),
    ('Arquiteto', 'PARCEIRO', 10.00, 0.00, 1500.00, 0.00, 0.00, true, 6, 'Arquiteto - percentual sobre venda com mínimo garantido'),
    ('Medidor Externo', 'PARCEIRO', 0.00, 0.00, 0.00, 0.00, 120.00, true, 7, 'Medidor externo - valor fixo por serviço'),
    ('Projetista Técnico', 'PARCEIRO', 2.00, 0.00, 0.00, 0.00, 0.00, true, 8, 'Projetista técnico - percentual sobre venda'),
    ('Transportadora', 'PARCEIRO', 0.00, 0.00, 0.00, 0.00, 200.00, true, 9, 'Transportadora - valor fixo por entrega')
ON CONFLICT (nome) DO NOTHING;

-- ========================================
-- POPULAR COLABORADORES EXEMPLO
-- ========================================
INSERT INTO c_colaboradores (nome, tipo_colaborador_id, cpf, telefone, email, data_admissao, observacoes)
SELECT 
    'João Silva Santos',
    t.id,
    '123.456.789-01',
    '(11) 99999-1111',
    'joao.silva@empresa.com',
    '2024-01-15'::DATE,
    'Vendedor experiente, especialista em móveis planejados'
FROM c_tipo_de_colaborador t 
WHERE t.nome = 'Vendedor'
ON CONFLICT (cpf) DO NOTHING;

INSERT INTO c_colaboradores (nome, tipo_colaborador_id, cpf, telefone, email, data_admissao, observacoes)
SELECT 
    'Maria Costa Lima',
    t.id,
    '987.654.321-02',
    '(11) 99999-2222',
    'maria.costa@empresa.com',
    '2023-03-10'::DATE,
    'Gerente de loja com 5 anos de experiência'
FROM c_tipo_de_colaborador t 
WHERE t.nome = 'Gerente'
ON CONFLICT (cpf) DO NOTHING;

INSERT INTO c_colaboradores (nome, tipo_colaborador_id, telefone, email, observacoes)
SELECT 
    'Carlos Montagens Ltda',
    t.id,
    '(11) 3333-4444',
    'contato@carlosmontagens.com',
    'Empresa parceira especializada em montagem de móveis planejados'
FROM c_tipo_de_colaborador t 
WHERE t.nome = 'Montador'
ON CONFLICT (email) DO NOTHING;

INSERT INTO c_colaboradores (nome, tipo_colaborador_id, telefone, email, observacoes)
SELECT 
    'Arquitetura & Design Studio',
    t.id,
    '(11) 5555-6666',
    'projetos@arqdesign.com',
    'Escritório de arquitetura parceiro para projetos especiais'
FROM c_tipo_de_colaborador t 
WHERE t.nome = 'Arquiteto'
ON CONFLICT (email) DO NOTHING;

-- ========================================
-- VERIFICAÇÃO DOS DADOS
-- ========================================

-- Verificar tipos criados
SELECT 
    nome,
    categoria,
    CASE 
        WHEN percentual_sobre_venda > 0 THEN CONCAT(percentual_sobre_venda::TEXT, '% venda')
        ELSE ''
    END as perc_venda,
    CASE 
        WHEN percentual_sobre_custo > 0 THEN CONCAT(percentual_sobre_custo::TEXT, '% custo')
        ELSE ''
    END as perc_custo,
    CASE 
        WHEN salario_base > 0 THEN CONCAT('R$ ', salario_base::TEXT)
        WHEN valor_por_servico > 0 THEN CONCAT('R$ ', valor_por_servico::TEXT, ' /serviço')
        ELSE 'Apenas %'
    END as remuneracao,
    opcional_no_orcamento
FROM c_tipo_de_colaborador 
ORDER BY ordem_exibicao;

-- Verificar colaboradores criados
SELECT 
    c.nome as colaborador,
    t.nome as tipo,
    t.categoria,
    c.telefone,
    c.email
FROM c_colaboradores c
JOIN c_tipo_de_colaborador t ON c.tipo_colaborador_id = t.id
ORDER BY t.categoria, c.nome; 