/**
 * Componente compositivo completo da sidebar
 */

'use client';

import React from 'react';
import { SidebarProvider } from './core/sidebar-context';
import { ThemeProvider } from './themes/theme-provider';
import { Sidebar } from './core/sidebar';
import { SidebarHeader } from './components/sidebar-header';
import { SidebarMenu } from './components/sidebar-menu';
import { SidebarFooter } from './components/sidebar-footer';
import { SidebarUser } from './components/sidebar-user';
import { menuItems } from './config/menu-config';
import { ConnectionStatus } from '@/components/layout/connection-status';

export function AppSidebar() {
  return (
    <SidebarProvider>
      <ThemeProvider>
        <Sidebar>
          <SidebarHeader />
          <SidebarMenu items={menuItems} />
          <SidebarFooter>
            <div className="flex items-center justify-center mb-2">
              <ConnectionStatus />
            </div>
            <SidebarUser />
          </SidebarFooter>
        </Sidebar>
      </ThemeProvider>
    </SidebarProvider>
  );
} 