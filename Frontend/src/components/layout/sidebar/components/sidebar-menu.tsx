/**
 * Componente de menu da sidebar
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSidebar } from '../core/sidebar-context';
import type { MenuItem } from '../core/sidebar-types';

interface SidebarMenuProps {
  items: MenuItem[];
  className?: string;
}

export function SidebarMenu({ items, className }: SidebarMenuProps) {
  const pathname = usePathname();
  const { isCollapsed } = useSidebar();

  return (
    <nav className={cn("flex-1 px-2 py-3", className)}>
      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icone;
          // Lógica de seleção melhorada: Dashboard só ativo se estiver exatamente na rota
          const isActive = item.href === '/painel' 
            ? pathname === '/painel'
            : pathname.startsWith(item.href);
          const isDisabled = !item.ativo && item.href !== '/painel/orcamento';
          
          return (
            <Link
              key={item.href}
              href={isDisabled ? '#' : item.href}
              className={cn(
                "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors relative group",
                isActive && "bg-accent text-accent-foreground",
                isDisabled && "opacity-50 cursor-not-allowed",
                !isActive && !isDisabled && "hover:bg-accent/50"
              )}
              title={isCollapsed ? item.titulo : undefined}
            >
              <Icon className={cn(
                "h-4 w-4 flex-shrink-0", 
                isCollapsed ? "mx-auto" : "mr-3"
              )} />
              
              {!isCollapsed && (
                <span>{item.titulo}</span>
              )}

              {/* Tooltip para modo colapsado */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap pointer-events-none border shadow-md">
                  {item.titulo}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
} 