# 🚀 IMPLEMENTAR Status de Orçamento - Guia Completo

## 📊 **DIAGNÓSTICO ATUAL**

### ✅ **O QUE JÁ ESTÁ PRONTO**
1. **Backend 100% funcional** - Módulo completo
   - `controller.py` - Endpoints REST (GET, POST, PATCH, DELETE)
   - `repository.py` - Queries Supabase com validações
   - `schemas.py` - Modelos Pydantic com validação
   - `services.py` - Lógica de negócio (provavelmente existe)

2. **Tabela Supabase** - `c_status_orcamento`
   - Campos: `id`, `nome`, `descricao`, `cor`, `ordem`, `ativo`, `created_at`, `updated_at`
   - Validações: nome único, cor em formato hex, soft delete
   - Integração com tabela `c_orcamentos` via `status_id`

### ❌ **O QUE FALTA IMPLEMENTAR**
1. **Frontend completo** - Não existe ainda
2. **Integração Backend no main.py** - Verificar se está registrado
3. **Hooks de estado** - Para gerenciar dados no frontend
4. **Tipos TypeScript** - Interfaces para Status de Orçamento

---

## 🎯 **PLANO DE IMPLEMENTAÇÃO**

### **ETAPA 1: Verificar Backend**
- [ ] Verificar se módulo está registrado no `main.py`
- [ ] Testar endpoints via API
- [ ] Criar dados de teste no banco

### **ETAPA 2: Criar Tipos TypeScript**
- [ ] Adicionar interfaces em `types/sistema.ts`
- [ ] Definir tipos de formulário
- [ ] Configurar validações

### **ETAPA 3: Criar API Client**
- [ ] Adicionar endpoints em `services/api-client.ts`
- [ ] Implementar CRUD completo
- [ ] Configurar tratamento de erros

### **ETAPA 4: Criar Hooks**
- [ ] Hook principal `use-status-orcamento.ts`
- [ ] Estado de expansão de tabela
- [ ] Funções CRUD
- [ ] Gerenciamento de loading/erros

### **ETAPA 5: Componentes Frontend**
- [ ] `gestao-status-orcamento.tsx` - Página principal
- [ ] `status-orcamento-table.tsx` - Tabela com expansão
- [ ] `status-orcamento-form.tsx` - Modal de formulário
- [ ] `index.ts` - Exports

### **ETAPA 6: Integração Sistema**
- [ ] Adicionar no `components/modulos/sistema/index.ts`
- [ ] Criar página em `app/painel/sistema/status-orcamento/page.tsx`
- [ ] Adicionar no menu lateral

---

## 🔧 **ESTRUTURA DETALHADA**

### **1. Tipos TypeScript**
```typescript
// Frontend/src/types/sistema.ts
export interface StatusOrcamento {
  id: string;
  nome: string;
  descricao?: string;
  cor?: string;
  ordem: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface StatusOrcamentoFormData {
  nome: string;
  descricao?: string;
  cor?: string;
  ordem: number;
  ativo: boolean;
}
```

### **2. Hook Principal**
```typescript
// Frontend/src/hooks/modulos/sistema/use-status-orcamento.ts
export function useStatusOrcamento() {
  // Estado de expansão da tabela
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  // Função para alternar expansão
  const toggleRowExpansion = (id: string) => {
    // Lógica de expansão
  };
  
  // Função para numeração sequencial
  const getStatusNumero = (index: number) => {
    return String(index + 1).padStart(3, '0');
  };
  
  // CRUD operations usando React Query
  // ... funções de criar, atualizar, deletar
  
  return {
    expandedRows,
    toggleRowExpansion,
    getStatusNumero,
    // ... outros métodos
  };
}
```

### **3. Componente Tabela**
```typescript
// Frontend/src/components/modulos/sistema/status-orcamento/status-orcamento-table.tsx
export function StatusOrcamentoTable({
  status,
  onEdit,
  onDelete,
  onToggleStatus,
  loading = false
}: StatusOrcamentoTableProps) {
  // Seguir padrão do uiux_tabela_modal
  // - Cabeçalho com 7 colunas
  // - Linha principal compacta
  // - Linha expandida com 3 colunas organizadas
  // - Cores contextuais para status
  // - Ícones Lucide apropriados
}
```

### **4. Estrutura de Pastas**
```
Frontend/src/
├── components/modulos/sistema/status-orcamento/
│   ├── gestao-status-orcamento.tsx
│   ├── status-orcamento-table.tsx
│   ├── status-orcamento-form.tsx
│   └── index.ts
├── hooks/modulos/sistema/
│   └── use-status-orcamento.ts
├── app/painel/sistema/status-orcamento/
│   └── page.tsx
└── types/sistema.ts (adicionar interfaces)
```

---

