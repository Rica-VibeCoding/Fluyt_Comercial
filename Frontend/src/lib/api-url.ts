/**
 * Utilitário para determinar a URL da API
 * Se estiver no browser, usa URLs relativas (proxy reverso)
 * Se estiver no servidor, usa URL completa
 */

export function getApiUrl(endpoint: string): string {
  // Se começar com /api/v1, já está no formato correto
  if (endpoint.startsWith('/api/v1')) {
    // No browser, usar URL relativa (proxy reverso do Next.js)
    if (typeof window !== 'undefined') {
      return endpoint;
    }
    // No servidor, usar URL completa
    return `http://localhost:8000${endpoint}`;
  }
  
  // Se for URL completa, manter
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  
  // Adicionar prefixo /api/v1 se necessário
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // No browser, usar URL relativa
  if (typeof window !== 'undefined') {
    return `/api/v1${path}`;
  }
  
  // No servidor, usar URL completa
  return `http://localhost:8000/api/v1${path}`;
}

// Constantes úteis
export const API_ENDPOINTS = {
  LOGIN: '/api/v1/auth/login',
  REFRESH: '/api/v1/auth/refresh',
  LOGOUT: '/api/v1/auth/logout',
  ME: '/api/v1/auth/me',
  CLIENTES: '/api/v1/clientes',
  EMPRESAS: '/api/v1/empresas',
  HEALTH: '/api/v1/health',
} as const; 