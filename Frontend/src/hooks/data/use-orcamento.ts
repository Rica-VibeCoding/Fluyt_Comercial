/**
 * Hook de dados para orçamento
 * 
 * EQUIPE B (Claude Code) - ETAPA 9
 * Hook especializado para gerenciamento de dados do orçamento
 */

import { useOrcamentoStore } from '@/store/orcamento-store';
import { FormaPagamento } from '@/types/orcamento';

export const useOrcamento = () => {
  const store = useOrcamentoStore();
  
  // Proteger contra erros de hidratação
  if (typeof window === 'undefined') {
    return {
      ...store,
      cliente: null,
      ambientes: [],
      formasPagamento: [],
      valorTotal: 0,
      podeGerarOrcamento: () => false,
      podeGerarContrato: () => false,
      setLoading: () => {},
      setErro: () => {},
      limparTudo: () => {}
    };
  }
  
  return {
    // Estados principais
    cliente: store.cliente,
    ambientes: store.ambientes,
    formasPagamento: store.formasPagamento,
    
    // Estados computados
    valorTotal: store.valorTotal,
    valorTotalFormas: store.valorTotalFormas,
    valorPresenteTotal: store.valorPresenteTotal,
    valorRestante: store.valorRestante,
    descontoPercentual: store.descontoPercentual,
    valorNegociado: store.valorNegociado,
    
    // Estados de UI
    loading: store.loading,
    erro: store.erro,
    
    // Ações principais
    definirCliente: store.definirCliente,
    definirAmbientes: store.definirAmbientes,
    definirDesconto: store.definirDesconto,
    
    // Ações de UI
    setLoading: store.setLoading,
    setErro: store.setErro,
    
    // Ações de limpeza
    limparTudo: store.limparTudo,
    
    // Validações
    podeGerarOrcamento: store.podeGerarOrcamento,
    podeGerarContrato: store.podeGerarContrato,
    
    // Debug
    debug: store.debug
  };
};