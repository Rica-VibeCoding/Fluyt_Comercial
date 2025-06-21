/**
 * Barrel exports para componentes de layout
 */

export { PageHeader } from './page-header';
export { ProgressStepper } from './progress-stepper';

// Sidebar refatorada
export { 
  AppSidebar,
  Sidebar,
  SidebarProvider,
  useSidebar,
  SidebarMenu,
  SidebarHeader,
  SidebarFooter,
  SidebarUser,
  SidebarToggle,
  ThemeProvider,
  menuItems,
  sidebarThemes,
  type MenuItem,
  type SidebarTheme,
  type SidebarContextType,
  type UserInfo
} from './sidebar';