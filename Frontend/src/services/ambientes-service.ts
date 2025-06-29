import { ApiClientStable } from '@/lib/api-client-stable';
import type { Ambiente, AmbienteFiltros, AmbienteFormData } from '@/types/ambiente';

// Criar wrapper para adaptar a interface
const apiClient = {
  async get(endpoint: string, options?: { params?: any }) {
    const url = new URL(endpoint, 'http://localhost');
    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return ApiClientStable.get(url.pathname + url.search);
  },
  
  async post(endpoint: string, data?: any, options?: { params?: any; headers?: any }) {
    const url = new URL(endpoint, 'http://localhost');
    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return ApiClientStable.post(url.pathname + url.search, data);
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
  listar(filtros?: AmbienteFiltros) {
    return apiClient.get('/ambientes', { params: filtros });
  },

  // Obter ambiente por ID
  obterPorId(id: string, incluirMateriais = false) {
    return apiClient.get(`/ambientes/${id}`, {
      params: { incluir_materiais: incluirMateriais }
    });
  },

  // Criar ambiente
  criar(dados: AmbienteFormData) {
    return apiClient.post('/ambientes', dados);
  },

  // Atualizar ambiente
  atualizar(id: string, dados: Partial<AmbienteFormData>) {
    return apiClient.put(`/ambientes/${id}`, dados);
  },

  // Deletar ambiente
  deletar(id: string) {
    return apiClient.delete(`/ambientes/${id}`);
  },

  // Importar XML
  async importarXML(clienteId: string, arquivo: File) {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    
    return apiClient.post('/ambientes/importar-xml', formData, {
      params: { cliente_id: clienteId },
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  },

  // Materiais
  obterMateriais(ambienteId: string) {
    return apiClient.get(`/ambientes/${ambienteId}/materiais`);
  },

  salvarMateriais(ambienteId: string, materiais: any) {
    return apiClient.post(`/ambientes/${ambienteId}/materiais`, { 
      materiais_json: materiais 
    });
  }
};