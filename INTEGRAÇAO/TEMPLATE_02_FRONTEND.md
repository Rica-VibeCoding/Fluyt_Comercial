# 🎨 MISSÃO FRONTEND - MÓDULO [NOME_MODULO]

> **ID:** T02_FRONTEND_[MODULO]  
> **Responsável:** IA Frontend  
> **Status:** 🔲 Aguardando início  
> **Dependências:** Schema aprovado por Ricardo  

## 🎯 OBJETIVO

Implementar a interface frontend completa do módulo [NOME], criando componentes React modernos, hooks personalizados e integração total com a API backend usando dados reais do Supabase.

## 📋 PRÉ-REQUISITOS

### Informações da Descoberta
- **Tabela Supabase:** `c_[nome]` ou `cad_[nome]`
- **Campos obrigatórios:** [listar]
- **Campos opcionais:** [listar]
- **Relacionamentos:** [descrever FKs]
- **Conversões:** camelCase ↔ snake_case

### Módulos de Referência
- **Service:** `/Frontend/src/services/cliente-service.ts`
- **Hook:** `/Frontend/src/hooks/modulos/sistema/use-setores.ts`
- **Componentes:** `/Frontend/src/components/modulos/sistema/`

## 📁 ESTRUTURA DE ARQUIVOS

```bash
Frontend/src/
├── types/[modulo].ts                    # Interfaces TypeScript
├── services/[modulo]-service.ts         # Integração com API
├── hooks/modulos/[modulo]/             # Hooks personalizados
│   └── use-[modulo].ts
├── components/modulos/[modulo]/        # Componentes React
│   ├── [modulo]-form.tsx               # Formulário criar/editar
│   ├── [modulo]-table.tsx              # Tabela com listagem
│   ├── [modulo]-modal.tsx              # Modal de confirmações
│   └── gestao-[modulo].tsx             # Página principal
└── store/[modulo]-store.ts             # Estado Zustand (opcional)
```

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### 1️⃣ TYPES/[MODULO].TS - Interfaces TypeScript

```typescript
/**
 * Tipos e interfaces para o módulo [nome]
 * Baseados na estrutura real do Supabase
 */

// Interface base (campos do Supabase)
export interface [Modulo] {
  id: string;
  nome: string;
  // ... outros campos conforme tabela
  ativo: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Para formulários (sem campos automáticos)
export interface [Modulo]FormData {
  nome: string;
  // ... campos editáveis pelo usuário
}

// Para filtros de busca
export interface Filtros[Modulo] {
  busca?: string;
  ativo?: boolean;
  page?: number;
  limit?: number;
}
```

- [ ] Interface base com todos os campos da tabela
- [ ] Interface para formulários (sem id, timestamps)
- [ ] Interface para filtros de busca
- [ ] Comentários explicando cada campo
- [ ] Tipos opcionais marcados corretamente

### 2️⃣ SERVICES/[MODULO]-SERVICE.TS - Integração com API

```typescript
/**
 * Serviço para integração com API do módulo [nome]
 * Conecta diretamente com endpoints do backend
 */

import { apiClient } from './api-client';
import type { [Modulo], [Modulo]FormData } from '@/types/[modulo]';

export interface [Modulo]ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  source: 'api';
  timestamp: string;
}

export interface [Modulo]ListResponse {
  items: [Modulo][];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

class [Modulo]Service {
  // Listar com filtros
  async listar(filtros?: Filtros[Modulo]): Promise<[Modulo]ServiceResponse<[Modulo]ListResponse>> {
    // Implementar chamada para GET /api/v1/[modulo]
  }

  // Buscar por ID
  async buscarPorId(id: string): Promise<[Modulo]ServiceResponse<[Modulo]>> {
    // Implementar chamada para GET /api/v1/[modulo]/{id}
  }

  // Criar novo
  async criar(dados: [Modulo]FormData): Promise<[Modulo]ServiceResponse<[Modulo]>> {
    // Implementar chamada para POST /api/v1/[modulo]
  }

  // Atualizar existente
  async atualizar(id: string, dados: [Modulo]FormData): Promise<[Modulo]ServiceResponse<[Modulo]>> {
    // Implementar chamada para PUT /api/v1/[modulo]/{id}
  }

  // Excluir (soft delete)
  async excluir(id: string): Promise<[Modulo]ServiceResponse<void>> {
    // Implementar chamada para DELETE /api/v1/[modulo]/{id}
  }
}

export const [modulo]Service = new [Modulo]Service();
```

