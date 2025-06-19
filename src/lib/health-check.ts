/**
 * Função para testar conectividade com backend
 * VERSÃO CORRIGIDA - USA CONFIGURAÇÕES CENTRALIZADAS
 */
import { API_CONFIG, logConfig } from './config';

export async function testBackendConnection() {
  logConfig('Iniciando teste de conectividade...');

  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HEALTH}`;
    logConfig('URL de teste:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: API_CONFIG.DEFAULT_HEADERS,
      signal: AbortSignal.timeout(API_CONFIG.REQUEST_TIMEOUT)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    console.log('✅ Backend conectado com sucesso:', data);
    return {
      success: true,
      data,
      status: response.status,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Erro ao conectar com backend:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Função para testar múltiplos endpoints
export async function testMultipleEndpoints() {
  const endpoints = [
    '/health',
    '/api/v1/docs',
  ];

  const results = [];

  for (const endpoint of endpoints) {
    try {
      const url = `${API_CONFIG.BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        headers: API_CONFIG.DEFAULT_HEADERS,
        signal: AbortSignal.timeout(API_CONFIG.REQUEST_TIMEOUT)
      });
      results.push({
        endpoint,
        success: response.ok,
        status: response.status,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      results.push({
        endpoint,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  return results;
} 