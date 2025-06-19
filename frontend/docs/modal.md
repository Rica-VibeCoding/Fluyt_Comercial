# 📋 Padrões de Modal - Fluyt Comercial Frontend

> **Documentação oficial** para implementação de modais no projeto seguindo princípios de **design produtivo** e **interface limpa**.

## 🎯 Filosofia de Design

### Princípios Fundamentais
- **Produtividade sobre Decoração**: Foco na velocidade de preenchimento
- **Interface Limpa**: Sem elementos visuais desnecessários
- **Compacidade Inteligente**: Espaço proporcional ao conteúdo
- **Consistência Visual**: Padrões uniformes em todo o sistema
- **Simplicidade**: Apenas o essencial para funcionamento

### Inspiração
Baseado nas melhores práticas do **GitHub/Primer Design System** com foco em interfaces produtivas e limpas.

---

## 📐 Especificações Técnicas

### Dimensões Padrão
```tsx
// Modal Principal
className="max-w-lg max-h-[85vh] flex flex-col bg-white dark:bg-slate-900"

// Para conteúdo simples (1-2 formulários)
max-w-lg max-h-[85vh]

// Para conteúdo complexo (3+ formulários)  
max-w-2xl h-[70vh]

// Para conteúdo mínimo (confirmações)
max-w-md h-auto
```

### Cores e Bordas
```tsx
// Background
bg-white dark:bg-slate-900

// Bordas
border-slate-200 dark:border-slate-700

// Inputs (mais visíveis)
border-slate-300 focus:border-slate-400
```

---

## 🏗️ Estrutura Obrigatória

### 1. Header Limpo
```tsx
<DialogHeader className="border-b border-slate-200 dark:border-slate-700 p-2 pb-1">
  <DialogTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
    {titulo}
  </DialogTitle>
</DialogHeader>
```

**❌ Não Use:**
- Ícones decorativos
- Progress bars desnecessárias
- Gradientes no background
- Títulos com `text-2xl`
- Textos explicativos redundantes

### 2. Navegação por Abas (quando aplicável)
```tsx
<div className="px-2 py-1 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
  <Tabs value={abaAtiva} onValueChange={handleTabChange}>
    <TabsList className="grid w-full grid-cols-3 h-auto p-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <TabsTrigger 
        value={tab.id} 
        className="flex items-center justify-center h-8 px-2 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900"
      >
        <span className="font-medium text-xs">{tab.label}</span>
      </TabsTrigger>
    </TabsList>
  </Tabs>
</div>
```

**❌ Evite:**
- Ícones nas abas
- Textos descritivos nas abas ("Dados básicos do cliente")
- Abas com altura excessiva (`h-12+`)
- Layout vertical desnecessário

### 3. Conteúdo Principal
```tsx
<div className="flex-1 overflow-y-auto">
  <TabsContent value="aba" className="h-full p-2 mt-0">
    <div className="h-full">
      {/* Formulário */}
    </div>
  </TabsContent>
</div>
```

### 4. Footer de Ações
```tsx
<div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 pt-1">
  <div className="flex justify-end items-center gap-1">
    <button 
      type="button"
      className="px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors rounded border border-slate-200"
    >
      Cancelar
    </button>
    <button 
      type="submit"
      className="px-4 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium border border-slate-900"
    >
      Salvar
    </button>
  </div>
</div>
```

**❌ Não Use:**
- Texto "Campos obrigatórios marcados com *"
- Botões com gradientes
- Alinhamento `justify-between`
- Ícones nos botões

---

## 📝 Formulários Internos

### Espaçamento Ultra-Compacto
```tsx
// Container principal
<div className="space-y-1">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-1">

// Campos individuais
<FormItem>
  <FormLabel className="text-xs font-medium text-slate-700">Label *</FormLabel>
  <FormControl>
    <Input 
      className="h-8 text-sm border-slate-300 focus:border-slate-400"
      placeholder="Placeholder"
    />
  </FormControl>
  <FormMessage />
</FormItem>
```

### Tipografia Funcional
```tsx
// Labels
className="text-xs font-medium text-slate-700"

// Inputs
className="h-8 text-sm border-slate-300 focus:border-slate-400"

// Selects
className="h-8 text-sm border-slate-300 focus:border-slate-400"

// Textareas
className="min-h-[60px] text-sm border-slate-300 focus:border-slate-400"

// Descriptions (usar apenas se ESSENCIAL)
className="text-xs text-slate-500"
```

---

## ✅ Checklist de Implementação

### Antes de Criar um Modal

- [ ] **Dimensão apropriada**: Conteúdo cabe em `max-w-lg max-h-[85vh]`?
- [ ] **Necessidade real**: Modal é a melhor solução vs. página dedicada?
- [ ] **Estrutura limpa**: Header + Conteúdo + Footer sem elementos extras?

### Durante o Desenvolvimento

- [ ] **Header**: Título `text-sm`, padding `p-2 pb-1`, SEM ícones
- [ ] **Abas**: Altura `h-8`, sem ícones, sem textos descritivos
- [ ] **Formulários**: Espaçamento `space-y-1` e `gap-1`
- [ ] **Campos**: Altura `h-8`, bordas `border-slate-300`
- [ ] **Footer**: Alinhamento direita, botões pequenos `text-xs`
- [ ] **Limpeza**: Sem textos explicativos desnecessários

### Após Implementação

- [ ] **Teste visual**: Modal proporcional e limpo?
- [ ] **Navegação**: Tab/Enter funciona corretamente?
- [ ] **Responsivo**: Funciona em telas pequenas?
- [ ] **Performance**: Carregamento rápido?
- [ ] **Simplicidade**: Apenas elementos essenciais?

