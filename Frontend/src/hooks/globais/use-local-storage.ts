import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para gerenciar dados no localStorage com sincronização automática
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Estado para armazenar o valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Erro ao ler localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Função para salvar no localStorage
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      setStoredValue(currentValue => {
        // Permitir que value seja uma função para atualização funcional
        const valueToStore = value instanceof Function ? value(currentValue) : value;
        
        console.log(`💾 localStorage.setValue "${key}":`, {
          previous: currentValue,
          new: valueToStore
        });
        
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
        
        return valueToStore;
      });
    } catch (error) {
      console.warn(`Erro ao salvar no localStorage key "${key}":`, error);
    }
  }, [key]);

  // Função para limpar dados
  const clearValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Erro ao limpar localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Sincronizar com mudanças em outras abas (DESABILITADO TEMPORARIAMENTE)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue);
          console.warn(`🚨 localStorage sync IGNORADO "${key}":`, {
            oldValue: storedValue,
            newValue: newValue,
            motivo: 'sync_desabilitado_para_debug'
          });
          // TEMPORARIAMENTE DESABILITADO: setStoredValue(newValue);
        } catch (error) {
          console.warn(`Erro ao sincronizar localStorage key "${key}":`, error);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [key, storedValue]);

  return [storedValue, setValue, clearValue] as const;
}