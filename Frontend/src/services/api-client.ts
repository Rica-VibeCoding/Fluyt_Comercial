/**
 * SERVIÇO API UNIFICADO - MIGRAÇÃO FRONTEND→BACKEND
 * Centraliza todas as comunicações com a API backend
 * Implementa fallback automático para mocks em caso de falha
 */

import { API_CONFIG, FRONTEND_CONFIG, logConfig } from '@/lib/config';
import type { Cliente, ClienteFormData, FiltrosCliente } from '@/types/cliente';

// ============= TIPOS ALINHADOS COM BACKEND =============

export interface ClienteBackend {
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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  fallback?: boolean; // Indica se foi usado fallback para dados locais
  timestamp: string;
}

export interface ApiListResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ============= CONFIGURAÇÕES DO CLIENTE API =============

class ApiClient {
  private readonly baseURL: string;
  private readonly timeout: number;
  private readonly defaultHeaders: Record<string, string>;
  private authToken: string | null = null;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.REQUEST_TIMEOUT;
    this.defaultHeaders = { ...API_CONFIG.DEFAULT_HEADERS };
    
    // Carregar token de autenticação se existir
    if (typeof window !== 'undefined') {
      this.authToken = localStorage.getItem('fluyt_auth_token');
      
      // Se tiver token, verificar se ainda é válido
      if (this.authToken) {
        logConfig('Token de autenticação encontrado no localStorage');
      }
    }
    
