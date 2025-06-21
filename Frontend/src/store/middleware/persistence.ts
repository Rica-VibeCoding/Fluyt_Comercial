/**
 * Middleware de persistência para stores Zustand
 * 
 * EQUIPE B (Claude Code) - ETAPA 10
 * Sistema automático de persistência com localStorage
 */

import { StateCreator, StoreMutatorIdentifier } from 'zustand';

type PersistConfig<T> = {
  name: string;
  storage?: Storage;
  partialize?: (state: T) => Partial<T>;
  onRehydrateStorage?: () => (state?: T, error?: Error) => void;
  skipHydration?: boolean;
  merge?: (persistedState: any, currentState: T) => T;
  version?: number;
};

type PersistImpl = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  config: StateCreator<T, Mps, Mcs>,
  options: PersistConfig<T>
) => StateCreator<T, Mps, Mcs>;

declare module 'zustand/middleware' {
  interface StoreMutators<S, A> {
    'zustand/persist': WithPersist<S, A>
  }
}

type WithPersist<S, A> = S extends { getState: () => infer T }
  ? S & {
      persist: {
        setOptions: (options: Partial<PersistConfig<T>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void>;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: T) => void) => () => void;
        onFinishHydration: (fn: (state: T) => void) => () => void;
        getOptions: () => Partial<PersistConfig<T>>;
      };
    }
  : never;

// Implementação simplificada do persist para nosso uso
export const createPersistMiddleware = <T>(
  config: StateCreator<T, [], []>,
  options: PersistConfig<T>
): StateCreator<T, [], []> => {
  return (set, get, api) => {
    const storage = options.storage || localStorage;
    const partialize = options.partialize || ((state: T) => state);
    const merge = options.merge || ((persistedState: any, currentState: T) => ({ ...currentState, ...persistedState }));
    
    let hasHydrated = false;
    const hydrationListeners = new Set<(state: T) => void>();
    const finishHydrationListeners = new Set<(state: T) => void>();

    // Função para salvar no storage
    const saveToStorage = (state: T) => {
      try {
        const stateToSave = partialize(state);
        storage.setItem(options.name, JSON.stringify({
          state: stateToSave,
          version: options.version || 0,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.warn(`[Persist] Erro ao salvar ${options.name}:`, error);
      }
    };

    // Função para carregar do storage
    const loadFromStorage = (): Partial<T> | null => {
      try {
        const item = storage.getItem(options.name);
        if (!item) return null;

        const parsed = JSON.parse(item);
        
        // Verificar versão
        if (options.version && parsed.version !== options.version) {
          console.warn(`[Persist] Versão diferente para ${options.name}, limpando...`);
          storage.removeItem(options.name);
          return null;
        }

        return parsed.state;
      } catch (error) {
        console.warn(`[Persist] Erro ao carregar ${options.name}:`, error);
        return null;
      }
    };

    // Criar store base
    const store = config(
      (partial, replace) => {
        set(partial, replace);
        // Salvar após cada mudança
        saveToStorage(get());
      },
      get,
      api
    );

    // Hidratar na inicialização
    if (!options.skipHydration) {
      const persistedState = loadFromStorage();
      if (persistedState) {
        const mergedState = merge(persistedState, store);
        Object.assign(store, mergedState);
        
        // Notificar listeners de hidratação
        hydrationListeners.forEach(listener => {
          try {
            listener(store);
          } catch (error) {
            console.warn('[Persist] Erro em listener de hidratação:', error);
          }
        });
      }
      
      hasHydrated = true;
      
      // Notificar listeners de finalização
      finishHydrationListeners.forEach(listener => {
        try {
          listener(store);
        } catch (error) {
          console.warn('[Persist] Erro em listener de finalização:', error);
        }
      });
    }

    // Adicionar métodos de persistência ao store
    (store as any).persist = {
      setOptions: (newOptions: Partial<PersistConfig<T>>) => {
        Object.assign(options, newOptions);
      },
      clearStorage: () => {
        storage.removeItem(options.name);
      },
      rehydrate: async () => {
        const persistedState = loadFromStorage();
        if (persistedState) {
          const mergedState = merge(persistedState, get());
          set(mergedState, true);
        }
      },
      hasHydrated: () => hasHydrated,
      onHydrate: (fn: (state: T) => void) => {
        hydrationListeners.add(fn);
        return () => hydrationListeners.delete(fn);
      },
      onFinishHydration: (fn: (state: T) => void) => {
        finishHydrationListeners.add(fn);
        return () => finishHydrationListeners.delete(fn);
      },
      getOptions: () => options
    };

    return store;
  };
};

// Helper para configuração rápida
export const createPersistConfig = <T>(
  name: string,
  options: Partial<PersistConfig<T>> = {}
): PersistConfig<T> => ({
  name: `fluyt_${name}`,
  storage: localStorage,
  version: 1,
  ...options
});

// Função utilitária para debug
export const debugStorage = (name: string) => {
  const item = localStorage.getItem(`fluyt_${name}`);
  if (item) {
    console.log(`[Storage Debug] ${name}:`, JSON.parse(item));
  } else {
    console.log(`[Storage Debug] ${name}: vazio`);
  }
};