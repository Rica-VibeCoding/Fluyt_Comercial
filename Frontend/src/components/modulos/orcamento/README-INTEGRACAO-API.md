# 📊 INTEGRAÇÃO FRONTEND ↔ BACKEND - ORÇAMENTOS

## ✅ **IMPLEMENTADO NA ETAPA 3**

### **Services Criados:**
- `orcamento-service.ts` - Comunicação com API
- `use-orcamento-api.ts` - Hook para API
- `use-orcamento-integrado.ts` - Hook que combina store + API

### **Endpoints Configurados:**
- `/api/v1/orcamentos` - CRUD de orçamentos
- `/api/v1/formas-pagamento` - CRUD de formas de pagamento
- `/api/v1/status-orcamento` - Listagem de status

## 🎯 **COMO USAR**

### **1. Hook Simples (apenas API):**
```tsx
import { useOrcamentoApi } from '@/hooks/data/use-orcamento-api';

const MeuComponente = () => {
  const { listarOrcamentos, criarOrcamento, loading, error } = useOrcamentoApi();
  
  const handleCriar = async () => {
    const orcamento = await criarOrcamento({
      cliente_id: 'uuid-cliente',
      loja_id: 'uuid-loja', 
      vendedor_id: 'uuid-vendedor',
      valor_ambientes: 15000,
      valor_final: 13500
    });
  };
};
```

### **2. Hook Integrado (store + API):**
```tsx
import { useOrcamentoIntegrado } from '@/hooks/data/use-orcamento-integrado';

const MeuComponente = () => {
  const orcamento = useOrcamentoIntegrado();
  
  const handleSalvar = async () => {
    // Usa dados do store + salva na API
    const resultado = await orcamento.salvarOrcamentoCompleto();
  };
  
  const handleCarregar = async (id: string) => {
    // Carrega da API + popula store
    await orcamento.carregarOrcamento(id);
  };
};
```

### **3. Service Direto:**
```tsx
import { orcamentoService } from '@/services/orcamento-service';

const criarOrcamento = async () => {
  const response = await orcamentoService.criarOrcamento({
    cliente_id: 'uuid',
    // ... outros dados
  });
  
  if (response.success) {
    console.log('Orçamento criado:', response.data);
  }
};
```

## 📋 **EXEMPLO COMPLETO**

Veja `exemplo-integracao-api.tsx` para um exemplo completo.

## 🔧 **CONFIGURAÇÕES**

### **Endpoints (config.ts):**
```typescript
ENDPOINTS: {
  ORCAMENTOS: '/api/v1/orcamentos',
  STATUS_ORCAMENTO: '/api/v1/status-orcamento', 
  FORMAS_PAGAMENTO: '/api/v1/formas-pagamento'
}
```

### **API Client:**
- Autenticação automática via JWT
- Retry automático para tokens expirados
- Logs detalhados em desenvolvimento

## ⚡ **FEATURES**

### **✅ Implementado:**
- CRUD completo de orçamentos
- CRUD de formas de pagamento
- Listagem de status
- Conversão automática de dados (snake_case ↔ camelCase)
- Tratamento de erros
- Loading states
- Validações de negócio

### **🔄 Integração com Store:**
- Mantém cálculos no frontend (velocidade)
- Sincroniza com backend quando necessário
- Carregamento/salvamento transparente

## 🚀 **PRÓXIMOS PASSOS**

1. **Usar hook integrado** nos componentes de orçamento
2. **Adicionar botão "Salvar"** na interface
3. **Listar orçamentos existentes** em nova página
4. **Implementar edição** de orçamentos salvos

## 🎯 **VALIDAÇÕES**

- Backend valida se desconto > 30% (marca para aprovação)
- Frontend valida soma de formas de pagamento ≤ valor total
- Conversão automática de tipos (Decimal ↔ Number)

**ETAPA 3 CONCLUÍDA - Sistema totalmente integrado!** 🚀