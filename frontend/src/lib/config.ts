/**
 * CONFIGURAÇÕES CRÍTICAS - AGENTE SÊNIOR
 * Configurações para conectividade frontend-backend
 */

export const API_CONFIG = {
  // URLs do backend
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  API_VERSION: 'v1',
  
  // Timeouts
  REQUEST_TIMEOUT: 10000, // 10 segundos
  
  // Headers padrão
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Endpoints críticos
  ENDPOINTS: {
    HEALTH: '/health',
    AUTH: '/api/v1/auth',
    CLIENTES: '/api/v1/clientes',
    DOCS: '/api/v1/docs',
  }
} as const;

// Export direto para compatibilidade
export const API_BASE_URL = API_CONFIG.BASE_URL;

export const FRONTEND_CONFIG = {
  // Configurações do frontend
  APP_NAME: 'Fluyt Comercial',
  VERSION: '1.0.0',
  
  // Features flags para integração gradual
  FEATURES: {
    USE_REAL_API: process.env.NEXT_PUBLIC_USE_REAL_API === 'true',
    ENABLE_LOGS: typeof process !== 'undefined' && process.env.NODE_ENV === 'development',
    MOCK_FALLBACK: true, // Fallback para mocks se API falhar
  },
  
  // Configurações de localStorage
  STORAGE_KEYS: {
    SESSAO: 'fluyt_sessao_simples',
    AUTH_TOKEN: 'fluyt_auth_token',
    DEBUG_MODE: 'fluyt_debug_mode',
  }
} as const;

/**
 * Função para verificar se configurações estão OK
 */
export function verificarConfiguracoes(): {
  valido: boolean;
  problemas: string[];
} {
  const problemas: string[] = [];
  
  // Verificar URL da API
  if (!API_CONFIG.BASE_URL) {
    problemas.push('API_CONFIG.BASE_URL não definida');
  }
  
  // Verificar se é localhost válido
  if (API_CONFIG.BASE_URL.includes('localhost') && !API_CONFIG.BASE_URL.includes(':8000')) {
    problemas.push('Backend deve rodar na porta 8000');
  }
  
  // Verificar se window existe (client-side)
  if (typeof window !== 'undefined') {
    // Verificar localStorage disponível
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
    } catch {
      problemas.push('localStorage não disponível');
    }
  }
  
  return {
    valido: problemas.length === 0,
    problemas
  };
}

/**
 * Log helper para desenvolvimento
 */
export function logConfig(message: string, data?: any) {
  // Verificação segura para ambiente browser
  if (typeof window !== 'undefined' && FRONTEND_CONFIG.FEATURES.ENABLE_LOGS) {
    console.log(`🔧 [CONFIG] ${message}`, data);
  }
}

/**
 * Configurações de debug para júniores
 */
export const DEBUG_CONFIG = {
  // Mostrar todas as requests no console
  LOG_REQUESTS: true,
  
  // Mostrar resposta das APIs
  LOG_RESPONSES: true,
  
  // Simular latência de rede
  SIMULATE_DELAY: false,
  DELAY_MS: 1000,
  
  // Forçar erros para teste
  FORCE_ERRORS: false,
} as const;

/**
 * Helper para verificar se backend está rodando
 */
export async function verificarBackendDisponivel(): Promise<boolean> {
  try {
    // Criar AbortController para timeout manual
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HEALTH}`, {
      method: 'GET',
      headers: API_CONFIG.DEFAULT_HEADERS,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}