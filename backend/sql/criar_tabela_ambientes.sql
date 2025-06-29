-- Script para criar tabela cad_ambientes
-- Tabela para armazenar os ambientes de cada orçamento/cliente

-- Criar tabela principal de ambientes
CREATE TABLE IF NOT EXISTS cad_ambientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    cliente_id UUID REFERENCES cad_clientes(id) ON DELETE CASCADE,
    orcamento_id UUID,  -- Referência futura para tabela de orçamentos
    origem VARCHAR(20) CHECK (origem IN ('manual', 'xml')) DEFAULT 'manual',
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    importado_em TIMESTAMPTZ,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de acabamentos (relacionamento 1:N com ambientes)
CREATE TABLE IF NOT EXISTS cad_ambiente_acabamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ambiente_id UUID NOT NULL REFERENCES cad_ambientes(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('Porta', 'Caixa', 'Painel', 'Porta de Vidro')),
    cor TEXT NOT NULL,
    espessura VARCHAR(20),
    material VARCHAR(50),
    valor DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_ambientes_cliente ON cad_ambientes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ambientes_orcamento ON cad_ambientes(orcamento_id);
CREATE INDEX IF NOT EXISTS idx_ambientes_ativo ON cad_ambientes(ativo);
CREATE INDEX IF NOT EXISTS idx_ambientes_origem ON cad_ambientes(origem);
CREATE INDEX IF NOT EXISTS idx_acabamentos_ambiente ON cad_ambiente_acabamentos(ambiente_id);
CREATE INDEX IF NOT EXISTS idx_acabamentos_tipo ON cad_ambiente_acabamentos(tipo);

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger na tabela de ambientes
CREATE TRIGGER update_cad_ambientes_updated_at 
    BEFORE UPDATE ON cad_ambientes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Aplicar trigger na tabela de acabamentos
CREATE TRIGGER update_cad_ambiente_acabamentos_updated_at 
    BEFORE UPDATE ON cad_ambiente_acabamentos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Criar políticas RLS (Row Level Security)
ALTER TABLE cad_ambientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cad_ambiente_acabamentos ENABLE ROW LEVEL SECURITY;

-- Política para SELECT (todos podem ver)
CREATE POLICY "Ambientes visíveis para todos" 
    ON cad_ambientes FOR SELECT 
    USING (true);

CREATE POLICY "Acabamentos visíveis para todos" 
    ON cad_ambiente_acabamentos FOR SELECT 
    USING (true);

-- Política para INSERT (usuários autenticados podem inserir)
CREATE POLICY "Usuários autenticados podem criar ambientes" 
    ON cad_ambientes FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem criar acabamentos" 
    ON cad_ambiente_acabamentos FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

-- Política para UPDATE (usuários autenticados podem atualizar)
CREATE POLICY "Usuários autenticados podem atualizar ambientes" 
    ON cad_ambientes FOR UPDATE 
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem atualizar acabamentos" 
    ON cad_ambiente_acabamentos FOR UPDATE 
    USING (auth.uid() IS NOT NULL);

-- Política para DELETE (usuários autenticados podem deletar)
CREATE POLICY "Usuários autenticados podem deletar ambientes" 
    ON cad_ambientes FOR DELETE 
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem deletar acabamentos" 
    ON cad_ambiente_acabamentos FOR DELETE 
    USING (auth.uid() IS NOT NULL);

-- Comentários nas tabelas e colunas
COMMENT ON TABLE cad_ambientes IS 'Tabela principal de ambientes do sistema';
COMMENT ON COLUMN cad_ambientes.nome IS 'Nome do ambiente (ex: Cozinha, Dormitório)';
COMMENT ON COLUMN cad_ambientes.valor_total IS 'Valor total do ambiente incluindo todos os acabamentos';
COMMENT ON COLUMN cad_ambientes.cliente_id IS 'Referência ao cliente proprietário do ambiente';
COMMENT ON COLUMN cad_ambientes.orcamento_id IS 'Referência ao orçamento (quando implementado)';
COMMENT ON COLUMN cad_ambientes.origem IS 'Origem do ambiente: manual ou importado via XML';
COMMENT ON COLUMN cad_ambientes.criado_em IS 'Data/hora de criação do ambiente';
COMMENT ON COLUMN cad_ambientes.importado_em IS 'Data/hora de importação (apenas para origem=xml)';

COMMENT ON TABLE cad_ambiente_acabamentos IS 'Tabela de acabamentos de cada ambiente';
COMMENT ON COLUMN cad_ambiente_acabamentos.ambiente_id IS 'Referência ao ambiente pai';
COMMENT ON COLUMN cad_ambiente_acabamentos.tipo IS 'Tipo do acabamento: Porta, Caixa, Painel, Porta de Vidro';
COMMENT ON COLUMN cad_ambiente_acabamentos.cor IS 'Cor do acabamento';
COMMENT ON COLUMN cad_ambiente_acabamentos.espessura IS 'Espessura do material (ex: 18mm)';
COMMENT ON COLUMN cad_ambiente_acabamentos.material IS 'Material utilizado (ex: MDF, MDP)';
COMMENT ON COLUMN cad_ambiente_acabamentos.valor IS 'Valor individual do acabamento';

-- Verificar se as tabelas foram criadas
SELECT 
    'cad_ambientes' as tabela,
    COUNT(*) as total_registros 
FROM cad_ambientes
UNION ALL
SELECT 
    'cad_ambiente_acabamentos' as tabela,
    COUNT(*) as total_registros 
FROM cad_ambiente_acabamentos;