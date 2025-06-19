'use client';

import { useEffect, useState } from 'react';

interface HydrationProviderProps {
  children: React.ReactNode;
}

export function HydrationProvider({ children }: HydrationProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Garantir que a hidratação aconteça apenas no cliente
    setIsHydrated(true);
  }, []);

  // Durante SSR, mostrar apenas uma versão básica
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  // Após hidratação, mostrar conteúdo completo
  return <>{children}</>;
}