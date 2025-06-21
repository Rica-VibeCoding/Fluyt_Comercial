/**
 * Configuração de temas da sidebar
 */

export interface SidebarTheme {
  name: string;
  id: string;
  colors: {
    primary: string;
    sidebar: string;
    sidebarForeground: string;
    sidebarAccent: string;
    sidebarAccentForeground: string;
  };
}

// Tema fixo "Azul Clarinho" - removido sistema de múltiplos temas
export const sidebarThemes: SidebarTheme[] = [
  { 
    name: "Azul Clarinho", 
    id: "blue-light",
    colors: {
      primary: "207 44% 49%",
      sidebar: "207 44% 49%",
      sidebarForeground: "0 0% 98%",
      sidebarAccent: "207 54% 39%",
      sidebarAccentForeground: "0 0% 98%"
    }
  }
];

export const defaultTheme = sidebarThemes[0];

export function applyTheme(themeId: string): void {
  const theme = sidebarThemes.find(t => t.id === themeId);
  if (!theme) return;

  const root = document.documentElement;
  
  // Aplicar CSS custom properties
  root.style.setProperty('--sidebar-primary', theme.colors.primary);
  root.style.setProperty('--sidebar-background', theme.colors.sidebar);
  root.style.setProperty('--sidebar-foreground', theme.colors.sidebarForeground);
  root.style.setProperty('--sidebar-accent', theme.colors.sidebarAccent);
  root.style.setProperty('--sidebar-accent-foreground', theme.colors.sidebarAccentForeground);
}

export function loadSavedTheme(): string {
  // Sempre retorna o tema fixo "Azul Clarinho"
  return defaultTheme.id;
}

export function getThemeById(themeId: string): SidebarTheme | undefined {
  return sidebarThemes.find(t => t.id === themeId);
} 