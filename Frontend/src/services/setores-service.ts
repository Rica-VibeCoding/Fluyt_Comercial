import { ApiClientStable } from '@/lib/api-client-stable';
import type { Setor, SetorFormData } from '@/types/sistema';

interface SetorBackend {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  total_funcionarios: number;
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
  // ✅ CORREÇÃO: ApiClientStable tem métodos estáticos, não precisa de instância
  constructor() {
    // Removido: this.apiClient = new ApiClientStable();
  }

  // Converter do backend para frontend
  private converterParaFrontend(setorBackend: SetorBackend): Setor {
    return {
      id: setorBackend.id,
      nome: setorBackend.nome,
      descricao: setorBackend.descricao || '',
      ativo: setorBackend.ativo,
      funcionarios: setorBackend.total_funcionarios,
      createdAt: setorBackend.created_at,
      updatedAt: setorBackend.updated_at
    };
  }

  // Converter do frontend para backend
  private converterParaBackend(setorFrontend: SetorFormData): any {
    return {
      nome: setorFrontend.nome,
      descricao: setorFrontend.descricao?.trim() || null
    };
  }

  async listar() {
    try {
      // ✅ CORREÇÃO: Usar método estático
      const response = await ApiClientStable.get<SetoresListResponse>('/setores');
      
      if (response.success && response.data) {
        const setoresConvertidos = response.data.items.map(setor => 
          this.converterParaFrontend(setor)
        );
        
        return {
          success: true,
          data: {
            items: setoresConvertidos,
            total: response.data.total,
            page: response.data.page,
            limit: response.data.limit,
            pages: response.data.pages
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
      // ✅ CORREÇÃO: Usar método estático
      const response = await ApiClientStable.post<SetorBackend>('/setores/', dadosBackend);
      
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
      // ✅ CORREÇÃO: Usar método estático
      const response = await ApiClientStable.put<SetorBackend>(`/setores/${id}`, dadosBackend);
      
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
      // ✅ CORREÇÃO: Usar método estático
      const response = await ApiClientStable.delete(`/setores/${id}`);
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