---

## 🎨 Variações por Tipo

### Modal de Formulário (Padrão)
```tsx
// Exemplo: Cadastro de Cliente
max-w-lg max-h-[85vh] + formulários compactos
```

### Modal de Confirmação
```tsx
// Exemplo: Deletar item
max-w-md h-auto + texto + 2 botões
```

### Modal de Visualização
```tsx
// Exemplo: Detalhes do pedido
max-w-2xl h-[70vh] + dados readonly
```

### Modal de Seleção
```tsx
// Exemplo: Escolher produto
max-w-lg max-h-[85vh] + lista + busca
```

---

## 🚫 Anti-Padrões (Não Fazer)

### Visual
- ❌ Ícones decorativos no header
- ❌ Ícones nas abas ou botões
- ❌ Progress bars decorativas
- ❌ Gradientes no background
- ❌ Shadows excessivos (`shadow-2xl`)
- ❌ Textos explicativos sob campos
- ❌ Descriptions desnecessárias

### Espaçamento
- ❌ `space-y-4` ou maiores
- ❌ `gap-4` entre campos
- ❌ `p-6` em containers
- ❌ Altura de campos `h-10+`

### Comportamento
- ❌ Modais que abrem outros modais
- ❌ Scroll horizontal
- ❌ Campos obrigatórios sem validação
- ❌ Botões sem estados de loading
- ❌ Textos explicativos redundantes

---

## 📱 Responsividade

### Mobile First
```tsx
// Grid responsivo
className="grid grid-cols-1 md:grid-cols-2 gap-1"

// Largura adaptável
className="max-w-lg"  // Desktop
className="mx-2"      // Mobile (adicionar quando necessário)
```

### Breakpoints
- **xs-sm**: Stack vertical, padding reduzido
- **md+**: Grid 2 colunas, layout completo
- **lg+**: Espaçamento normal

---

## 🔧 Implementação Técnica

### Overlay Otimizado (ATUALIZADO JAN/2025)
**IMPORTANTE**: O overlay foi otimizado para intensidade única em modais aninhados:
```tsx
// CONFIGURAÇÃO ATUAL (components/ui/dialog.tsx):
// bg-black/50 (50% opacidade) - não acumula em modais sobrepostos
// EVITA: bg-black/80 que causa escurecimento excessivo (160%) 

// Resultado: Todos os modais mantêm mesma intensidade visual
// independente da profundidade (modal sobre modal)
```

### Imports Obrigatórios
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Form } from '../../ui/form';
```

### Estrutura Base
```tsx
export function MeuModal({ aberto, onFechar, dados, onSalvar }: Props) {
  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col bg-white dark:bg-slate-900">
        {/* Header */}
        {/* Navegação (se aplicável) */}
        {/* Conteúdo */}
        {/* Footer */}
      </DialogContent>
    </Dialog>
  );
}
```

---

## 📋 Template Completo

```tsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Form } from '../../ui/form';

interface SeuModalProps {
  aberto: boolean;
  onFechar: () => void;
  onSalvar: (dados: any) => Promise<void>;
  isLoading: boolean;
}

export function SeuModal({ aberto, onFechar, onSalvar, isLoading }: SeuModalProps) {
  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col bg-white dark:bg-slate-900">
        <DialogHeader className="border-b border-slate-200 dark:border-slate-700 p-2 pb-1">
          <DialogTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Título do Modal
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Form>
            <form className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto p-2">
                <div className="space-y-1">
                  {/* Seus campos aqui */}
                  <div>
                    <label className="text-xs font-medium text-slate-700">Campo *</label>
                    <input 
                      className="h-8 text-sm border-slate-300 focus:border-slate-400 w-full rounded px-2"
                      placeholder="Digite aqui"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 pt-1">
                <div className="flex justify-end items-center gap-1">
                  <button 
                    type="button" 
                    onClick={onFechar}
                    className="px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                    disabled={isLoading}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium border border-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 🎯 Diretrizes de Interface Limpa

### O que MANTER
- Labels essenciais dos campos
- Placeholders informativos
- Validações necessárias
- Estados de loading
- Funcionalidade completa

### O que REMOVER
- Ícones decorativos
- Textos explicativos sob campos
- Descriptions redundantes
- Elementos visuais desnecessários
- Progress bars decorativas

### Foco na Eficiência
- Usuário experiente não precisa de explicações
- Interface limpa = menos distrações
- Campos autoexplicativos pelos labels
- Velocidade de preenchimento prioritária

---

## 🎯 Próximos Passos

1. **Auditoria**: Revisar todos os modais existentes
2. **Limpeza**: Remover ícones e textos desnecessários
3. **Refatoração**: Aplicar estes padrões limpos
4. **Componentes**: Criar base components minimalistas
5. **Testes**: Validar UX com usuários experientes

---

---

## 🆕 **ATUALIZAÇÕES E MELHORIAS**

### Janeiro 2025 - Overlay Otimizado
- **Problema resolvido**: Modais aninhados causavam escurecimento excessivo (160%)
- **Solução implementada**: Overlay único com 50% de opacidade
- **Benefício**: UX consistente independente da profundidade dos modais
- **Arquivo alterado**: `src/components/ui/dialog.tsx` (bg-black/80 → bg-black/50)

### Padrão da Indústria
- **Gmail, Slack, Figma**: Todos usam intensidade única de overlay
- **50-60% opacidade**: Sweet spot para foco sem escurecimento excessivo
- **Accessibility**: Mantém contraste adequado e conforto visual

---

*📅 Última atualização: Janeiro 2025*  
*👤 Padrões baseados na implementação limpa e produtiva*  
*🔧 Overlay otimizado para modais aninhados*
