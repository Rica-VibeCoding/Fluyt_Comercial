/**
 * Header da sidebar
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useSidebar } from '../core/sidebar-context';
import { SidebarToggle } from './sidebar-toggle';

interface SidebarHeaderProps {
  title?: string;
  subtitle?: string;
  showToggle?: boolean;
  className?: string;
}

export function SidebarHeader({ 
  title = "D-Art",
  subtitle = "Fluyt",
  showToggle = true,
  className 
}: SidebarHeaderProps) {
  const { isCollapsed } = useSidebar();

  return (
    <div className={cn("border-b border-opacity-20 px-4 py-3", className)}>
      <div className="flex items-center justify-between">
        <div className={cn(
          "transition-all duration-300",
          isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
        )}>
          <h1 className="text-lg font-bold mb-0.5">
            {title}
          </h1>
          <p className="text-xs font-medium opacity-70">
            {subtitle}
          </p>
        </div>
        {showToggle && (
          <div className={cn(
            "transition-all duration-300",
            isCollapsed ? "ml-0" : "ml-2"
          )}>
            <SidebarToggle />
          </div>
        )}
      </div>
    </div>
  );
} 