/**
 * Exemplo básico de uso da sidebar
 */

'use client';

import React from 'react';
import { 
  AppSidebar,
  SidebarProvider,
  ThemeProvider,
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarFooter,
  SidebarUser,
  SidebarToggle,
  menuItems
} from '../index';

export function BasicSidebarExample() {
  return <AppSidebar />;
}

/**
 * Exemplo com composição manual
 */
export function CustomSidebarExample() {
  return (
    <SidebarProvider>
      <ThemeProvider>
        <Sidebar>
          <SidebarHeader title="Meu App" subtitle="v2.0" />
          <SidebarMenu items={menuItems} />
          <SidebarFooter>
            <SidebarUser />
            <SidebarToggle />
          </SidebarFooter>
        </Sidebar>
      </ThemeProvider>
    </SidebarProvider>
  );
}

/**
 * Exemplo com configurações customizadas
 */
export function CustomConfigExample() {
  const customUser = {
    nome: 'Maria Silva',
    cargo: 'Gerente',
    iniciais: 'MS'
  };

  return (
    <SidebarProvider 
      defaultCollapsed={false}
      defaultTheme="blue-corporate"
      defaultUser={customUser}
    >
      <ThemeProvider>
        <Sidebar className="border-l-4 border-l-blue-500">
          <SidebarHeader title="Sistema XYZ" showToggle={false} />
          <SidebarMenu items={menuItems} />
          <SidebarFooter>
            <SidebarUser />
          </SidebarFooter>
        </Sidebar>
      </ThemeProvider>
    </SidebarProvider>
  );
} 