# 📋 GUIA COMPLETO DE INTEGRAÇÃO DAS TABELAS - FLUYT COMERCIAL

Este documento define **todos os aspectos necessários** para integrar as demais tabelas do sistema, usando a tabela **Clientes** como modelo de referência perfeito.

**BASEADO NA EXPERIÊNCIA REAL** de implementação do CRUD de Clientes, onde superamos todos os problemas e chegamos a uma solução **PRODUCTION-READY**.

---

## 🎯 **OBJETIVO**

Criar um **padrão consistente** para integração de todas as tabelas, garantindo:
- **Conectividade completa:** Frontend ↔ Backend ↔ Supabase
- **Hierarquia de dados** respeitada
- **Autenticação e autorização** adequadas
- **Código limpo e manutenível**
- **Escalabilidade** para futuras tabelas
- **ZERO problemas** de alinhamento entre camadas

---

## 🚨 **LIÇÕES APRENDIDAS - PROBLEMAS QUE SUPERAMOS**

### **❌ PROBLEMAS ENCONTRADOS NO CRUD CLIENTES:**

1. **INCONSISTÊNCIA DE TIPOS** - Frontend dizia que campos eram obrigatórios, backend dizia que eram opcionais
2. **VALIDAÇÕES QUEBRADAS** - Pydantic retornava ora None, ora string vazia inconsistentemente  
3. **SOFT DELETE INCOMPLETO** - Código implementava mas banco não tinha o campo `ativo`
4. **CONVERSÃO DE DADOS FALHA** - String vazia do frontend não virava `undefined` no backend
5. **VALIDAÇÃO ASSIMÉTRICA** - Criação validava duplicidade, atualização não
6. **PERFORMANCE RUIM** - Sem índices para validações de duplicidade
7. **SCHEMA ZOD CONFUSO** - `.optional().or(z.literal(''))` redundante e confuso

### **✅ SOLUÇÕES IMPLEMENTADAS:**

1. **ALINHAMENTO TOTAL DE TIPOS** - Frontend e Backend com mesmos campos opcionais
2. **VALIDADORES NORMALIZADOS** - Todos retornam `None` para valores vazios
3. **SOFT DELETE REAL** - Campo `ativo` criado no banco + filtros consistentes
4. **CONVERSÃO ROBUSTA** - `string vazia → undefined` em todas as conversões
5. **VALIDAÇÃO SIMÉTRICA** - Mesmas regras para criar e atualizar
6. **ÍNDICES ESTRATÉGICOS** - Performance otimizada desde o início
7. **SCHEMA LIMPO** - Apenas `.optional()` sem redundâncias

---

## 🏗️ **PROCESSO STEP-BY-STEP PARA NOVA TABELA**

### **📋 PASSO 1: ANÁLISE E PLANEJAMENTO (15 min)**

**ANTES DE ESCREVER QUALQUER CÓDIGO:**

1. **Defina campos obrigatórios vs opcionais**
   ```
   PERGUNTA: "Quais campos são realmente obrigatórios para o negócio?"
   EXEMPLO: Cliente só precisa de nome. CPF, telefone são opcionais.
   ```

2. **Mapeie relacionamentos**
   ```
   PERGUNTA: "Esta tabela se relaciona com quais outras?"
   EXEMPLO: Cliente → loja_id, procedencia_id, vendedor_id
   ```

3. **Defina regras de duplicidade**
   ```
   PERGUNTA: "O que não pode ser duplicado?"
   EXEMPLO: Cliente não pode ter mesmo nome na mesma loja
   ```

4. **Planeje hierarquia de acesso**
   ```
   PERGUNTA: "Quem pode ver/editar estes dados?"
   EXEMPLO: SUPER_ADMIN vê tudo, GERENTE vê só da sua loja
   ```

### **📋 PASSO 2: SUPABASE PRIMEIRO (30 min)**

**⚠️ SEMPRE COMECE PELO BANCO - É A FONTE DA VERDADE**

