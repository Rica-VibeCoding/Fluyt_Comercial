# BASELINE FUNCIONAL - ANTES DA MIGRAÇÃO

## DATA BACKUP: 2025-07-04

## ESTADO ATUAL FUNCIONANDO:

### ✅ FUNCIONAM COM useSessaoSimples:
- **Página Orçamentos**: `/painel/orcamento/page.tsx`
- **Página Contratos**: `/painel/contratos/visualizar/page.tsx`
- **Contract Summary**: `contract-summary.tsx`

### ⚠️ FUNCIONAM COM Zustand (PARA MIGRAR):
- **Página Ambientes**: via `use-ambientes-sessao.ts`
- **Validações Contratos**: `contract-validations.ts`
- **Botão Novo Fluxo**: `botao-novo-fluxo.tsx`
- **Action Bar**: `action-bar.tsx`

### 🔴 PROBLEMA IDENTIFICADO:
**Navegação ambientes → orçamentos FALHA** porque:
- Ambientes salva dados no **Zustand store**
- Orçamentos lê dados do **localStorage (sessaoSimples)**
- **Resultado**: Ambientes desaparecem, valor total = 0

### 📊 ARQUIVOS BACKUPEADOS:
1. `sessao-store.ts` - Core Zustand
2. `use-ambientes-sessao.ts` - Hook crítico ambientes
3. `sessao-bridge.ts` - Bridge atual
4. `botao-novo-fluxo.tsx` - Gestão fluxos
5. `contract-validations.ts` - Validações contratos
6. `action-bar.tsx` - Botão finalizar contrato
7. `validation-alerts.tsx` - Alertas validação
8. `debug-persistencia.tsx` - Debug desenvolvimento
9. `cliente-selector-universal.tsx` - Seletor universal

### 🎯 OBJETIVO DA MIGRAÇÃO:
**Unificar tudo em useSessaoSimples** para que navegação ambientes → orçamentos funcione perfeitamente.

### 🛡️ PLANO DE ROLLBACK:
1. `git checkout main` (volta ao estado anterior)
2. Ou restaurar arquivos desta pasta backup
3. Branch `migracao-sessao-simples` preserva todo progresso

### ⚠️ PONTOS DE ATENÇÃO:
- **NÃO QUEBRAR** funcionalidades que já funcionam
- **MANTER** compatibilidade com contratos
- **TESTAR** navegação após cada mudança
- **ROLLBACK** imediato se algo falhar