# Guia de Migração - Sidebar

## Migração da Sidebar Antiga para Nova

### ❌ Implementação Antiga
```tsx
import { AppSidebar } from '@/components/layout/app-sidebar';
import { useSidebarContext } from '../../app/painel/layout';

export function Layout() {
  const { isCollapsed, currentTheme, setCurrentTheme } = useSidebarContext();
  
  return <AppSidebar />;
}
```

### ✅ Nova Implementação

#### Opção 1: Uso Direto (Recomendado)
```tsx
import { AppSidebar } from '@/components/layout/sidebar';

export function Layout() {
  return <AppSidebar />;
}
```

#### Opção 2: Composição Customizada
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

## Principais Mudanças

### 1. Context Próprio
- **Antes:** `useSidebarContext` do layout da aplicação
- **Depois:** `useSidebar` próprio da sidebar

### 2. Estrutura de Arquivos
- **Antes:** Arquivos soltos em `/layout`
- **Depois:** Estrutura organizada em `/sidebar`

### 3. Sistema de Temas
- **Antes:** Configuração inline no componente
- **Depois:** Sistema dedicado com provider

### 4. Props e API
```tsx
// ANTES
<SidebarThemeSelector 
  currentTheme={currentTheme} 
  onThemeChange={setCurrentTheme} 
  isCollapsed={isCollapsed}
/>

// DEPOIS
<ThemeSelector />
```

## Checklist de Migração

### 📋 Etapas de Migração

1. **Atualizar Imports**
   ```tsx
   // Remover
   import { useSidebarContext } from '../../app/painel/layout';
   
   // Adicionar
   import { AppSidebar } from '@/components/layout/sidebar';
   ```

2. **Substituir Context**
   ```tsx
   // Remover dependência de context externo
   const { isCollapsed, currentTheme } = useSidebarContext();
   
   // Usar context interno (se necessário customização)
   const { isCollapsed, currentTheme } = useSidebar();
   ```

3. **Simplificar Componente**
   ```tsx
   // De implementação complexa para simples
   return <AppSidebar />;
   ```

4. **Remover Arquivos Antigos** (Etapa 4)
   - `src/components/layout/app-sidebar.tsx`
   - `src/components/layout/sidebar-theme-selector.tsx`
   - `src/components/layout/sidebar-themes.ts`
   - `src/components/layout/sidebar-config.ts`

### ⚠️ Pontos de Atenção

1. **CSS Variables**
   - Verificar se tema está sendo aplicado corretamente
   - CSS variables agora seguem padrão `--sidebar-*`

2. **LocalStorage**
   - Keys mantidas compatíveis: `fluyt-sidebar-theme`, `fluyt-sidebar-collapsed`

3. **Props Customizadas**
   - User info agora via context: `setUserInfo()`
   - Temas via: `setTheme()`

## Validação Pós-Migração

### ✅ Checklist de Teste
- [ ] Sidebar renderiza corretamente
- [ ] Menu items funcionando
- [ ] Toggle collapse/expand funciona
- [ ] Seletor de temas funciona
- [ ] Tema persiste após reload
- [ ] Responsive funciona
- [ ] Acessibilidade mantida
- [ ] Performance melhorada

### 🔧 Debugging
Se algo não funcionar:

1. **Verificar Context**
   ```tsx
   const sidebar = useSidebar();
   console.log('Sidebar state:', sidebar);
   ```

2. **Verificar CSS Variables**
   ```tsx
   console.log('Theme vars:', {
     background: getComputedStyle(document.documentElement)
       .getPropertyValue('--sidebar-background')
   });
   ```

3. **Verificar LocalStorage**
   ```tsx
   console.log('Stored theme:', localStorage.getItem('fluyt-sidebar-theme'));
   ``` 