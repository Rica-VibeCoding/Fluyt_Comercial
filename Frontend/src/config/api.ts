/**
 * Configuração centralizada da API
 * Facilita mudanças entre desenvolvimento e produção
 */

// Detectar se estamos em desenvolvimento
const isDevelopment = process.env.NODE_ENV === 'development';

// URL base da API
export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:8000/api/v1'  // Desenvolvimento: conexão direta
  : '/api/v1';                      // Produção: usar proxy

// Timeout padrão para requisições (em ms)
export const API_TIMEOUT = 60000; // 60 segundos

// Headers padrão
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Configuração de retry
export const RETRY_CONFIG = {
  maxRetries: 2,
  retryDelay: 1000, // 1 segundo entre tentativas
};

console.log(`🔧 API configurada para: ${API_BASE_URL}`);