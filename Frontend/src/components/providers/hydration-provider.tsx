'use client';

import { useEffect, useState } from 'react';

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