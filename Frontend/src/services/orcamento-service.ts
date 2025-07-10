/**
 * Service para orçamentos - Conecta frontend com backend
 * Implementa CRUD completo para orçamentos e formas de pagamento
 */

import { apiClient } from './api-client';
import type { ApiResponse, ApiListResponse } from './api-client';

// ============= TIPOS ALINHADOS COM BACKEND =============

export interface StatusOrcamento {
  id: string;
  nome: string;
  descricao?: string;
  cor?: string;
  ordem: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface FormaPagamentoBackend {
  id: string;
  orcamento_id: string;
  tipo: 'a-vista' | 'boleto' | 'cartao' | 'financeira';
  valor: number;
  valor_presente: number;
  parcelas: number;
  dados?: any;
  travada: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrcamentoBackend {
  id: string;
  numero: string;
  cliente_id: string;
  loja_id: string;
  vendedor_id: string;
  aprovador_id?: string;
  medidor_selecionado_id?: string;
  montador_selecionado_id?: string;
  transportadora_selecionada_id?: string;
  
  // Valores
  valor_ambientes: number;
  desconto_percentual: number;
  valor_final: number;
  
  // Custos
  custo_fabrica: number;
  comissao_vendedor: number;
  comissao_gerente: number;
  custo_medidor: number;
  custo_montador: number;
  custo_frete: number;
  margem_lucro: number;
  
  // Controle
  necessita_aprovacao: boolean;
  data_aprovacao?: string;
  status_id?: string;
  observacoes?: string;
  
  // Metadados
  created_at: string;
  updated_at: string;
  created_by?: string;
  
  // Relacionamentos
  formas_pagamento?: FormaPagamentoBackend[];
  status?: StatusOrcamento;
  cliente?: any;
}

export interface OrcamentoCreatePayload {
  // ========== CAMPOS ESSENCIAIS DO ORÇAMENTO ==========
  cliente_id: string;
  loja_id: string;
  vendedor_id: string;
  aprovador_id?: string;
  medidor_selecionado_id?: string;
  montador_selecionado_id?: string;
  transportadora_selecionada_id?: string;
  
  // Valores do orçamento
  valor_ambientes?: number;
  desconto_percentual?: number;
  valor_final?: number;
  
  // Controle
  necessita_aprovacao?: boolean;
  status_id?: string;
  observacoes?: string;
  
  // ========== CAMPOS DE CUSTO COM VALORES PADRÃO ==========
  // Estes campos serão usados futuramente na seção de Lucratividade
  custo_fabrica?: number;
  comissao_vendedor?: number;
  comissao_gerente?: number;
  custo_medidor?: number;
  custo_montador?: number;
  custo_frete?: number;
  margem_lucro?: number;
}

export interface FormaPagamentoCreatePayload {
  orcamento_id: string;
  tipo: 'a-vista' | 'boleto' | 'cartao' | 'financeira';
  valor: number;
  valor_presente: number;
  parcelas?: number;
  dados?: any;
  travada?: boolean;
}

export interface FiltrosOrcamento {
  cliente_id?: string;
  status_id?: string;
  numero?: string;
  page?: number;
  limit?: number;
}

// ============= CLASSE DO SERVICE =============

class OrcamentoService {
  private readonly baseEndpoint = '/api/v1/orcamentos';
  private readonly statusEndpoint = '/api/v1/status-orcamento';
  private readonly formaEndpoint = '/api/v1/formas-pagamento';

  // ========== MÉTODOS DE ORÇAMENTOS ==========

  async listarOrcamentos(filtros?: FiltrosOrcamento): Promise<ApiResponse<ApiListResponse<OrcamentoBackend>>> {
    const params = new URLSearchParams();
    
    if (filtros?.cliente_id) params.append('cliente_id', filtros.cliente_id);
    if (filtros?.status_id) params.append('status_id', filtros.status_id);
    if (filtros?.numero) params.append('numero', filtros.numero);
    if (filtros?.page) params.append('page', filtros.page.toString());
    if (filtros?.limit) params.append('limit', filtros.limit.toString());

    const endpoint = params.toString() 
      ? `${this.baseEndpoint}?${params.toString()}`
      : this.baseEndpoint;

    return apiClient.request<ApiListResponse<OrcamentoBackend>>(endpoint);
  }

  async buscarOrcamentoPorId(id: string): Promise<ApiResponse<OrcamentoBackend>> {
    const endpoint = `${this.baseEndpoint}/${id}`;
    return apiClient.request<OrcamentoBackend>(endpoint);
  }

  async criarOrcamento(dados: OrcamentoCreatePayload): Promise<ApiResponse<OrcamentoBackend>> {
    return apiClient.request<OrcamentoBackend>(this.baseEndpoint, {
      method: 'POST',
      body: JSON.stringify(dados),
    });
  }

  async atualizarOrcamento(id: string, dados: Partial<OrcamentoCreatePayload>): Promise<ApiResponse<OrcamentoBackend>> {
    const endpoint = `${this.baseEndpoint}/${id}`;
    return apiClient.request<OrcamentoBackend>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(dados),
    });
  }