- [ ] Classe de serviço com métodos CRUD
- [ ] Tratamento de erros específicos
- [ ] Conversão de dados se necessário
- [ ] Tipos de resposta padronizados
- [ ] Logs para debugging
- [ ] **ZERO dados mock** - apenas API real

### 3️⃣ HOOKS/MODULOS/[MODULO]/USE-[MODULO].TS - Hook Personalizado

```typescript
/**
 * Hook personalizado para gerenciar estado do módulo [nome]
 * Conecta componentes com a API de forma reativa
 */

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { [modulo]Service } from '@/services/[modulo]-service';
import type { [Modulo], [Modulo]FormData } from '@/types/[modulo]';

export function use[Modulo]() {
  const [items, setItems] = useState<[Modulo][]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar dados do Supabase
  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const response = await [modulo]Service.listar();
      if (response.success && response.data) {
        setItems(response.data.items);
      } else {
        toast.error(response.error || 'Erro ao carregar dados');
      }
    } catch (error) {
      toast.error('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar novo item
  const criar = useCallback(async (dados: [Modulo]FormData): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await [modulo]Service.criar(dados);
      if (response.success && response.data) {
        setItems(prev => [...prev, response.data!]);
        toast.success('Criado com sucesso!');
        return true;
      } else {
        toast.error(response.error || 'Erro ao criar');
        return false;
      }
    } catch (error) {
      toast.error('Erro de conexão');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Outros métodos: atualizar, excluir, etc.

  // Carregar na montagem
  useEffect(() => {
    carregar();
  }, []);

  return {
    items,
    loading,
    carregar,
    criar,
    // ... outros métodos
  };
}
```

- [ ] Hook com estado reativo
- [ ] Métodos CRUD completos
- [ ] Loading states apropriados
- [ ] Tratamento de erros com toast
- [ ] useEffect para carregamento inicial
- [ ] Callbacks otimizados com useCallback

### 4️⃣ COMPONENTS/MODULOS/[MODULO]/[MODULO]-FORM.TSX - Formulário

```tsx
/**
 * Formulário para criar/editar [nome]
 * Usando React Hook Form + Zod + Shadcn/ui
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { [Modulo], [Modulo]FormData } from '@/types/[modulo]';

// Schema de validação
const [modulo]Schema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  // ... outros campos com validações
});

interface [Modulo]FormProps {
  [modulo]?: [Modulo]; // Para edição
  onSubmit: (dados: [Modulo]FormData) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
}

export function [Modulo]Form({ [modulo], onSubmit, onCancel, loading }: [Modulo]FormProps) {
  const form = useForm<[Modulo]FormData>({
    resolver: zodResolver([modulo]Schema),
    defaultValues: {
      nome: [modulo]?.nome || '',
      // ... outros valores padrão
    },
  });

  const handleSubmit = async (dados: [Modulo]FormData) => {
    const sucesso = await onSubmit(dados);
    if (sucesso) {
      form.reset();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} disabled={loading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Outros campos */}

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : ([modulo] ? 'Atualizar' : 'Criar')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

- [ ] React Hook Form com validação Zod
- [ ] Campos baseados na estrutura da tabela
- [ ] Estados de loading apropriados
- [ ] Validações client-side
- [ ] Design consistente com Shadcn/ui
- [ ] Suporte para criar e editar

### 5️⃣ COMPONENTS/MODULOS/[MODULO]/[MODULO]-TABLE.TSX - Tabela

```tsx
/**
 * Tabela para listagem de [nome]
 * Com filtros, ordenação e ações
 */

'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { [Modulo] } from '@/types/[modulo]';

interface [Modulo]TableProps {
  items: [Modulo][];
  onEdit: (item: [Modulo]) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  loading?: boolean;
}

