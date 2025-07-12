/**
 * SERVIÇO DE CLIENTES COM AUTENTICAÇÃO JWT
 * Conecta com o backend FastAPI para operações CRUD de clientes
 * CORRIGIDO: Agora usa apiClient centralizado com autenticação (padrão Empresas)
 */

import { API_CONFIG, logConfig } from '@/lib/config';
import { apiClient } from './api-client';
import type { Cliente, ClienteFormData, FiltrosCliente } from '@/types/cliente';

// Tipos para as requisições (alinhados com backend)
export interface ClienteAPI {
  id: string;
  nome: string;
  cpf_cnpj?: string;
  rg_ie?: string;
  email?: string;
  telefone?: string;
  tipo_venda: 'NORMAL' | 'FUTURA';
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  procedencia_id?: string;
  vendedor_id?: string;
  observacoes?: string;
  loja_id: string;
  vendedor_nome?: string;
  procedencia?: string;
  created_at: string;
  updated_at: string;
}

export interface ClienteCreatePayload {
  nome: string;
  cpf_cnpj?: string;
  rg_ie?: string;
  email?: string;
  telefone?: string;
  tipo_venda: 'NORMAL' | 'FUTURA';
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  procedencia_id?: string;
  vendedor_id?: string;
  observacoes?: string;
}

export interface ClienteUpdatePayload {
  nome?: string;
  cpf_cnpj?: string;
  rg_ie?: string;
  email?: string;
  telefone?: string;
  tipo_venda?: 'NORMAL' | 'FUTURA';
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  procedencia_id?: string;
  vendedor_id?: string;
  observacoes?: string;
}

