import { ApiClientStable } from '@/lib/api-client-stable';
import type { 
  Ambiente, 
  AmbienteFiltros, 
  AmbienteFormData,
  AmbienteListResponse,
  AmbienteMaterial
} from '@/types/ambiente';

// Tipo para resposta da API
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  source: 'proxy' | 'direct';
}

/**
 * Adaptador para o ApiClient com melhor tratamento de URLs e parâmetros
 * Corrige problemas de construção de URL e headers para FormData
 */
const apiClient = {
  async get(endpoint: string, options?: { params?: any }) {
    // Construir query string de forma segura
    const params = new URLSearchParams();
    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    // Adicionar query string ao endpoint se houver parâmetros
    const queryString = params.toString();
    const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return ApiClientStable.get(fullEndpoint);
  },
  
  async post(endpoint: string, data?: any, options?: { params?: any; headers?: any }) {
    // Construir query string de forma segura
    const params = new URLSearchParams();
    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    // Adicionar query string ao endpoint se houver parâmetros
    const queryString = params.toString();
    const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    // Para FormData, usar abordagem especial
    // Não definir Content-Type, o browser adiciona automaticamente com boundary
    if (data instanceof FormData) {
      try {
        const token = localStorage.getItem('fluyt_auth_token');
        const headers: any = {
          'Accept': 'application/json'
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`http://localhost:8000/api/v1${fullEndpoint}`, {
          method: 'POST',
          headers,
          body: data
        });
        
        let result;
        try {
          result = await response.json();
        } catch {
          result = { detail: 'Erro ao processar resposta do servidor' };
        }
        
        if (response.ok) {
          return {
            success: true,
            data: result,
            source: 'direct' as const
          } as ApiResponse<any>;
        } else {
          // Extrair mensagem de erro seguindo padrão FastAPI
          const errorMessage = result.detail || result.message || 'Erro no upload';
          return {
            success: false,
            error: errorMessage,
            source: 'direct' as const
          } as ApiResponse<any>;
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Erro de conexão',
          source: 'direct' as const
        } as ApiResponse<any>;
      }
    }
    
    return ApiClientStable.post(fullEndpoint, data);
  },
  
  async put(endpoint: string, data?: any) {
    return ApiClientStable.put(endpoint, data);
  },
  
  async delete(endpoint: string) {
    return ApiClientStable.delete(endpoint);
  }
};

export const ambientesService = {
  // Listar ambientes com filtros
  listar(filtros?: AmbienteFiltros): Promise<ApiResponse<AmbienteListResponse>> {
    const params = new URLSearchParams();
    if (filtros?.cliente_id) params.append('cliente_id', filtros.cliente_id);
    if (filtros?.busca) params.append('busca', filtros.busca);
    if (filtros?.origem) params.append('origem', filtros.origem);
    
    return apiClient.get('/ambientes', { params: filtros }) as Promise<ApiResponse<AmbienteListResponse>>;
  },

  // Obter ambiente por ID
  obterPorId(id: string, incluirMateriais = false): Promise<ApiResponse<Ambiente>> {
    return apiClient.get(`/ambientes/${id}`, {
      params: { incluir_materiais: incluirMateriais }
    }) as Promise<ApiResponse<Ambiente>>;
  },

  // Criar ambiente
  criar(dados: AmbienteFormData): Promise<ApiResponse<Ambiente>> {
    return apiClient.post('/ambientes', dados) as Promise<ApiResponse<Ambiente>>;
  },

  // Atualizar ambiente
  atualizar(id: string, dados: Partial<AmbienteFormData>): Promise<ApiResponse<Ambiente>> {
    return apiClient.put(`/ambientes/${id}`, dados) as Promise<ApiResponse<Ambiente>>;
  },

  // Deletar ambiente
  deletar(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/ambientes/${id}`) as Promise<ApiResponse<void>>;
  },

  // Importar XML
  async importarXML(clienteId: string, arquivo: File): Promise<ApiResponse<Ambiente[]>> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    
    // Não passar Content-Type para FormData
    // O browser adiciona automaticamente com o boundary correto
    return apiClient.post('/ambientes/importar-xml', formData, {
      params: { cliente_id: clienteId }
    });
  },

  // Materiais
  obterMateriais(ambienteId: string): Promise<ApiResponse<AmbienteMaterial>> {
    return apiClient.get(`/ambientes/${ambienteId}/materiais`) as Promise<ApiResponse<AmbienteMaterial>>;
  },

  salvarMateriais(ambienteId: string, materiais: any): Promise<ApiResponse<AmbienteMaterial>> {
    return apiClient.post(`/ambientes/${ambienteId}/materiais`, { 
      materiais_json: materiais 
    }) as Promise<ApiResponse<AmbienteMaterial>>;
  }
};