#### **2.1 Estrutura da Tabela**
```sql
-- Template base para qualquer tabela
CREATE TABLE IF NOT EXISTS [nome_tabela] (
    -- Campos obrigatórios do sistema
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    ativo BOOLEAN NOT NULL DEFAULT true,  -- OBRIGATÓRIO para soft delete
    loja_id UUID REFERENCES c_lojas(id),   -- OBRIGATÓRIO para hierarquia
    
    -- Campos específicos da tabela
    nome TEXT NOT NULL,  -- Exemplo: quase toda tabela tem nome
    -- ... outros campos conforme necessidade
    
    -- Campos opcionais comuns
    observacoes TEXT,
    created_by UUID,
    updated_by UUID
);
```

#### **2.2 Índices de Performance**
```sql
-- SEMPRE criar estes índices para performance
CREATE INDEX IF NOT EXISTS idx_[tabela]_ativo ON [nome_tabela](ativo);
CREATE INDEX IF NOT EXISTS idx_[tabela]_loja ON [nome_tabela](loja_id);
CREATE INDEX IF NOT EXISTS idx_[tabela]_ativo_loja ON [nome_tabela](ativo, loja_id);

-- Índices para validação de duplicidade (adaptar conforme necessário)
CREATE INDEX IF NOT EXISTS idx_[tabela]_nome_loja ON [nome_tabela](nome, loja_id);
```

#### **2.3 RLS (Row Level Security)**
```sql
-- Habilitar RLS
ALTER TABLE [nome_tabela] ENABLE ROW LEVEL SECURITY;

-- Política de acesso baseada em hierarquia
CREATE POLICY "policy_[tabela]_select" ON [nome_tabela]
FOR SELECT USING (
    CASE 
        WHEN auth.jwt() ->> 'perfil' = 'SUPER_ADMIN' THEN true
        WHEN auth.jwt() ->> 'perfil' = 'ADMIN' THEN 
            loja_id IN (
                SELECT id FROM c_lojas 
                WHERE empresa_id = (auth.jwt() ->> 'empresa_id')::uuid
            )
        ELSE 
            loja_id = (auth.jwt() ->> 'loja_id')::uuid
    END
);

-- Replicar para INSERT, UPDATE, DELETE
```

### **📋 PASSO 3: BACKEND - SCHEMAS PRIMEIRO (45 min)**

**⚠️ SCHEMAS SÃO A PONTE ENTRE BANCO E FRONTEND**

#### **3.1 Schema Base (schemas.py)**
```python
from typing import Optional, Literal
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, field_validator
import re

class [Tabela]Base(BaseModel):
    """
    Campos base - APENAS CAMPOS REALMENTE OBRIGATÓRIOS
    """
    # Campo obrigatório (adaptar conforme tabela)
    nome: str
    
    # Campos opcionais - SEMPRE Optional[tipo] = None
    observacoes: Optional[str] = None
    ativo: bool = True
    
    # Relacionamentos - SEMPRE Optional[UUID] = None
    loja_id: Optional[UUID] = None
    
    # VALIDADORES CONSISTENTES - SEMPRE retornar None para vazios
    @field_validator('observacoes')
    def validar_observacoes(cls, v):
        if not v or v.strip() == '':
            return None
        return v.strip()

class [Tabela]Create([Tabela]Base):
    """Dados para criar"""
    pass

class [Tabela]Update(BaseModel):
    """Dados para atualizar - TODOS OPCIONAIS"""
    nome: Optional[str] = None
    observacoes: Optional[str] = None
    ativo: Optional[bool] = None
    loja_id: Optional[UUID] = None

class [Tabela]Response([Tabela]Base):
    """Dados retornados"""
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
```

