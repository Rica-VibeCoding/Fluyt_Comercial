/**
 * API CLIENT PROFISSIONAL - SÊNIOR
 * Cliente HTTP robusto para integração frontend-backend
 */
import { API_CONFIG, logConfig, FRONTEND_CONFIG } from './config';

// Tipos para o cliente API
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
  status?: number;
}

export class ApiClientError extends Error {
  public readonly status?: number;
  public readonly code?: string;
  public readonly details?: any;

  constructor(message: string, status?: number, code?: string, details?: any) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Cliente HTTP profissional com interceptors e error handling
 */
export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private authToken: string | null = null;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.defaultHeaders = { ...API_CONFIG.DEFAULT_HEADERS };
    
    // Carregar token de auth se existir
    this.loadAuthToken();
    
    logConfig('ApiClient inicializado', { baseURL: this.baseURL });
  }

  /**
   * Carrega token de autenticação do localStorage
   */
  private loadAuthToken(): void {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(FRONTEND_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        this.setAuthToken(token);
      }
    }
  }

  /**
   * Define token de autenticação
   */
  public setAuthToken(token: string): void {
    this.authToken = token;
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(FRONTEND_CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
    }
    
    logConfig('Token de autenticação definido');
  }

  /**
   * Remove token de autenticação
   */
  public clearAuthToken(): void {
    this.authToken = null;
    delete this.defaultHeaders['Authorization'];
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(FRONTEND_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    }
    
    logConfig('Token de autenticação removido');
  }

  /**
   * Prepara headers para requisição
   */
  private prepareHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    return {
      ...this.defaultHeaders,
      ...customHeaders
    };
  }

  /**
   * Processa resposta da API
   */
  private async processResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    
    try {
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        
        if (!response.ok) {
          throw new ApiClientError(
            data.message || `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            data.code,
            data
          );
        }
        
        return data;
      } else {
        const text = await response.text();
        
        if (!response.ok) {
          throw new ApiClientError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status
          );
        }
        
        return text as T;
      }
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }
      
      throw new ApiClientError(
        'Erro ao processar resposta da API',
        response.status,
        'PARSE_ERROR',
        error
      );
    }
  }

  /**
   * Executa requisição HTTP genérica
   */
  private async request<T>(
    method: string,
    endpoint: string,
    body?: any,
    customHeaders?: Record<string, string>
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.prepareHeaders(customHeaders);
    
    // Log da requisição
    logConfig(`${method} ${endpoint}`, { url, headers: Object.keys(headers) });
    
    try {
      // Criar AbortController para timeout manual
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.REQUEST_TIMEOUT);
      
      const config: RequestInit = {
        method,
        headers,
        signal: controller.signal
      };
      
      if (body) {
        if (headers['Content-Type']?.includes('application/json')) {
          config.body = JSON.stringify(body);
        } else {
          config.body = body;
        }
      }
      
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      const result = await this.processResponse<T>(response);
      
      logConfig(`✅ ${method} ${endpoint}`, { status: response.status });
      return result;
      
    } catch (error) {
      if (error instanceof ApiClientError) {
        logConfig(`❌ ${method} ${endpoint}`, { error: error.message, status: error.status });
        throw error;
      }
      
      // Erro de rede ou timeout
      const message = error instanceof Error ? error.message : 'Erro de rede desconhecido';
      logConfig(`❌ ${method} ${endpoint}`, { error: message });
      
      throw new ApiClientError(
        `Erro de conectividade: ${message}`,
        0,
        'NETWORK_ERROR',
        error
      );
    }
  }

  /**
   * Requisição GET
   */
  public async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, headers);
  }

  /**
   * Requisição POST
   */
  public async post<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('POST', endpoint, data, headers);
  }

  /**
   * Requisição PUT
   */
  public async put<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('PUT', endpoint, data, headers);
  }

  /**
   * Requisição DELETE
   */
  public async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('DELETE', endpoint, undefined, headers);
  }

  /**
   * Requisição PATCH
   */
  public async patch<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('PATCH', endpoint, data, headers);
  }

  /**
   * Verifica se API está online
   */
  public async healthCheck(): Promise<boolean> {
    try {
      await this.get(API_CONFIG.ENDPOINTS.HEALTH);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Upload de arquivo
   */
  public async uploadFile<T>(
    endpoint: string,
    file: File,
    fieldName: string = 'file',
    additionalData?: Record<string, string>
  ): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }
    
    // Remove Content-Type para multipart/form-data
    const headers = { ...this.defaultHeaders };
    delete headers['Content-Type'];
    
    return this.request<T>('POST', endpoint, formData, headers);
  }
}

// Instância singleton do cliente API
export const apiClient = new ApiClient();

// Funções de conveniência
export const api = {
  get: <T>(endpoint: string) => apiClient.get<T>(endpoint),
  post: <T>(endpoint: string, data?: any) => apiClient.post<T>(endpoint, data),
  put: <T>(endpoint: string, data?: any) => apiClient.put<T>(endpoint, data),
  delete: <T>(endpoint: string) => apiClient.delete<T>(endpoint),
  patch: <T>(endpoint: string, data?: any) => apiClient.patch<T>(endpoint, data),
  
  // Helpers específicos
  healthCheck: () => apiClient.healthCheck(),
  setAuthToken: (token: string) => apiClient.setAuthToken(token),
  clearAuthToken: () => apiClient.clearAuthToken(),
  uploadFile: <T>(endpoint: string, file: File, fieldName?: string) => 
    apiClient.uploadFile<T>(endpoint, file, fieldName)
};