  async excluirOrcamento(id: string): Promise<ApiResponse<void>> {
    const endpoint = `${this.baseEndpoint}/${id}`;
    return apiClient.request<void>(endpoint, {
      method: 'DELETE',
    });
  }

  // ========== MÉTODOS DE FORMAS DE PAGAMENTO ==========

  async listarFormasPagamentoPorOrcamento(orcamentoId: string): Promise<ApiResponse<FormaPagamentoBackend[]>> {
    const endpoint = `${this.baseEndpoint}/${orcamentoId}/formas-pagamento`;
    return apiClient.request<FormaPagamentoBackend[]>(endpoint);
  }

  async buscarFormaPagamentoPorId(id: string): Promise<ApiResponse<FormaPagamentoBackend>> {
    const endpoint = `${this.formaEndpoint}/${id}`;
    return apiClient.request<FormaPagamentoBackend>(endpoint);
  }

  async criarFormaPagamento(dados: FormaPagamentoCreatePayload): Promise<ApiResponse<FormaPagamentoBackend>> {
    return apiClient.request<FormaPagamentoBackend>(this.formaEndpoint, {
      method: 'POST',
      body: JSON.stringify(dados),
    });
  }

  async atualizarFormaPagamento(id: string, dados: Partial<FormaPagamentoCreatePayload>): Promise<ApiResponse<FormaPagamentoBackend>> {
    const endpoint = `${this.formaEndpoint}/${id}`;
    return apiClient.request<FormaPagamentoBackend>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(dados),
    });
  }

  async excluirFormaPagamento(id: string): Promise<ApiResponse<void>> {
    const endpoint = `${this.formaEndpoint}/${id}`;
    return apiClient.request<void>(endpoint, {
      method: 'DELETE',
    });
  }

  // ========== MÉTODOS DE STATUS ==========

  async listarStatusOrcamento(apenasAtivos: boolean = true): Promise<ApiResponse<StatusOrcamento[]>> {
    const params = apenasAtivos ? '?apenas_ativos=true' : '';
    const endpoint = `${this.statusEndpoint}${params}`;
    
    const response = await apiClient.request<{ items: StatusOrcamento[]; total: number }>(endpoint);
    
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data.items,
        timestamp: response.timestamp
      };
    }
    
    return {
      success: false,
      error: response.error || 'Erro ao listar status',
      timestamp: new Date().toISOString()
    };
  }

  async buscarStatusPorId(id: string): Promise<ApiResponse<StatusOrcamento>> {
    const endpoint = `${this.statusEndpoint}/${id}`;
    return apiClient.request<StatusOrcamento>(endpoint);
  }

  // ========== MÉTODOS DE CONVERSÃO ==========

  /**
   * Converte orçamento do backend para formato do frontend
   */
  converterOrcamentoParaFrontend(orcamento: OrcamentoBackend): any {
    return {
      id: orcamento.id,
      numero: orcamento.numero,
      clienteId: orcamento.cliente_id,
      lojaId: orcamento.loja_id,
      vendedorId: orcamento.vendedor_id,
      aprovadorId: orcamento.aprovador_id,
      medidorSelecionadoId: orcamento.medidor_selecionado_id,
      montadorSelecionadoId: orcamento.montador_selecionado_id,
      transportadoraSelecionadaId: orcamento.transportadora_selecionada_id,
      
      // Valores convertidos para números
      valorAmbientes: Number(orcamento.valor_ambientes) || 0,
      descontoPercentual: Number(orcamento.desconto_percentual) || 0,
      valorFinal: Number(orcamento.valor_final) || 0,
      
      custoFabrica: Number(orcamento.custo_fabrica) || 0,
      comissaoVendedor: Number(orcamento.comissao_vendedor) || 0,
      comissaoGerente: Number(orcamento.comissao_gerente) || 0,
      custoMedidor: Number(orcamento.custo_medidor) || 0,
      custoMontador: Number(orcamento.custo_montador) || 0,
      custoFrete: Number(orcamento.custo_frete) || 0,
      margemLucro: Number(orcamento.margem_lucro) || 0,
      
      necessitaAprovacao: orcamento.necessita_aprovacao,
      dataAprovacao: orcamento.data_aprovacao,
      statusId: orcamento.status_id,
      observacoes: orcamento.observacoes,
      
      createdAt: orcamento.created_at,
      updatedAt: orcamento.updated_at,
      createdBy: orcamento.created_by,
      
      // Relacionamentos
      formasPagamento: orcamento.formas_pagamento?.map(forma => this.converterFormaPagamentoParaFrontend(forma)) || [],
      status: orcamento.status,
      cliente: orcamento.cliente,
    };
  }

  /**
   * Converte forma de pagamento do backend para formato do frontend
   */
  converterFormaPagamentoParaFrontend(forma: FormaPagamentoBackend): any {
    return {
      id: forma.id,
      orcamentoId: forma.orcamento_id,
      tipo: forma.tipo,
      valor: Number(forma.valor),
      valorPresente: Number(forma.valor_presente),
      parcelas: forma.parcelas,
      dados: forma.dados,
      travada: forma.travada,
      criadaEm: forma.created_at,
      atualizadaEm: forma.updated_at,
    };
  }

  /**
   * Converte dados do frontend para payload do backend
   */
  converterFrontendParaBackend(dados: any): OrcamentoCreatePayload {
    // Garantir que todos os IDs sejam strings válidas
    const converterParaString = (valor: any) => {
      return valor ? String(valor) : undefined;
    };
    
    return {
      // ========== CAMPOS ESSENCIAIS DO ORÇAMENTO ==========
      // Foco na venda: cliente, ambientes, valor, pagamento
      cliente_id: converterParaString(dados.clienteId),
      loja_id: converterParaString(dados.lojaId),
      vendedor_id: converterParaString(dados.vendedorId),
      aprovador_id: converterParaString(dados.aprovadorId),
      medidor_selecionado_id: converterParaString(dados.medidorSelecionadoId),
      montador_selecionado_id: converterParaString(dados.montadorSelecionadoId),
      transportadora_selecionada_id: converterParaString(dados.transportadoraSelecionadaId),
      
      // Valores do orçamento (com valores padrão para evitar erros)
      valor_ambientes: dados.valorAmbientes || 0,
      desconto_percentual: dados.descontoPercentual || 0,
      valor_final: dados.valorFinal || 0,
      
      // Controle
      necessita_aprovacao: dados.necessitaAprovacao || false,
      // Status padrão: usar um ID válido da tabela c_config_status_orcamento
      status_id: converterParaString(dados.statusId) || "2aa69438-8ccb-4948-aec0-d34de96bd95e", // ID do status "Negociação" (padrão)
      observacoes: dados.observacoes,
      
      // ========== CAMPOS DE CUSTO COM ZEROS OBRIGATÓRIOS ==========
      // O banco exige esses campos, enviando zeros para evitar constraint NOT NULL
      custo_fabrica: 0,
      comissao_vendedor: 0,
      comissao_gerente: 0,
      custo_medidor: 0,
      custo_montador: 0,
      custo_frete: 0,
      margem_lucro: 0,
    };
  }
}

// ============= INSTÂNCIA SINGLETON =============

export const orcamentoService = new OrcamentoService();

// ============= LOG DE INICIALIZAÇÃO =============

if (process.env.NODE_ENV === 'development') {
  console.log('📊 OrcamentoService carregado e configurado');
}