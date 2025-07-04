/**
 * Hook para integração com API de orçamentos
 * Conecta o store frontend com o backend
 */

import { useState, useCallback } from 'react';
import { orcamentoService } from '@/services/orcamento-service';
import type { 
  OrcamentoBackend, 
  FormaPagamentoBackend, 
  StatusOrcamento,
  OrcamentoCreatePayload,
  FormaPagamentoCreatePayload,
  FiltrosOrcamento 
} from '@/services/orcamento-service';

interface UseOrcamentoApiReturn {
  // Estados
  loading: boolean;
  error: string | null;
  
  // Métodos de orçamento
  listarOrcamentos: (filtros?: FiltrosOrcamento) => Promise<OrcamentoBackend[]>;
  buscarOrcamento: (id: string) => Promise<OrcamentoBackend | null>;
  criarOrcamento: (dados: OrcamentoCreatePayload) => Promise<OrcamentoBackend | null>;
  atualizarOrcamento: (id: string, dados: Partial<OrcamentoCreatePayload>) => Promise<OrcamentoBackend | null>;
  excluirOrcamento: (id: string) => Promise<boolean>;
  
  // Métodos de formas de pagamento
  listarFormasPagamento: (orcamentoId: string) => Promise<FormaPagamentoBackend[]>;
  criarFormaPagamento: (dados: FormaPagamentoCreatePayload) => Promise<FormaPagamentoBackend | null>;
  atualizarFormaPagamento: (id: string, dados: Partial<FormaPagamentoCreatePayload>) => Promise<FormaPagamentoBackend | null>;
  excluirFormaPagamento: (id: string) => Promise<boolean>;
  
  // Métodos de status
  listarStatus: (apenasAtivos?: boolean) => Promise<StatusOrcamento[]>;
  buscarStatus: (id: string) => Promise<StatusOrcamento | null>;
  
  // Utilitários
  limparError: () => void;
}

export const useOrcamentoApi = (): UseOrcamentoApiReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((error: any, context: string) => {
    console.error(`❌ [OrcamentoAPI] ${context}:`, error);
    const message = error?.message || `Erro em ${context}`;
    setError(message);
    return null;
  }, []);

  const executeWithLoading = useCallback(async <T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      return result;
    } catch (error) {
      return handleError(error, context);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // ========== MÉTODOS DE ORÇAMENTO ==========

  const listarOrcamentos = useCallback(async (filtros?: FiltrosOrcamento): Promise<OrcamentoBackend[]> => {
    const result = await executeWithLoading(async () => {
      const response = await orcamentoService.listarOrcamentos(filtros);
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao listar orçamentos');
      }
      
      return response.data?.items || [];
    }, 'listar orçamentos');
    
    return result || [];
  }, [executeWithLoading]);

  const buscarOrcamento = useCallback(async (id: string): Promise<OrcamentoBackend | null> => {
    return await executeWithLoading(async () => {
      const response = await orcamentoService.buscarOrcamentoPorId(id);
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao buscar orçamento');
      }
      
      return response.data || null;
    }, 'buscar orçamento');
  }, [executeWithLoading]);

  const criarOrcamento = useCallback(async (dados: OrcamentoCreatePayload): Promise<OrcamentoBackend | null> => {
    return await executeWithLoading(async () => {
      const response = await orcamentoService.criarOrcamento(dados);
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao criar orçamento');
      }
      
      return response.data || null;
    }, 'criar orçamento');
  }, [executeWithLoading]);

  const atualizarOrcamento = useCallback(async (
    id: string, 
    dados: Partial<OrcamentoCreatePayload>
  ): Promise<OrcamentoBackend | null> => {
    return await executeWithLoading(async () => {
      const response = await orcamentoService.atualizarOrcamento(id, dados);
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao atualizar orçamento');
      }
      
      return response.data || null;
    }, 'atualizar orçamento');
  }, [executeWithLoading]);

  const excluirOrcamento = useCallback(async (id: string): Promise<boolean> => {
    const result = await executeWithLoading(async () => {
      const response = await orcamentoService.excluirOrcamento(id);
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao excluir orçamento');
      }
      
      return true;
    }, 'excluir orçamento');
    
    return result || false;
  }, [executeWithLoading]);

  // ========== MÉTODOS DE FORMAS DE PAGAMENTO ==========

  const listarFormasPagamento = useCallback(async (orcamentoId: string): Promise<FormaPagamentoBackend[]> => {
    const result = await executeWithLoading(async () => {
      const response = await orcamentoService.listarFormasPagamentoPorOrcamento(orcamentoId);
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao listar formas de pagamento');
      }
      
      return response.data || [];
    }, 'listar formas de pagamento');
    
    return result || [];
  }, [executeWithLoading]);

  const criarFormaPagamento = useCallback(async (dados: FormaPagamentoCreatePayload): Promise<FormaPagamentoBackend | null> => {
    return await executeWithLoading(async () => {
      const response = await orcamentoService.criarFormaPagamento(dados);
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao criar forma de pagamento');
      }
      
      return response.data || null;
    }, 'criar forma de pagamento');
  }, [executeWithLoading]);

  const atualizarFormaPagamento = useCallback(async (
    id: string, 
    dados: Partial<FormaPagamentoCreatePayload>
  ): Promise<FormaPagamentoBackend | null> => {
    return await executeWithLoading(async () => {
      const response = await orcamentoService.atualizarFormaPagamento(id, dados);
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao atualizar forma de pagamento');
      }
      
      return response.data || null;
    }, 'atualizar forma de pagamento');
  }, [executeWithLoading]);

  const excluirFormaPagamento = useCallback(async (id: string): Promise<boolean> => {
    const result = await executeWithLoading(async () => {
      const response = await orcamentoService.excluirFormaPagamento(id);
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao excluir forma de pagamento');
      }
      
      return true;
    }, 'excluir forma de pagamento');
    
    return result || false;
  }, [executeWithLoading]);

  // ========== MÉTODOS DE STATUS ==========

  const listarStatus = useCallback(async (apenasAtivos: boolean = true): Promise<StatusOrcamento[]> => {
    const result = await executeWithLoading(async () => {
      const response = await orcamentoService.listarStatusOrcamento(apenasAtivos);
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao listar status');
      }
      
      return response.data || [];
    }, 'listar status');
    
    return result || [];
  }, [executeWithLoading]);

  const buscarStatus = useCallback(async (id: string): Promise<StatusOrcamento | null> => {
    return await executeWithLoading(async () => {
      const response = await orcamentoService.buscarStatusPorId(id);
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao buscar status');
      }
      
      return response.data || null;
    }, 'buscar status');
  }, [executeWithLoading]);

  // ========== UTILITÁRIOS ==========

  const limparError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Estados
    loading,
    error,
    
    // Métodos de orçamento
    listarOrcamentos,
    buscarOrcamento,
    criarOrcamento,
    atualizarOrcamento,
    excluirOrcamento,
    
    // Métodos de formas de pagamento
    listarFormasPagamento,
    criarFormaPagamento,
    atualizarFormaPagamento,
    excluirFormaPagamento,
    
    // Métodos de status
    listarStatus,
    buscarStatus,
    
    // Utilitários
    limparError,
  };
};