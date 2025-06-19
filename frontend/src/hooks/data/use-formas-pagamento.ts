/**
 * ✅ HOOK SIMPLES: Formas de pagamento integradas com sessaoSimples
 * 
 * CORREÇÃO: Conectar com sessaoSimples para persistir dados entre páginas
 */

import { useState, useEffect, useCallback } from 'react';
import { FormaPagamento } from '@/types/orcamento';
import { sessaoSimples } from '@/lib/sessao-simples';

export const useFormasPagamento = () => {
  // ✅ Carregar formas de pagamento da sessão simples
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>(() => {
    if (typeof window === 'undefined') return [];
    return sessaoSimples.obterFormasPagamento();
  });

  // ✅ Sincronizar com sessaoSimples quando mudanças externas ocorrerem
  useEffect(() => {
    const handleSessionChange = () => {
      console.log('📡 Sessão mudou - atualizando formas de pagamento');
      const novasFormas = sessaoSimples.obterFormasPagamento();
      setFormasPagamento(novasFormas);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('sessaoSimples-changed', handleSessionChange);
      return () => {
        window.removeEventListener('sessaoSimples-changed', handleSessionChange);
      };
    }
  }, []);
  
  // Estados dos modais (UI state)
  const [modalFormasAberto, setModalFormasAberto] = useState(false);
  const [modalAVistaAberto, setModalAVistaAberto] = useState(false);
  const [modalBoletoAberto, setModalBoletoAberto] = useState(false);
  const [modalCartaoAberto, setModalCartaoAberto] = useState(false);
  const [modalFinanceiraAberto, setModalFinanceiraAberto] = useState(false);
  const [formaEditando, setFormaEditando] = useState<FormaPagamento | null>(null);
  
  // ✅ Ações para formas de pagamento (conectadas com sessaoSimples)
  const adicionarFormaPagamento = useCallback((forma: Omit<FormaPagamento, 'id' | 'criadaEm'>) => {
    console.log('➕ Adicionando forma de pagamento:', forma);
    const novaSessao = sessaoSimples.adicionarFormaPagamento(forma);
    setFormasPagamento(novaSessao.formasPagamento);
  }, []);
  
  const editarFormaPagamento = useCallback((id: string, dadosAtualizados: Partial<FormaPagamento>) => {
    console.log('✏️ Editando forma de pagamento:', id, dadosAtualizados);
    const novaSessao = sessaoSimples.editarFormaPagamento(id, dadosAtualizados);
    setFormasPagamento(novaSessao.formasPagamento);
  }, []);
  
  const removerFormaPagamento = useCallback((id: string) => {
    console.log('🗑️ Removendo forma de pagamento:', id);
    const novaSessao = sessaoSimples.removerFormaPagamento(id);
    setFormasPagamento(novaSessao.formasPagamento);
  }, []);
  
  // ✅ Ações dos modais
  const abrirModalFormas = () => setModalFormasAberto(true);
  const fecharModalFormas = () => setModalFormasAberto(false);
  
  const abrirModalEdicao = (forma: FormaPagamento) => {
    setFormaEditando(forma);
    // Abrir modal específico baseado no tipo
    switch (forma.tipo) {
      case 'a-vista':
        setModalAVistaAberto(true);
        break;
      case 'boleto':
        setModalBoletoAberto(true);
        break;
      case 'cartao':
        setModalCartaoAberto(true);
        break;
      case 'financeira':
        setModalFinanceiraAberto(true);
        break;
    }
  };
  
  const fecharModalEdicao = () => {
    setFormaEditando(null);
    setModalAVistaAberto(false);
    setModalBoletoAberto(false);
    setModalCartaoAberto(false);
    setModalFinanceiraAberto(false);
  };
  
  return {
    // Estados
    formasPagamento,
    
    // Ações
    adicionarFormaPagamento,
    editarFormaPagamento,
    removerFormaPagamento,
    
    // Estados dos modais
    modalFormasAberto,
    modalAVistaAberto,
    modalBoletoAberto,
    modalCartaoAberto,
    modalFinanceiraAberto,
    formaEditando,
    
    // Ações dos modais
    abrirModalFormas,
    fecharModalFormas,
    abrirModalEdicao,
    fecharModalEdicao
  };
};