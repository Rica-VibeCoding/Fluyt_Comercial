/**
 * Botão para colapsar/expandir a sidebar
 */

'use client';

import React from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '../core/sidebar-context';

export function SidebarToggle() {
  const { isCollapsed, toggleCollapse } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleCollapse}
      className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      title={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
    >
      {isCollapsed ? (
        <PanelLeftOpen className="h-4 w-4" />
      ) : (
        <PanelLeftClose className="h-4 w-4" />
      )}
    </Button>
  );
} 