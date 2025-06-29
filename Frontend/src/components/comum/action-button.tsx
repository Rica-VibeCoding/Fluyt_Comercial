/**
 * Componente ActionButton reutilizável
 * Botão padronizado para ações com ícone
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionButtonProps {
  icon: LucideIcon;
  onClick?: () => void;
  variant?: 'edit' | 'delete' | 'default';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  tooltip?: string;
  className?: string;
}

const variantStyles = {
  edit: 'hover:bg-blue-100',
  delete: 'hover:bg-red-100',
  default: 'hover:bg-gray-100'
};

const iconColors = {
  edit: 'text-blue-600',
  delete: 'text-red-600',
  default: 'text-gray-600'
};

const sizeMap = {
  sm: { button: 'h-6 w-6 p-0', icon: 'h-3 w-3' },
  md: { button: 'h-8 w-8 p-0', icon: 'h-4 w-4' },
  lg: { button: 'h-10 w-10 p-0', icon: 'h-5 w-5' }
};

export function ActionButton({ 
  icon: Icon,
  onClick,
  variant = 'default',
  size = 'sm',
  disabled = false,
  tooltip,
  className
}: ActionButtonProps) {
  const sizes = sizeMap[size];
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        sizes.button,
        variantStyles[variant],
        className
      )}
      title={tooltip}
    >
      <Icon className={cn(sizes.icon, iconColors[variant])} />
    </Button>
  );
}