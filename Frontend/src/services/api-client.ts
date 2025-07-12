/**
 * SERVIÇO API UNIFICADO - MIGRAÇÃO FRONTEND→BACKEND
 * Centraliza todas as comunicações com a API backend
 * Implementa fallback automático para mocks em caso de falha
 */

import { API_CONFIG, FRONTEND_CONFIG, logConfig } from '@/lib/config';
import type { Cliente, ClienteFormData, FiltrosCliente } from '@/types/cliente';
import type { ConfiguracaoLoja, ConfiguracaoLojaFormData, StatusOrcamento, StatusOrcamentoFormData } from '@/types/sistema';

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
  vendedor?: { id: string; nome: string } | null;
  procedencia?: { id: string; nome: string } | null;
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
    this.initializeAuth();
    
    logConfig('ApiClient inicializado', { 
      baseURL: this.baseURL,
      hasAuthToken: !!this.authToken 
    });
  }

  // Inicializar autenticação
  private initializeAuth() {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('fluyt_auth_token');
      if (storedToken) {
        this.authToken = storedToken;
        logConfig('🔑 Token de autenticação carregado do localStorage');
      }
    }
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

  // Forçar recarregamento do token do localStorage
  refreshAuthFromStorage() {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('fluyt_auth_token');
      if (storedToken !== this.authToken) {
        this.authToken = storedToken;
        console.log('🔄 Token recarregado do localStorage:', !!storedToken);
      }
    }
  }

  // Headers com autenticação
  private getHeaders(): Record<string, string> {
    const headers = { ...this.defaultHeaders };
    
    // Sempre tentar carregar token mais recente do localStorage
    if (typeof window !== 'undefined') {
      const currentToken = localStorage.getItem('fluyt_auth_token');
      if (currentToken && currentToken !== this.authToken) {
        this.authToken = currentToken;
        console.log('🔄 Token atualizado do localStorage');
      }
    }
    
    // Adicionar token de autenticação se disponível
    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
      console.log('🔑 Enviando requisição com token de autenticação');
    } else {
      console.warn('⚠️ Nenhum token de autenticação disponível');
    }
    
    return headers;
  }

  // Método base para requests
  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false
  ): Promise<ApiResponse<T>> {

    
    const url = `${this.baseURL}${endpoint}`;

    // Define o método padrão como GET se não for especificado
    const method = options.method || 'GET';

    const requestOptions: RequestInit = {
      ...options,
      method: method,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
      signal: AbortSignal.timeout(this.timeout),
    };

    // ✨ FIX: Desativa o cache para todas as requisições GET para garantir dados frescos.
    if (method === 'GET') {
      requestOptions.cache = 'no-store';
    }

    // 🔧 CORREÇÃO: Não enviar body em requisições GET
    if (method === 'GET') {
      delete requestOptions.body;
    }

    // 🔧 DEBUG LOGS SIMPLIFICADOS (apenas em desenvolvimento)
    if (FRONTEND_CONFIG.FEATURES.DEBUG_API) {
      console.log(`🌐 ${options.method || 'GET'} ${endpoint}`);
    }

    try {
      const response = await fetch(url, requestOptions);
      
      // 🔧 DEBUG RESPONSE SIMPLIFICADO
      if (FRONTEND_CONFIG.FEATURES.DEBUG_API && !response.ok) {
        console.log(`❌ ${response.status} ${response.statusText} - ${endpoint}`);
      }
      
              // Se for 401 e não for retry, tentar renovar token
        if (response.status === 401 && !isRetry && this.authToken) {
          if (FRONTEND_CONFIG.FEATURES.DEBUG_API) {
            console.log('🔄 Token expirado, tentando renovar...');
          }
        
        const refreshed = await this.refreshToken();
        
        if (refreshed) {
          // Tentar novamente com novo token
          return this.request<T>(endpoint, options, true);
        }
      }
      
      if (!response.ok) {
        // Tentar capturar mensagem de erro do corpo da resposta
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        let errorBody = null;
        
        try {
          errorBody = await response.json();
          if (errorBody.message) {
            errorMessage = errorBody.message;
          } else if (errorBody.detail) {
            errorMessage = errorBody.detail;
          }
        } catch (e) {
          // Se falhar ao parsear JSON, usar mensagem padrão
        }
        
        // 🔧 LOG SIMPLIFICADO DE ERRO
        if (FRONTEND_CONFIG.FEATURES.DEBUG_API) {
          console.error(`❌ ${response.status} ${response.statusText} - ${endpoint}`);
        }
        
        // Se for 401 após retry ou sem token, limpar autenticação
        if (response.status === 401) {
          console.log('🚪 Limpando autenticação por 401');
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
        
        throw new Error(errorMessage);
      }

      // 🔧 CORREÇÃO: Verificar se resposta tem conteúdo antes de fazer parse JSON
      let data = null;
      
      if (response.status !== 204 && response.headers.get('content-length') !== '0') {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        }
      }
      
      if (FRONTEND_CONFIG.FEATURES.DEBUG_API) {
        console.log(`✅ ${endpoint} - ${data?.items?.length || 'sucesso'}`);
      }
      
      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      // 🔧 LOG SIMPLIFICADO DE ERRO
      if (FRONTEND_CONFIG.FEATURES.DEBUG_API) {
        console.error(`❌ Erro em ${endpoint}:`, error.message);
      }
      
      // Tratamento específico de erros de rede
      let errorMessage = 'Erro desconhecido';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Timeout: Servidor demorou muito para responder';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Failed to fetch';
        } else if (error.message.includes('NetworkError')) {
          errorMessage = 'NetworkError';
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // ============= MÉTODOS ESPECÍFICOS PARA CLIENTES =============

  // Listar clientes com filtros
  async listarClientes(
    filtros?: FiltrosCliente,
    options?: RequestInit // Adiciona a opção para passar configurações de fetch
  ): Promise<ApiResponse<ApiListResponse<ClienteBackend>>> {
    const params = new URLSearchParams();
    if (filtros) {
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const endpoint = `${API_CONFIG.ENDPOINTS.CLIENTES}?${params.toString()}`;
    return this.request(endpoint, { method: 'GET', ...options }); // Passa as opções para o request base
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
    const endpoint = `/api/v1/procedencias/public`;
    return this.request<Array<{ id: string; nome: string; ativo: boolean }>>(endpoint, {
      method: 'GET',
    });
  }

  // Verificar CPF/CNPJ de cliente
  async verificarCpfCnpjCliente(cpfCnpj: string, clienteId?: string): Promise<ApiResponse<{ disponivel: boolean; cpf_cnpj: string }>> {
    let endpoint = `${API_CONFIG.ENDPOINTS.CLIENTES}/verificar-cpf-cnpj/${encodeURIComponent(cpfCnpj)}`;
    
    if (clienteId) {
      endpoint += `?cliente_id=${clienteId}`;
    }

    return this.request<{ disponivel: boolean; cpf_cnpj: string }>(endpoint);
  }

  // Teste público de clientes
  async testePublicoClientes(): Promise<ApiResponse<any>> {
    const endpoint = `${API_CONFIG.ENDPOINTS.CLIENTES}/test/public`;
    return this.request<any>(endpoint);
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

  // ============= MÉTODOS ESPECÍFICOS PARA LOJAS =============

  // Listar lojas com filtros
  async listarLojas(filtros?: any): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    
    if (filtros?.busca) params.append('busca', filtros.busca);
    if (filtros?.empresa_id) params.append('empresa_id', filtros.empresa_id);
    if (filtros?.gerente_id) params.append('gerente_id', filtros.gerente_id);
    if (filtros?.data_inicio) params.append('data_inicio', filtros.data_inicio);
    if (filtros?.data_fim) params.append('data_fim', filtros.data_fim);
    if (filtros?.page) params.append('page', filtros.page.toString());
    if (filtros?.limit) params.append('limit', filtros.limit.toString());

    let endpoint = API_CONFIG.ENDPOINTS.LOJAS;
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    return this.request<any>(endpoint);
  }

  // Buscar loja por ID
  async buscarLojaPorId(id: string): Promise<ApiResponse<any>> {
    const endpoint = `${API_CONFIG.ENDPOINTS.LOJAS}/${id}`;
    return this.request<any>(endpoint);
  }

  // Criar loja
  async criarLoja(dados: any): Promise<ApiResponse<any>> {
    const endpoint = API_CONFIG.ENDPOINTS.LOJAS;
    return this.request<any>(endpoint, {
      method: 'POST',
      body: JSON.stringify(dados),
    });
  }

  // Atualizar loja
  async atualizarLoja(id: string, dados: any): Promise<ApiResponse<any>> {
    const endpoint = `${API_CONFIG.ENDPOINTS.LOJAS}/${id}`;
    return this.request<any>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(dados),
    });
  }

  // Excluir loja
  async excluirLoja(id: string): Promise<ApiResponse<void>> {
    const endpoint = `${API_CONFIG.ENDPOINTS.LOJAS}/${id}`;
    return this.request<void>(endpoint, {
      method: 'DELETE',
    });
  }

  // Verificar nome de loja
  async verificarNomeLoja(nome: string, lojaId?: string): Promise<ApiResponse<any>> {
    let endpoint = `${API_CONFIG.ENDPOINTS.LOJAS}/verificar-nome/${encodeURIComponent(nome)}`;
    
    if (lojaId) {
      endpoint += `?loja_id=${lojaId}`;
    }

    return this.request<any>(endpoint);
  }

  // Teste público de lojas
  async testePublicoLojas(): Promise<ApiResponse<any>> {
    const endpoint = `${API_CONFIG.ENDPOINTS.LOJAS}/test/public`;
    return this.request<any>(endpoint);
  }

  // ============= MÉTODOS ESPECÍFICOS PARA FUNCIONÁRIOS =============

  // Listar funcionários com filtros
  async listarFuncionarios(filtros?: {
    busca?: string;
    perfil?: string;
    setor_id?: string;
    page?: number;
    limit?: number;
    signal?: AbortSignal;
  }): Promise<ApiResponse<ApiListResponse<any>>> {
    const params = new URLSearchParams();
    
    if (filtros?.busca) params.append('busca', filtros.busca);
    if (filtros?.perfil) params.append('perfil', filtros.perfil);
    if (filtros?.setor_id) params.append('setor_id', filtros.setor_id);
    if (filtros?.page) params.append('page', filtros.page.toString());
    if (filtros?.limit) params.append('limit', filtros.limit.toString());

    let endpoint = API_CONFIG.ENDPOINTS.FUNCIONARIOS;
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    // Passar o signal se fornecido, mas com timeout personalizado
    const options: RequestInit = {
      method: 'GET'
    };
    
    // Se signal foi fornecido, verificar se já está abortado
    if (filtros?.signal) {
      if (filtros.signal.aborted) {
        console.log('🛑 Signal já abortado antes da requisição');
        return {
          success: false,
          error: 'Requisição cancelada',
          timestamp: new Date().toISOString(),
        };
      }
      options.signal = filtros.signal;
      console.log('🔄 Requisição funcionários com AbortSignal');
    }

    return this.request<ApiListResponse<any>>(endpoint, options);
  }

  // Buscar funcionário por ID
  async buscarFuncionarioPorId(id: string): Promise<ApiResponse<any>> {
    const endpoint = `${API_CONFIG.ENDPOINTS.FUNCIONARIOS}/${id}`;
    return this.request<any>(endpoint);
  }

  // Criar funcionário
  async criarFuncionario(dados: any): Promise<ApiResponse<any>> {
    // Converter dados do frontend para backend
    const payload = this.converterFuncionarioParaBackend(dados);
    
    const endpoint = API_CONFIG.ENDPOINTS.FUNCIONARIOS;
    
    return this.request<any>(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Atualizar funcionário
  async atualizarFuncionario(id: string, dados: any): Promise<ApiResponse<any>> {
    // Converter dados do frontend para backend
    const payload = this.converterFuncionarioParaBackend(dados);
    
    const endpoint = `${API_CONFIG.ENDPOINTS.FUNCIONARIOS}/${id}`;
    return this.request<any>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  // Excluir funcionário (soft delete)
  async excluirFuncionario(id: string): Promise<ApiResponse<void>> {
    const endpoint = `${API_CONFIG.ENDPOINTS.FUNCIONARIOS}/${id}`;
    return this.request<void>(endpoint, {
      method: 'DELETE',
    });
  }

  // Verificar nome de funcionário disponível
  async verificarNomeFuncionario(nome: string, funcionarioId?: string): Promise<ApiResponse<{ disponivel: boolean; nome: string }>> {
    let endpoint = `${API_CONFIG.ENDPOINTS.FUNCIONARIOS}/verificar-nome/${encodeURIComponent(nome)}`;
    
    if (funcionarioId) {
      endpoint += `?funcionario_id=${funcionarioId}`;
    }

    return this.request<{ disponivel: boolean; nome: string }>(endpoint);
  }

  // Teste público de equipe
  async testePublicoEquipe(): Promise<ApiResponse<any>> {
    const endpoint = `${API_CONFIG.ENDPOINTS.FUNCIONARIOS}/test/public`;
    return this.request<any>(endpoint);
  }

  // Converter dados do frontend para backend
  private converterFuncionarioParaBackend(dados: any): any {
    const payload: any = {
      nome: dados.nome,
      email: dados.email,
      telefone: dados.telefone,
    };

    // Conversões de campos obrigatórias
    if (dados.tipoFuncionario) {
      payload.perfil = dados.tipoFuncionario;  // tipoFuncionario → perfil
    }
    if (dados.nivelAcesso) {
      payload.nivel_acesso = dados.nivelAcesso;  // camelCase → snake_case
    }
    if (dados.lojaId) {
      payload.loja_id = dados.lojaId;  // camelCase → snake_case
    }
    if (dados.setorId) {
      payload.setor_id = dados.setorId;  // camelCase → snake_case
    }
    if (dados.dataAdmissao) {
      payload.data_admissao = dados.dataAdmissao;  // camelCase → snake_case
    }

    // Campos que não precisam conversão
    if (dados.salario !== undefined) payload.salario = dados.salario;
    if (dados.ativo !== undefined) payload.ativo = dados.ativo;

    // Lógica especial para comissão baseada no perfil
    if (dados.tipoFuncionario === 'VENDEDOR' && dados.comissao) {
      payload.comissao_percentual_vendedor = dados.comissao;
    } else if (dados.tipoFuncionario === 'GERENTE' && dados.comissao) {
      payload.comissao_percentual_gerente = dados.comissao;
    }

    // Mapear configurações para campos separados do banco
    if (dados.configuracoes) {
      if (dados.configuracoes.limiteDesconto) {
        payload.limite_desconto = dados.configuracoes.limiteDesconto;
      }
      if (dados.configuracoes.valorMedicao) {
        payload.valor_medicao = dados.configuracoes.valorMedicao;
      }
      if (dados.configuracoes.minimoGarantido) {
        payload.valor_minimo_garantido = dados.configuracoes.minimoGarantido;
        payload.tem_minimo_garantido = true;
      }
    }

    return payload;
  }

  // ============= MÉTODOS ESPECÍFICOS PARA COMISSÕES =============

  // Listar regras de comissão
  async listarComissoes(filtros?: {
    loja_id?: string;
    tipo_comissao?: string;
    ativo?: boolean;
    busca?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<ApiListResponse<any>>> {
    const params = new URLSearchParams();
    
    if (filtros?.loja_id) params.append('loja_id', filtros.loja_id);
    if (filtros?.tipo_comissao) params.append('tipo_comissao', filtros.tipo_comissao);
    if (filtros?.ativo !== undefined) params.append('ativo', filtros.ativo.toString());
    if (filtros?.busca) params.append('busca', filtros.busca);
    if (filtros?.page) params.append('page', filtros.page.toString());
    if (filtros?.limit) params.append('limit', filtros.limit.toString());

    let endpoint = API_CONFIG.ENDPOINTS.COMISSOES;
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    return this.request<ApiListResponse<any>>(endpoint);
  }

  // Buscar regra por ID
  async buscarComissaoPorId(id: string): Promise<ApiResponse<any>> {
    const endpoint = `${API_CONFIG.ENDPOINTS.COMISSOES}${id}`;
    return this.request<any>(endpoint);
  }

  // Criar nova regra
  async criarComissao(dados: any): Promise<ApiResponse<any>> {
    const endpoint = API_CONFIG.ENDPOINTS.COMISSOES;
    return this.request<any>(endpoint, {
      method: 'POST',
      body: JSON.stringify(dados),
    });
  }

  // Atualizar regra
  async atualizarComissao(id: string, dados: any): Promise<ApiResponse<any>> {
    const endpoint = `${API_CONFIG.ENDPOINTS.COMISSOES}${id}`;
    return this.request<any>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(dados),
    });
  }

  // Excluir regra
  async excluirComissao(id: string): Promise<ApiResponse<void>> {
    // CORREÇÃO: remover barra dupla - COMISSOES já termina com /
    const endpoint = `${API_CONFIG.ENDPOINTS.COMISSOES}${id}`;
    console.log('🗑️ Iniciando DELETE para comissão:', id);
    console.log('🔗 Endpoint completo:', endpoint);
    console.log('🔑 Auth token disponível:', !!this.authToken);
    
    const result = await this.request<void>(endpoint, {
      method: 'DELETE',
    });
    
    console.log('📝 Resultado do DELETE:', result);
    return result;
  }

  // Alternar status
  async alternarStatusComissao(id: string): Promise<ApiResponse<any>> {
    const endpoint = `${API_CONFIG.ENDPOINTS.COMISSOES}${id}/toggle-status`;
    return this.request<any>(endpoint, {
      method: 'PATCH',
    });
  }

  // Calcular comissão
  async calcularComissao(valor: number, tipo_comissao: string, loja_id: string): Promise<ApiResponse<any>> {
    const endpoint = `${API_CONFIG.ENDPOINTS.COMISSOES}calcular`;
    return this.request<any>(endpoint, {
      method: 'POST',
      body: JSON.stringify({ valor, tipo_comissao, loja_id }),
    });
  }

  // ============= MÉTODOS ESPECÍFICOS PARA CONFIG_LOJA =============

  // Listar configurações com filtros
  async listarConfiguracoes(filtros?: { store_id?: string; page?: number; limit?: number }): Promise<ApiResponse<ApiListResponse<any>>> {
    const params = new URLSearchParams();
    
    if (filtros?.store_id) params.append('store_id', filtros.store_id);
    if (filtros?.page) params.append('page', filtros.page.toString());
    if (filtros?.limit) params.append('limit', filtros.limit.toString());

    let endpoint = '/api/v1/config-loja';
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    return this.request<ApiListResponse<any>>(endpoint);
  }

  // Obter configuração por loja
  async obterConfiguracaoPorLoja(storeId: string): Promise<ApiResponse<any>> {
    const endpoint = `/api/v1/config-loja/loja/${storeId}`;
    return this.request<any>(endpoint);
  }

  // Criar configuração padrão para loja
  async criarConfiguracaoPadrao(storeId: string): Promise<ApiResponse<any>> {
    const endpoint = `/api/v1/config-loja/loja/${storeId}/padrao`;
    return this.request<any>(endpoint, {
      method: 'POST',
    });
  }

  // Criar nova configuração
  async criarConfiguracao(dados: ConfiguracaoLojaFormData): Promise<ApiResponse<any>> {
    const payload = this.mapearConfigLojaParaBackend(dados);
    const endpoint = '/api/v1/config-loja';
    return this.request<any>(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Atualizar configuração existente
  async atualizarConfiguracao(configId: string, dados: Partial<ConfiguracaoLojaFormData>): Promise<ApiResponse<any>> {
    const payload = this.mapearConfigLojaParaBackend(dados);
    const endpoint = `/api/v1/config-loja/${configId}`;
    return this.request<any>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  // Excluir configuração
  async excluirConfiguracao(configId: string): Promise<ApiResponse<void>> {
    const endpoint = `/api/v1/config-loja/${configId}`;
    return this.request<void>(endpoint, {
      method: 'DELETE',
    });
  }

  // Verificar se store já possui configuração
  async verificarStoreConfiguracao(storeId: string): Promise<ApiResponse<any>> {
    const endpoint = `/api/v1/config-loja/verificar-store/${storeId}`;
    return this.request<any>(endpoint);
  }

  // Mapear dados do frontend para backend (camelCase → snake_case)
  private mapearConfigLojaParaBackend(dados: Partial<ConfiguracaoLojaFormData>): any {
    const payload: any = {};

    if (dados.storeId !== undefined) payload.store_id = dados.storeId;
    if (dados.discountLimitVendor !== undefined) payload.discount_limit_vendor = dados.discountLimitVendor;
    if (dados.discountLimitManager !== undefined) payload.discount_limit_manager = dados.discountLimitManager;
    if (dados.discountLimitAdminMaster !== undefined) payload.discount_limit_admin_master = dados.discountLimitAdminMaster;
    if (dados.defaultMeasurementValue !== undefined) payload.default_measurement_value = dados.defaultMeasurementValue;
    if (dados.freightPercentage !== undefined) payload.freight_percentage = dados.freightPercentage;
    if (dados.assemblyPercentage !== undefined) payload.assembly_percentage = dados.assemblyPercentage;
    if (dados.executiveProjectPercentage !== undefined) payload.executive_project_percentage = dados.executiveProjectPercentage;
    if (dados.initialNumber !== undefined) payload.initial_number = dados.initialNumber;
    if (dados.numberFormat !== undefined) payload.number_format = dados.numberFormat;
    if (dados.numberPrefix !== undefined) payload.number_prefix = dados.numberPrefix;

    return payload;
  }

  // Mapear dados do backend para frontend (snake_case → camelCase)
  private mapearConfigLojaParaFrontend(dados: any): ConfiguracaoLoja {
    return {
      storeId: dados.store_id,
      storeName: dados.store_name || dados.loja_nome || 'Loja Desconhecida',
      discountLimitVendor: dados.discount_limit_vendor,
      discountLimitManager: dados.discount_limit_manager,
      discountLimitAdminMaster: dados.discount_limit_admin_master,
      defaultMeasurementValue: dados.default_measurement_value,
      freightPercentage: dados.freight_percentage,
      assemblyPercentage: dados.assembly_percentage,
      executiveProjectPercentage: dados.executive_project_percentage,
      initialNumber: dados.initial_number,
      numberFormat: dados.number_format,
      numberPrefix: dados.number_prefix,
      updatedAt: dados.updated_at || dados.updated_at || new Date().toISOString().split('T')[0],
    };
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

  // ============= MÉTODOS ESPECÍFICOS PARA PROCEDÊNCIAS =============

  // Listar procedências
  async listarProcedencias(apenasAtivas = true): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    params.append('apenas_ativas', apenasAtivas.toString());
    
    const endpoint = `/api/v1/procedencias?${params.toString()}`;
    return this.request<any>(endpoint);
  }

  // Buscar procedência por ID
  async buscarProcedenciaPorId(id: string): Promise<ApiResponse<any>> {
    const endpoint = `/api/v1/procedencias/${id}`;
    return this.request<any>(endpoint);
  }

  // Criar procedência
  async criarProcedencia(dados: any): Promise<ApiResponse<any>> {
    const endpoint = `/api/v1/procedencias`;
    return this.request<any>(endpoint, {
      method: 'POST',
      body: JSON.stringify(dados),
    });
  }

  // Atualizar procedência
  async atualizarProcedencia(id: string, dados: any): Promise<ApiResponse<any>> {
    const endpoint = `/api/v1/procedencias/${id}`;
    return this.request<any>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(dados),
    });
  }

  // Excluir procedência (soft delete)
  async excluirProcedencia(id: string): Promise<ApiResponse<void>> {
    const endpoint = `/api/v1/procedencias/${id}`;
    return this.request<void>(endpoint, {
      method: 'DELETE',
    });
  }

  // Buscar procedências por nome
  async buscarProcedenciasPorNome(termo: string): Promise<ApiResponse<any>> {
    const endpoint = `/api/v1/procedencias/buscar/${encodeURIComponent(termo)}`;
    return this.request<any>(endpoint);
  }

  // ============= MÉTODOS ESPECÍFICOS PARA STATUS ORÇAMENTO =============

  // Listar status de orçamento
  async listarStatusOrcamento(apenasAtivos = true): Promise<ApiResponse<ApiListResponse<StatusOrcamento>>> {
    const params = new URLSearchParams();
    params.append('apenas_ativos', apenasAtivos.toString());
    
    const endpoint = `${API_CONFIG.ENDPOINTS.STATUS_ORCAMENTO}?${params.toString()}`;
    return this.request<ApiListResponse<StatusOrcamento>>(endpoint);
  }

  // Buscar status por ID
  async buscarStatusOrcamentoPorId(id: string): Promise<ApiResponse<StatusOrcamento>> {
    const endpoint = `${API_CONFIG.ENDPOINTS.STATUS_ORCAMENTO}/${id}`;
    return this.request<StatusOrcamento>(endpoint);
  }

  // Criar novo status
  async criarStatusOrcamento(dados: StatusOrcamentoFormData): Promise<ApiResponse<StatusOrcamento>> {
    const endpoint = API_CONFIG.ENDPOINTS.STATUS_ORCAMENTO;
    return this.request<StatusOrcamento>(endpoint, {
      method: 'POST',
      body: JSON.stringify(dados),
    });
  }

  // Atualizar status
  async atualizarStatusOrcamento(id: string, dados: Partial<StatusOrcamentoFormData>): Promise<ApiResponse<StatusOrcamento>> {
    const endpoint = `${API_CONFIG.ENDPOINTS.STATUS_ORCAMENTO}/${id}`;
    return this.request<StatusOrcamento>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(dados),
    });
  }

  // Excluir status (soft delete)
  async excluirStatusOrcamento(id: string): Promise<ApiResponse<void>> {
    const endpoint = `${API_CONFIG.ENDPOINTS.STATUS_ORCAMENTO}/${id}`;
    return this.request<void>(endpoint, {
      method: 'DELETE',
    });
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
    procedencia: clienteBackend.procedencia?.nome || null,
    vendedor_nome: clienteBackend.vendedor_nome || null,
    observacoes: clienteBackend.observacoes,
    status_id: null, // Campo será definido pelos hooks
    created_at: clienteBackend.created_at,
    updated_at: clienteBackend.updated_at,
  };
}

// Converter dados do formulário para payload do backend
export function converterFormDataParaPayload(formData: ClienteFormData): ClienteCreatePayload {
  // Filtrar IDs temporários (não são UUIDs válidos) e valores vazios
  const procedencia_id = formData.procedencia_id?.startsWith('temp-') ? undefined : (formData.procedencia_id || undefined);
  const vendedor_id = formData.vendedor_id?.startsWith('v') ? undefined : (formData.vendedor_id || undefined);
  
  // Criar payload base apenas com campos obrigatórios
  const payload: ClienteCreatePayload = {
    nome: formData.nome,
    tipo_venda: formData.tipo_venda,
  };

  // Adicionar campos opcionais apenas se tiverem valor
  if (formData.cpf_cnpj && formData.cpf_cnpj.trim()) payload.cpf_cnpj = formData.cpf_cnpj;
  if (formData.rg_ie && formData.rg_ie.trim()) payload.rg_ie = formData.rg_ie;
  if (formData.email && formData.email.trim()) payload.email = formData.email;
  if (formData.telefone && formData.telefone.trim()) payload.telefone = formData.telefone;
  if (formData.logradouro && formData.logradouro.trim()) payload.logradouro = formData.logradouro;
  if (formData.numero && formData.numero.trim()) payload.numero = formData.numero;
  if (formData.complemento && formData.complemento.trim()) payload.complemento = formData.complemento;
  if (formData.bairro && formData.bairro.trim()) payload.bairro = formData.bairro;
  if (formData.cidade && formData.cidade.trim()) payload.cidade = formData.cidade;
  if (formData.uf && formData.uf.trim()) payload.uf = formData.uf;
  if (formData.cep && formData.cep.trim()) payload.cep = formData.cep;
  if (procedencia_id && procedencia_id.trim()) payload.procedencia_id = procedencia_id;
  if (vendedor_id && vendedor_id.trim()) payload.vendedor_id = vendedor_id;
  if (formData.observacoes && formData.observacoes.trim()) payload.observacoes = formData.observacoes;

  return payload;
}

// ============= INSTÂNCIA SINGLETON =============

export const apiClient = new ApiClient();

// Exportar a classe também para uso direto
export { ApiClient };

// ============= LOGS DE INICIALIZAÇÃO =============

logConfig('🚀 ApiClient carregado e configurado');
logConfig('📡 Base URL:', API_CONFIG.BASE_URL);
logConfig('🔧 Timeout:', API_CONFIG.REQUEST_TIMEOUT);
logConfig('🏳️ Use Real API:', FRONTEND_CONFIG.FEATURES.USE_REAL_API);