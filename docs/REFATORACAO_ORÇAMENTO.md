# 🔄 REFATORAÇÃO ORÇAMENTO: Código Limpo + Arquitetura

## 🎯 **Contexto**
**DUAS EQUIPES SIMULTÂNEAS:**
- **Equipe A**: Migração `sessaoSimples → Zustand` (dados)
- **Equipe B**: Refatoração de código limpo (estrutura) ← **ESTE DOCUMENTO**

---

## 📊 **Status Atual - EQUIPE B (Refatoração Estrutural)**

### ✅ **ETAPA 1 - CONCLUÍDA** 
**Data:** 📅 Hoje  
**Duração:** ⏱️ 30 minutos  
**Risco:** ❌ Zero - Apenas imports otimizados

#### **Realizado:**
- ✅ **Extraídos utilitários** de formatação e validação
- ✅ **Eliminada duplicação** de funções `formatarMoeda`, `parseValorMoeda`
- ✅ **Adicionados imports** de `/lib/formatters.ts` e `/lib/validators.ts`
- ✅ **4 modais atualizados** para usar funções compartilhadas
- ✅ **Build testado** - sem erros

#### **Arquivos Modificados:**
```typescript
// Imports adicionados em:
- modal-a-vista.tsx
- modal-boleto.tsx  
- modal-cartao.tsx
- modal-financeira.tsx

// Usando agora:
import { formatarMoeda, parseValorMoeda } from '@/lib/formatters';
import { validarValorDisponivel } from '@/lib/validators';
```

---

## 🛠️ **ETAPAS PLANEJADAS - EQUIPE B**

### 📋 **ETAPA 2 - Centralizar Configurações** 
**Status:** ⏳ Em progresso  
**Risco:** 🟢 Baixo - Apenas constantes  
**Duração:** ⏱️ ~20 minutos

#### **Objetivo:**
Eliminar valores hardcoded (taxas, limites) criando arquivo de configuração

#### **Plano:**
1. 🔄 Criar `/src/lib/pagamento-config.ts`
2. 🔄 Centralizar todas as configurações hardcoded
3. 🔄 Atualizar modais para usar configurações
4. 🔄 Testar funcionamento

---

### 📋 **ETAPA 3 - Extrair Cálculos**
**Status:** 📅 Próxima  
**Risco:** 🟡 Médio - Lógica matemática  
**Duração:** ⏱️ ~45 minutos

#### **Objetivo:**
Extrair cálculos complexos (valor presente, descontos) para utilitários

---

### 📋 **ETAPA 4 - Hook Customizado**
**Status:** 📅 Aguardando  
**Risco:** 🟡 Médio - Lógica compartilhada  
**Duração:** ⏱️ ~60 minutos

#### **Objetivo:**
Criar `useModalPagamento` para lógica comum dos modais

---

### 📋 **ETAPA 5 - Componente Base Modal**
**Status:** 📅 Aguardando  
**Risco:** 🟡 Médio - Reestruturação UI  
**Duração:** ⏱️ ~75 minutos

#### **Objetivo:**
Criar `ModalPagamentoBase` para layout padrão

---

### 📋 **ETAPA 6 - Refatorar Modais**
**Status:** 📅 Aguardando  
**Risco:** 🟠 Alto - Mudança estrutural  
**Duração:** ⏱️ ~90 minutos

#### **Objetivo:**
Aplicar todos os utilitários nos modais (reduzir de 300+ → ~100 linhas)

---

### 📋 **ETAPA 7 - Consolidar Gerenciamento**
**Status:** 📅 Aguardando  
**Risco:** 🟠 Alto - Eliminar duplicação  
**Duração:** ⏱️ ~60 minutos

#### **Objetivo:**
Resolver duplicação entre `orcamento-modals.tsx` e `modal-formas-pagamento.tsx`

---

### 📋 **ETAPA 8 - Quebrar page.tsx**
**Status:** 📅 Aguardando  
**Risco:** 🔴 Alto - Componente monolítico  
**Duração:** ⏱️ ~120 minutos

#### **Objetivo:**
Reduzir `page.tsx` de 532 → ~150 linhas

---

### 📋 **ETAPA 9 - Alinhamento Final**
**Status:** 📅 Final  
**Risco:** 🟡 Médio - Coordenação entre equipes  
**Duração:** ⏱️ ~180 minutos

#### **Objetivo:**
Alinhar com Equipe A (migrar para sessaoSimples único)

---

## 🎯 **Benefícios Esperados - EQUIPE B**

### ✅ **Imediatos:**
- 🧹 Código 60-70% mais limpo
- 🔄 Manutenibilidade drasticamente melhorada
- 🐛 Menos bugs por duplicação

### 🎯 **Médio Prazo:**
- 🧪 Testabilidade melhorada
- 🚀 Performance (menos código)
- 🔧 Flexibilidade para novos tipos de pagamento

---

## 📝 **Log de Mudanças - EQUIPE B**

### 📅 **Hoje - Etapa 1**
- ✅ **Iniciada** extração de utilitários
- ✅ **Atualizados imports** em 4 modais
- ✅ **Eliminada duplicação** de formatação e validação
- ✅ **Build testado** - sem erros
- ✅ **ETAPA 1 CONCLUÍDA**

### 📅 **Hoje - Etapa 2**
- ✅ **Criado** `/src/lib/pagamento-config.ts` centralizado
- ✅ **Substituídos valores** hardcoded por configurações
- ✅ **Atualizados 4 modais** para usar configurações centralizadas
- ✅ **Build testado** - sem erros
- ✅ **ETAPA 2 CONCLUÍDA**

### 📅 **Agora - Etapa 3**
- 🔄 **Em progresso** - Extraindo cálculos matemáticos complexos

---

## 🤝 **Coordenação Entre Equipes**

### 🔄 **Equipe A (Dados):**
- Migração `sessaoSimples → Zustand`
- Foco em gerenciamento de estado
- Preparação para Supabase

### 🧹 **Equipe B (Estrutura):**
- Limpeza e organização de código
- Eliminação de duplicações
- Melhoria de arquitetura

### 🎯 **Ponto de Convergência:**
- **ETAPA 9**: Alinhar ambas as equipes para solução final unificada