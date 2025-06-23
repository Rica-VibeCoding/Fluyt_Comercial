import { ApiClientStable } from '@/lib/api-client-stable';
import type { Setor, SetorFormData } from '@/types/sistema';

interface SetorBackend {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  created_at: string;
  updated_at?: string;
}

interface SetoresListResponse {
  items: SetorBackend[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export class SetoresService {
  private apiClient: ApiClientStable;

  constructor() {
    this.apiClient = new ApiClientStable();
  }

  // Converter do backend para frontend
  private converterParaFrontend(setorBackend: SetorBackend): Setor {
    return {
      id: setorBackend.id,
      nome: setorBackend.nome,
      descricao: setorBackend.descricao || '',
      ativo: setorBackend.ativo,
      funcionarios: 0, // TODO: Adicionar contagem real quando disponível
      createdAt: setorBackend.created_at,
      updatedAt: setorBackend.updated_at
    };
  }

  // Converter do frontend para backend
  private converterParaBackend(setorFrontend: SetorFormData): any {
    return {
      nome: setorFrontend.nome,
      descricao: setorFrontend.descricao || null
    };
  }

  async listar() {
    try {
      const response = await this.apiClient.get<SetoresListResponse>('/setores/');
      
      if (response.success && response.data) {
        // Converter todos os itens
        const itemsConvertidos = response.data.items.map(item => 
          this.converterParaFrontend(item)
        );
        
        return {
          success: true,
          data: {
            ...response.data,
            items: itemsConvertidos
          }
        };
      }
      
      return response;
    } catch (error) {
      console.error('Erro ao listar setores:', error);
      return {
        success: false,
        error: 'Erro ao carregar setores'
      };
    }
  }

  async criar(dados: SetorFormData) {
    try {
      const dadosBackend = this.converterParaBackend(dados);
      const response = await this.apiClient.post<SetorBackend>('/setores/', dadosBackend);
      
      if (response.success && response.data) {
        return {
          success: true,
          data: this.converterParaFrontend(response.data)
        };
      }
      
      return response;
    } catch (error) {
      console.error('Erro ao criar setor:', error);
      return {
        success: false,
        error: 'Erro ao criar setor'
      };
    }
  }

  async atualizar(id: string, dados: SetorFormData) {
    try {
      const dadosBackend = this.converterParaBackend(dados);
      const response = await this.apiClient.put<SetorBackend>(`/setores/${id}`, dadosBackend);
      
      if (response.success && response.data) {
        return {
          success: true,
          data: this.converterParaFrontend(response.data)
        };
      }
      
      return response;
    } catch (error) {
      console.error('Erro ao atualizar setor:', error);
      return {
        success: false,
        error: 'Erro ao atualizar setor'
      };
    }
  }

  async excluir(id: string) {
    try {
      const response = await this.apiClient.delete(`/setores/${id}`);
      return response;
    } catch (error) {
      console.error('Erro ao excluir setor:', error);
      return {
        success: false,
        error: 'Erro ao excluir setor'
      };
    }
  }
}

export const setoresService = new SetoresService();