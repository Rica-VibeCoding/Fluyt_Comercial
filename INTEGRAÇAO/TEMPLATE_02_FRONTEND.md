# 🎨 MISSÃO FRONTEND - MÓDULO [NOME_MODULO]

> **ID:** T02_FRONTEND_[MODULO]  
> **Responsável:** IA Frontend  
> **Status:** 🔒 Bloqueado (aguarda Backend)  
> **Dependências:** Backend funcionando com API  

## 🎯 OBJETIVO

Implementar a interface completa do módulo [NOME], removendo TODOS os dados mockados e conectando com a API real do backend, garantindo uma experiência de usuário consistente e profissional.

## 📋 PRÉ-REQUISITOS

### Informações do Backend (já implementado)
- **Endpoint base:** `/api/v1/[modulo]`
- **Campos da API:**
  - Response: `{ id, nome, campo2, ativo, created_at, updated_at }`
  - Create: `{ nome, campo2, campo3? }`
  - Update: `{ nome?, campo2?, ativo? }`

### Conversão de Dados
| Backend (snake_case) | Frontend (camelCase) |
|---------------------|---------------------|
| `nome_completo` | `nomeCompleto` |
| `created_at` | `createdAt` |
| `updated_at` | `updatedAt` |

### Módulo de Referência
- **Usar como base:** `/Frontend/src/components/modulos/lojas/`
- **Copiar estrutura de componentes**
- **Manter padrões visuais**

## 📁 ESTRUTURA DE ARQUIVOS

```bash
Frontend/src/
├── types/
│   └── [modulo].ts                    # Interfaces TypeScript
├── hooks/modulos/[modulo]/
│   └── use-[modulo].ts               # Hook principal
├── services/
│   └── [modulo]-service.ts          # Chamadas API
├── store/
│   └── [modulo]-store.ts            # Estado Zustand
└── components/modulos/[modulo]/
    ├── index.ts                      # Exports
    ├── [modulo]-page.tsx            # Página principal
    ├── [modulo]-tabela.tsx          # Lista/tabela
    ├── [modulo]-modal.tsx           # Criar/editar
    ├── [modulo]-filtros.tsx         # Filtros de busca
    └── [modulo]-actions.tsx         # Ações (botões)
```

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### 1️⃣ TYPES - Interfaces TypeScript

```typescript
// types/[modulo].ts
export interface [Modulo] {
  id: string;
  nome: string;
  campo2: string;
  campo3?: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface [Modulo]FormData {
  nome: string;
  campo2: string;
  campo3?: string;
}

export interface [Modulo]Filters {
  busca?: string;
  ativo?: boolean;
  page?: number;
  limit?: number;
}
```

### 2️⃣ SERVICE - Integração com API

```typescript
// services/[modulo]-service.ts
import { apiClient } from '@/lib/api-client';

export const [modulo]Service = {
  // Listar com filtros
  async listar(filters?: [Modulo]Filters) {
    const response = await apiClient.get('/[modulo]', { params: filters });
    return response.data;
  },

  // Buscar por ID
  async buscarPorId(id: string) {
    const response = await apiClient.get(`/[modulo]/${id}`);
    return response.data;
  },

  // Criar novo
  async criar(data: [Modulo]FormData) {
    const response = await apiClient.post('/[modulo]', data);
    return response.data;
  },

  // Atualizar
  async atualizar(id: string, data: Partial<[Modulo]FormData>) {
    const response = await apiClient.put(`/[modulo]/${id}`, data);
    return response.data;
  },

  // Excluir
  async excluir(id: string) {
    const response = await apiClient.delete(`/[modulo]/${id}`);
    return response.data;
  }
};
```

### 3️⃣ STORE - Gerenciamento de Estado

```typescript
// store/[modulo]-store.ts
import { create } from 'zustand';

interface [Modulo]State {
  [modulos]: [Modulo][];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetch[Modulos]: (filters?: [Modulo]Filters) => Promise<void>;
  criar[Modulo]: (data: [Modulo]FormData) => Promise<void>;
  atualizar[Modulo]: (id: string, data: Partial<[Modulo]FormData>) => Promise<void>;
  excluir[Modulo]: (id: string) => Promise<void>;
}
```

### 4️⃣ HOOK PRINCIPAL

```typescript
// hooks/modulos/[modulo]/use-[modulo].ts
export function use[Modulos]() {
  const { [modulos], loading, error, fetch[Modulos] } = use[Modulo]Store();
  
  useEffect(() => {
    fetch[Modulos]();
  }, []);

  return { [modulos], loading, error, refetch: fetch[Modulos] };
}
```

### 5️⃣ COMPONENTES UI

#### Página Principal
- [ ] Layout com header e ações
- [ ] Integração com hook de dados
- [ ] Estados de loading/empty/error
- [ ] Breadcrumbs de navegação

