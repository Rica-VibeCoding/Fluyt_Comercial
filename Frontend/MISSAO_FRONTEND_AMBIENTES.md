# 🎯 MISSÃO: AJUSTAR FRONTEND DO MÓDULO AMBIENTES

**Data:** 2025-01-29  
**Gerente:** Claude Code  
**Desenvolvedor:** IA Frontend  
**Prazo:** 4-5 horas  

## 📋 CONTEXTO

O módulo de Ambientes no Frontend já existe parcialmente, mas precisa ser ajustado para a nova estrutura do backend. As tabelas foram refatoradas e agora temos:

- **c_ambientes**: Dados principais do ambiente
- **c_ambientes_material**: Detalhes dos materiais em JSONB

## 🎯 OBJETIVOS

1. **Ajustar interfaces TypeScript** para nova estrutura
2. **Remover TODOS os dados mockados**
3. **Integrar com a API real** do backend
4. **Manter UI/UX existente** (se estiver boa)

## 📐 ESTRUTURA ATUAL vs NOVA

### **Estrutura Antiga (Frontend)**
```typescript
interface Ambiente {
  id: string;
  nome: string;
  acabamentos: Acabamento[]; // Array direto
  valorTotal: number;
  clienteId?: string;
  criadoEm?: string;
  importadoEm?: string;
  origem?: 'manual' | 'xml';
}
```

### **Nova Estrutura (Backend)**
```typescript
interface Ambiente {
  id: string;
  nome: string;
  clienteId: string; // Agora obrigatório
  valorCustoFabrica: number;
  valorVenda: number;
  dataImportacao?: string;
  horaImportacao?: string;
  origem: 'manual' | 'xml';
  createdAt: string;
  updatedAt: string;
  materiais?: any; // JSONB opcional - VEJA EXPLICAÇÃO DETALHADA ABAIXO!
}
```

### **🔴 IMPORTANTE: COMO FUNCIONAM AS DUAS TABELAS**

**O Frontend precisa entender que:**

1. **c_ambientes** → Contém dados básicos do ambiente
2. **c_ambientes_material** → Contém detalhes em JSON

**MAS O BACKEND FAZ A MÁGICA!** Quando você pedir:
```typescript
// SEM materiais - retorna só c_ambientes
GET /api/v1/ambientes/123

// COM materiais - retorna c_ambientes + c_ambientes_material juntos
GET /api/v1/ambientes/123?include=materiais
```

**Resposta SEM materiais:**
```json
{
  "id": "123",
  "nome": "Cozinha Moderna",
  "clienteId": "456",
  "valorCustoFabrica": 5000.00,
  "valorVenda": 10000.00,
  "origem": "xml"
}
```

**Resposta COM materiais:**
```json
{
  "id": "123",
  "nome": "Cozinha Moderna",
  "clienteId": "456",
  "valorCustoFabrica": 5000.00,
  "valorVenda": 10000.00,
  "origem": "xml",
  "materiais": {
    "componentes": [
      {
        "tipo": "Porta",
        "material": "MDF",
        "cor": "Branco",
        "espessura": 18,
        "quantidade": 4
      },
      {
        "tipo": "Gaveta",
        "material": "MDF",
        "cor": "Branco",
        "espessura": 15,
        "quantidade": 6
      }
    ],
    "ferragens": [...],
    "acabamentos": [...]
  }
}
```

**O FRONTEND NÃO PRECISA SE PREOCUPAR COM 2 TABELAS!**
- Para CRIAR: Envie tudo junto
- Para LER: Use `?include=materiais` se quiser os detalhes
- Para ATUALIZAR: Endpoints separados (ambiente básico vs materiais)

## 🔧 TAREFAS ESPECÍFICAS

### **1. Atualizar Types (`/src/types/ambiente.ts`)**

```typescript
// Nova estrutura
export interface Ambiente {
  id: string;
  nome: string;
  clienteId: string;
  valorCustoFabrica: number;
  valorVenda: number;
  dataImportacao?: string;
  horaImportacao?: string;
  origem: 'manual' | 'xml';
  createdAt?: string;
  updatedAt?: string;
  materiais?: AmbienteMaterial;
}

export interface AmbienteMaterial {
  id: string;
  ambienteId: string;
  materiaisJson: any; // Objeto JSON flexível
  xmlHash?: string;
}

export interface AmbienteFormData {
  nome: string;
  clienteId: string;
  valorCustoFabrica: number;
  valorVenda: number;
  origem: 'manual' | 'xml';
}

export interface AmbienteFiltros {
  clienteId?: string;
  origem?: 'manual' | 'xml';
  nome?: string;
  dataInicio?: string;
  dataFim?: string;
}
```

### **2. Criar Service (`/src/services/ambiente-service.ts`)**

```typescript
import { apiClient } from '@/lib/api-client';

export const ambienteService = {
  // Listar ambientes com filtros
  listar(filtros?: AmbienteFiltros) {
    return apiClient.get('/ambientes', { params: filtros });
  },

  // Obter ambiente por ID (com materiais opcionalmente)
  obterPorId(id: string, incluirMateriais = false) {
    return apiClient.get(`/ambientes/${id}`, {
      params: { include: incluirMateriais ? 'materiais' : undefined }
    });
  },

  // Criar ambiente
  criar(dados: AmbienteFormData) {
    return apiClient.post('/ambientes', dados);
  },

  // Atualizar ambiente
  atualizar(id: string, dados: Partial<AmbienteFormData>) {
    return apiClient.put(`/ambientes/${id}`, dados);
  },

  // Deletar ambiente
  deletar(id: string) {
    return apiClient.delete(`/ambientes/${id}`);
  },

  // Materiais
  obterMateriais(ambienteId: string) {
    return apiClient.get(`/ambientes/${ambienteId}/materiais`);
  },

  salvarMateriais(ambienteId: string, materiais: any) {
    return apiClient.post(`/ambientes/${ambienteId}/materiais`, { materiaisJson: materiais });
  }
};
```

