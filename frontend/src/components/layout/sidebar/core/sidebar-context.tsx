/**
 * Context da sidebar
 */

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { SidebarContextType, UserInfo } from './sidebar-types';

const SidebarContext = createContext<SidebarContextType | null>(null);

interface SidebarProviderProps {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
  defaultTheme?: string;
  defaultUser?: UserInfo;
}

export function SidebarProvider({ 
  children, 
  defaultCollapsed = false,
  defaultTheme = 'blue-light', // Tema fixo "Azul Clarinho"
  defaultUser = {
    nome: 'João Silva',
    cargo: 'Designer', 
    iniciais: 'JS'
  }
}: SidebarProviderProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [currentTheme] = useState(defaultTheme); // Removido setter - tema fixo
  const [userInfo, setUserInfo] = useState<UserInfo | null>(defaultUser);

  // Carregar estado de collapse persistido considerando responsividade
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768; // md breakpoint
      const savedCollapsed = localStorage.getItem('fluyt-sidebar-collapsed');
      
      if (savedCollapsed) {
        // Em desktop: usar valor salvo, em mobile: sempre começar fechado
        const shouldCollapse = isMobile ? true : JSON.parse(savedCollapsed);
        setIsCollapsed(shouldCollapse);
      } else {
        // Valor padrão: desktop expandido, mobile fechado
        setIsCollapsed(isMobile ? true : defaultCollapsed);
      }
    }
  }, [defaultCollapsed]);

  const toggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    localStorage.setItem('fluyt-sidebar-collapsed', JSON.stringify(newCollapsed));
  };

  // Função removida - tema é fixo
  const setTheme = () => {
    // Noop - tema fixo "Azul Clarinho"
  };

  const value: SidebarContextType = {
    isCollapsed,
    currentTheme,
    userInfo,
    toggleCollapse,
    setTheme,
    setUserInfo
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarContextType {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar deve ser usado dentro de SidebarProvider');
  }
  return context;
} 