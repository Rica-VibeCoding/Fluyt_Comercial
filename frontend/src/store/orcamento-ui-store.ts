/**
 * Store Zustand para UI states do orçamento
 * 
 * EQUIPE B (Claude Code) - ETAPA 10
 * Separação de responsabilidades: UI vs Business Logic
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { FormaPagamento } from '../types/orcamento';

// === TIPOS PARA UI STORE ===

interface OrcamentoUIState {
  // Estados dos modais
  modalFormasAberto: boolean;
  modalAVistaAberto: boolean;
  modalBoletoAberto: boolean;
  modalCartaoAberto: boolean;
  modalFinanceiraAberto: boolean;
  
  // Estados de edição
  formaEditando: FormaPagamento | null;
  modoEdicao: boolean;
  
  // Estados de carregamento
  loading: boolean;
  loadingModal: string | null;
  
  // Estados de erro
  erro: string | null;
  erroModal: string | null;
  
  // Estados de validação
  validacaoAtiva: boolean;
  camposComErro: string[];
  
  // Estados de UI temporários
  showTooltip: string | null;
  highlightedField: string | null;
  
  // Ações para modais
  abrirModalFormas: () => void;
  fecharModalFormas: () => void;
  abrirModalEdicao: (forma: FormaPagamento) => void;
  fecharModalEdicao: () => void;
  fecharTodosModais: () => void;
  
  // Ações para estados de carregamento
  setLoading: (loading: boolean) => void;
  setLoadingModal: (modal: string | null) => void;
  
  // Ações para estados de erro
  setErro: (erro: string | null) => void;
  setErroModal: (erro: string | null) => void;
  
  // Ações para validação
  setValidacaoAtiva: (ativa: boolean) => void;
  adicionarCampoComErro: (campo: string) => void;
  removerCampoComErro: (campo: string) => void;
  limparErrosValidacao: () => void;
  
  // Ações para UI temporários
  setShowTooltip: (tooltip: string | null) => void;
  setHighlightedField: (field: string | null) => void;
  
  // Ações de limpeza
  limparEstadosTemporarios: () => void;
  resetarUI: () => void;
}

// === STORE IMPLEMENTATION ===

export const useOrcamentoUIStore = create<OrcamentoUIState>()(
  devtools(
    (set, get) => ({
      // Estados iniciais dos modais
      modalFormasAberto: false,
      modalAVistaAberto: false,
      modalBoletoAberto: false,
      modalCartaoAberto: false,
      modalFinanceiraAberto: false,
      
      // Estados iniciais de edição
      formaEditando: null,
      modoEdicao: false,
      
      // Estados iniciais de carregamento
      loading: false,
      loadingModal: null,
      
      // Estados iniciais de erro
      erro: null,
      erroModal: null,
      
      // Estados iniciais de validação
      validacaoAtiva: false,
      camposComErro: [],
      
      // Estados iniciais de UI temporários
      showTooltip: null,
      highlightedField: null,
      
      // === AÇÕES PARA MODAIS ===
      
      abrirModalFormas: () => {
        set({
          modalFormasAberto: true,
          formaEditando: null,
          modoEdicao: false,
          erro: null,
          erroModal: null
        });
      },
      
      fecharModalFormas: () => {
        set({
          modalFormasAberto: false,
          erro: null,
          erroModal: null,
          loadingModal: null
        });
      },
      
      abrirModalEdicao: (forma) => {
        // Fechar modal principal se estiver aberto
        const novoEstado: Partial<OrcamentoUIState> = {
          modalFormasAberto: false,
          formaEditando: forma,
          modoEdicao: true,
          erro: null,
          erroModal: null,
          loadingModal: null
        };
        
        // Abrir modal específico baseado no tipo
        switch (forma.tipo) {
          case 'a-vista':
            novoEstado.modalAVistaAberto = true;
            break;
          case 'boleto':
            novoEstado.modalBoletoAberto = true;
            break;
          case 'cartao':
            novoEstado.modalCartaoAberto = true;
            break;
          case 'financeira':
            novoEstado.modalFinanceiraAberto = true;
            break;
        }
        
        set(novoEstado);
      },
      
      fecharModalEdicao: () => {
        set({
          modalAVistaAberto: false,
          modalBoletoAberto: false,
          modalCartaoAberto: false,
          modalFinanceiraAberto: false,
          formaEditando: null,
          modoEdicao: false,
          erro: null,
          erroModal: null,
          loadingModal: null,
          camposComErro: []
        });
      },
      
      fecharTodosModais: () => {
        set({
          modalFormasAberto: false,
          modalAVistaAberto: false,
          modalBoletoAberto: false,
          modalCartaoAberto: false,
          modalFinanceiraAberto: false,
          formaEditando: null,
          modoEdicao: false,
          erro: null,
          erroModal: null,
          loadingModal: null,
          camposComErro: []
        });
      },
      
      // === AÇÕES PARA CARREGAMENTO ===
      
      setLoading: (loading) => set({ loading }),
      
      setLoadingModal: (modal) => set({ loadingModal: modal }),
      
      // === AÇÕES PARA ERRO ===
      
      setErro: (erro) => set({ erro }),
      
      setErroModal: (erro) => set({ erroModal: erro }),
      
      // === AÇÕES PARA VALIDAÇÃO ===
      
      setValidacaoAtiva: (ativa) => set({ validacaoAtiva: ativa }),
      
      adicionarCampoComErro: (campo) => {
        set((state) => ({
          camposComErro: [...state.camposComErro.filter(c => c !== campo), campo]
        }));
      },
      
      removerCampoComErro: (campo) => {
        set((state) => ({
          camposComErro: state.camposComErro.filter(c => c !== campo)
        }));
      },
      
      limparErrosValidacao: () => {
        set({
          camposComErro: [],
          erro: null,
          erroModal: null
        });
      },
      
      // === AÇÕES PARA UI TEMPORÁRIOS ===
      
      setShowTooltip: (tooltip) => set({ showTooltip: tooltip }),
      
      setHighlightedField: (field) => set({ highlightedField: field }),
      
      // === AÇÕES DE LIMPEZA ===
      
      limparEstadosTemporarios: () => {
        set({
          showTooltip: null,
          highlightedField: null,
          loadingModal: null,
          erroModal: null
        });
      },
      
      resetarUI: () => {
        set({
          modalFormasAberto: false,
          modalAVistaAberto: false,
          modalBoletoAberto: false,
          modalCartaoAberto: false,
          modalFinanceiraAberto: false,
          formaEditando: null,
          modoEdicao: false,
          loading: false,
          loadingModal: null,
          erro: null,
          erroModal: null,
          validacaoAtiva: false,
          camposComErro: [],
          showTooltip: null,
          highlightedField: null
        });
      }
    }),
    { name: 'orcamento-ui-store' }
  )
);

// === HOOKS ESPECIALIZADOS ===

export const useOrcamentoModals = () => {
  const store = useOrcamentoUIStore();
  
  return {
    // Estados dos modais
    modalFormasAberto: store.modalFormasAberto,
    modalAVistaAberto: store.modalAVistaAberto,
    modalBoletoAberto: store.modalBoletoAberto,
    modalCartaoAberto: store.modalCartaoAberto,
    modalFinanceiraAberto: store.modalFinanceiraAberto,
    formaEditando: store.formaEditando,
    modoEdicao: store.modoEdicao,
    
    // Ações dos modais
    abrirModalFormas: store.abrirModalFormas,
    fecharModalFormas: store.fecharModalFormas,
    abrirModalEdicao: store.abrirModalEdicao,
    fecharModalEdicao: store.fecharModalEdicao,
    fecharTodosModais: store.fecharTodosModais
  };
};

export const useOrcamentoLoading = () => {
  const store = useOrcamentoUIStore();
  
  return {
    loading: store.loading,
    loadingModal: store.loadingModal,
    setLoading: store.setLoading,
    setLoadingModal: store.setLoadingModal
  };
};

export const useOrcamentoValidacao = () => {
  const store = useOrcamentoUIStore();
  
  return {
    validacaoAtiva: store.validacaoAtiva,
    camposComErro: store.camposComErro,
    erro: store.erro,
    erroModal: store.erroModal,
    setValidacaoAtiva: store.setValidacaoAtiva,
    adicionarCampoComErro: store.adicionarCampoComErro,
    removerCampoComErro: store.removerCampoComErro,
    limparErrosValidacao: store.limparErrosValidacao,
    setErro: store.setErro,
    setErroModal: store.setErroModal
  };
};