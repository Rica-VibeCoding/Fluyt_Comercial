'use client';

import { useEffect, useState } from 'react';
// import { useHidratarSessao } from '@/store/sessao-store';

interface HydrationProviderProps {
  children: React.ReactNode;
}

export function HydrationProvider({ children }: HydrationProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  // const hidratarSessao = useHidratarSessao();

  useEffect(() => {
    // Hidratar o store
    // hidratarSessao();
    setIsHydrated(true);
  }, []);

  return (
    <>
      {children}
    </>
  );
}