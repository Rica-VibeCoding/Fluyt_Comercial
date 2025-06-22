/**
 * Serviço de API para Empresas
 * Conecta com o backend FastAPI para operações CRUD de empresas
 * CORRIGIDO: Agora usa apiClient centralizado com autenticação
 */

import { API_CONFIG, logConfig } from '@/lib/config';
import { apiClient } from './api-client';

// Tipos para as requisições (alinhados com backend)
export interface EmpresaAPI {
  id: string;
  nome: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  ativo: boolean;
  total_lojas: number;
  lojas_ativas: number;
  created_at: string;
  updated_at: string;
}

export interface EmpresaCreatePayload {
  nome: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
}

export interface EmpresaUpdatePayload {
  nome?: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  ativo?: boolean;
}

export interface EmpresaListResponse {
  items: EmpresaAPI[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface EmpresaFiltros {
  busca?: string;
  data_inicio?: string;
  data_fim?: string;
  page?: number;
  limit?: number;
}

// Classe para serviço de empresas usando apiClient centralizado
class EmpresaService {
  constructor() {
    logConfig('EmpresaService inicializado usando apiClient centralizado');
  }

  // Método helper para converter resposta do apiClient para formato esperado
  private convertApiResponse<T>(response: any): { success: boolean; data?: T; error?: string } {
    return {
      success: response.success,
      data: response.data,
      error: response.error
    };
  }

  /**
   * Lista empresas com filtros e paginação
   */
  async listar(filtros: EmpresaFiltros = {}): Promise<{ success: boolean; data?: EmpresaListResponse; error?: string }> {
    try {
      logConfig('📡 Listando empresas via API...', { filtros });
      
      // Construir endpoint com parâmetros
      const params = new URLSearchParams();
      
      if (filtros.busca) params.append('busca', filtros.busca);
      if (filtros.data_inicio) params.append('data_inicio', filtros.data_inicio);
      if (filtros.data_fim) params.append('data_fim', filtros.data_fim);
      if (filtros.page) params.append('page', filtros.page.toString());
      if (filtros.limit) params.append('limit', filtros.limit.toString());

      let endpoint = API_CONFIG.ENDPOINTS.EMPRESAS;
      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }

      const response = await apiClient.listarEmpresas(filtros);

      if (response.success && response.data) {
        logConfig('✅ Empresas carregadas via API');
        return this.convertApiResponse<EmpresaListResponse>(response);
      } else {
        throw new Error(response.error || 'Erro ao carregar empresas');
      }
    } catch (error: any) {
      logConfig('❌ Erro ao listar empresas:', error.message);
      return {
        success: false,
        error: error.message || 'Erro ao carregar empresas'
      };
    }
  }

  /**
   * Busca uma empresa específica por ID
   */
  async buscarPorId(id: string): Promise<{ success: boolean; data?: EmpresaAPI; error?: string }> {
    try {
      logConfig('📡 Buscando empresa via API...', { id });
      
      const response = await apiClient.buscarEmpresaPorId(id);

      if (response.success && response.data) {
        logConfig('✅ Empresa encontrada via API');
        return this.convertApiResponse<EmpresaAPI>(response);
      } else {
        throw new Error(response.error || 'Empresa não encontrada');
      }
    } catch (error: any) {
      logConfig('❌ Erro ao buscar empresa:', error.message);
      return {
        success: false,
        error: error.message || 'Erro ao buscar empresa'
      };
    }
  }

  /**
   * Cria uma nova empresa
   */
  async criar(dados: EmpresaCreatePayload): Promise<{ success: boolean; data?: EmpresaAPI; error?: string }> {
    try {
      logConfig('📡 Criando empresa via API...', { nome: dados.nome });
      
      const response = await apiClient.criarEmpresa(dados);

      if (response.success && response.data) {
        logConfig('✅ Empresa criada via API');
        return this.convertApiResponse<EmpresaAPI>(response);
      } else {
        throw new Error(response.error || 'Erro ao criar empresa');
      }
    } catch (error: any) {
      logConfig('❌ Erro ao criar empresa:', error.message);
      return {
        success: false,
        error: error.message || 'Erro ao criar empresa'
      };
    }
  }

  /**
   * Atualiza uma empresa existente
   */
  async atualizar(id: string, dados: EmpresaUpdatePayload): Promise<{ success: boolean; data?: EmpresaAPI; error?: string }> {
    try {
      logConfig('📡 Atualizando empresa via API...', { id });
      
      const response = await apiClient.atualizarEmpresa(id, dados);

      if (response.success && response.data) {
        logConfig('✅ Empresa atualizada via API');
        return this.convertApiResponse<EmpresaAPI>(response);
      } else {
        throw new Error(response.error || 'Erro ao atualizar empresa');
      }
    } catch (error: any) {
      logConfig('❌ Erro ao atualizar empresa:', error.message);
      return {
        success: false,
        error: error.message || 'Erro ao atualizar empresa'
      };
    }
  }

  /**
   * Exclui uma empresa (soft delete)
   */
  async excluir(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      logConfig('📡 Excluindo empresa via API...', { id });
      
      const response = await apiClient.excluirEmpresa(id);

      if (response.success) {
        logConfig('✅ Empresa excluída via API');
        return {
          success: true
        };
      } else {
        throw new Error(response.error || 'Erro ao excluir empresa');
      }
    } catch (error: any) {
      logConfig('❌ Erro ao excluir empresa:', error.message);
      return {
        success: false,
        error: error.message || 'Erro ao excluir empresa'
      };
    }
  }

