**Perfeito!** Vou detalhar tudo para o Claude Code implementar em fases testáveis.

---

## **BRIEFING COMPLETO PARA CLAUDE CODE**

### **CONTEXTO:**
Sistema de orçamento financeiro com calculadora de deflação já implementada. Precisa adicionar **redistribuição automática** quando usuário altera valores de formas de pagamento ou parâmetros de desconto.

### **ESTRUTURA ATUAL:**
```typescript
// Já existe e está funcionando:
- src/lib/calculadora-negociacao.ts (calculadora principal)
- src/types/orcamento.ts (interfaces)
- Componentes base em src/components/modulos/orcamento/
- Sistema de travamento (lock/unlock) já implementado
```

### **FUNCIONALIDADE ALVO:**
Quando usuário alterar:
1. **Desconto Real** → redistribui automaticamente
2. **Valor Negociado** → redistribui automaticamente  
3. **Qualquer Forma de Pagamento** → redistribui diferença nas outras formas

---

## **FASES DE IMPLEMENTAÇÃO**

### **🚀 FASE 1: Hook Base de Redistribuição**
**Objetivo:** Criar hook que detecta mudanças e redistribui automaticamente

**Deliverables:**
```typescript
// src/hooks/use-redistribuicao-automatica.ts
export function useRedistribuicaoAutomatica(
  valorTotal: number,
  formasPagamentoIniciais: FormaPagamento[]
) {
  // Estado com proteção anti-loop
  // Handler para mudança em forma específica
  // Algoritmo de redistribuição proporcional
  // Validações básicas
  
  return {
    formasPagamento,
    handleFormaPagamentoChange,
    isCalculating,
    validacoes
  };
}
```

**Teste da Fase 1:**
- Alterar valor de uma forma → verificar se outras se ajustam automaticamente
- Travar uma forma → verificar se redistribuição respeita travamento
- Testar com valores extremos (zeros, negativos)

### **🔧 FASE 2: Integração com Desconto Real**
**Objetivo:** Conectar mudanças de desconto real com redistribuição

**Deliverables:**
```typescript
// Extensão do hook da Fase 1
const handleDescontoRealChange = (novoDesconto: number) => {
  // Algoritmo iterativo para encontrar valor negociado adequado
  // Redistribuição baseada no novo valor negociado
  // Atualização automática das formas
};
```

**Teste da Fase 2:**
- Alterar desconto real → verificar se valor negociado se ajusta
- Verificar se formas se redistribuem corretamente
- Testar convergência do algoritmo iterativo

### **⚡ FASE 3: Debounce e Performance**
**Objetivo:** Otimizar para evitar cálculos excessivos

**Deliverables:**
```typescript
// Debounce de 500ms em todas as mudanças
// Loading states durante cálculo
// Prevenção de loops infinitos
// Cache de cálculos quando possível
```

**Teste da Fase 3:**
- Digitar valores rapidamente → verificar se não trava
- Verificar se loading aparece durante cálculos longos
- Testar que não há loops infinitos

### **🎨 FASE 4: Feedback Visual**
**Objetivo:** Mostrar mudanças em tempo real para o usuário

**Deliverables:**
```typescript
// Highlight temporário em campos alterados
// Indicação visual de diferenças
// Estados de loading
// Mensagens de validação inline
```

**Teste da Fase 4:**
- Verificar highlights aparecem nas mudanças
- Testar que loading states são claros
- Validar que erros são mostrados corretamente

### **🔄 FASE 5: Sistema de Undo**
**Objetivo:** Permitir desfazer mudanças complexas

**Deliverables:**
```typescript
// Histórico de estados
// Botão "Desfazer última alteração"
// Snapshot antes de redistribuições grandes
// Ctrl+Z support
```

**Teste da Fase 5:**
- Fazer várias mudanças → desfazer → verificar estado correto
- Testar undo após redistribuição automática
- Verificar que histórico não cresce indefinidamente

---

## **ESPECIFICAÇÕES TÉCNICAS DETALHADAS**

### **Algoritmo de Redistribuição:**
```typescript
const redistribuirDiferenca = (
  diferenca: number, 
  formasAbertas: FormaPagamento[]
) => {
  // Se só 1 forma aberta → recebe tudo
  if (formasAbertas.length === 1) {
    return aplicarDiferencaCompleta(diferenca, formasAbertas[0]);
  }
  
  // Se múltiplas → distribui proporcionalmente
  const somaAtual = formasAbertas.reduce((sum, f) => sum + f.valor, 0);
  
  return formasAbertas.map(forma => {
    const proporcao = somaAtual > 0 ? forma.valor / somaAtual : 1 / formasAbertas.length;
    const valorAdicional = diferenca * proporcao;
    return {
      ...forma,
      valor: Math.max(0, forma.valor + valorAdicional)
    };
  });
};
```

### **Integração com Sistema Existente:**
```typescript
// Usar calculadora existente:
import { CalculadoraNegociacao } from '@/lib/calculadora-negociacao';

// Manter compatibilidade com:
- Sistema de travamento (FormaPagamento.travada)
- Cálculo de valor presente (deflação)
- Validações existentes
- Tipos existentes em src/types/orcamento.ts
```

### **Configurações:**
```typescript
const CONFIG_REDISTRIBUICAO = {
  debounceMs: 500,
  maxTentativasIterativas: 20,
  toleranciaConvergencia: 10, // R$ 0,10
  highlightDurationMs: 2000
};
```

---

## **CRITÉRIOS DE ACEITAÇÃO POR FASE**

**Fase 1 ✅ Quando:**
- Alterar qualquer forma redistribui automaticamente nas outras
- Formas travadas não são alteradas
- Soma total sempre bate com valor negociado

**Fase 2 ✅ Quando:**
- Alterar desconto real recalcula valor negociado
- Redistribuição funciona após mudança de desconto
- Algoritmo converge em < 20 iterações

**Fase 3 ✅ Quando:**
- Digitação rápida não causa travamentos
- Loading states aparecem em cálculos > 200ms
- Sem loops infinitos em nenhum cenário

**Fase 4 ✅ Quando:**
- Mudanças têm feedback visual claro
- Estados de erro são informativos
- UX é fluida e responsiva

**Fase 5 ✅ Quando:**
- Undo funciona perfeitamente
- Histórico é limitado e eficiente
- Usuário pode reverter qualquer mudança

---

## **ARQUIVOS PARA MODIFICAR/CRIAR**

### **Criar:**
- `src/hooks/use-redistribuicao-automatica.ts`
- `src/utils/algoritmos-redistribuicao.ts`
- `src/components/ui/campo-monetario-automatico.tsx`

### **Modificar:**
- Componentes existentes em `src/components/modulos/orcamento/`
- Integração nos formulários principais
- Testes unitários

---

**Claude Code, implemente fase por fase, confirmando que cada uma está funcionando antes de prosseguir para a próxima. Comece pela Fase 1 e me avise quando estiver pronto para testar!**