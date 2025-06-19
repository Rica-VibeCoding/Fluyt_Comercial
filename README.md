# 🏢 Sistema Fluyt - Gestão Comercial

> **Projeto Principal**: Simulador Financeiro de Orçamentos empresarial em Next.js 15

## 🎯 Contexto Essencial

**Sistema unificado** consolidando 4 aplicações React separadas em uma plataforma Next.js modular com interface em português para gestão comercial empresarial.

## 🛠 Stack Core

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS** + **Shadcn/ui** (Radix UI primitives)
- **TanStack Query** + **React Hook Form** + **Zod**
- **Interface**: 100% português brasileiro

## 📁 Estrutura Modular

```
src/
├── app/                        # 🎯 Next.js App Router
│   ├── layout.tsx              # Layout global da aplicação
│   ├── page.tsx                # Página inicial (redirect)
│   ├── not-found.tsx           # Página 404 personalizada
│   └── painel/                 # Painel administrativo
│       ├── layout.tsx          # Layout do painel com sidebar
│       ├── page.tsx            # Dashboard principal
│       ├── orcamento/          # 💰 ATIVO - Módulo Orçamentos
│       │   ├── page.tsx        # Lista de orçamentos
│       │   └── simulador/      # Simulador financeiro
│       ├── clientes/           # 👥 Módulo Clientes
│       ├── ambientes/          # 🏢 Módulo Ambientes
│       ├── contratos/          # 📋 Módulo Contratos
│       └── sistema/            # ⚙️ Configurações do Sistema
│
├── components/                 # 🧩 Componentes Reutilizáveis
│   ├── layout/                 # Componentes de layout
│   │   ├── sidebar.tsx         # Navegação lateral principal
│   │   └── progress-stepper.tsx # Stepper de progresso
│   ├── modulos/                # Componentes específicos por módulo
│   │   ├── orcamento/          # Componentes do simulador
│   │   ├── clientes/           # Componentes de clientes
│   │   ├── ambientes/          # Componentes de ambientes
│   │   └── contratos/          # Componentes de contratos
│   ├── comum/                  # Componentes comuns entre módulos
│   ├── formularios/            # Componentes de formulários
│   └── ui/                     # 🎨 Design System (Shadcn/ui)
│       ├── button.tsx          # Componentes primitivos
│       ├── form.tsx            # Sistema de formulários
│       ├── chart.tsx           # Componentes de gráficos
│       └── [50+ componentes]   # Biblioteca UI completa
│
├── hooks/                      # 🎣 Hooks Customizados
│   ├── globais/                # Hooks globais da aplicação
│   └── modulos/                # Hooks específicos por módulo
│       ├── orcamento/          # use-simulador.ts (CORE)
│       ├── clientes/           # Hooks de clientes
│       ├── ambientes/          # Hooks de ambientes
│       └── contratos/          # Hooks de contratos
│
├── types/                      # 📝 Tipagens TypeScript
│   ├── simulador.ts            # Tipos do simulador financeiro
│   ├── cliente.ts              # Tipos de clientes
│   ├── ambiente.ts             # Tipos de ambientes
│   └── contrato.ts             # Tipos de contratos
│
├── lib/                        # 🛠 Utilitários e Configurações
│   ├── utils.ts                # Utilitários gerais (cn, etc.)
│   ├── dados/                  # Dados estáticos e mocks
│   ├── tipos/                  # Tipos auxiliares
│   └── validacoes/             # Esquemas Zod de validação
│
├── migracao/                   # 📦 Códigos Originais (Temporário)
│   ├── fluyt-cliente-manager-main/
│   ├── contrato-main/
│   └── uiux/
│
└── index.css                   # Estilos globais Tailwind
```

## 🏗 Organização Modular Detalhada

### 📐 Padrão de Arquitetura Modular
O projeto segue uma **arquitetura modular consistente** onde cada módulo de negócio (Orçamentos, Clientes, Ambientes, Contratos) possui sua própria estrutura organizacional:

```
📁 [MÓDULO]/
├── 🎯 app/painel/[modulo]/     # Rotas e páginas do módulo
├── 🧩 components/modulos/[modulo]/ # Componentes específicos
├── 🎣 hooks/modulos/[modulo]/   # Lógica de negócio
└── 📝 types/[modulo].ts        # Tipagens TypeScript
```

### 🎨 Design System Centralizado
- **50+ componentes UI** baseados em **Radix UI** + **Tailwind CSS**
- **Componentes primitivos**: Button, Form, Input, Card, Dialog, etc.
- **Componentes compostos**: Chart, Calendar, DataTable, Navigation
- **Sistema de temas**: Suporte a modo claro/escuro
- **Acessibilidade nativa**: ARIA, navegação por teclado

