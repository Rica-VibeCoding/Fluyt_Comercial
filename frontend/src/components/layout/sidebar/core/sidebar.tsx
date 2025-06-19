/**
 * Componente principal da sidebar
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useSidebar } from './sidebar-context';
import type { SidebarProps } from './sidebar-types';

export function Sidebar({ 
  className,
  children, 
  ...props 
}: SidebarProps) {
  const { isCollapsed } = useSidebar();

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen border-r border-opacity-20 z-30 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className
      )} 
      style={{
        backgroundColor: 'hsl(var(--sidebar-background, var(--background)))',
        borderColor: 'hsl(var(--sidebar-accent, var(--border)))',
        color: 'hsl(var(--sidebar-foreground, var(--foreground)))'
      }}
      {...props}
    >
      <div className="h-full flex flex-col">
        {children}
      </div>
    </aside>
  );
} 