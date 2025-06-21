'use client';

import { useEffect, useState } from 'react';

/**
 * Hook para gerenciar transições suaves durante hidratação e carregamento
 * Elimina o "piscar" visual quando F5 é pressionado
 */
export function useSmoothTransitions() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Marca como hidratado
    setIsHydrated(true);
    
    // Aplica fade-in suave após hidratação
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50); // Delay mínimo para evitar flash

    return () => clearTimeout(timer);
  }, []);

  return {
    isHydrated,
    isVisible,
    fadeInClass: `component-fade-in ${isVisible ? 'visible' : ''}`,
    smoothClass: `smooth-element ${isHydrated ? 'loaded' : 'loading'}`,
  };
}

/**
 * Hook especializado para tabelas com skeleton loading
 */
export function useSmoothTableTransition(isLoading: boolean) {
  const { isVisible } = useSmoothTransitions();
  
  return {
    showSkeleton: isLoading || !isVisible,
    tableClass: `table-smooth component-fade-in ${isVisible && !isLoading ? 'visible' : ''}`,
  };
}

/**
 * Hook para gerenciar transições de páginas
 */
export function useSmoothPageTransition() {
  const { isHydrated, isVisible } = useSmoothTransitions();
  
  return {
    isReady: isHydrated && isVisible,
    pageClass: `page-content-smooth component-fade-in ${isVisible ? 'visible' : ''}`,
  };
} 