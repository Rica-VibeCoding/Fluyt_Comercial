## 🗄️ **SCHEMA PARA `c_ambientes_material`**

**Vibecode**, baseando-me no documento e na implementação atual, aqui está o schema otimizado para complementar a tabela `c_ambientes`:

### **📋 ESTRUTURA DA TABELA `c_ambientes_material`**

```sql
CREATE TABLE c_ambientes_material (
    -- IDENTIFICAÇÃO
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ambiente_id UUID NOT NULL REFERENCES c_ambientes(id) ON DELETE CASCADE,
    
    -- METADADOS DA EXTRAÇÃO
    linha_detectada TEXT, -- "Unique / Sublime" ou "Unique" ou "Sublime"
    xml_hash TEXT, -- Hash do XML para evitar duplicatas
    extracted_at TIMESTAMP DEFAULT NOW(),
    
    -- SEÇÃO 1: CAIXA (MÚLTIPLAS LINHAS)
    caixa_espessura TEXT, -- "18mm / 15mm"
    caixa_espessura_prateleiras TEXT, -- "18mm"
    caixa_material TEXT, -- "MDF / MDP"
    caixa_cor TEXT, -- "Branco Polar / Itapuã"
    
    -- SEÇÃO 2: PAINÉIS (MÚLTIPLAS LINHAS)
    paineis_material TEXT, -- "MDF / MDP"
    paineis_espessura TEXT, -- "18mm / 15mm"
    paineis_cor TEXT, -- "Azul Lord / Branco Trama"
    
    -- SEÇÃO 3: PORTAS (MÚLTIPLAS LINHAS)
    portas_espessura TEXT, -- "18mm"
    portas_material TEXT, -- "MDF / MDP"
    portas_modelo TEXT, -- "Frontal Milano / Frontal"
    portas_cor TEXT, -- "Branco Polar / Itapuã"
    
    -- SEÇÃO 4: FERRAGENS (MÚLTIPLAS LINHAS + HIERÁRQUICAS)
    ferragens_puxadores TEXT, -- "128mm > Pux. Punata / Sem Puxador"
    ferragens_dobradicas TEXT, -- "Movelmar c/ Amortecimento / Soft c/ amortecimento"
    ferragens_corredicas TEXT, -- "Movelmar Telescópica c/amortecedor / Standard amortecimento"
    
    -- SEÇÃO 5: PORTA PERFIL (INDEPENDENTE DE LINHA)
    porta_perfil_perfil TEXT, -- "1830 / Anodizado"
    porta_perfil_vidro TEXT, -- "Argentato / 4mm"
    porta_perfil_puxador TEXT, -- "2007"
    porta_perfil_dobradicas TEXT, -- "Soft c/ amortecimento" (opcional)
    
    -- SEÇÃO 6: BRILHART COLOR (INDEPENDENTE DE LINHA)
    brilhart_espessura TEXT, -- "18mm"
    brilhart_cor TEXT, -- "Fosco(2 Face) > Alba"
    brilhart_perfil TEXT, -- "Anodizado > Inox Escovado"
    
    -- SEÇÃO 7: VALOR TOTAL (SIMPLIFICADO)
    custo_fabrica TEXT, -- "R$ 1.644,38"
    valor_venda TEXT, -- "R$ 14.799,42"
    
    -- AUDITORIA
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ÍNDICES PARA PERFORMANCE
CREATE INDEX idx_ambientes_material_ambiente_id ON c_ambientes_material(ambiente_id);
CREATE INDEX idx_ambientes_material_linha ON c_ambientes_material(linha_detectada);
CREATE INDEX idx_ambientes_material_extracted_at ON c_ambientes_material(extracted_at);
CREATE UNIQUE INDEX idx_ambientes_material_unique ON c_ambientes_material(ambiente_id, xml_hash);

-- TRIGGER PARA UPDATE AUTOMÁTICO
CREATE OR REPLACE FUNCTION update_ambientes_material_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ambientes_material_updated_at
    BEFORE UPDATE ON c_ambientes_material
    FOR EACH ROW
    EXECUTE FUNCTION update_ambientes_material_updated_at();
```

### **🔗 RELACIONAMENTO COM `c_ambientes`**

