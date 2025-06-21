# Sidebar Refatorada - Documentação

## Visão Geral

A sidebar foi completamente refatorada para seguir princípios de design compositivo, melhor manutenibilidade e flexibilidade.

## Arquitetura

```
sidebar/
├── core/                   # Componentes fundamentais
│   ├── sidebar.tsx        # Componente principal
│   ├── sidebar-context.tsx # Context e Provider
│   └── sidebar-types.ts   # Tipos TypeScript
├── components/            # Componentes específicos
│   ├── sidebar-menu.tsx   # Menu de navegação
│   ├── sidebar-header.tsx # Cabeçalho
│   ├── sidebar-footer.tsx # Rodapé
│   ├── sidebar-user.tsx   # Informações do usuário
│   └── sidebar-toggle.tsx # Botão colapsar/expandir
├── themes/               # Sistema de temas
│   ├── theme-config.ts   # Configurações de temas
│   ├── theme-provider.tsx # Provider de temas
│   └── theme-selector.tsx # Seletor de temas
├── config/              # Configurações
│   └── menu-config.ts   # Itens do menu
└── examples/           # Exemplos de uso
    └── basic-usage.tsx
```

## Uso Básico

### Implementação Simples
```tsx
import { AppSidebar } from '@/components/layout/sidebar';

export function Layout() {
  return <AppSidebar />;
}
```

### Implementação Compositiva
```tsx
import { 
  SidebarProvider,
  ThemeProvider,
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarFooter,
  SidebarUser,
  ThemeSelector,
  menuItems
} from '@/components/layout/sidebar';

export function CustomLayout() {
  return (
    <SidebarProvider>
      <ThemeProvider>
        <Sidebar>
          <SidebarHeader />
          <SidebarMenu items={menuItems} />
          <SidebarFooter>
            <SidebarUser />
            <ThemeSelector />
          </SidebarFooter>
        </Sidebar>
      </ThemeProvider>
    </SidebarProvider>
  );
}
```

## Componentes

### SidebarProvider
Context provider que gerencia estado da sidebar.

**Props:**
- `defaultCollapsed?: boolean` - Estado inicial de colapso
- `defaultTheme?: string` - Tema inicial
- `defaultUser?: UserInfo` - Informações do usuário

### Sidebar
Componente principal da sidebar.

**Props:**
- `className?: string` - Classes CSS customizadas
- `children: ReactNode` - Conteúdo da sidebar

### SidebarMenu
Menu de navegação.

**Props:**
- `items: MenuItem[]` - Itens do menu
- `className?: string` - Classes CSS customizadas

### SidebarHeader
Cabeçalho da sidebar.

**Props:**
- `title?: string` - Título (padrão: "D-Art")
- `subtitle?: string` - Subtítulo (padrão: "Fluyt")
- `showToggle?: boolean` - Mostrar botão toggle (padrão: true)

### ThemeSelector
Seletor de temas com preview.

**Features:**
- Preview de cores dos temas
- Persistência automática
- Interface intuitiva

## Hook useSidebar

```tsx
const {
  isCollapsed,
  currentTheme,
  userInfo,
  toggleCollapse,
  setTheme,
  setUserInfo
} = useSidebar();
```

## Sistema de Temas

### Temas Disponíveis
- `light-default` - Claro Padrão
- `blue-light` - Azul Clarinho
- `gray-professional` - Cinza Profissional
- `blue-corporate` - Azul Corporativo
- `green-elegant` - Verde Elegante
- `purple-modern` - Roxo Moderno
- `black-minimal` - Preto Minimalista

### CSS Variables
```css
--sidebar-primary
--sidebar-background
--sidebar-foreground
--sidebar-accent
--sidebar-accent-foreground
```

## Benefícios da Refatoração

✅ **Modularidade:** Componentes pequenos e focados
✅ **Reutilização:** Componentes compositivos
✅ **Manutenibilidade:** Código organizado e tipado
✅ **Performance:** Redução de re-renders
✅ **Flexibilidade:** Fácil customização
✅ **Acessibilidade:** ARIA labels e navegação por teclado 