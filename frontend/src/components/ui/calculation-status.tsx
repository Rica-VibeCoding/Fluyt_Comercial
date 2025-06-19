'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle, Calculator, Zap } from 'lucide-react';

interface CalculationStatusProps {
  isCalculating: boolean;
  hasErrors: boolean;
  lastOperation?: string;
  className?: string;
}

export function CalculationStatus({ 
  isCalculating, 
  hasErrors, 
  lastOperation,
  className 
}: CalculationStatusProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [operationText, setOperationText] = useState('');

  useEffect(() => {
    if (isCalculating) {
      setShowSuccess(false);
      setOperationText(lastOperation || 'Recalculando...');
    } else if (!hasErrors && lastOperation) {
      setShowSuccess(true);
      setOperationText('Cálculo concluído');
      // Auto-hide success após 2 segundos
      const timer = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCalculating, hasErrors, lastOperation]);

  if (!isCalculating && !showSuccess && !hasErrors) {
    return null;
  }

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300",
      {
        "bg-blue-50 text-blue-700 border border-blue-200": isCalculating,
        "bg-green-50 text-green-700 border border-green-200": showSuccess && !hasErrors,
        "bg-red-50 text-red-700 border border-red-200": hasErrors
      },
      className
    )}>
      
      {/* Ícone baseado no estado */}
      {isCalculating && (
        <Calculator className="h-4 w-4 animate-pulse" />
      )}
      
      {showSuccess && !hasErrors && (
        <CheckCircle className="h-4 w-4" />
      )}
      
      {hasErrors && (
        <AlertCircle className="h-4 w-4" />
      )}

      {/* Texto do status */}
      <span className="flex-1">
        {operationText}
      </span>

      {/* Indicador de velocidade para cálculos rápidos */}
      {showSuccess && (
        <Zap className="h-3 w-3 text-green-500" />
      )}
    </div>
  );
}

interface CalculationProgressProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function CalculationProgress({ 
  steps, 
  currentStep, 
  className 
}: CalculationProgressProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {steps.map((step, index) => (
        <div 
          key={index}
          className={cn(
            "flex items-center gap-2 text-xs transition-all duration-200",
            {
              "text-blue-600": index === currentStep,
              "text-green-600": index < currentStep,
              "text-gray-400": index > currentStep
            }
          )}
        >
          <div className={cn(
            "w-2 h-2 rounded-full transition-all duration-200",
            {
              "bg-blue-500 animate-pulse": index === currentStep,
              "bg-green-500": index < currentStep,
              "bg-gray-300": index > currentStep
            }
          )} />
          <span>{step}</span>
        </div>
      ))}
    </div>
  );
} 