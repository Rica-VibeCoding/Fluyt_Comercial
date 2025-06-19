/**
 * Exports da sidebar refatorada
 */

export { Sidebar } from './core/sidebar';
export { SidebarProvider, useSidebar } from './core/sidebar-context';
export { SidebarMenu } from './components/sidebar-menu';
export { SidebarHeader } from './components/sidebar-header';
export { SidebarFooter } from './components/sidebar-footer';
export { SidebarUser } from './components/sidebar-user';
export { SidebarToggle } from './components/sidebar-toggle';
export { ThemeProvider } from './themes/theme-provider';
export { AppSidebar } from './sidebar-app';
export { menuItems } from './config/menu-config';
export type { MenuItem } from './core/sidebar-types';
export { sidebarThemes, type SidebarTheme } from './themes/theme-config';
export type { SidebarContextType, UserInfo } from './core/sidebar-types'; 