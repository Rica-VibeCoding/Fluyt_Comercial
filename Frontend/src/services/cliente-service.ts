/**
 * SERVIÇO DE CLIENTES COM FALLBACK AUTOMÁTICO
 * Implementa estratégia API-first com fallback inteligente para mocks
 * Transparente para os hooks - eles não sabem se estão usando API ou mock
 */

import { 
  apiClient, 
  converterClienteBackendParaFrontend, 
  converterFormDataParaPayload,
  type ApiResponse,
  type ApiListResponse,
  type ClienteBackend 
} from './api-client';
import { ClienteStore } from '@/lib/store/cliente-store';
import { FRONTEND_CONFIG, logConfig } from '@/lib/config';
import { debugAPI } from '@/lib/debug-api';
import type { Cliente, ClienteFormData, FiltrosCliente } from '@/types/cliente';

// ============= INTERFACE UNIFICADA =============

export interface ClienteServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  source: 'api' | 'mock'; // Indica fonte dos dados
  timestamp: string;
}

export interface ClienteListResponse {
  items: Cliente[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ============= SERVIÇO PRINCIPAL =============

class ClienteService {
  private forcarMock: boolean = false;
  private ultimaConectividade: boolean | null = null;
  private ultimoTesteConectividade: number = 0;
  private readonly CACHE_CONECTIVIDADE = 60000; // 60 segundos para evitar verificações desnecessárias

  constructor() {
    // Verificar feature flag
    this.forcarMock = !FRONTEND_CONFIG.FEATURES.USE_REAL_API;
    logConfig('ClienteService inicializado', { 
      forcarMock: this.forcarMock,
      useRealApi: FRONTEND_CONFIG.FEATURES.USE_REAL_API 
    });
  }

  // ============= ESTRATÉGIA DE CONECTIVIDADE =============

  private async verificarConectividade(): Promise<boolean> {
    // Se forçando mock, não testar conectividade
    if (this.forcarMock) {
      logConfig('🔧 Conectividade: Forçando uso de mock');
      return false;
    }

    const agora = Date.now();
    
    // Usar cache de conectividade se recente
    if (this.ultimaConectividade !== null && 
        (agora - this.ultimoTesteConectividade) < this.CACHE_CONECTIVIDADE) {
      logConfig('📦 Conectividade: Usando cache', { conectado: this.ultimaConectividade });
      return this.ultimaConectividade;
    }

    // Testar conectividade real
    try {
      logConfig('🔍 Conectividade: Testando backend...');
      const conectado = await apiClient.isBackendDisponivel();
      
      this.ultimaConectividade = conectado;
      this.ultimoTesteConectividade = agora;
      
      logConfig(conectado ? '✅ Conectividade: Backend disponível' : '❌ Conectividade: Backend indisponível');
      return conectado;
    } catch (error) {
      logConfig('❌ Conectividade: Erro ao testar', error);
      this.ultimaConectividade = false;
      this.ultimoTesteConectividade = agora;
      return false;
    }
  }

  // ============= MÉTODOS PRINCIPAIS =============

  // Listar clientes
  async listarClientes(filtros?: FiltrosCliente): Promise<ClienteServiceResponse<ClienteListResponse>> {
    debugAPI('ClienteService.listarClientes - INÍCIO', { filtros });
    
    const conectado = await this.verificarConectividade();
    debugAPI('ClienteService.listarClientes - Conectividade', { conectado });

    if (conectado) {
      try {
        const startTime = Date.now();
        logConfig('📡 Listando clientes via API...');
        const response = await apiClient.listarClientes(filtros);
        
        if (response.success && response.data) {
          const responseTime = Date.now() - startTime;
          logConfig(`✅ Clientes carregados via API em ${responseTime}ms`);
          
          const clientesConvertidos = response.data.items.map(converterClienteBackendParaFrontend);
          
          return {
            success: true,
            data: {
              items: clientesConvertidos,
              total: response.data.total,
              page: response.data.page,
              limit: response.data.limit,
              pages: response.data.pages,
            },
            source: 'api',
            timestamp: response.timestamp,
          };
        } else {
          throw new Error(response.error || 'Erro na API');
        }
      } catch (error: any) {
        const errorMsg = error.message || 'Erro desconhecido';
        logConfig('❌ Erro na API:', errorMsg);
        
        // Mensagem mais específica baseada no tipo de erro
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

    // Se não está conectado, retornar erro
    logConfig('⚠️  Backend não disponível - verificação de conectividade falhou');
    return {
      success: false,
      error: 'Backend não disponível. Verifique se o servidor está rodando em http://localhost:8000',
      source: 'api',
      timestamp: new Date().toISOString(),
    };
  }

  // Buscar cliente por ID
  async buscarClientePorId(id: string): Promise<ClienteServiceResponse<Cliente>> {
    const conectado = await this.verificarConectividade();

    if (conectado) {
      try {
        logConfig('📡 Buscando cliente via API...', { id });
        const response = await apiClient.buscarClientePorId(id);
        
        if (response.success && response.data) {
          const clienteConvertido = converterClienteBackendParaFrontend(response.data);
          
          return {
            success: true,
            data: clienteConvertido,
            source: 'api',
            timestamp: response.timestamp,
          };
        } else {
          throw new Error(response.error || 'Cliente não encontrado na API');
        }
      } catch (error: any) {
        const errorMsg = error.message || 'Erro desconhecido';
        logConfig('❌ Erro na API:', errorMsg);
        
        // Mensagem mais específica baseada no tipo de erro
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

    // Se não está conectado, retornar erro
    logConfig('⚠️  Backend não disponível - verificação de conectividade falhou');
    return {
      success: false,
      error: 'Backend não disponível. Verifique se o servidor está rodando em http://localhost:8000',
      source: 'api',
      timestamp: new Date().toISOString(),
    };
  }

  // Criar cliente
  async criarCliente(dados: ClienteFormData): Promise<ClienteServiceResponse<Cliente>> {
    const conectado = await this.verificarConectividade();

    if (conectado) {
      try {
        logConfig('📡 Criando cliente via API...', { nome: dados.nome });
        const payload = converterFormDataParaPayload(dados);
        const response = await apiClient.criarCliente(payload);
        
        if (response.success && response.data) {
          const clienteConvertido = converterClienteBackendParaFrontend(response.data);
          
          return {
            success: true,
            data: clienteConvertido,
            source: 'api',
            timestamp: response.timestamp,
          };
        } else {
          throw new Error(response.error || 'Erro ao criar cliente na API');
        }
      } catch (error: any) {
        const errorMsg = error.message || 'Erro desconhecido';
        logConfig('❌ Erro na API:', errorMsg);
        
        // Mensagem mais específica baseada no tipo de erro
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

    // Se não está conectado, retornar erro
    return {
      success: false,
      error: 'Backend não disponível. Não é possível criar clientes sem conexão com o servidor.',
      source: 'api',
      timestamp: new Date().toISOString(),
    };
  }

  // Atualizar cliente
  async atualizarCliente(id: string, dados: Partial<ClienteFormData>): Promise<ClienteServiceResponse<Cliente>> {
    const conectado = await this.verificarConectividade();

    if (conectado) {
      try {
        logConfig('📡 Atualizando cliente via API...', { id });
        const payload = converterFormDataParaPayload(dados as ClienteFormData);
        const response = await apiClient.atualizarCliente(id, payload);
        
        if (response.success && response.data) {
          const clienteConvertido = converterClienteBackendParaFrontend(response.data);
          
          return {
            success: true,
            data: clienteConvertido,
            source: 'api',
            timestamp: response.timestamp,
          };
        } else {
          throw new Error(response.error || 'Erro ao atualizar cliente na API');
        }
      } catch (error: any) {
        const errorMsg = error.message || 'Erro desconhecido';
        logConfig('❌ Erro na API:', errorMsg);
        
        // Mensagem mais específica baseada no tipo de erro
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

    // Se não está conectado, retornar erro
    return {
      success: false,
      error: 'Backend não disponível. Não é possível atualizar clientes sem conexão com o servidor.',
      source: 'api',
      timestamp: new Date().toISOString(),
    };
  }

  // Deletar cliente
  async deletarCliente(id: string): Promise<ClienteServiceResponse<void>> {
    const conectado = await this.verificarConectividade();

    if (conectado) {
      try {
        logConfig('📡 Deletando cliente via API...', { id });
        const response = await apiClient.excluirCliente(id);
        
        if (response.success) {
          return {
            success: true,
            data: undefined,
            source: 'api',
            timestamp: response.timestamp,
          };
        } else {
          throw new Error(response.error || 'Erro ao deletar cliente na API');
        }
      } catch (error: any) {
        const errorMsg = error.message || 'Erro desconhecido';
        logConfig('❌ Erro na API:', errorMsg);
        
        return {
          success: false,
          error: 'Não foi possível deletar o cliente. Tente novamente.',
          source: 'api',
          timestamp: new Date().toISOString(),
        };
      }
    }

    // Se não está conectado, retornar erro
    return {
      success: false,
      error: 'Backend não disponível. Não é possível deletar clientes sem conexão com o servidor.',
      source: 'api',
      timestamp: new Date().toISOString(),
    };
  }

  // ============= MÉTODOS AUXILIARES =============

  // Forçar uso de mock (para debugging)
  forcarUsoDeMock(forcar: boolean = true) {
    this.forcarMock = forcar;
    this.ultimaConectividade = null; // Reset cache
    logConfig('🔧 Forçar mock alterado', { forcarMock: this.forcarMock });
  }

  // Obter status da conectividade
  async obterStatusConectividade() {
    const conectado = await this.verificarConectividade();
    return {
      conectado,
      forcarMock: this.forcarMock,
      ultimoTeste: new Date(this.ultimoTesteConectividade).toISOString(),
      cacheValido: (Date.now() - this.ultimoTesteConectividade) < this.CACHE_CONECTIVIDADE,
    };
  }

  // Limpar cache de conectividade
  limparCacheConectividade() {
    this.ultimaConectividade = null;
    this.ultimoTesteConectividade = 0;
    logConfig('🧹 Cache de conectividade limpo');
  }
}

// ============= INSTÂNCIA SINGLETON =============

export const clienteService = new ClienteService();

// ============= LOGS DE INICIALIZAÇÃO =============

logConfig('🚀 ClienteService carregado e configurado');
logConfig('🔀 Estratégia: API-first SEM fallback para mock');
logConfig('🎯 Feature USE_REAL_API:', FRONTEND_CONFIG.FEATURES.USE_REAL_API);
logConfig('⚠️  Dados mock desabilitados - apenas conexão real com backend');