#### **3.2 Repository (repository.py)**
```python
import logging
from typing import Optional, List, Dict, Any
from supabase import Client
from core.exceptions import NotFoundException, DatabaseException, ConflictException

logger = logging.getLogger(__name__)

class [Tabela]Repository:
    def __init__(self, db: Client):
        self.db = db
        self.table = '[nome_tabela]'
    
    async def listar(self, loja_id: Optional[str], filtros: Dict[str, Any] = None, page: int = 1, limit: int = 20):
        """SEMPRE filtrar por ativo=True para soft delete"""
        try:
            query = self.db.table(self.table).select('*').eq('ativo', True)
            
            # Hierarquia: SUPER_ADMIN vê tudo, outros filtram por loja
            if loja_id is not None:
                query = query.eq('loja_id', loja_id)
            
            # Aplicar filtros específicos
            if filtros and filtros.get('busca'):
                busca = f"%{filtros['busca']}%"
                query = query.ilike('nome', busca)
            
            # Contagem para paginação
            count_query = self.db.table(self.table).select('id', count='exact').eq('ativo', True)
            if loja_id is not None:
                count_query = count_query.eq('loja_id', loja_id)
            count_result = count_query.execute()
            
            # Paginação
            offset = (page - 1) * limit
            query = query.order('created_at', desc=True).limit(limit).offset(offset)
            
            result = query.execute()
            
            return {
                'items': result.data,
                'total': count_result.count or 0,
                'page': page,
                'limit': limit,
                'pages': (count_result.count or 0 + limit - 1) // limit
            }
        except Exception as e:
            logger.error(f"Erro ao listar {self.table}: {str(e)}")
            raise DatabaseException(f"Erro ao listar: {str(e)}")
    
    async def buscar_por_nome(self, nome: str, loja_id: Optional[str]) -> Optional[Dict[str, Any]]:
        """Para validação de duplicidade"""
        try:
            query = self.db.table(self.table).select('*').eq('nome', nome).eq('ativo', True)
            if loja_id is not None:
                query = query.eq('loja_id', loja_id)
            result = query.execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Erro ao buscar por nome: {str(e)}")
            raise DatabaseException(f"Erro ao buscar: {str(e)}")
    
    async def criar(self, dados: Dict[str, Any], loja_id: str) -> Dict[str, Any]:
        """SEMPRE validar duplicidade antes de criar"""
        try:
            # Validar duplicidade de nome
            existe_nome = await self.buscar_por_nome(dados['nome'], loja_id)
            if existe_nome:
                raise ConflictException(f"Nome '{dados['nome']}' já cadastrado")
            
            # Adicionar loja_id
            dados['loja_id'] = loja_id
            
            result = self.db.table(self.table).insert(dados).execute()
            if not result.data:
                raise DatabaseException("Erro ao criar")
            
            return result.data[0]
        except ConflictException:
            raise
        except Exception as e:
            logger.error(f"Erro ao criar: {str(e)}")
            raise DatabaseException(f"Erro ao criar: {str(e)}")
    
    async def atualizar(self, item_id: str, dados: Dict[str, Any], loja_id: Optional[str]) -> Dict[str, Any]:
        """SEMPRE validar duplicidade na atualização também"""
        try:
            # Verificar se existe
            item_atual = await self.buscar_por_id(item_id, loja_id)
            
            # Se mudando nome, validar duplicidade
            if 'nome' in dados and dados['nome'] != item_atual['nome']:
                existe_nome = await self.buscar_por_nome(dados['nome'], loja_id)
                if existe_nome:
                    raise ConflictException(f"Nome '{dados['nome']}' já cadastrado")
            
            # Limpar dados None
            dados_limpos = {k: v for k, v in dados.items() if v is not None}
            
            query = self.db.table(self.table).update(dados_limpos).eq('id', item_id)
            if loja_id is not None:
                query = query.eq('loja_id', loja_id)
                
            result = query.execute()
            if not result.data:
                raise DatabaseException("Erro ao atualizar")
                
            return result.data[0]
        except (NotFoundException, ConflictException):
            raise
        except Exception as e:
            logger.error(f"Erro ao atualizar: {str(e)}")
            raise DatabaseException(f"Erro ao atualizar: {str(e)}")
    
    async def excluir(self, item_id: str, loja_id: Optional[str]) -> bool:
        """SEMPRE soft delete - marcar ativo=false"""
        try:
            await self.buscar_por_id(item_id, loja_id)
            
            query = self.db.table(self.table).update({'ativo': False}).eq('id', item_id)
            if loja_id is not None:
                query = query.eq('loja_id', loja_id)
                
            result = query.execute()
            return bool(result.data)
        except Exception as e:
            logger.error(f"Erro ao excluir: {str(e)}")
            raise DatabaseException(f"Erro ao excluir: {str(e)}")
```

### **📋 PASSO 4: FRONTEND - TIPOS PRIMEIRO (30 min)**

**⚠️ TIPOS CORRETOS PREVINEM 90% DOS BUGS**

