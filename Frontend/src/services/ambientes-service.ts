/**
 * SERVIÇO DE AMBIENTES COM INTEGRAÇÃO TOTAL AO BACKEND
 * Implementa estratégia API-first para módulo de ambientes
 * Compatível com estrutura Supabase: c_ambientes + c_ambientes_material
 */

import { API_CONFIG, FRONTEND_CONFIG, logConfig } from '@/lib/config';
import { debugAPI } from '@/lib/debug-api';
import type { 
  Ambiente, 
  AmbienteFormData, 
  AmbienteUpdateData,
  FiltrosAmbiente,
  AmbienteListResponse,
  AmbienteBackend,
  AmbienteMaterial,
  AmbienteMaterialFormData
} from '@/types/ambiente';

// ============= INTERFACE UNIFICADA =============

export interface AmbienteServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  source: 'api';
  timestamp: string;
}

// ============= CONVERSORES BACKEND ↔ FRONTEND =============

function converterAmbienteBackendParaFrontend(ambienteBackend: AmbienteBackend): Ambiente {
  return {
    id: ambienteBackend.id,
    clienteId: ambienteBackend.cliente_id,
    nome: ambienteBackend.nome,
    valorCustoFabrica: ambienteBackend.valor_custo_fabrica,
    valorVenda: ambienteBackend.valor_venda,
    dataImportacao: ambienteBackend.data_importacao,
    horaImportacao: ambienteBackend.hora_importacao,
    origem: ambienteBackend.origem,
    clienteNome: ambienteBackend.cliente_nome,
    materiais: ambienteBackend.materiais,
    createdAt: ambienteBackend.created_at,
    updatedAt: ambienteBackend.updated_at,
  };
}

function converterFormDataParaPayload(dados: AmbienteFormData | AmbienteUpdateData) {
  const payload: any = {};
  
  if ('nome' in dados && dados.nome !== undefined) payload.nome = dados.nome;
  if ('clienteId' in dados && dados.clienteId !== undefined) payload.cliente_id = dados.clienteId;
  if ('valorCustoFabrica' in dados && dados.valorCustoFabrica !== undefined) payload.valor_custo_fabrica = dados.valorCustoFabrica;
  if ('valorVenda' in dados && dados.valorVenda !== undefined) payload.valor_venda = dados.valorVenda;
  if ('dataImportacao' in dados && dados.dataImportacao !== undefined) payload.data_importacao = dados.dataImportacao;
  if ('horaImportacao' in dados && dados.horaImportacao !== undefined) payload.hora_importacao = dados.horaImportacao;
  if ('origem' in dados && dados.origem !== undefined) payload.origem = dados.origem;
  
  return payload;
}

function converterFiltrosParaQuery(filtros?: FiltrosAmbiente): Record<string, string> {
  const query: Record<string, string> = {};
  
  if (filtros?.busca) query.busca = filtros.busca;
  if (filtros?.clienteId) query.cliente_id = filtros.clienteId;
  if (filtros?.origem) query.origem = filtros.origem;
  if (filtros?.dataInicio) query.data_inicio = filtros.dataInicio;
  if (filtros?.dataFim) query.data_fim = filtros.dataFim;
  if (filtros?.valorMin) query.valor_min = filtros.valorMin.toString();
  if (filtros?.valorMax) query.valor_max = filtros.valorMax.toString();
  
  return query;
}

// ============= SERVIÇO PRINCIPAL =============

class AmbienteService {
  private readonly baseURL: string;
  private readonly timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.REQUEST_TIMEOUT;
    
