'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  children: React.ReactNode;
}

const variantStyles = {
  primary: 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white',
  secondary: 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white',
  danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white',
  success: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
};

const sizeStyles = {
  sm: 'h-12 px-4 text-sm',
  md: 'h-14 px-6 text-base',
  lg: 'h-16 px-8 text-lg'
};

/**
 * Componente PrimaryButton reutilizável
 * Substitui botões com classes CSS repetidas por variantes configuráveis
 */
export const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'sm', 
    icon: Icon, 
    iconPosition = 'left',
    isLoading = false,
    className,
    disabled,
    children,
    ...props 
  }, ref) => {
    const baseStyles = 'gap-2 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg font-semibold';
    
    const combinedClassName = cn(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      disabled && 'disabled:opacity-50 disabled:cursor-not-allowed',
      className
    );

    return (
      <Button
        ref={ref}
        className={combinedClassName}
        disabled={disabled || isLoading}
        {...props}
      >
        {Icon && iconPosition === 'left' && (
          <Icon className={cn('h-4 w-4', isLoading && 'animate-spin')} />
        )}
        {children}
        {Icon && iconPosition === 'right' && (
          <Icon className={cn('h-4 w-4', isLoading && 'animate-spin')} />
        )}
      </Button>
    );
  }
);

PrimaryButton.displayName = 'PrimaryButton';