#### Tabela/Lista
- [ ] Columns definidas com tipos corretos
- [ ] Ações por linha (editar/excluir)
- [ ] Paginação funcionando
- [ ] Ordenação se aplicável
- [ ] Seleção múltipla se necessário

#### Modal de Formulário
- [ ] Validação com react-hook-form + zod
- [ ] Modo criar e editar
- [ ] Loading durante submissão
- [ ] Feedback de sucesso/erro
- [ ] Fechar após sucesso

#### Filtros
- [ ] Campo de busca com debounce
- [ ] Filtro por status (ativo/inativo)
- [ ] Filtros adicionais específicos
- [ ] Botão limpar filtros
- [ ] Persistir em URL se necessário

## 🚨 REMOÇÃO DE MOCKS - CRÍTICO!

### Buscar e Remover
```bash
# Encontrar todos os mocks
grep -r "mock" Frontend/src/components/modulos/[modulo]/
grep -r "Mock" Frontend/src/components/modulos/[modulo]/
grep -r "MOCK" Frontend/src/components/modulos/[modulo]/
grep -r "exemplo" Frontend/src/components/modulos/[modulo]/
```

### Exemplos do que Remover
```typescript
// ❌ REMOVER TUDO ISSO:
const mockData = [
  { id: 1, nome: 'Teste' },
  { id: 2, nome: 'Exemplo' }
];

const MOCK_[MODULOS] = [...];

// Dados hardcoded
const items = [
  { id: 'abc', nome: 'Vendas' }
];

// ✅ SUBSTITUIR POR:
const { [modulos], loading, error } = use[Modulos]();
```

## 🎨 UI/UX CONSISTENTE

### Componentes Obrigatórios
- [ ] Usar componentes do Shadcn/ui
- [ ] Botões com variantes corretas
- [ ] Cards para agrupamento
- [ ] Skeleton durante loading
- [ ] Empty state com ilustração
- [ ] Mensagens de erro claras

### Padrões Visuais
```typescript
// Botão principal
<Button>
  <Plus className="w-4 h-4 mr-2" />
  Novo [Módulo]
</Button>

// Tabela com ações
<Table>
  <TableHeader>...</TableHeader>
  <TableBody>
    {loading ? (
      <SkeletonTable />
    ) : items.length === 0 ? (
      <EmptyState />
    ) : (
      items.map(item => <TableRow key={item.id}>...</TableRow>)
    )}
  </TableBody>
</Table>
```

### Responsividade
- [ ] Mobile: Cards empilhados
- [ ] Tablet: Layout adaptado
- [ ] Desktop: Tabela completa
- [ ] Testar em diferentes tamanhos

## 🔄 INTEGRAÇÃO E SINCRONIZAÇÃO

### Estado Global
- [ ] Store Zustand atualizada após ações
- [ ] Cache invalidado quando necessário
- [ ] Loading states coordenados
- [ ] Otimistic updates se aplicável

### Feedback Visual
```typescript
// Sucesso
toast({
  title: "[Módulo] criado com sucesso",
  description: "O registro foi adicionado ao sistema",
});

// Erro
toast({
  title: "Erro ao criar [módulo]",
  description: error.message,
  variant: "destructive",
});
```

## 🧪 TESTES MANUAIS OBRIGATÓRIOS

### Fluxo Completo
1. [ ] Acessar página do módulo
2. [ ] Ver lista carregando do backend
3. [ ] Criar novo registro
4. [ ] Editar registro existente
5. [ ] Excluir com confirmação
6. [ ] Filtrar e buscar
7. [ ] Paginar resultados

### Casos de Erro
- [ ] API fora do ar
- [ ] Token expirado
- [ ] Dados inválidos
- [ ] Sem permissão
- [ ] Conflito (duplicado)

### Performance
- [ ] Carregamento < 1s
- [ ] Debounce na busca
- [ ] Sem re-renders desnecessários
- [ ] Bundle size adequado

## 📊 CRITÉRIOS DE ACEITAÇÃO

- [ ] ZERO dados mockados
- [ ] Todos os componentes criados
- [ ] Integração com API funcionando
- [ ] CRUD completo operacional
- [ ] UI/UX consistente com sistema
- [ ] Responsivo em todos devices
- [ ] Sem erros no console
- [ ] Performance adequada

## 🚀 ENTREGA

1. **Limpar todos os mocks** verificados
2. **Testar fluxo completo** manualmente
3. **Validar com diferentes perfis** de usuário
4. **Notificar conclusão** para revisão
5. **Demonstrar funcionando** com dados reais

## ⚠️ PONTOS DE ATENÇÃO

1. **Conversão de Dados**: snake_case ↔ camelCase automática
2. **Timezone**: Datas em UTC, mostrar em local
3. **Validação**: Client-side + server-side
4. **Cache**: Invalidar após mutações
5. **Acessibilidade**: Labels, ARIA, keyboard nav

---

**IMPORTANTE:** O frontend DEVE estar 100% conectado com a API real. Qualquer dado mockado será considerado falha na entrega!