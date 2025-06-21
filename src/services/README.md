# Sistema de Integração Frontend ↔ Backend

## 🎯 Visão Geral

Este sistema implementa uma **integração transparente** entre o frontend Next.js e o backend FastAPI, com **fallback automático** para mocks em caso de indisponibilidade da API.

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Componentes   │───▶│   use-clientes   │───▶│ cliente-service │
│   (UI Layer)    │    │   -api.ts        │    │   (Strategy)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                                          ┌──────────────┼──────────────┐
                                          ▼              ▼              ▼
                                   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
                                   │ api-client  │ │    Mock     │ │   Cache     │
                                   │ (FastAPI)   │ │ (LocalStore)│ │ (Strategy)  │
                                   └─────────────┘ └─────────────┘ └─────────────┘
```

## 📁 Estrutura de Arquivos

### **Core Services**
- `api-client.ts` - Cliente HTTP para comunicação com FastAPI
- `cliente-service.ts` - Estratégia de fallback API ↔ Mock
- `index.ts` - Exports centralizados

### **Hooks Integrados**  
- `use-clientes-api.ts` - Hook principal com integração transparente

### **Debug & Testing**
- `components/debug/teste-integracao-clientes.tsx` - Ferramentas de desenvolvimento

## 🔧 Configuração

### **Variáveis de Ambiente**

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_USE_REAL_API=true  # false = forçar mock
```

### **Feature Flags (config.ts)**

```typescript
FEATURES: {
  USE_REAL_API: true,          // Usar API real
  MOCK_FALLBACK: true,         // Fallback para mock
  DEBUG_API: true,             // Logs detalhados
}
```

## 🚀 Como Usar

### **1. Básico - Hook nos Componentes**

```tsx
import { useClientesApi } from '@/hooks/modulos/clientes/use-clientes-api';

function MeuComponente() {
  const { 
    clientes, 
    adicionarCliente, 
    ultimaFonte // 'api' | 'mock'
  } = useClientesApi();
  
  // O hook é transparente - componente não sabe se está usando API ou mock
}
```

### **2. Avançado - Serviço Direto**

```typescript
import { clienteService } from '@/services/cliente-service';

// Lista com fallback automático
const response = await clienteService.listarClientes();
console.log(response.source); // 'api' ou 'mock'

// Forçar mock para testes
clienteService.forcarUsoDeMock(true);
```

### **3. Debug - Ferramentas de Desenvolvimento**

O componente `TesteIntegracaoClientes` aparece automaticamente em modo de desenvolvimento na página de clientes e oferece:

- ✅ **Status de conectividade** em tempo real
- 🧪 **Testes diretos** de API e service
- 🔧 **Controles** para forçar mock/API
- 📊 **Logs detalhados** de execução

## 🔄 Estratégia de Fallback

### **Fluxo Automático**

1. **Tentativa API**: Primeiro, tenta conectar com o backend
2. **Cache de Conectividade**: Reutiliza resultado por 30 segundos
3. **Fallback Mock**: Se API falha, usa dados locais automaticamente
4. **Feedback Visual**: Badge indica fonte dos dados ('API' ou 'Local')

### **Vantagens**

- ✅ **Zero quebra de UX** - usuário não percebe falhas
- ✅ **Desenvolvimento offline** - funciona sem backend rodando  
- ✅ **Transição suave** - switch automático entre modos
- ✅ **Debug facilitado** - logs e controles visuais

## 📊 Monitoramento

### **Indicadores Visuais**

- 🟢 **Badge "Conectado (API)"** - Backend funcionando
- 🔴 **Badge "Offline (Local)"** - Usando dados locais
- 🔄 **Loading States** - Operações em andamento

### **Console Logs (Desenvolvimento)**

```bash
🚀 ApiClient carregado e configurado
📡 Base URL: http://localhost:8000
🔀 Estratégia: API-first com fallback automático para mock
✅ Conectividade: Backend disponível
📊 Clientes carregados: 5 items via api
```

## 🐛 Debugging

### **Problemas Comuns**

1. **Backend não inicia**
   - ✅ Resultado: Fallback automático para mock
   - 🔧 Debug: Badge mostra "Offline (Local)"

2. **CORS bloqueando requests**
   - ✅ Resultado: Fallback automático para mock
   - 🔧 Debug: Console mostra erro CORS + fallback

3. **Dados inconsistentes**
   - 🔧 Debug: Use `TesteIntegracaoClientes` para verificar fonte
   - 🔧 Debug: Forçar mock/API para isolar problema

### **Comandos de Debug**

```typescript
// Via DevTools Console
clienteService.obterStatusConectividade()
clienteService.forcarUsoDeMock(true)
clienteService.limparCacheConectividade()
```

## 🔮 Próximos Passos

### **FASE 2: Expansão**
- [ ] Autenticação JWT integrada
- [ ] Outros módulos (ambientes, orçamentos)
- [ ] Sincronização em tempo real

### **FASE 3: Otimização**  
- [ ] Cache inteligente com TTL
- [ ] Retry automático com backoff
- [ ] Offline-first com sincronização

### **FASE 4: Produção**
- [ ] Error tracking integrado
- [ ] Métricas de performance
- [ ] Health check dashboard

## 📝 Notas Técnicas

- **Compatibilidade**: Tipos alinhados com schemas Pydantic do backend
- **Performance**: Cache de conectividade evita testes repetitivos
- **Segurança**: Headers de autenticação automáticos
- **Manutenibilidade**: Logs estruturados e debug visual