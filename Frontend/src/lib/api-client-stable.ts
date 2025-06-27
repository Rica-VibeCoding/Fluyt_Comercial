/**
 * Cliente API estável com fallback automático
 * Resolve problemas de proxy e timeout
 */

const API_URLS = {
  // Temporariamente forçar conexão direta até resolver proxy
  proxy: 'http://localhost:8000/api/v1',
  // Fallback: conexão direta
  direct: 'http://localhost:8000/api/v1'
};

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  source: 'proxy' | 'direct';
}

export class ApiClientStable {
  // ✅ CORRIGIDO: Método para obter token do localStorage
  private static getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      // ✅ CORRIGIDO: Buscar pela chave correta que o login usa
      return localStorage.getItem('fluyt_auth_token') || localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    }
    return null;
  }

  private static async tryFetch(
    endpoint: string,
    options: RequestInit,
    useProxy: boolean
  ): Promise<Response | null> {
    const baseUrl = useProxy ? API_URLS.proxy : API_URLS.direct;
    const url = `${baseUrl}${endpoint}`;
    
    // ✅ ADICIONADO: Token de autenticação
    const token = this.getAuthToken();
    const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    // Declarar startTime ANTES do try para estar disponível no catch
    const startTime = Date.now();
    
    try {
      console.log(`🔗 Tentando ${useProxy ? 'primeira conexão' : 'segunda tentativa'}: ${url}`);
      console.log(`🔐 Token: ${token ? 'Presente' : 'Ausente'}`);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...authHeaders,  // ✅ ADICIONADO: Headers de autenticação
          ...options.headers,
        },
        // Timeout aumentado para dar tempo ao backend responder
        signal: AbortSignal.timeout(60000) // 60 segundos
      });
      
      const responseTime = Date.now() - startTime;
      console.log(`✅ Resposta ${useProxy ? 'proxy' : 'direto'} em ${responseTime}ms`);
      return response;
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      console.error(`❌ Erro ${useProxy ? 'proxy' : 'direto'} após ${responseTime}ms:`, error.message);
      
      // Log mais detalhado do tipo de erro
      if (error.name === 'AbortError') {
        console.error('⏱️  Timeout: Backend demorou mais de 30 segundos para responder');
      } else if (error.message.includes('Failed to fetch')) {
        console.error('🌐 Erro de conexão: Não foi possível conectar ao servidor');
      }
      
      return null;
    }
  }

  static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Tentar primeiro via proxy
    let response = await this.tryFetch(endpoint, options, true);
    let source: 'proxy' | 'direct' = 'proxy';
    
    // Se falhar, tentar direto
    if (!response) {
      console.log('⚠️  Proxy falhou, tentando conexão direta...');
      response = await this.tryFetch(endpoint, options, false);
      source = 'direct';
    }
    
    // Se ainda falhar, retornar erro com mensagem mais específica
    if (!response) {
      // Verificar se é problema de timeout vs conexão
      const errorMessage = source === 'direct' 
        ? 'Não foi possível conectar ao servidor. Verifique se o backend está rodando em http://localhost:8000'
        : 'Servidor demorou muito para responder. Tente novamente em alguns instantes';
      
      return {
        success: false,
        error: errorMessage,
        source
      };
    }
    
    // Processar resposta
    try {
      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          data,
          source
        };
      } else {
        return {
          success: false,
          error: data.message || data.detail || 'Erro na requisição',
          data,
          source
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao processar resposta',
        source
      };
    }
  }

  // Métodos convenientes
  static async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  static async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET'
    });
  }

  static async put<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  static async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE'
    });
  }
}

// Função helper para login
export async function loginStable(email: string, password: string) {
  return ApiClientStable.post('/auth/login', { email, password });
}