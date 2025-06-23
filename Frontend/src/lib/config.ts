/**
 * CONFIGURAÇÕES CRÍTICAS - AGENTE SÊNIOR
 * Configurações para conectividade frontend-backend
 */

export const API_CONFIG = {
  // 🔧 URLs do backend - CORRIGIDO para conectar diretamente ao backend
  BASE_URL: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:8000' // CONECTAR DIRETAMENTE AO BACKEND
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'),
  API_VERSION: 'v1',
  
  // Timeouts
  REQUEST_TIMEOUT: 60000, // 60 segundos - tempo suficiente para backend processar
  
  // Headers padrão
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // 🔧 Endpoints críticos - CONECTAR DIRETAMENTE AO BACKEND
  ENDPOINTS: {
    HEALTH: '/health',
    AUTH: '/api/v1/auth',
    CLIENTES: '/api/v1/clientes',
    EMPRESAS: '/api/v1/empresas',
    LOJAS: '/api/v1/lojas',
    FUNCIONARIOS: '/api/v1/funcionarios',
    DOCS: '/api/v1/docs',
  }
} as const;

export const FRONTEND_CONFIG = {
  // Configurações do frontend
  APP_NAME: 'Fluyt Comercial',
  VERSION: '1.0.0',
  
  // Features flags para integração gradual
  FEATURES: {
    USE_REAL_API: process.env.NEXT_PUBLIC_USE_REAL_API === 'true',
    ENABLE_LOGS: process.env.NODE_ENV === 'development',
    MOCK_FALLBACK: false, // Desabilitado - usar apenas dados reais
    DEBUG_API: process.env.NODE_ENV === 'development', // Logs detalhados de API
    USE_PROXY: process.env.NODE_ENV === 'development', // 🔧 NOVO: Flag para usar proxy
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
  
  // 🔧 Verificação ajustada para proxy
  if (process.env.NODE_ENV === 'production' && !API_CONFIG.BASE_URL) {
    problemas.push('API_CONFIG.BASE_URL não definida para produção');
  }
  
  // Verificar se é localhost válido em produção
  if (process.env.NODE_ENV === 'production' && 
      API_CONFIG.BASE_URL.includes('localhost') && 
      !API_CONFIG.BASE_URL.includes(':8000')) {
    problemas.push('Backend deve rodar na porta 8000 em produção');
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
  if (FRONTEND_CONFIG.FEATURES.ENABLE_LOGS) {
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
 * Helper para verificar se backend está disponível
 * 🔧 CORRIGIDO para conectar diretamente ao backend
 */
export async function verificarBackendDisponivel(): Promise<boolean> {
  try {
    const url = `${API_CONFIG.BASE_URL}/health`; // SEMPRE DIRETO AO BACKEND
    
    const response = await fetch(url, {
      method: 'GET',
      headers: API_CONFIG.DEFAULT_HEADERS,
      signal: AbortSignal.timeout(5000) // 5 segundos timeout
    });
    
    return response.ok;
  } catch {
    return false;
  }
}