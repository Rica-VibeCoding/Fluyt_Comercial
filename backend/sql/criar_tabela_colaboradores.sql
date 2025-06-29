-- Script para criar tabela c_colaboradores
-- Centraliza todos os tipos de colaboração (funcionários e parceiros)

-- Criar tabela principal
CREATE TABLE IF NOT EXISTS c_colaboradores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL UNIQUE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('FUNCIONARIO', 'PARCEIRO')),
    
    -- Percentuais de remuneração
    percentual_sobre_venda DECIMAL(5,2) DEFAULT 0.00 CHECK (percentual_sobre_venda >= 0 AND percentual_sobre_venda <= 100),
    percentual_sobre_custo DECIMAL(5,2) DEFAULT 0.00 CHECK (percentual_sobre_custo >= 0 AND percentual_sobre_custo <= 100),
    
    -- Valores fixos
    minimo_garantido DECIMAL(10,2) DEFAULT 0.00 CHECK (minimo_garantido >= 0),
    salario_mensal DECIMAL(10,2) DEFAULT 0.00 CHECK (salario_mensal >= 0),
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
    CONSTRAINT check_remuneracao CHECK (
        percentual_sobre_venda > 0 OR 
        percentual_sobre_custo > 0 OR 
        salario_mensal > 0 OR 
        valor_por_servico > 0
    )
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_colaboradores_tipo ON c_colaboradores(tipo);
CREATE INDEX IF NOT EXISTS idx_colaboradores_ativo ON c_colaboradores(ativo);
CREATE INDEX IF NOT EXISTS idx_colaboradores_ordem ON c_colaboradores(ordem_exibicao);
CREATE INDEX IF NOT EXISTS idx_colaboradores_nome ON c_colaboradores(nome);

-- Popular com dados básicos
INSERT INTO c_colaboradores (nome, tipo, percentual_sobre_venda, percentual_sobre_custo, minimo_garantido, salario_mensal, valor_por_servico, opcional_no_orcamento, ordem_exibicao, descricao)
VALUES 
    -- FUNCIONÁRIOS (sempre incluídos)
    ('Vendedor', 'FUNCIONARIO', 3.00, 0.00, 0.00, 4000.00, 0.00, false, 1, 'Vendedor interno - comissão sobre vendas'),
    ('Gerente', 'FUNCIONARIO', 2.00, 0.00, 1500.00, 8000.00, 0.00, false, 2, 'Gerente - comissão + salário + mínimo garantido'),
    ('Administrativo', 'FUNCIONARIO', 0.00, 0.00, 0.00, 3500.00, 0.00, false, 3, 'Equipe administrativa - apenas salário'),
    
    -- PARCEIROS (opcionais no orçamento)
    ('Montador', 'PARCEIRO', 0.00, 8.00, 0.00, 0.00, 150.00, true, 4, 'Montador externo - percentual sobre custo + valor fixo'),
    ('Arquiteto', 'PARCEIRO', 10.00, 0.00, 1500.00, 0.00, 0.00, true, 5, 'Arquiteto - percentual sobre venda com mínimo garantido'),
    ('Medidor', 'PARCEIRO', 0.00, 0.00, 0.00, 0.00, 80.00, true, 6, 'Medidor externo - valor fixo por serviço'),
    ('Projetista Técnico', 'PARCEIRO', 2.00, 0.00, 0.00, 0.00, 0.00, true, 7, 'Projetista técnico - percentual sobre venda'),
    ('Transportadora', 'PARCEIRO', 0.00, 0.00, 0.00, 0.00, 200.00, true, 8, 'Transportadora - valor fixo por entrega')
ON CONFLICT (nome) DO NOTHING;

-- Trigger para atualizar updated_at automaticamente
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

-- Verificar dados inseridos
SELECT 
    nome, 
    tipo, 
    percentual_sobre_venda, 
    percentual_sobre_custo, 
    CASE 
        WHEN salario_mensal > 0 THEN CONCAT('R$ ', salario_mensal::TEXT)
        WHEN valor_por_servico > 0 THEN CONCAT('R$ ', valor_por_servico::TEXT, ' por serviço')
        ELSE 'Apenas percentual'
    END as remuneracao,
    opcional_no_orcamento
FROM c_colaboradores 
ORDER BY ordem_exibicao; 