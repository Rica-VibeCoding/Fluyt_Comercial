/**
 * Footer da sidebar
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SidebarFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function SidebarFooter({ children, className }: SidebarFooterProps) {
  return (
    <div className={cn("border-t border-opacity-20 px-2 py-3 space-y-3", className)}>
      {children}
    </div>
  );
} 