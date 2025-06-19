/**
 * Utilitários de performance para stores Zustand
 * 
 * EQUIPE B (Claude Code) - ETAPA 10
 * Cache inteligente e otimizações avançadas
 */

// === DEBOUNCE PARA UPDATES FREQUENTES ===

export const createDebounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// === THROTTLE PARA CONTROLE DE FREQUÊNCIA ===

export const createThrottle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// === CACHE AVANÇADO COM TTL ===

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

class AdvancedCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private defaultTTL: number;

  constructor(defaultTTL: number = 5 * 60 * 1000) { // 5 minutos default
    this.defaultTTL = defaultTTL;
  }

  set(key: string, value: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    };
    
    this.cache.set(key, entry);
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Verificar se expirou
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  size(): number {
    this.cleanup(); // Limpar primeiro
    return this.cache.size;
  }

  debug(): void {
    console.log('[Cache Debug]', {
      size: this.size(),
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        age: Date.now() - entry.timestamp,
        ttl: entry.ttl
      }))
    });
  }
}

// === INSTÂNCIAS GLOBAIS DE CACHE ===

export const orcamentoCache = new AdvancedCache(10 * 60 * 1000); // 10 minutos
export const uiCache = new AdvancedCache(2 * 60 * 1000); // 2 minutos
export const validationCache = new AdvancedCache(30 * 1000); // 30 segundos

// === MEMOIZAÇÃO AVANÇADA ===

export const createMemoizedSelector = <T, R>(
  selector: (state: T) => R,
  equalityFn?: (a: R, b: R) => boolean
) => {
  let lastState: T | undefined;
  let lastResult: R;
  
  const defaultEqualityFn = (a: R, b: R) => a === b;
  const isEqual = equalityFn || defaultEqualityFn;
  
  return (state: T): R => {
    if (lastState === undefined || state !== lastState) {
      const newResult = selector(state);
      
      if (lastState === undefined || !isEqual(newResult, lastResult)) {
        lastResult = newResult;
      }
      
      lastState = state;
    }
    
    return lastResult;
  };
};

// === EQUALITY FUNCTIONS ===

export const shallowEqual = <T>(a: T, b: T): boolean => {
  if (a === b) return true;
  
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
    return false;
  }
  
  const keysA = Object.keys(a as any);
  const keysB = Object.keys(b as any);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!keysB.includes(key) || (a as any)[key] !== (b as any)[key]) {
      return false;
    }
  }
  
  return true;
};

export const deepEqual = <T>(a: T, b: T): boolean => {
  return JSON.stringify(a) === JSON.stringify(b);
};

// === PERFORMANCE MONITORING ===

class PerformanceMonitor {
  private timers = new Map<string, number>();
  private stats = new Map<string, { count: number; totalTime: number; avgTime: number }>();

  start(label: string): void {
    this.timers.set(label, performance.now());
  }

  end(label: string): number {
    const startTime = this.timers.get(label);
    if (!startTime) return 0;
    
    const duration = performance.now() - startTime;
    this.timers.delete(label);
    
    // Atualizar estatísticas
    const stat = this.stats.get(label) || { count: 0, totalTime: 0, avgTime: 0 };
    stat.count++;
    stat.totalTime += duration;
    stat.avgTime = stat.totalTime / stat.count;
    
    this.stats.set(label, stat);
    
    return duration;
  }

  measure<T>(label: string, fn: () => T): T {
    this.start(label);
    const result = fn();
    this.end(label);
    return result;
  }

  async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    const result = await fn();
    this.end(label);
    return result;
  }

  getStats(): Record<string, { count: number; totalTime: number; avgTime: number }> {
    return Object.fromEntries(this.stats.entries());
  }

  reset(): void {
    this.timers.clear();
    this.stats.clear();
  }

  debug(): void {
    console.table(this.getStats());
  }
}

export const performanceMonitor = new PerformanceMonitor();

// === LAZY LOADING HELPER ===

export const createLazyLoader = <T>(
  loader: () => Promise<T>,
  fallback: T
) => {
  let cached: T | null = null;
  let loading = false;
  let promise: Promise<T> | null = null;

  return {
    get: (): T => cached || fallback,
    
    load: async (): Promise<T> => {
      if (cached) return cached;
      if (loading && promise) return promise;
      
      loading = true;
      promise = loader().then(result => {
        cached = result;
        loading = false;
        return result;
      }).catch(error => {
        loading = false;
        console.error('[LazyLoader] Erro ao carregar:', error);
        return fallback;
      });
      
      return promise;
    },
    
    isLoaded: (): boolean => cached !== null,
    isLoading: (): boolean => loading,
    
    clear: (): void => {
      cached = null;
      loading = false;
      promise = null;
    }
  };
};

// === UTILITÁRIOS DE DEBUG ===

export const createStoreDebugger = (storeName: string) => {
  return {
    logState: (state: any) => {
      console.group(`[${storeName}] Estado atual`);
      console.log('Estado completo:', state);
      console.groupEnd();
    },
    
    logAction: (actionName: string, payload?: any) => {
      console.log(`[${storeName}] Ação: ${actionName}`, payload);
    },
    
    logPerformance: (actionName: string, duration: number) => {
      const color = duration > 100 ? 'red' : duration > 50 ? 'orange' : 'green';
      console.log(`[${storeName}] %c${actionName}: ${duration.toFixed(2)}ms`, `color: ${color}`);
    }
  };
};