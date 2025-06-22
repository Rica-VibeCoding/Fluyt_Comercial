# 🏢 Sistema Fluyt - Gestão Comercial

> **Projeto Principal**: Sistema de Gestão Comercial Full-Stack em Next.js + FastAPI

## 🎯 Contexto Essencial

**Sistema unificado** de gestão comercial empresarial com arquitetura full-stack, interface em português e fluxo operacional completo para móveis planejados.

## 🛠 Stack Core

- **Next.js 14.2** (App Router) + **React 18.3** + **TypeScript**
- **Tailwind CSS** + **Shadcn/ui** (Radix UI primitives)
- **TanStack Query** + **React Hook Form** + **Zod** + **Zustand**
- **Backend**: FastAPI + Python + Supabase
- **Interface**: 100% português brasileiro

## 🏗 Arquitetura Full-Stack

### Frontend (Next.js)
- Interface em React + TypeScript
- Gerenciamento de estado com Zustand
- Comunicação via React Query

### Backend (FastAPI + Python)
- API RESTful modular
- Autenticação JWT
- Integração com Supabase

### Banco de Dados (Supabase/PostgreSQL)
- Row Level Security (RLS)
- Soft delete implementado
- Índices otimizados

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
│       ├── orcamento/          # 💰 Módulo Orçamentos
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
│       ├── orcamento/          # use-modal-pagamento.ts
│       ├── clientes/           # use-clientes-api.ts
│       ├── ambientes/          # Hooks de ambientes
│       └── contratos/          # Hooks de contratos
│
├── types/                      # 📝 Tipagens TypeScript
│   ├── orcamento.ts            # Tipos do sistema de orçamentos
│   ├── cliente.ts              # Tipos de clientes
│   ├── ambiente.ts             # Tipos de ambientes
│   └── contrato.ts             # Tipos de contratos
│
├── lib/                        # 🛠 Utilitários e Configurações
│   ├── utils.ts                # Utilitários gerais (cn, etc.)
│   ├── supabase.ts             # Configuração Supabase
│   ├── api-client.ts           # Cliente HTTP
│   └── validators.ts           # Esquemas Zod de validação
│
├── store/                      # 🗃️ Zustand Stores
│   ├── clientes-store.ts       # Store de clientes
│   ├── orcamento-store.ts      # Store de orçamentos
│   └── sessao-store.ts         # Store de sessão
│
├── services/                   # 🔌 Serviços de API
│   ├── api-client.ts           # Cliente HTTP base
│   └── cliente-service.ts      # Serviços de clientes
│
├── context/                    # ⚡ React Contexts
├── middleware.ts               # 🛡️ Middleware Next.js
└── index.css                   # 🎨 Estilos globais Tailwind
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

### 🎣 Hooks Principais
- `hooks/modulos/clientes/use-clientes-api.ts` - API de clientes
- `hooks/modulos/orcamento/use-modal-pagamento.ts` - Modal de pagamento
- `hooks/globais/use-cliente-selecionado.ts` - Cliente global
- `hooks/data/use-orcamento.ts` - Dados de orçamento

### 📝 Sistema de Tipagens
- **Tipagem modular**: Um arquivo por módulo de negócio
- **Interfaces consistentes**: Padrões de nomenclatura em português
- **Validação integrada**: Esquemas Zod para runtime validation
- **Type safety**: 100% TypeScript sem `any`

## 📈 Fluxo Operacional

### Processo Implementado
1. **Autenticação** - Login via Supabase Auth ✅
2. **Cliente** - CRUD completo funcionando ✅
3. **Ambientes** - Em desenvolvimento 🔄
4. **Orçamento** - Interface básica 🔄
5. **Contrato** - Estrutura preparada 🔄

### ProgressStepper
Sistema de navegação visual que guia o usuário através do fluxo comercial: **Cliente → Ambientes → Orçamento → Contrato**.

## 📊 Status dos Módulos

| Módulo | Status | Descrição |
|--------|--------|-----------|
| 👥 Clientes | ✅ **COMPLETO** | CRUD funcional + backend integrado |
| 💰 Orçamentos | 🟡 Em desenvolvimento | Interface parcial, hooks básicos |
| 🏢 Ambientes | 🟡 Estrutura | Páginas básicas criadas |
| 📋 Contratos | 🟡 Estrutura | Páginas básicas criadas |
| ⚙️ Sistema | 🟡 Estrutura | Páginas básicas criadas |

## 🔧 Backend FastAPI

### Estrutura Modular
```
backend/
├── main.py                     # Aplicação principal
├── core/                       # Configurações centrais
│   ├── config.py              # Configurações do sistema
│   ├── database.py            # Conexão Supabase
│   ├── auth.py                # Middleware de autenticação
│   └── exceptions.py          # Exceções customizadas
└── modules/                    # Módulos de negócio
    ├── auth/                  # Autenticação e autorização
    ├── clientes/              # CRUD de clientes ✅
    └── status_orcamento/      # Gestão de status ✅
```

### Padrão de Desenvolvimento
Cada módulo segue a estrutura:
- **`controller.py`** - Endpoints REST
- **`services.py`** - Lógica de negócio
- **`repository.py`** - Acesso ao banco
- **`schemas.py`** - Validação Pydantic

### Sistema de Autenticação
- **JWT tokens** com refresh automático
- **Hierarquia de perfis**: SUPER_ADMIN, ADMIN, GERENTE, VENDEDOR
- **RLS (Row Level Security)** no Supabase
- **Middleware** de autenticação no backend

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

## 🚀 Para Desenvolvimento

### Arquivos Chave para Modificações
- `src/app/painel/clientes/page.tsx` - Interface de clientes (funcional)
- `src/hooks/modulos/orcamento/use-modal-pagamento.ts` - Hook de pagamento (247 linhas)
- `src/components/layout/sidebar.tsx` - Navegação lateral do painel
- `src/components/modulos/clientes/` - Componentes de clientes (completos)
- `src/types/cliente.ts` - Tipagens do módulo de clientes
- `src/components/ui/` - Design system com 50+ componentes
- `src/lib/utils.ts` - Utilitários gerais (Tailwind merge, etc.)
- `backend/modules/clientes/` - Backend completo de clientes

### Scripts Disponíveis
```bash
# Frontend
npm run dev    # Desenvolvimento
npm run build  # Build produção  
npm run start  # Produção local

# Backend
python main.py # Servidor FastAPI
```

### Documentação Técnica
- `INTEGRAÇÃO TABELAS.md` - Guia completo para novos módulos
- Padrões baseados na implementação de clientes (modelo de referência)

---
**Objetivo**: Sistema empresarial de gestão comercial full-stack com foco em fluxo operacional completo. Interface profissional em português brasileiro com backend robusto e seguro.
