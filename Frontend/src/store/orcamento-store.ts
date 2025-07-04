/**
 * Store Zustand para gerenciamento de orçamento
 * 
 * ETAPA 2: Tipos unificados importados de @/types/orcamento
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  Cliente, 
  Ambiente, 
  FormaPagamento,
  OrcamentoState
} from '../types/orcamento';

// === STORE IMPLEMENTATION ===

export const useOrcamentoStore = create<OrcamentoState>()(
  devtools(
    (set, get) => ({
      // Estados iniciais
      cliente: null,
      ambientes: [],
      formasPagamento: [],
      
      // Estados computados iniciais
      valorTotal: 0,
      valorTotalFormas: 0,
      valorPresenteTotal: 0,
      valorRestante: 0,
      descontoPercentual: 0,
      valorNegociado: 0,
      
      // Estados de UI iniciais
      loading: false,
      erro: null,
      
      // Estados dos modais iniciais
      modalFormasAberto: false,
      modalAVistaAberto: false,
      modalBoletoAberto: false,
      modalCartaoAberto: false,
      modalFinanceiraAberto: false,
      formaEditando: null,
      
      // === IMPLEMENTAÇÃO DAS AÇÕES ===
      
      // Ações para cliente
      definirCliente: (cliente) => {
        console.log('🔄 Store: definirCliente chamado com:', cliente?.nome || 'null');
        set((state) => {
          const clienteMudou = cliente?.id !== state.cliente?.id;
          
          const novoEstado = {
            cliente,
            // Se cliente mudou, limpar dados relacionados
            ambientes: clienteMudou ? [] : state.ambientes,
            formasPagamento: clienteMudou ? [] : state.formasPagamento,
            valorTotal: clienteMudou ? 0 : state.valorTotal,
            valorTotalFormas: clienteMudou ? 0 : state.valorTotalFormas,
            valorPresenteTotal: clienteMudou ? 0 : state.valorPresenteTotal,
            valorRestante: clienteMudou ? 0 : state.valorRestante,
            descontoPercentual: clienteMudou ? 0 : state.descontoPercentual,
            valorNegociado: clienteMudou ? 0 : state.valorNegociado
          };
          
          console.log('✅ Store: cliente definido no estado:', novoEstado.cliente?.nome || 'null');
          return novoEstado;
        });
      },
      
      limparCliente: () => {
        set({
          cliente: null,
          ambientes: [],
          formasPagamento: [],
          valorTotal: 0,
          valorTotalFormas: 0,
          valorPresenteTotal: 0,
          valorRestante: 0,
          descontoPercentual: 0,
          valorNegociado: 0
        });
      },
      
      // Ações para ambientes
      definirAmbientes: (ambientes) => {
        console.log('🔄 Store: definirAmbientes chamado com:', ambientes?.length || 0, 'ambientes');
        const valorTotal = ambientes.reduce((total, amb) => total + amb.valor, 0);
        const state = get();
        const valorTotalFormas = state.valorTotalFormas;
        const valorNegociado = valorTotal - (valorTotal * state.descontoPercentual / 100);
        
        const novoEstado = {
          ambientes,
          valorTotal,
          valorRestante: valorNegociado - valorTotalFormas,
          valorNegociado
        };
        
        console.log('✅ Store: ambientes definidos no estado:', novoEstado.ambientes?.length || 0, 'ambientes, valorTotal:', novoEstado.valorTotal);
        set(novoEstado);
      },
      
      adicionarAmbiente: (ambiente) => {
        set((state) => {
          const novosAmbientes = [...state.ambientes, ambiente];
          const valorTotal = novosAmbientes.reduce((total, amb) => total + amb.valor, 0);
          const valorNegociado = valorTotal - (valorTotal * state.descontoPercentual / 100);
          
          return {
            ambientes: novosAmbientes,
            valorTotal,
            valorRestante: valorNegociado - state.valorTotalFormas,
            valorNegociado
          };
        });
      },
      
      removerAmbiente: (id) => {
        set((state) => {
          const novosAmbientes = state.ambientes.filter(amb => amb.id !== id);
          const valorTotal = novosAmbientes.reduce((total, amb) => total + amb.valor, 0);
          const valorNegociado = valorTotal - (valorTotal * state.descontoPercentual / 100);
          
          return {
            ambientes: novosAmbientes,
            valorTotal,
            valorRestante: valorNegociado - state.valorTotalFormas,
            valorNegociado
          };
        });
      },
      
      // Ações para formas de pagamento
      adicionarFormaPagamento: (forma) => {
        const novaForma: FormaPagamento = {
          ...forma,
          id: `forma_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          criadaEm: new Date().toISOString()
        };
        
        set((state) => {
          const novasFormas = [...state.formasPagamento, novaForma];
          const valorTotalFormas = novasFormas.reduce((total, f) => total + f.valor, 0);
          const valorPresenteTotal = novasFormas.reduce((total, f) => total + f.valorPresente, 0);
          
          return {
            formasPagamento: novasFormas,
            valorTotalFormas,
            valorPresenteTotal,
            valorRestante: state.valorNegociado - valorTotalFormas
          };
        });
      },
      
      editarFormaPagamento: (id, dadosAtualizados) => {
        set((state) => {
          const novasFormas = state.formasPagamento.map(forma =>
            forma.id === id ? { ...forma, ...dadosAtualizados } : forma
          );
          
          const valorTotalFormas = novasFormas.reduce((total, f) => total + f.valor, 0);
          const valorPresenteTotal = novasFormas.reduce((total, f) => total + f.valorPresente, 0);
          
          return {
            formasPagamento: novasFormas,
            valorTotalFormas,
            valorPresenteTotal,
            valorRestante: state.valorNegociado - valorTotalFormas
          };
        });
      },
      
      removerFormaPagamento: (id) => {
        set((state) => {
          const novasFormas = state.formasPagamento.filter(forma => forma.id !== id);
          const valorTotalFormas = novasFormas.reduce((total, f) => total + f.valor, 0);
          const valorPresenteTotal = novasFormas.reduce((total, f) => total + f.valorPresente, 0);
          
          return {
            formasPagamento: novasFormas,
            valorTotalFormas,
            valorPresenteTotal,
            valorRestante: state.valorNegociado - valorTotalFormas
          };
        });
      },
      
      toggleTravamentoForma: (id) => {
        set((state) => ({
          formasPagamento: state.formasPagamento.map(forma =>
            forma.id === id ? { ...forma, travada: !forma.travada } : forma
          )
        }));
      },
      
      // Ações para desconto
      definirDesconto: (percentual) => {
        set((state) => {
          const valorNegociado = state.valorTotal - (state.valorTotal * percentual / 100);
          
          return {
            descontoPercentual: percentual,
            valorNegociado,
            valorRestante: valorNegociado - state.valorTotalFormas
          };
        });
      },
      
      // Ações para modais
      abrirModalFormas: () => set({ modalFormasAberto: true }),
      fecharModalFormas: () => set({ modalFormasAberto: false }),
      
      abrirModalEdicao: (forma) => {
        set({ 
          formaEditando: forma,
          [`modal${forma.tipo === 'a-vista' ? 'AVista' : 
                  forma.tipo === 'boleto' ? 'Boleto' : 
                  forma.tipo === 'cartao' ? 'Cartao' : 'Financeira'}Aberto`]: true 
        });
      },
      
      fecharModalEdicao: () => {
        set({
          formaEditando: null,
          modalAVistaAberto: false,
          modalBoletoAberto: false,
          modalCartaoAberto: false,
          modalFinanceiraAberto: false
        });
      },
      
      // Ações de UI
      setLoading: (loading) => set({ loading }),
      setErro: (erro) => set({ erro }),
      
      // Ações de validação
      podeGerarOrcamento: () => {
        const state = get();
        return !!(state.cliente && state.ambientes.length > 0 && state.valorTotal > 0);
      },
      
      podeGerarContrato: () => {
        const state = get();
        return state.podeGerarOrcamento() && state.formasPagamento.length > 0;
      },
      
      // Ações de limpeza
      limparTudo: () => {
        set({
          cliente: null,
          ambientes: [],
          formasPagamento: [],
          valorTotal: 0,
          valorTotalFormas: 0,
          valorPresenteTotal: 0,
          valorRestante: 0,
          descontoPercentual: 0,
          valorNegociado: 0,
          loading: false,
          erro: null,
          modalFormasAberto: false,
          modalAVistaAberto: false,
          modalBoletoAberto: false,
          modalCartaoAberto: false,
          modalFinanceiraAberto: false,
          formaEditando: null
        });
      },
      
      // Debug
      debug: () => {
        const state = get();
        console.log('🔍 OrcamentoStore Debug:', {
          cliente: state.cliente?.nome || 'null',
          ambientes: state.ambientes.length,
          valorTotal: state.valorTotal,
          formasPagamento: state.formasPagamento.length,
          valorTotalFormas: state.valorTotalFormas,
          valorRestante: state.valorRestante
        });
      }
    }),
    { name: 'orcamento-store' }
  )
);

// === HOOK PERSONALIZADO ===

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
      podeGerarContrato: () => false
    };
  }
  
  return store;
}; 