```sql
-- Exemplo da tabela principal (referência)
-- c_ambientes
-- ├── id (UUID PK)
-- ├── nome_ambiente (TEXT)
-- ├── cliente_id (UUID FK)
-- ├── projeto_id (UUID FK)
-- └── ... outros campos

-- Relacionamento 1:1 (um ambiente pode ter apenas um conjunto de materiais)
-- Foreign Key: c_ambientes_material.ambiente_id → c_ambientes.id
```

### **📊 MODELO PYDANTIC CORRESPONDENTE**

```python
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class AmbienteMaterialCreate(BaseModel):
    """Schema para criação de materiais de ambiente"""
    ambiente_id: uuid.UUID
    linha_detectada: Optional[str] = None
    xml_hash: Optional[str] = None
    
    # Caixa
    caixa_espessura: Optional[str] = None
    caixa_espessura_prateleiras: Optional[str] = None
    caixa_material: Optional[str] = None
    caixa_cor: Optional[str] = None
    
    # Painéis
    paineis_material: Optional[str] = None
    paineis_espessura: Optional[str] = None
    paineis_cor: Optional[str] = None
    
    # Portas
    portas_espessura: Optional[str] = None
    portas_material: Optional[str] = None
    portas_modelo: Optional[str] = None
    portas_cor: Optional[str] = None
    
    # Ferragens
    ferragens_puxadores: Optional[str] = None
    ferragens_dobradicas: Optional[str] = None
    ferragens_corredicas: Optional[str] = None
    
    # Porta Perfil
    porta_perfil_perfil: Optional[str] = None
    porta_perfil_vidro: Optional[str] = None
    porta_perfil_puxador: Optional[str] = None
    porta_perfil_dobradicas: Optional[str] = None
    
    # Brilhart Color
    brilhart_espessura: Optional[str] = None
    brilhart_cor: Optional[str] = None
    brilhart_perfil: Optional[str] = None
    
    # Valor Total
    custo_fabrica: Optional[str] = None
    valor_venda: Optional[str] = None

class AmbienteMaterialResponse(AmbienteMaterialCreate):
    """Schema para resposta com dados completos"""
    id: uuid.UUID
    extracted_at: datetime
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
```

### **🔄 ENDPOINTS SUGERIDOS**

```python
# POST /api/ambientes/{ambiente_id}/materiais
async def criar_materiais_ambiente(
    ambiente_id: uuid.UUID,
    dados: AmbienteMaterialCreate
):
    """Criar/atualizar materiais extraídos do XML"""

# GET /api/ambientes/{ambiente_id}/materiais
async def obter_materiais_ambiente(ambiente_id: uuid.UUID):
    """Obter materiais de um ambiente específico"""

# PUT /api/ambientes/{ambiente_id}/materiais
async def atualizar_materiais_ambiente(
    ambiente_id: uuid.UUID,
    dados: AmbienteMaterialCreate
):
    """Atualizar materiais existentes"""

# DELETE /api/ambientes/{ambiente_id}/materiais
async def remover_materiais_ambiente(ambiente_id: uuid.UUID):
    """Remover materiais de um ambiente"""
```

### **📋 CARACTERÍSTICAS DO DESIGN**

**1. NORMALIZAÇÃO:**
- Relacionamento 1:1 com `c_ambientes`
- Evita duplicação de dados
- Facilita consultas relacionadas

**2. FLEXIBILIDADE:**
- Todos campos opcionais (podem ser NULL)
- Suporte a múltiplas linhas com concatenação
- Schema evolutivo para futuras funcionalidades

**3. PERFORMANCE:**
- Índices estratégicos
- Hash do XML para evitar reprocessamento
- Timestamps para auditoria

**4. INTEGRIDADE:**
- Foreign Key com CASCADE DELETE
- Constraint único (ambiente_id + xml_hash)
- Trigger para updated_at automático

**5. AUDITORIA:**
- Timestamp de extração
- Hash do XML original
- Linha detectada para debugging

### **💡 VANTAGENS DESTA ABORDAGEM**

- **Separação clara**: Dados do ambiente vs materiais/acabamentos
- **Escalabilidade**: Fácil adicionar novos campos de materiais
- **Consultas eficientes**: JOIN simples entre tabelas
- **Manutenção**: Schema específico para dados do XML
- **Flexibilidade**: Suporte a evoluções futuras do extrator

**STATUS**: Schema completo pronto para implementação no Supabase.