#### **4.1 Tipos TypeScript (types/[tabela].ts)**
```typescript
// SEMPRE alinhar com schemas do backend
export interface [Tabela] {
  id: string;
  nome: string;
  observacoes?: string;
  ativo: boolean;
  loja_id?: string;
  created_at: string;
  updated_at: string;
}

// Para formulários - APENAS campos que o usuário preenche
export interface [Tabela]FormData {
  nome: string;
  observacoes?: string;
}

// Para API - EXATAMENTE igual ao backend
export interface [Tabela]CreatePayload {
  nome: string;
  observacoes?: string;
}

export interface [Tabela]UpdatePayload {
  nome?: string;
  observacoes?: string;
}
```

#### **4.2 Hook de API (hooks/modulos/[tabela]/use-[tabela]-api.ts)**
```typescript
import { useState, useCallback } from 'react';
import { [tabela]Service } from '@/services/[tabela]-service';
import type { [Tabela], [Tabela]CreatePayload, [Tabela]UpdatePayload } from '@/types/[tabela]';

export const use[Tabela]Api = () => {
  const [data, setData] = useState<[Tabela][]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await [tabela]Service.listar();
      if (response.success && response.data) {
        setData(response.data.items);
      } else {
        throw new Error(response.error || 'Erro ao carregar dados');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  const criar = useCallback(async (dados: [Tabela]CreatePayload) => {
    try {
      const response = await [tabela]Service.criar(dados);
      if (response.success) {
        await listar(); // Recarregar lista
        return response.data;
      } else {
        throw new Error(response.error || 'Erro ao criar');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar');
      throw err;
    }
  }, [listar]);

  const atualizar = useCallback(async (id: string, dados: [Tabela]UpdatePayload) => {
    try {
      const response = await [tabela]Service.atualizar(id, dados);
      if (response.success) {
        await listar(); // Recarregar lista
        return response.data;
      } else {
        throw new Error(response.error || 'Erro ao atualizar');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar');
      throw err;
    }
  }, [listar]);

  const excluir = useCallback(async (id: string) => {
    try {
      const response = await [tabela]Service.excluir(id);
      if (response.success) {
        await listar(); // Recarregar lista
      } else {
        throw new Error(response.error || 'Erro ao excluir');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir');
      throw err;
    }
  }, [listar]);

  return {
    data,
    loading,
    error,
    listar,
    criar,
    atualizar,
    excluir
  };
};
```

#### **4.3 Conversão de Dados (services/[tabela]-service.ts)**
```typescript
// SEMPRE converter string vazia para undefined
export function converter[Tabela]FormDataParaPayload(formData: [Tabela]FormData): [Tabela]CreatePayload {
  return {
    nome: formData.nome,
    observacoes: formData.observacoes || undefined, // CRÍTICO: string vazia → undefined
  };
}
```

#### **4.4 Schema de Validação (hooks/modulos/[tabela]/use-[tabela]-form.ts)**
```typescript
import { z } from 'zod';

// Schema LIMPO - apenas .optional(), sem redundâncias
const [tabela]Schema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  observacoes: z.string().optional(), // SIMPLES e CLARO
});
```

---

## 🔧 **FERRAMENTAS E COMANDOS ÚTEIS**

### **VERIFICAÇÃO DE ALINHAMENTO**

#### **1. Verificar estrutura da tabela no Supabase:**
```typescript
// Via MCP
mcp_supabase_list_tables({ project_id: "seu_project_id", schemas: ["public"] })
```

#### **2. Testar criação no banco:**
```sql
-- Sempre testar inserção manual primeiro
INSERT INTO [nome_tabela] (nome, loja_id) 
VALUES ('Teste', 'uuid-da-loja')
RETURNING *;
```

#### **3. Verificar índices criados:**
```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = '[nome_tabela]' 
ORDER BY indexname;
```

### **DEBUGGING COMUM**

#### **Erro HTTP 422:**
```
CAUSA: Tipos desalinhados entre frontend e backend
SOLUÇÃO: Verificar se campos obrigatórios coincidem
```

#### **Erro de duplicidade não funcionando:**
```
CAUSA: Falta índice ou validação assimétrica
SOLUÇÃO: Criar índice + validar em criar E atualizar
```

#### **Soft delete não funcionando:**
```
CAUSA: Campo ativo não existe ou filtro inconsistente
SOLUÇÃO: Criar campo + filtrar em TODAS as queries
```

---

## 📊 **MAPEAMENTO COMPLETO DAS TABELAS**

