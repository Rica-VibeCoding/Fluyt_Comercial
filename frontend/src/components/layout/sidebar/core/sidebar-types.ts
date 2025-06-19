/**
 * Tipos e interfaces da sidebar
 */

import type { LucideIcon } from 'lucide-react';

export interface MenuItem {
  titulo: string;
  icone: LucideIcon;
  href: string;
  descricao: string;
  ativo?: boolean;
}

export interface UserInfo {
  nome: string;
  cargo: string;
  iniciais: string;
  avatar?: string;
}

export interface SidebarContextType {
  isCollapsed: boolean;
  currentTheme: string;
  userInfo: UserInfo | null;
  toggleCollapse: () => void;
  setTheme: (theme: string) => void;
  setUserInfo: (user: UserInfo) => void;
}

export interface SidebarProps {
  className?: string;
  children?: React.ReactNode;
} 