export function [Modulo]Table({ items, onEdit, onDelete, onToggleStatus, loading }: [Modulo]TableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h3 className="text-lg font-medium mb-2">Nenhum registro encontrado</h3>
        <p className="text-gray-500">Clique em "Novo" para criar o primeiro registro.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.nome}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={item.ativo}
                    onCheckedChange={() => onToggleStatus(item.id)}
                    disabled={loading}
                  />
                  <Badge variant={item.ativo ? "default" : "secondary"}>
                    {item.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                {new Date(item.createdAt).toLocaleDateString('pt-BR')}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(item)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(item.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

- [ ] Tabela responsiva com Shadcn/ui
- [ ] Ações: editar, excluir, toggle status
- [ ] Empty state quando sem dados
- [ ] Loading states
- [ ] Formatação de datas em PT-BR
- [ ] Dropdown menu para ações

### 6️⃣ COMPONENTS/MODULOS/[MODULO]/GESTAO-[MODULO].TSX - Página Principal

```tsx
/**
 * Página principal de gestão de [nome]
 * Integra todos os componentes do módulo
 */

'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { use[Modulo] } from '@/hooks/modulos/[modulo]/use-[modulo]';
import { [Modulo]Form } from './[modulo]-form';
import { [Modulo]Table } from './[modulo]-table';
import type { [Modulo] } from '@/types/[modulo]';

export function Gestao[Modulo]() {
  const { items, loading, criar, atualizar, excluir, alternarStatus } = use[Modulo]();
  const [modalAberto, setModalAberto] = useState(false);
  const [itemEdicao, setItemEdicao] = useState<[Modulo] | undefined>();
  const [itemExclusao, setItemExclusao] = useState<string | undefined>();

  const handleSubmit = async (dados: [Modulo]FormData) => {
    const sucesso = itemEdicao 
      ? await atualizar(itemEdicao.id, dados)
      : await criar(dados);
    
    if (sucesso) {
      setModalAberto(false);
      setItemEdicao(undefined);
    }
    
    return sucesso;
  };

  const handleEdit = (item: [Modulo]) => {
    setItemEdicao(item);
    setModalAberto(true);
  };

  const handleDelete = async () => {
    if (itemExclusao) {
      await excluir(itemExclusao);
      setItemExclusao(undefined);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Gestão de [Nome]</h1>
          <p className="text-gray-600">Gerencie os registros de [nome] do sistema</p>
        </div>
        <Button onClick={() => setModalAberto(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo [Nome]
        </Button>
      </div>

      {/* Tabela */}
      <[Modulo]Table
        items={items}
        onEdit={handleEdit}
        onDelete={setItemExclusao}
        onToggleStatus={alternarStatus}
        loading={loading}
      />

      {/* Modal do formulário */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {itemEdicao ? 'Editar [Nome]' : 'Novo [Nome]'}
            </DialogTitle>
          </DialogHeader>
          <[Modulo]Form
            [modulo]={itemEdicao}
            onSubmit={handleSubmit}
            onCancel={() => {
              setModalAberto(false);
              setItemEdicao(undefined);
            }}
            loading={loading}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de confirmação de exclusão */}
      <AlertDialog open={!!itemExclusao} onOpenChange={() => setItemExclusao(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O registro será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
```

- [ ] Página completa com header
- [ ] Integração com hook personalizado
- [ ] Modal para formulário (criar/editar)
- [ ] Modal de confirmação para exclusão
- [ ] Estados de loading apropriados
- [ ] Layout responsivo

## ⚠️ PONTOS CRÍTICOS

1. **ZERO Mock Data**: Todos os dados devem vir da API real
2. **Conversões**: Implementar camelCase ↔ snake_case se necessário
3. **Validações**: Client-side + server-side
4. **Acessibilidade**: Labels, ARIA, navegação por teclado
5. **Performance**: useCallback, useMemo quando apropriado
6. **Tipos**: TypeScript rigoroso em todos os componentes

## 📊 CRITÉRIOS DE ACEITAÇÃO

- [ ] Todos os componentes criados e funcionando
- [ ] Integração com API backend completa
- [ ] CRUD funcionando com dados reais
- [ ] Validações client-side implementadas
- [ ] UI/UX consistente com design system
- [ ] Responsividade em mobile/desktop
- [ ] Loading states e error handling
- [ ] Código comentado em PT-BR
- [ ] Zero dados mock em produção

## 🚀 ENTREGA

1. **Testar localmente** todos os componentes
2. **Validar integração** com backend rodando
3. **Verificar responsividade** em diferentes telas
4. **Documentar** funcionalidades implementadas
5. **Aguardar aprovação** do Claude Code

---

**LEMBRE-SE:** Use dados reais do Supabase, mantenha consistência visual com outros módulos e implemente todas as funcionalidades CRUD!