  /**
   * Verifica se um CNPJ está disponível
   */
  async verificarCNPJ(cnpj: string, empresaId?: string): Promise<{ success: boolean; data?: { disponivel: boolean; cnpj: string }; error?: string }> {
    try {
      const response = await apiClient.verificarCNPJEmpresa(cnpj, empresaId);

      if (response.success && response.data) {
        return this.convertApiResponse<{ disponivel: boolean; cnpj: string }>(response);
      } else {
        throw new Error(response.error || 'Erro ao verificar CNPJ');
      }
    } catch (error: any) {
      logConfig('❌ Erro ao verificar CNPJ:', error.message);
      return {
        success: false,
        error: error.message || 'Erro ao verificar CNPJ'
      };
    }
  }

  /**
   * Verifica se um nome está disponível
   */
  async verificarNome(nome: string, empresaId?: string): Promise<{ success: boolean; data?: { disponivel: boolean; nome: string }; error?: string }> {
    try {
      const response = await apiClient.verificarNomeEmpresa(nome, empresaId);

      if (response.success && response.data) {
        return this.convertApiResponse<{ disponivel: boolean; nome: string }>(response);
      } else {
        throw new Error(response.error || 'Erro ao verificar nome');
      }
    } catch (error: any) {
      logConfig('❌ Erro ao verificar nome:', error.message);
      return {
        success: false,
        error: error.message || 'Erro ao verificar nome'
      };
    }
  }

  /**
   * Teste de conectividade (endpoint público)
   */
  async testePublico(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await apiClient.testePublicoEmpresas();

      if (response.success) {
        return this.convertApiResponse<any>(response);
      } else {
        throw new Error(response.error || 'Erro no teste de conectividade');
      }
    } catch (error: any) {
      logConfig('❌ Erro no teste público:', error.message);
      return {
        success: false,
        error: error.message || 'Erro no teste de conectividade'
      };
    }
  }
}

// Instância singleton
export const empresaService = new EmpresaService();

// Funções de conversão entre tipos do frontend e backend
export function converterEmpresaAPIParaFrontend(empresaAPI: EmpresaAPI): {
  id: string;
  nome: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  ativo: boolean;
  total_lojas: number;
  lojas_ativas: number;
  createdAt: string;
  updatedAt?: string;
} {
  return {
    id: empresaAPI.id,
    nome: empresaAPI.nome,
    cnpj: empresaAPI.cnpj,
    email: empresaAPI.email,
    telefone: empresaAPI.telefone,
    endereco: empresaAPI.endereco,
    ativo: empresaAPI.ativo,
    total_lojas: empresaAPI.total_lojas,
    lojas_ativas: empresaAPI.lojas_ativas,
    createdAt: empresaAPI.created_at,
    updatedAt: empresaAPI.updated_at
  };
}

export function converterEmpresaFormDataParaPayload(formData: {
  nome: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
}): EmpresaCreatePayload {
  return {
    nome: formData.nome,
    cnpj: formData.cnpj || undefined,
    email: formData.email || undefined,
    telefone: formData.telefone || undefined,
    endereco: formData.endereco || undefined
  };
}

// Log de inicialização
logConfig('🚀 EmpresaService carregado com autenticação própria'); 