### **3. Criar Hook (`/src/hooks/modulos/ambientes/use-ambientes.ts`)**

Atualizar o hook existente para usar o service real:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ambienteService } from '@/services/ambiente-service';
import { toast } from '@/hooks/use-toast';

export function useAmbientes(filtros?: AmbienteFiltros) {
  return useQuery({
    queryKey: ['ambientes', filtros],
    queryFn: () => ambienteService.listar(filtros)
  });
}

export function useAmbiente(id: string, incluirMateriais = false) {
  return useQuery({
    queryKey: ['ambiente', id, incluirMateriais],
    queryFn: () => ambienteService.obterPorId(id, incluirMateriais),
    enabled: !!id
  });
}

export function useCriarAmbiente() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ambienteService.criar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ambientes'] });
      toast({ title: 'Ambiente criado com sucesso!' });
    },
    onError: (error) => {
      toast({ 
        title: 'Erro ao criar ambiente',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
}

// Similar para atualizar, deletar, etc...
```

### **4. Atualizar Store (`/src/store/ambientes-store.ts`)**

Remover lógica de mock e integrar com API:

```typescript
// Simplificar a store para trabalhar com dados reais
export const useAmbientesStore = create<AmbientesState>()(
  devtools(
    (set, get) => ({
      // Estado
      ambienteSelecionado: null,
      filtros: {},
      
      // Ações
      selecionarAmbiente: (ambiente) => set({ ambienteSelecionado: ambiente }),
      setFiltros: (filtros) => set({ filtros }),
      
      // Remover toda lógica de dados locais
      // Os dados virão do useQuery
    })
  )
);
```

### **5. Atualizar Componentes**

#### **AmbientePage (`/src/components/modulos/ambientes/ambiente-page.tsx`)**
- Usar `useAmbientes()` hook
- Remover dados mockados
- Adicionar loading e error states

#### **AmbienteModal (`/src/components/modulos/ambientes/ambiente-modal.tsx`)**
- Ajustar formulário para novos campos
- Separar valor_custo_fabrica e valor_venda
- Adicionar seletor de cliente (obrigatório)

#### **AmbienteCard (`/src/components/modulos/ambientes/ambiente-card.tsx`)**
- Mostrar novos campos
- Formatar valores corretamente
- Indicar origem (XML/Manual)

### **6. Integração com Extrator XML**

O módulo extrator XML em `/backend/modules/ambientes/extrator_xml/` precisa ser integrado:

1. Criar botão "Importar XML" na página de ambientes
2. Upload do arquivo XML
3. Processar e criar ambientes automaticamente
4. Mostrar progresso da importação

### **7. ESTRUTURA DOS MATERIAIS JSON (EXEMPLOS PRÁTICOS)**

**Exemplo de ambiente SEM materiais (criação manual):**
```typescript
const novoAmbiente = {
  nome: "Sala de Estar",
  clienteId: "uuid-do-cliente",
  valorCustoFabrica: 3000,
  valorVenda: 6000,
  origem: "manual"
  // NÃO envia materiais - fica vazio
};
```

**Exemplo de ambiente COM materiais (importado do XML):**
```typescript
const ambienteComMateriais = {
  nome: "Cozinha Completa",
  clienteId: "uuid-do-cliente",
  valorCustoFabrica: 8500,
  valorVenda: 17000,
  origem: "xml",
  materiais: {
    // Este JSON vem do extrator XML
    componentes: [
      { tipo: "Porta", qtd: 12, material: "MDF", cor: "Branco" },
      { tipo: "Gaveta", qtd: 8, material: "MDF", cor: "Branco" }
    ],
    medidas: {
      largura: 3200,
      altura: 2400,
      profundidade: 600
    },
    observacoes: "Cozinha em L com ilha central"
  }
};
```

**IMPORTANTE PARA O FRONTEND:**
- O campo `materiais` é FLEXÍVEL (any/JSONB)
- Pode ter qualquer estrutura que vier do XML
- Não precisa validar a estrutura interna
- Apenas exibir de forma organizada na UI

## ⚠️ PONTOS DE ATENÇÃO

1. **Cliente obrigatório**: Todo ambiente DEVE ter um cliente
2. **Dois valores**: `valorCustoFabrica` e `valorVenda` são separados
3. **Materiais em JSON**: Não é mais array de acabamentos
4. **Conversão de nomes**: Backend retorna snake_case, converter para camelCase
5. **Remover mocks**: TODOS os dados falsos devem ser removidos

## 🧪 VALIDAÇÃO

Testar:
1. ✅ Listar ambientes com filtros
2. ✅ Criar novo ambiente (com cliente)
3. ✅ Editar ambiente existente
4. ✅ Deletar ambiente
5. ✅ Visualizar/editar materiais
6. ✅ Importar XML (se implementado)
7. ✅ Loading states funcionando
8. ✅ Tratamento de erros

## 📝 ENTREGÁVEIS

1. **Types atualizados** com nova estrutura
2. **Service completo** para API
3. **Hooks com React Query**
4. **Componentes sem mocks**
5. **Store simplificada**
6. **UI/UX mantida** (ou melhorada)

## 🚀 ORDEM DE IMPLEMENTAÇÃO

1. Atualizar types primeiro
2. Criar service de API
3. Implementar hooks
4. Ajustar store
5. Atualizar componentes
6. Testar integração
7. Remover todo código mock

**IMPORTANTE**: Manter a UI existente se estiver boa. Focar na integração com backend real!