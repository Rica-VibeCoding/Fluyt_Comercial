'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useStepper } from '@/hooks/globais/use-stepper';

// Importar ícone dinamicamente para evitar problemas de SSR
const Check = dynamic(() => import('lucide-react').then(mod => ({ default: mod.Check })), { ssr: false });

export function ProgressStepper() {
  const [isClient, setIsClient] = useState(false);
  
  // Garantir que só renderizamos no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { 
    steps, 
    navigateToStep, 
    isStepClickable, 
    isStepCompleted, 
    isStepCurrent 
  } = useStepper();

  // Durante SSR ou antes da hidratação, mostrar fallback
  if (!isClient) {
    return (
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-center">
            <div className="text-sm text-gray-500">Carregando navegação...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-8 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = isStepCompleted(step.id);
              const isCurrent = isStepCurrent(step.id);
              const isClickable = isStepClickable(step.id);
              const isLast = index === steps.length - 1;
              
              return (
                <React.Fragment key={step.id}>
                  <div 
                    className={`
                      flex items-center transition-all duration-200 relative
                      ${isClickable 
                        ? 'cursor-pointer hover:scale-105' 
                        : 'cursor-not-allowed opacity-75'
                      }
                    `}
                    onClick={() => isClickable && navigateToStep(step.id)}
                    role="button"
                    tabIndex={isClickable ? 0 : -1}
                    aria-label={`Navegar para ${step.label}`}
                    onKeyDown={(e) => {
                      if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        navigateToStep(step.id);
                      }
                    }}
                  >
                    <div
                      className={`
                        relative w-12 h-12 min-w-[48px] min-h-[48px] max-w-[48px] max-h-[48px] 
                        rounded-full border-2 flex items-center justify-center 
                        transition-all duration-300 flex-shrink-0
                        ${isCompleted 
                          ? 'bg-green-500 border-green-500 text-white shadow-md' 
                          : isCurrent 
                            ? 'bg-purple-600 border-purple-600 text-white shadow-lg' 
                            : 'bg-white border-gray-300 text-gray-400'
                        }
                      `}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                      
                      {isCurrent && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-200 rounded-full animate-ping opacity-75" />
                      )}
                    </div>

                    <div className="ml-4 text-left">
                      <div
                        className={`
                          text-sm font-semibold transition-colors duration-300
                          ${isCurrent 
                            ? 'text-purple-700' 
                            : isCompleted 
                              ? 'text-green-700' 
                              : 'text-gray-500'
                          }
                        `}
                      >
                        {step.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {step.description}
                      </div>
                    </div>
                  </div>

                  {!isLast && (
                    <div className="flex-1 min-w-16 max-w-24">
                      <div
                        className={`
                          h-0.5 transition-colors duration-500
                          ${isCompleted 
                            ? 'bg-green-500' 
                            : 'bg-gray-200'
                          }
                        `}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 