'use client';

import React, { useEffect, useState } from 'react';

interface HydrationProviderProps {
  children: React.ReactNode;
}

export function HydrationProvider({ children }: HydrationProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // ✨ SOLUÇÃO NÍVEL 1: Pequeno delay para transição suave
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 100); // Delay mínimo para permitir transição suave

    return () => clearTimeout(timer);
  }, []);

  // ✨ SEMPRE mostrar o conteúdo, mas com classes diferentes para transição
  return (
    <div className={`app-container ${isHydrated ? 'hydrated' : 'hydrating'}`}>
      {children}
    </div>
  );
}