    logConfig('ApiClient inicializado', { 
      baseURL: this.baseURL,
      hasAuthToken: !!this.authToken 
    });
  }

  // Configurar token de autenticação
  setAuthToken(token: string | null) {
    this.authToken = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('fluyt_auth_token', token);
      } else {
        localStorage.removeItem('fluyt_auth_token');
      }
    }
    logConfig('Token de autenticação atualizado', { hasToken: !!token });
  }

  // Headers com autenticação
  private getHeaders(): Record<string, string> {
    const headers = { ...this.defaultHeaders };
    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  // Método base para requests
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
      signal: AbortSignal.timeout(this.timeout),
    };

    logConfig('Request iniciada', { 
      method: options.method || 'GET', 
      url,
      hasAuth: !!this.authToken,
      isRetry 
    });

    try {
      const response = await fetch(url, requestOptions);
      
      // Se for 401 e não for retry, tentar renovar token
      if (response.status === 401 && !isRetry && this.authToken) {
        logConfig('Token expirado, tentando renovar...');
        const refreshed = await this.refreshToken();
        
        if (refreshed) {
          // Tentar novamente com novo token
          return this.request<T>(endpoint, options, true);
        }
      }
      
      if (!response.ok) {
        // Se for 401 após retry ou sem token, limpar autenticação
        if (response.status === 401) {
          this.setAuthToken(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('fluyt_refresh_token');
            localStorage.removeItem('fluyt_user');
            // Redirecionar para login se não estiver na página de login
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
          }
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      logConfig('Request bem-sucedida', { status: response.status, url });
      
      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Erro na request:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // ============= MÉTODOS ESPECÍFICOS PARA CLIENTES =============

  // Listar clientes com filtros
  async listarClientes(filtros?: FiltrosCliente): Promise<ApiResponse<ApiListResponse<ClienteBackend>>> {
    const params = new URLSearchParams();
    
    if (filtros?.busca) params.append('busca', filtros.busca);
    if (filtros?.tipo_venda) params.append('tipo_venda', filtros.tipo_venda);
    if (filtros?.procedencia_id) params.append('procedencia_id', filtros.procedencia_id);
    if (filtros?.vendedor_id) params.append('vendedor_id', filtros.vendedor_id);
    if (filtros?.data_inicio) params.append('data_inicio', filtros.data_inicio);
    if (filtros?.data_fim) params.append('data_fim', filtros.data_fim);

    const endpoint = `${API_CONFIG.ENDPOINTS.CLIENTES}?${params.toString()}`;
    return this.request<ApiListResponse<ClienteBackend>>(endpoint);
  }

  // Buscar cliente por ID
  async buscarClientePorId(id: string): Promise<ApiResponse<ClienteBackend>> {
    const endpoint = `${API_CONFIG.ENDPOINTS.CLIENTES}/${id}`;
    return this.request<ClienteBackend>(endpoint);
  }

  // Criar novo cliente
  async criarCliente(dados: ClienteCreatePayload): Promise<ApiResponse<ClienteBackend>> {
    const endpoint = API_CONFIG.ENDPOINTS.CLIENTES;
    return this.request<ClienteBackend>(endpoint, {
      method: 'POST',
      body: JSON.stringify(dados),
    });
  }

  // Atualizar cliente
  async atualizarCliente(id: string, dados: Partial<ClienteCreatePayload>): Promise<ApiResponse<ClienteBackend>> {
    const endpoint = `${API_CONFIG.ENDPOINTS.CLIENTES}/${id}`;
    return this.request<ClienteBackend>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(dados),
    });
  }

  // Excluir cliente
  async excluirCliente(id: string): Promise<ApiResponse<void>> {
    const endpoint = `${API_CONFIG.ENDPOINTS.CLIENTES}/${id}`;
    return this.request<void>(endpoint, {
      method: 'DELETE',
    });
  }

  // Buscar procedências
  async buscarProcedencias(): Promise<ApiResponse<Array<{ id: string; nome: string; ativo: boolean }>>> {
    const endpoint = `${API_CONFIG.ENDPOINTS.CLIENTES}/procedencias`;
    return this.request<Array<{ id: string; nome: string; ativo: boolean }>>(endpoint, {
      method: 'GET',
    });
  }

  // ============= MÉTODOS ESPECÍFICOS PARA EMPRESAS =============

  // Listar empresas
  async listarEmpresas(filtros?: any): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    
    if (filtros?.busca) params.append('busca', filtros.busca);
    if (filtros?.data_inicio) params.append('data_inicio', filtros.data_inicio);
    if (filtros?.data_fim) params.append('data_fim', filtros.data_fim);
    if (filtros?.page) params.append('page', filtros.page.toString());
    if (filtros?.limit) params.append('limit', filtros.limit.toString());

    let endpoint = API_CONFIG.ENDPOINTS.EMPRESAS;
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    return this.request<any>(endpoint);
  }

  // Buscar empresa por ID
  async buscarEmpresaPorId(id: string): Promise<ApiResponse<any>> {
    const endpoint = `${API_CONFIG.ENDPOINTS.EMPRESAS}/${id}`;
    return this.request<any>(endpoint);
  }

  // Criar empresa
  async criarEmpresa(dados: any): Promise<ApiResponse<any>> {
    const endpoint = API_CONFIG.ENDPOINTS.EMPRESAS;
    return this.request<any>(endpoint, {
      method: 'POST',
      body: JSON.stringify(dados),
    });
  }

  // Atualizar empresa
  async atualizarEmpresa(id: string, dados: any): Promise<ApiResponse<any>> {
    const endpoint = `${API_CONFIG.ENDPOINTS.EMPRESAS}/${id}`;
    return this.request<any>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(dados),
    });
  }

  // Excluir empresa
  async excluirEmpresa(id: string): Promise<ApiResponse<void>> {
    const endpoint = `${API_CONFIG.ENDPOINTS.EMPRESAS}/${id}`;
    return this.request<void>(endpoint, {
      method: 'DELETE',
    });
  }

  // Verificar CNPJ
  async verificarCNPJEmpresa(cnpj: string, empresaId?: string): Promise<ApiResponse<any>> {
    let endpoint = `${API_CONFIG.ENDPOINTS.EMPRESAS}/verificar-cnpj/${cnpj}`;
    
    if (empresaId) {
      endpoint += `?empresa_id=${empresaId}`;
    }

    return this.request<any>(endpoint);
  }

  // Verificar nome
  async verificarNomeEmpresa(nome: string, empresaId?: string): Promise<ApiResponse<any>> {
    let endpoint = `${API_CONFIG.ENDPOINTS.EMPRESAS}/verificar-nome/${encodeURIComponent(nome)}`;
    
    if (empresaId) {
      endpoint += `?empresa_id=${empresaId}`;
    }

    return this.request<any>(endpoint);
  }

  // Teste público de empresas
  async testePublicoEmpresas(): Promise<ApiResponse<any>> {
    const endpoint = `${API_CONFIG.ENDPOINTS.EMPRESAS}/test/public`;
    return this.request<any>(endpoint);
  }

  // ============= MÉTODOS DE AUTENTICAÇÃO =============

  // Renovar token de acesso
  private async refreshToken(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    
    const refreshToken = localStorage.getItem('fluyt_refresh_token');
    if (!refreshToken) {
      logConfig('Sem refresh token disponível');
      return false;
    }

    try {
      const response = await fetch(`${this.baseURL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        logConfig('Falha ao renovar token', { status: response.status });
        return false;
      }

      const data = await response.json();
      
      // Salvar novos tokens
      this.setAuthToken(data.access_token);
      localStorage.setItem('fluyt_refresh_token', data.refresh_token);
      
      logConfig('Token renovado com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao renovar token:', error);
      return false;
    }
  }

  // Verificar se usuário está autenticado
  isAuthenticated(): boolean {
    return !!this.authToken;
  }

  // Logout (limpar tokens)
  logout() {
    this.setAuthToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fluyt_refresh_token');
      localStorage.removeItem('fluyt_user');
      // Remover cookie de autenticação
      document.cookie = 'fluyt_auth_token=; path=/; max-age=0';
      window.location.href = '/login';
    }
  }

  // ============= MÉTODOS DE CONECTIVIDADE =============

  // Testar conectividade
  async testarConectividade(): Promise<ApiResponse<any>> {
    return this.request(API_CONFIG.ENDPOINTS.HEALTH);
  }

  // Verificar se backend está disponível
  async isBackendDisponivel(): Promise<boolean> {
    try {
      const result = await this.testarConectividade();
      return result.success;
    } catch {
      return false;
    }
  }
}

// ============= HELPERS DE CONVERSÃO =============

// Converter cliente do backend para tipo frontend
export function converterClienteBackendParaFrontend(clienteBackend: ClienteBackend): Cliente {
  return {
    id: clienteBackend.id,
    nome: clienteBackend.nome,
    cpf_cnpj: clienteBackend.cpf_cnpj,
    rg_ie: clienteBackend.rg_ie,
    email: clienteBackend.email,
    telefone: clienteBackend.telefone,
    tipo_venda: clienteBackend.tipo_venda,
    logradouro: clienteBackend.logradouro,
    numero: clienteBackend.numero,
    complemento: clienteBackend.complemento,
    bairro: clienteBackend.bairro,
    cidade: clienteBackend.cidade,
    uf: clienteBackend.uf,
    cep: clienteBackend.cep,
    endereco: clienteBackend.logradouro || undefined, // Compatibilidade
    procedencia_id: clienteBackend.procedencia_id,
    vendedor_id: clienteBackend.vendedor_id,
    loja_id: clienteBackend.loja_id,
    procedencia: clienteBackend.procedencia,
    vendedor_nome: clienteBackend.vendedor_nome,
    observacoes: clienteBackend.observacoes,
    created_at: clienteBackend.created_at,
    updated_at: clienteBackend.updated_at,
  };
}

// Converter dados do formulário para payload do backend
export function converterFormDataParaPayload(formData: ClienteFormData): ClienteCreatePayload {
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
    observacoes: formData.observacoes || undefined,
  };
}

// ============= INSTÂNCIA SINGLETON =============

export const apiClient = new ApiClient();

// ============= LOGS DE INICIALIZAÇÃO =============

logConfig('🚀 ApiClient carregado e configurado');
logConfig('📡 Base URL:', API_CONFIG.BASE_URL);
logConfig('🔧 Timeout:', API_CONFIG.REQUEST_TIMEOUT);
logConfig('🏳️ Use Real API:', FRONTEND_CONFIG.FEATURES.USE_REAL_API);