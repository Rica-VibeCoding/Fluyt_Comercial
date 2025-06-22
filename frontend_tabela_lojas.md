# 🔴 FRONTEND - TABELA LOJAS - TAREFAS CRÍTICAS

## ⚠️ RESUMO EXECUTIVO
**NOTA ATUAL: 6/10 - NECESSITA LIMPEZA OBRIGATÓRIA**

O frontend da tabela Lojas tem **PROBLEMAS CRÍTICOS** que violam as diretrizes do empresário. Limpeza obrigatória antes de produção.

---

## 🚨 PROBLEMAS CRÍTICOS IDENTIFICADOS

### ❌ VIOLAÇÃO GRAVE: DADOS MOCK EM PRODUÇÃO
**Arquivo:** `/hooks/modulos/sistema/lojas/mock-data.ts`  
**Problema:** Sistema ainda contém dados falsos  
**Regra violada:** "DADOS REAIS - ZERO MOCK"

### ❌ COMPLEXIDADE DESNECESSÁRIA  
**Problema:** Múltiplos hooks para função simples  
**Impacto:** Dificulta manutenção para empresário

### ❌ CÓDIGO DUPLICADO
**Arquivos:** `use-lojas.ts` vs `use-lojas-refactored.ts`  
**Problema:** Confusão e manutenção duplicada

---

## 📋 TAREFAS OBRIGATÓRIAS (CRÍTICAS)

### TAREFA 1: ELIMINAR DADOS MOCK
**Prioridade:** 🚨 CRÍTICA  
**Status:** ❌ Pendente  
**Prazo:** IMEDIATO

**Descrição:** Remover completamente dados mock do sistema

**Arquivos a DELETAR:**
- ✅ `/hooks/modulos/sistema/lojas/mock-data.ts` - DELETAR ARQUIVO COMPLETO

**Arquivos a alterar:**
- ❌ `/hooks/modulos/sistema/lojas/index.ts` - remover export do mockLojas
- ❌ Qualquer outro arquivo que importe mock-data

**Critério de aceite:**
- ✅ Arquivo mock-data.ts deletado
- ✅ Nenhuma importação de dados mock no projeto
- ✅ Sistema funciona apenas com API real

### TAREFA 2: CONSOLIDAR HOOKS  
**Prioridade:** 🚨 CRÍTICA  
**Status:** ❌ Pendente  
**Prazo:** IMEDIATO

**Descrição:** Eliminar duplicação e simplificar arquitetura

**Ação:**
- ✅ Manter apenas `use-lojas-refactored.ts`
- ✅ Deletar `use-lojas.ts` (é só um re-export)
- ✅ Renomear `use-lojas-refactored.ts` para `use-lojas.ts`

**Arquivos a alterar:**
- ❌ Deletar `/hooks/modulos/sistema/use-lojas.ts`
- ❌ Renomear `use-lojas-refactored.ts` → `use-lojas.ts`
- ❌ Atualizar imports em todos os componentes

**Critério de aceite:**
- ✅ Apenas um hook principal para lojas
- ✅ Nome simples: `use-lojas.ts`
- ✅ Todos os imports funcionando

### TAREFA 3: SIMPLIFICAR ARQUITETURA
**Prioridade:** 🟡 ALTA  
**Status:** ❌ Pendente  

**Descrição:** Reduzir complexidade desnecessária dos hooks especializados

**Avaliar se realmente precisamos de:**
- ❓ `use-loja-validation.ts` - pode ser função simples
- ❓ `use-loja-utils.ts` - pode ser função simples  
- ❓ `use-loja-filters.ts` - pode ser função simples
- ❓ `use-loja-crud.ts` - pode ser integrado no hook principal

**Critério de aceite:**
- ✅ Máximo 2-3 arquivos para lojas
- ✅ Lógica concentrada e simples
- ✅ Fácil para empresário entender

### TAREFA 4: ELIMINAR TIPOS GENÉRICOS
**Prioridade:** 🟡 ALTA  
**Status:** ❌ Pendente

**Descrição:** Substituir `any` por tipos específicos

**Arquivos a alterar:**
- ❌ `/components/modulos/sistema/lojas/gestao-lojas.tsx` - linha 45: `any` → tipo específico
- ❌ `/hooks/modulos/sistema/lojas/use-loja-crud.ts` - substituir `any` nos parâmetros
- ❌ `/services/api-client.ts` - métodos de loja usam `any`

**Critério de aceite:**
- ✅ Zero uso de `any` relacionado a lojas
- ✅ Tipos específicos e corretos
- ✅ TypeScript sem warnings

---

## 📋 TAREFAS DE LIMPEZA (SECUNDÁRIAS)

### TAREFA 5: VERIFICAR CÓDIGO MORTO
**Prioridade:** 🟡 MÉDIA  
**Status:** ❌ Pendente

**Investigar arquivos não utilizados:**
- ❓ Componentes criados mas não importados
- ❓ Funções declaradas mas não chamadas  
- ❓ Importações não utilizadas
- ❓ Código comentado sem explicação

### TAREFA 6: PADRONIZAR COM OUTROS MÓDULOS
**Prioridade:** 🟡 MÉDIA  
**Status:** ❌ Pendente

**Comparar com módulos Cliente e Empresa:**
- ❓ Estrutura de hooks
- ❓ Padrões de nomenclatura
- ❓ Organização de arquivos
- ❓ Tratamento de erros

---

## 🎯 CRITÉRIOS DE APROVAÇÃO

Para o frontend ser aprovado (nota 8+), deve atender:

### ✅ OBRIGATÓRIOS:
- [ ] ZERO dados mock no projeto
- [ ] Máximo 3 arquivos para gestão de lojas  
- [ ] Zero uso de `any` em tipos
- [ ] API real funcionando 100%
- [ ] Código limpo e simples

### ✅ DESEJÁVEIS:
- [ ] Padrão consistente com outros módulos
- [ ] Zero código morto
- [ ] Documentação clara
- [ ] Testes funcionando

---

## ⚠️ ORIENTAÇÕES PARA EQUIPE

### 🔒 NÃO FAZER:
- ❌ NÃO criar novos hooks complexos
- ❌ NÃO adicionar dependências desnecessárias
- ❌ NÃO usar paliativos ou gambiarras
- ❌ NÃO complicar o que é simples

### ✅ FOCAR EM:
- ✅ Código definitivo e limpo
- ✅ Simplicidade para empresário manter
- ✅ Padrões estabelecidos no projeto
- ✅ Funcionalidade sem firulas

---

## 📊 CRONOGRAMA SUGERIDO

**Dia 1:** Tarefas 1 e 2 (eliminar mock + consolidar hooks)  
**Dia 2:** Tarefa 3 (simplificar arquitetura)  
**Dia 3:** Tarefa 4 (eliminar tipos any)  
**Dia 4:** Tarefas 5 e 6 (limpeza + padronização)  
**Dia 5:** Testes e validação final

---

**Última atualização:** 2024-12-22  
**Responsável:** Engenheiro Sênior Auditor (Conservador)  
**Status geral:** 🔴 CRÍTICO - LIMPEZA OBRIGATÓRIA  
**Próxima revisão:** Após conclusão das tarefas críticas