    logConfig('AmbienteService inicializado', { 
      baseURL: this.baseURL,
      useRealApi: FRONTEND_CONFIG.FEATURES.USE_REAL_API 
    });
  }

  // ============= MÉTODO BASE PARA REQUESTS =============

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<AmbienteServiceResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Headers padrão
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Adicionar token de autenticação se disponível
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('fluyt_auth_token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
      signal: AbortSignal.timeout(this.timeout),
    };

    debugAPI(`🌐 API Request: ${options.method || 'GET'} ${endpoint}`, { url, headers });

    try {
      const response = await fetch(url, requestOptions);
      
      debugAPI(`📥 API Response: ${response.status}`, { url, status: response.status });
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorBody = await response.json();
          if (errorBody.message) {
            errorMessage = errorBody.message;
          } else if (errorBody.detail) {
            errorMessage = errorBody.detail;
          }
        } catch (e) {
          // Se falhar ao parsear JSON, usar mensagem padrão
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      return {
        success: true,
        data,
        source: 'api',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      logConfig('❌ Erro na API:', errorMsg);
      
      let userMessage = 'Não foi possível conectar ao servidor.';
      if (errorMsg.includes('timeout') || errorMsg.includes('Timeout')) {
        userMessage = 'O servidor demorou muito para responder. Tente novamente.';
      } else if (errorMsg.includes('Network') || errorMsg.includes('fetch')) {
        userMessage = 'Erro de conexão. Verifique se o backend está rodando em http://localhost:8000';
      }
      
      return {
        success: false,
        error: userMessage,
        source: 'api',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // ============= VERIFICAÇÃO DE CONECTIVIDADE =============

  async verificarConectividade(): Promise<boolean> {
    try {
      const response = await this.request('/health', { method: 'GET' });
      return response.success;
    } catch {
      return false;
    }
  }

  // ============= MÉTODOS PRINCIPAIS =============

  // Listar ambientes
  async listarAmbientes(filtros?: FiltrosAmbiente): Promise<AmbienteServiceResponse<AmbienteListResponse>> {
    debugAPI('AmbienteService.listarAmbientes - INÍCIO', { filtros });
    
    const params = new URLSearchParams();
    const filtrosQuery = converterFiltrosParaQuery(filtros);
    Object.entries(filtrosQuery).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    let endpoint = '/api/v1/ambientes';
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    const response = await this.request<{ items: AmbienteBackend[]; total: number; page: number; limit: number; pages: number }>(endpoint);
    
    if (response.success && response.data) {
      const ambientesConvertidos = response.data.items.map(converterAmbienteBackendParaFrontend);
      
      return {
        success: true,
        data: {
          items: ambientesConvertidos,
          total: response.data.total,
          page: response.data.page,
          limit: response.data.limit,
          pages: response.data.pages,
        },
        source: 'api',
        timestamp: response.timestamp,
      };
    }
    
    return {
      success: false,
      error: response.error || 'Erro ao listar ambientes',
      source: 'api',
      timestamp: response.timestamp,
    };
  }

  // Buscar ambiente por ID
  async buscarAmbientePorId(id: string, incluirMateriais: boolean = false): Promise<AmbienteServiceResponse<Ambiente>> {
    const params = new URLSearchParams();
    if (incluirMateriais) {
      params.append('include', 'materiais');
    }
    
    let endpoint = `/api/v1/ambientes/${id}`;
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    const response = await this.request<AmbienteBackend>(endpoint);
    
    if (response.success && response.data) {
      const ambienteConvertido = converterAmbienteBackendParaFrontend(response.data);
      
      return {
        success: true,
        data: ambienteConvertido,
        source: 'api',
        timestamp: response.timestamp,
      };
    }
    
    return {
      success: false,
      error: response.error || 'Erro ao buscar ambiente',
      source: 'api',
      timestamp: response.timestamp,
    };
  }

  // Criar ambiente
  async criarAmbiente(dados: AmbienteFormData): Promise<AmbienteServiceResponse<Ambiente>> {
    const payload = converterFormDataParaPayload(dados);
    
    const response = await this.request<AmbienteBackend>('/api/v1/ambientes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    
    if (response.success && response.data) {
      const ambienteConvertido = converterAmbienteBackendParaFrontend(response.data);
      
      return {
        success: true,
        data: ambienteConvertido,
        source: 'api',
        timestamp: response.timestamp,
      };
    }
    
    return {
      success: false,
      error: response.error || 'Erro ao criar ambiente',
      source: 'api',
      timestamp: response.timestamp,
    };
  }

  // Atualizar ambiente
  async atualizarAmbiente(id: string, dados: AmbienteUpdateData): Promise<AmbienteServiceResponse<Ambiente>> {
    const payload = converterFormDataParaPayload(dados);
    
    const response = await this.request<AmbienteBackend>(`/api/v1/ambientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    
    if (response.success && response.data) {
      const ambienteConvertido = converterAmbienteBackendParaFrontend(response.data);
      
      return {
        success: true,
        data: ambienteConvertido,
        source: 'api',
        timestamp: response.timestamp,
      };
    }
    
    return {
      success: false,
      error: response.error || 'Erro ao atualizar ambiente',
      source: 'api',
      timestamp: response.timestamp,
    };
  }

  // Deletar ambiente
  async deletarAmbiente(id: string): Promise<AmbienteServiceResponse<void>> {
    const response = await this.request<void>(`/api/v1/ambientes/${id}`, {
      method: 'DELETE',
    });
    
    return response;
  }

  // ============= MÉTODOS PARA MATERIAIS =============

  // Criar/atualizar materiais de um ambiente
  async criarMateriais(dados: AmbienteMaterialFormData): Promise<AmbienteServiceResponse<AmbienteMaterial>> {
    const payload = {
      ambiente_id: dados.ambienteId,
      materiais_json: dados.materiaisJson,
      xml_hash: dados.xmlHash,
    };
    
    const response = await this.request<{
      id: string;
      ambiente_id: string;
      materiais_json: any;
      xml_hash?: string;
      created_at: string;
      updated_at: string;
    }>('/api/v1/ambientes/materiais', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    
    if (response.success && response.data) {
      return {
        success: true,
        data: {
          id: response.data.id,
          ambienteId: response.data.ambiente_id,
          materiaisJson: response.data.materiais_json,
          xmlHash: response.data.xml_hash,
          createdAt: response.data.created_at,
          updatedAt: response.data.updated_at,
        },
        source: 'api',
        timestamp: response.timestamp,
      };
    }
    
    return {
      success: false,
      error: response.error || 'Erro ao criar materiais',
      source: 'api',
      timestamp: response.timestamp,
    };
  }
}

// ============= INSTÂNCIA SINGLETON =============

export const ambienteService = new AmbienteService();

// ============= LOGS DE INICIALIZAÇÃO =============

logConfig('🚀 AmbienteService carregado e configurado');
logConfig('🔀 Estratégia: API-first - integração total com backend');
logConfig('🎯 Feature USE_REAL_API:', FRONTEND_CONFIG.FEATURES.USE_REAL_API);
logConfig('📊 Compatível com: c_ambientes + c_ambientes_material (Supabase)'); 