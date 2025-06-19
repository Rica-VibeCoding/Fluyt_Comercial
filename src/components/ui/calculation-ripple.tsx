'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface CalculationRippleProps {
  isActive: boolean;
  direction: 'left-to-right' | 'right-to-left' | 'center-out';
  className?: string;
}

export function CalculationRipple({ 
  isActive, 
  direction, 
  className 
}: CalculationRippleProps) {
  const [showRipple, setShowRipple] = useState(false);

  useEffect(() => {
    if (isActive) {
      setShowRipple(true);
      // Auto-hide após animação
      const timer = setTimeout(() => setShowRipple(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  if (!showRipple) return null;

  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)}>
      {/* Onda de propagação */}
      <div 
        className={cn(
          "absolute h-full bg-gradient-to-r from-transparent via-blue-200/30 to-transparent",
          "left-0 w-full",
          getAnimationClass(direction)
        )}
      />
      
      {/* Partículas de cálculo */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-1 h-1 bg-blue-400 rounded-full animate-ping"
            style={{
              animationDelay: `${i * 0.1}s`,
              transform: `translateX(${(i - 1) * 20}px)`
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Usar animações Tailwind simples
const getAnimationClass = (direction: 'left-to-right' | 'right-to-left' | 'center-out') => {
  switch (direction) {
    case 'left-to-right':
      return 'animate-pulse';
    case 'right-to-left':
      return 'animate-pulse';
    case 'center-out':
      return 'animate-pulse';
    default:
      return 'animate-pulse';
  }
}; 