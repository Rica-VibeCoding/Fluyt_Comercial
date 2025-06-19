/**
 * ✅ HOOK SIMPLES: Formas de pagamento locais (UI state)
 * 
 * Sistema funcionou na documentação novo_orcamento.md
 */

import { useState } from 'react';
import { FormaPagamento } from '@/types/orcamento';

export const useFormasPagamento = () => {
  // ✅ Estados locais para formas de pagamento (UI state)
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  
  // Estados dos modais (UI state)
  const [modalFormasAberto, setModalFormasAberto] = useState(false);
  const [modalAVistaAberto, setModalAVistaAberto] = useState(false);
  const [modalBoletoAberto, setModalBoletoAberto] = useState(false);
  const [modalCartaoAberto, setModalCartaoAberto] = useState(false);
  const [modalFinanceiraAberto, setModalFinanceiraAberto] = useState(false);
  const [formaEditando, setFormaEditando] = useState<FormaPagamento | null>(null);
  
  // ✅ Ações para formas de pagamento
  const adicionarFormaPagamento = (forma: Omit<FormaPagamento, 'id' | 'criadaEm'>) => {
    const novaForma: FormaPagamento = {
      ...forma,
      id: Date.now().toString(),
      criadaEm: new Date().toISOString()
    };
    setFormasPagamento(prev => [...prev, novaForma]);
  };
  
  const editarFormaPagamento = (id: string, dadosAtualizados: Partial<FormaPagamento>) => {
    setFormasPagamento(prev => 
      prev.map(forma => 
        forma.id === id ? { ...forma, ...dadosAtualizados } : forma
      )
    );
  };
  
  const removerFormaPagamento = (id: string) => {
    setFormasPagamento(prev => prev.filter(forma => forma.id !== id));
  };
  
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