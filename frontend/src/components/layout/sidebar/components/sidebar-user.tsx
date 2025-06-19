/**
 * Componente de usuário da sidebar
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useSidebar } from '../core/sidebar-context';

export function SidebarUser() {
  const { isCollapsed, userInfo } = useSidebar();

  if (!userInfo) return null;

  return (
    <div className={cn(
      "flex items-center transition-all duration-300",
      isCollapsed ? "justify-center px-0" : "px-2"
    )}>
      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
        {userInfo.iniciais}
      </div>
      <div className={cn(
        "ml-3 transition-all duration-300",
        isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
      )}>
        <p className="text-sm font-medium text-foreground">
          {userInfo.nome}
        </p>
        <p className="text-xs text-white/80">
          {userInfo.cargo}
        </p>
      </div>
    </div>
  );
} 