### 🎣 Hooks Customizados
- **Hooks globais**: Autenticação, tema, notificações
- **Hooks modulares**: Lógica específica de cada módulo
- **Padrão consistente**: `use[ModuloFuncionalidade]`
- **Tipagem completa**: TypeScript em todos os hooks

### 📝 Sistema de Tipagens
- **Tipagem modular**: Um arquivo por módulo de negócio
- **Interfaces consistentes**: Padrões de nomenclatura em português
- **Validação integrada**: Esquemas Zod para runtime validation
- **Type safety**: 100% TypeScript sem `any`

## 🧮 Módulo Principal: Simulador de Orçamentos

### Componentes Críticos
- `src/app/painel/orcamento/simulador/page.tsx` - Página principal (423 linhas)
- `src/hooks/modulos/orcamento/use-simulador.ts` - Lógica core (477 linhas)
- `src/components/modulos/orcamento/dashboard-orcamento.tsx` - Interface principal

### Funcionalidades Ativas
- **4 Formas de Pagamento**: ENTRADA, FINANCEIRA, CARTÃO, BOLETO
- **Cálculos Financeiros**: Valor presente, juros compostos, deflação
- **Sistema de Travamento**: Locks em valores específicos
- **Redistribuição Inteligente**: Algoritmo com prioridades
- **Interface Editável**: Click-to-edit nos valores principais

### Algoritmos Principais
```typescript
// Prioridade para redistribuição
const PRIORIDADE_FORMAS = ['ENTRADA', 'BOLETO', 'FINANCEIRA', 'CARTAO'];

// Cálculos por tipo de pagamento
- FINANCEIRA: VP = valor / (1 + taxa)^parcelas
- CARTAO: VR = valor * (1 - deflação) * (1 - juros * parcelas)
- BOLETO: VP = valor / (1 + custoCapital)^parcelas
```

## 📊 Status dos Módulos

| Módulo | Status | Descrição |
|--------|--------|-----------|
| 💰 Orçamentos | ✅ **ATIVO** | Simulador completo e funcional |
| 👥 Clientes | 🟡 Estrutura | Páginas básicas criadas |
| 🏢 Ambientes | 🟡 Estrutura | Páginas básicas criadas |
| 📋 Contratos | 🟡 Estrutura | Páginas básicas criadas |
| ⚙️ Sistema | 🟡 Estrutura | Páginas básicas criadas |

## 🎨 Convenções Importantes

### Nomenclatura
- **Arquivos**: `kebab-case` em português
- **Componentes**: `PascalCase` em português  
- **Hooks**: `camelCase` com prefixo `use`
- **URLs**: `/painel/modulo/funcionalidade`

### Padrões de Código
- **Hooks customizados** para lógica de negócio
- **Tipagem TypeScript** obrigatória
- **Formatação brasileira** (moeda R$, datas, números)
- **Responsividade** desktop-first

## 🔧 Contexto de Migração

### Origem
- **4 sistemas React separados** sendo consolidados
- **Pasta `src/migracao/`** contém códigos originais preservados:
  - `fluyt-cliente-manager-main/` - Sistema original de clientes  
  - `contrato-main/` - Sistema original de contratos
  - `uiux/` - Componentes e designs originais
- **Migração arquitetural**: React Router → Next.js App Router

### Foco Atual
- **Simulador de orçamentos** é o módulo prioritário e funcional
- **Demais módulos** têm estrutura básica preparada
- **Interface unificada** com sidebar de navegação

## 🚀 Para Desenvolvimento

### Arquivos Chave para Modificações
- `src/app/painel/orcamento/simulador/page.tsx` - Interface principal do simulador
- `src/hooks/modulos/orcamento/use-simulador.ts` - Lógica de negócio principal (477 linhas)
- `src/components/layout/sidebar.tsx` - Navegação lateral do painel
- `src/components/modulos/orcamento/` - Componentes específicos do simulador
- `src/types/simulador.ts` - Tipagens do módulo de orçamentos
- `src/components/ui/` - Design system com 50+ componentes
- `src/lib/utils.ts` - Utilitários gerais (Tailwind merge, etc.)

### Scripts Disponíveis
```bash
npm run dev    # Desenvolvimento
npm run build  # Build produção  
npm run start  # Produção local
```

---
**Objetivo**: Sistema empresarial de gestão comercial com foco em simulação financeira de propostas. Interface profissional em português brasileiro.