## 🎨 **ESPECIFICAÇÕES UI/UX**

### **Colunas da Tabela**
1. **Expand** - Ícone ChevronRight/Down
2. **Código** - #001, #002... (sequencial)
3. **Nome** - Nome do status
4. **Descrição** - Texto descritivo
5. **Cor** - Badge colorido com hex
6. **Ordem** - Número de ordenação
7. **Status** - Switch + Badge ativo/inativo
8. **Ações** - Editar/Excluir

### **Linha Expandida (3 colunas)**
- **Coluna 1:** Informações básicas (nome, descrição)
- **Coluna 2:** Configurações (cor, ordem)
- **Coluna 3:** Metadados (criado em, atualizado em)

### **Cores e Ícones**
- **Ícone principal:** `Target` (representa status/objetivo)
- **Cor badge:** Usar a cor definida no campo `cor`
- **Placeholder:** `--` para campos vazios
- **Estados:** Verde para ativo, cinza para inativo

---

## 🧪 **TESTES E VALIDAÇÕES**

### **Dados de Teste**
```sql
-- Inserir dados de teste
INSERT INTO c_status_orcamento (nome, descricao, cor, ordem, ativo) VALUES
('Orçamento Criado', 'Status inicial quando orçamento é criado', '#3B82F6', 1, true),
('Em Análise', 'Orçamento sendo analisado pela equipe', '#F59E0B', 2, true),
('Aguardando Cliente', 'Esperando retorno do cliente', '#EF4444', 3, true),
('Aprovado', 'Orçamento aprovado pelo cliente', '#10B981', 4, true),
('Rejeitado', 'Orçamento rejeitado pelo cliente', '#6B7280', 5, true);
```

### **Checklist de Testes**
- [ ] Listar todos os status ordenados por `ordem`
- [ ] Criar novo status com validações
- [ ] Editar status existente
- [ ] Desativar status (soft delete)
- [ ] Verificar se cores são exibidas corretamente
- [ ] Testar expansão/contração das linhas
- [ ] Validar responsividade mobile
- [ ] Testar integração com módulo de orçamentos

---

## 🔗 **INTEGRAÇÕES NECESSÁRIAS**

### **1. Menu Lateral**
Adicionar item no menu do sistema:
```typescript
{
  label: 'Status de Orçamento',
  href: '/painel/sistema/status-orcamento',
  icon: Target,
  badge: statusCount // opcional
}
```

### **2. Módulo de Orçamentos**
- Usar status na criação de orçamentos
- Mostrar nome do status em vez de ID
- Filtrar orçamentos por status
- Gráficos de distribuição por status

### **3. Relatórios**
- Relatório de orçamentos por status
- Tempo médio em cada status
- Conversão entre status

---

## 📚 **TEMPLATES DE REFERÊNCIA**

### **Usar como Base (já funcionais)**
1. **Setores** - Estrutura similar (nome, descrição, ativo)
2. **Colaboradores** - Tabela com expansão
3. **Lojas** - CRUD completo
4. **Equipe** - Formulário modal

### **Padrões a Seguir**
- Seguir exatamente o `uiux_tabela_modal`
- Usar hooks do sistema existente
- Manter consistência de cores e espaçamento
- Aplicar validações do backend

---

## 🚨 **PONTOS DE ATENÇÃO**

### **Backend**
- Verificar se `services.py` existe no módulo
- Validar se RLS está configurado no Supabase
- Testar se soft delete funciona corretamente

### **Frontend**
- Não criar código mock - usar dados reais
- Seguir exatamente o padrão UI/UX estabelecido
- Testar todas as validações do formulário
- Verificar se cores hex são renderizadas corretamente

### **Integração**
- Status não pode ser excluído se há orçamentos usando
- Ordem dos status deve ser respeitada
- Cores devem ser válidas em formato hex

---

## ✅ **CRITÉRIOS DE ACEITE**

### **Backend**
- [ ] Todos os endpoints funcionando
- [ ] Validações de negócio ativas
- [ ] Tratamento de erros adequado
- [ ] Soft delete funcionando

### **Frontend**
- [ ] Tabela com expansão funcionando
- [ ] CRUD completo através de modais
- [ ] Cores dos status exibidas corretamente
- [ ] Responsividade mobile
- [ ] Validações de formulário

### **Integração**
- [ ] Dados reais do Supabase
- [ ] Zero código mock
- [ ] Tratamento de erros
- [ ] Loading states

---

**🎯 Objetivo:** Ter o módulo Status de Orçamento funcionando 100% integrado com frontend + backend + Supabase, seguindo os padrões estabelecidos do sistema.

**📅 Estimativa:** 1-2 dias de desenvolvimento (considerando que backend está pronto)

**👥 Próximos passos:** Aguardar aprovação do Ricardo para começar implementação.