export interface ClienteListResponse {
  items: ClienteAPI[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Classe para serviço de clientes usando apiClient centralizado
class ClienteService {
  constructor() {
    logConfig('ClienteService inicializado usando apiClient centralizado');
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
   * Lista clientes com filtros e paginação
   */
  async listar(filtros?: FiltrosCliente): Promise<{ success: boolean; data?: ClienteListResponse; error?: string }> {
    try {
      logConfig('📡 Listando clientes via API...', { filtros });
      
      // Garantir que o token mais recente seja usado
      apiClient.refreshAuthFromStorage();
      
      const response = await apiClient.listarClientes(filtros);

      if (response.success && response.data) {
        logConfig('✅ Clientes carregados via API');
        return this.convertApiResponse<ClienteListResponse>(response);
      } else {
        throw new Error(response.error || 'Erro ao carregar clientes');
      }
    } catch (error: any) {
      logConfig('❌ Erro ao listar clientes:', error.message);
      return {
        success: false,
        error: error.message || 'Erro ao carregar clientes'
      };
    }
  }

  /**
   * Busca um cliente específico por ID
   */
  async buscarPorId(id: string): Promise<{ success: boolean; data?: ClienteAPI; error?: string }> {
    try {
      logConfig('📡 Buscando cliente via API...', { id });
      
      const response = await apiClient.buscarClientePorId(id);

      if (response.success && response.data) {
        logConfig('✅ Cliente encontrado via API');
        return this.convertApiResponse<ClienteAPI>(response);
      } else {
        throw new Error(response.error || 'Cliente não encontrado');
      }
    } catch (error: any) {
      logConfig('❌ Erro ao buscar cliente:', error.message);
      return {
        success: false,
        error: error.message || 'Erro ao buscar cliente'
      };
    }
  }

  /**
   * Cria um novo cliente
   */
  async criar(dados: ClienteFormData): Promise<{ success: boolean; data?: ClienteAPI; error?: string }> {
    try {
      logConfig('📡 Criando cliente via API...', { nome: dados.nome });
      const payload = converterClienteFormDataParaPayload(dados);
      const response = await apiClient.criarCliente(payload);
      
      if (response.success && response.data) {
        logConfig('✅ Cliente criado via API');
        return this.convertApiResponse<ClienteAPI>(response);
      } else {
        throw new Error(response.error || 'Erro ao criar cliente');
      }
    } catch (error: any) {
      logConfig('❌ Erro ao criar cliente:', error.message);
      return {
        success: false,
        error: error.message || 'Erro ao criar cliente'
      };
    }
  }

  /**
   * Atualiza um cliente existente
   */
  async atualizar(id: string, dados: ClienteUpdatePayload): Promise<{ success: boolean; data?: ClienteAPI; error?: string }> {
    try {
      logConfig('📡 Atualizando cliente via API...', { id });
      
      const response = await apiClient.atualizarCliente(id, dados);

      if (response.success && response.data) {
        logConfig('✅ Cliente atualizado via API');
        return this.convertApiResponse<ClienteAPI>(response);
      } else {
        throw new Error(response.error || 'Erro ao atualizar cliente');
      }
    } catch (error: any) {
      logConfig('❌ Erro ao atualizar cliente:', error.message);
      return {
        success: false,
        error: error.message || 'Erro ao atualizar cliente'
      };
    }
  }

  /**
   * Exclui um cliente (soft delete)
   */
  async excluir(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      logConfig('📡 Excluindo cliente via API...', { id });
      
      const response = await apiClient.excluirCliente(id);

      if (response.success) {
        logConfig('✅ Cliente excluído via API');
        return {
          success: true
        };
      } else {
        throw new Error(response.error || 'Erro ao excluir cliente');
      }
    } catch (error: any) {
      logConfig('❌ Erro ao excluir cliente:', error.message);
      return {
        success: false,
        error: error.message || 'Erro ao excluir cliente'
      };
    }
  }

  /**
   * Verifica se um CPF/CNPJ está disponível
   */
  async verificarCpfCnpj(cpfCnpj: string, clienteId?: string): Promise<{ success: boolean; data?: { disponivel: boolean; cpf_cnpj: string }; error?: string }> {
    try {
      const response = await apiClient.verificarCpfCnpjCliente(cpfCnpj, clienteId);

      if (response.success && response.data) {
        return this.convertApiResponse<{ disponivel: boolean; cpf_cnpj: string }>(response);
      } else {
        throw new Error(response.error || 'Erro ao verificar CPF/CNPJ');
      }
    } catch (error: any) {
      logConfig('❌ Erro ao verificar CPF/CNPJ:', error.message);
      return {
        success: false,
        error: error.message || 'Erro ao verificar CPF/CNPJ'
      };
    }
  }

  /**
   * Teste de conectividade (endpoint público)
   */
  async testePublico(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await apiClient.testePublicoClientes();

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
export const clienteService = new ClienteService();

// Funções de conversão entre tipos do frontend e backend
export function converterClienteAPIParaFrontend(clienteAPI: ClienteAPI): Cliente {
  return {
    id: clienteAPI.id,
    nome: clienteAPI.nome,
    cpf_cnpj: clienteAPI.cpf_cnpj,
    rg_ie: clienteAPI.rg_ie,
    email: clienteAPI.email,
    telefone: clienteAPI.telefone,
    tipo_venda: clienteAPI.tipo_venda,
    logradouro: clienteAPI.logradouro,
    numero: clienteAPI.numero,
    complemento: clienteAPI.complemento,
    bairro: clienteAPI.bairro,
    cidade: clienteAPI.cidade,
    uf: clienteAPI.uf,
    cep: clienteAPI.cep,
    endereco: clienteAPI.logradouro, // Compatibilidade
    procedencia_id: clienteAPI.procedencia_id,
    vendedor_id: clienteAPI.vendedor_id,
    loja_id: clienteAPI.loja_id,
    vendedor_nome: clienteAPI.vendedor_nome,
    procedencia: clienteAPI.procedencia,
    observacoes: clienteAPI.observacoes,
    created_at: clienteAPI.created_at,
    updated_at: clienteAPI.updated_at
  };
}

export function converterClienteFormDataParaPayload(formData: ClienteFormData): ClienteCreatePayload {
  return {
    nome: formData.nome,
    cpf_cnpj: formData.cpf_cnpj || undefined,
    rg_ie: formData.rg_ie || undefined,
    email: formData.email || undefined,
    telefone: formData.telefone || undefined,
    tipo_venda: formData.tipo_venda,
    logradouro: formData.logradouro || undefined,
    numero: formData.numero || undefined,
    complemento: formData.complemento || undefined,
    bairro: formData.bairro || undefined,
    cidade: formData.cidade || undefined,
    uf: formData.uf || undefined,
    cep: formData.cep || undefined,
    procedencia_id: formData.procedencia_id || undefined,
    vendedor_id: formData.vendedor_id || undefined,
    observacoes: formData.observacoes || undefined
  };
}

// Log de inicialização
logConfig('🚀 ClienteService carregado com autenticação própria');