### **🔵 TABELAS PRINCIPAIS (Alta Prioridade)**
1. **`cad_empresas`** - Empresas do sistema
2. **`c_lojas`** - Lojas das empresas
3. **`cad_equipe`** - Funcionários/Equipe
4. **`cad_setores`** - Setores organizacionais
5. **`cad_procedencias`** - Origem dos clientes ✅ **CONCLUÍDO**
6. **`cad_montadores`** - Prestadores de montagem
7. **`cad_transportadoras`** - Empresas de transporte

### **🟡 TABELAS DE CONFIGURAÇÃO (Média Prioridade)**
8. **`config_loja`** - Configurações por loja
9. **`config_status_orcamento`** - Status dos orçamentos
10. **`config_regras_comissao_faixa`** - Regras de comissão

### **🟢 TABELAS OPERACIONAIS (Baixa Prioridade Inicial)**
11. **`c_orcamentos`** - Orçamentos
12. **`c_ambientes`** - Ambientes dos orçamentos
13. **`c_contratos`** - Contratos gerados
14. **`c_aprovacao_historico`** - Histórico de aprovações

---

## 🚀 **ORDEM DE IMPLEMENTAÇÃO RECOMENDADA**

### **FASE 1: ESTRUTURA BASE (Seguir exatamente esta ordem)**
1. **`cad_empresas`** - Base da hierarquia
2. **`c_lojas`** - Dependente de empresas
3. **`cad_setores`** - Independente, simples para treinar

### **FASE 2: RECURSOS HUMANOS**
4. **`cad_equipe`** - Funcionários (depende de lojas e setores)
5. **`cad_procedencias`** - ✅ **JÁ CONCLUÍDO** (modelo perfeito)

### **FASE 3: PRESTADORES**
6. **`cad_montadores`** - Prestadores de montagem
7. **`cad_transportadoras`** - Empresas de transporte

---

## ✅ **CHECKLIST FINAL DE VALIDAÇÃO**

### **🗄️ SUPABASE**
- [ ] Tabela criada com campos obrigatórios (id, created_at, updated_at, ativo, loja_id)
- [ ] RLS habilitado e políticas configuradas
- [ ] Relacionamentos (FKs) criados
- [ ] Índices de performance adicionados (ativo, loja_id, nome+loja_id)
- [ ] Teste de inserção manual funcionando

### **🔧 BACKEND**
- [ ] Schemas com validações consistentes (None para vazios)
- [ ] Repository com soft delete em todas as queries
- [ ] Validação de duplicidade simétrica (criar E atualizar)
- [ ] Services com lógica de hierarquia
- [ ] Controller com endpoints RESTful
- [ ] Logs adequados em todos os métodos

### **🎨 FRONTEND**
- [ ] Tipos TypeScript alinhados com backend
- [ ] Conversão string vazia → undefined
- [ ] Schema Zod limpo (apenas .optional())
- [ ] Hook de API com tratamento de erros
- [ ] Componentes seguindo padrão estabelecido
- [ ] Estados de loading e erro implementados

### **🔐 SEGURANÇA**
- [ ] Autenticação obrigatória em todos os endpoints
- [ ] Autorização por perfil implementada (hierarquia)
- [ ] Validação de dados no backend
- [ ] RLS funcionando no Supabase

### **⚡ PERFORMANCE**
- [ ] Índices criados para campos filtráveis
- [ ] Paginação implementada
- [ ] Queries otimizadas (sem N+1)
- [ ] Soft delete com filtros eficientes

---

## 🎯 **RESULTADO ESPERADO**

Seguindo este guia **baseado na experiência real**, cada nova tabela terá:

✅ **ZERO problemas de alinhamento** entre Frontend ↔ Backend ↔ Supabase
✅ **Validações robustas** e consistentes
✅ **Performance otimizada** desde o início
✅ **Soft delete funcional** 
✅ **Hierarquia de acesso** respeitada
✅ **Código production-ready** desde o primeiro commit

**A tabela Clientes é o modelo PERFEITO** - todas as demais devem seguir exatamente os mesmos padrões, estruturas e soluções implementadas nela.

**LEMBRE-SE:** Este guia foi criado após superarmos TODOS os problemas reais. Seguindo-o à risca, você evitará semanas de debugging e refatoração!
