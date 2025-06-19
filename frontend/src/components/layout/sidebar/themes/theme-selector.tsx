/**
 * Seletor de temas da sidebar
 */

'use client';

import React, { useState } from 'react';
import { Palette, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { useSidebar } from '../core/sidebar-context';
import { sidebarThemes, getThemeById, type SidebarTheme } from './theme-config';

export function ThemeSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { isCollapsed, currentTheme, setTheme } = useSidebar();

  const handleThemeSelect = (themeId: string) => {
    setTheme(themeId);
    setIsOpen(false);
  };

  const currentThemeData = getThemeById(currentTheme);

  return (
    <div className={`transition-all duration-300 ${isCollapsed ? 'flex justify-center' : ''}`}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title={isCollapsed ? 'Trocar tema' : undefined}
          >
            <Palette className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-64 p-3" align="start" side="right">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Escolher tema</p>
            </div>
            
            {/* Preview do tema atual */}
            {currentThemeData && (
              <div className="p-2 rounded-lg border bg-muted/50 mb-3">
                <p className="text-xs text-muted-foreground mb-1">Tema atual:</p>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: `hsl(${currentThemeData.colors.primary})` }}
                  />
                  <span className="text-sm font-medium">{currentThemeData.name}</span>
                </div>
              </div>
            )}
            
            {/* Lista de temas */}
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {sidebarThemes.map((theme) => (
                <Button
                  key={theme.id}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto p-2 hover:bg-accent"
                  onClick={() => handleThemeSelect(theme.id)}
                >
                  <div className="flex items-center gap-3 w-full">
                    {/* Preview das cores */}
                    <div className="flex gap-1">
                      <div 
                        className="w-3 h-3 rounded border border-border"
                        style={{ backgroundColor: `hsl(${theme.colors.primary})` }}
                        title="Cor primária"
                      />
                      <div 
                        className="w-3 h-3 rounded border border-border"
                        style={{ backgroundColor: `hsl(${theme.colors.sidebar})` }}
                        title="Fundo da sidebar"
                      />
                    </div>
                    
                    {/* Nome do tema */}
                    <span className="text-sm flex-1">{theme.name}</span>
                    
                    {/* Check se é o tema atual */}
                    {currentTheme === theme.id && (
                      <Check className="h-3 w-3 text-primary flex-shrink-0" />
                    )}
                  </div>
                </Button>
              ))}
            </div>
            
            {/* Rodapé com info */}
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Tema será salvo automaticamente
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
} 