/**
 * Provider de temas da sidebar
 */

'use client';

import React, { useEffect } from 'react';
import { useSidebar } from '../core/sidebar-context';
import { applyTheme, loadSavedTheme } from './theme-config';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { currentTheme } = useSidebar();

  // Aplicar tema fixo "Azul Clarinho" na inicialização
  useEffect(() => {
    applyTheme('blue-light');
  }, []);

  return <>{children}</>;
} 