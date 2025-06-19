import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Cliente } from '@/types/cliente';
import { Ambiente } from '@/types/ambiente';
import { persistenciaInteligente, SessaoCliente } from '../lib/persistencia-inteligente';
import { sessionLogger } from '../lib/logger';

interface SessaoState {
  // Estado da sessão
  cliente: Cliente | null;
  ambientes: Ambiente[];
  valorTotalAmbientes: number;
  ultimaAtualizacao: string;
  
  // Estado do orçamento
  orcamentoConfigurado: boolean;
  valorNegociado: number;
  formasPagamento: number; // Quantidade de formas de pagamento
  descontoReal: number; // Desconto real calculado pelo simulador (%)
  
  // Ações para gerenciar cliente
  definirCliente: (cliente: Cliente | null) => void;
  limparCliente: () => void;
  
  // Ações para gerenciar ambientes
  definirAmbientes: (ambientes: Ambiente[]) => void;
  adicionarAmbiente: (ambiente: Ambiente) => void;
  removerAmbiente: (ambienteId: string) => void;
  
  // Ações para gerenciar orçamento
  definirOrcamento: (valorNegociado: number, formasPagamento: number, descontoReal?: number) => void;
  limparOrcamento: () => void;
  
  // Ações para gerenciar sessão
  limparSessaoCompleta: () => void;
  
  // Ações para persistência inteligente
  carregarSessaoCliente: (clienteId: string) => void;
  salvarSessaoAtual: () => void;
  iniciarNovoFluxoCliente: (cliente: Cliente) => void;
  
  // Getters computados
  podeGerarOrcamento: () => boolean;
  podeGerarContrato: () => boolean;
  obterResumo: () => {
    temCliente: boolean;
    quantidadeAmbientes: number;
    valorTotal: number;
    podeAvancar: boolean;
  };
}

export const useSessaoStore = create<SessaoState>()(
  devtools(
    (set, get) => ({
      // Estado inicial
      cliente: null,
      ambientes: [],
      valorTotalAmbientes: 0,
      ultimaAtualizacao: new Date().toISOString(),
      
      // Estado inicial do orçamento
      orcamentoConfigurado: false,
      valorNegociado: 0,
      formasPagamento: 0,
      descontoReal: 0,

      // === AÇÕES PARA CLIENTE ===
      definirCliente: (cliente) => {
        sessionLogger.debug('SessaoStore.definirCliente', {
          anterior: get().cliente?.nome || 'null',
          novo: cliente?.nome || 'null'
        });

        const state = get();
        const clienteMudou = cliente?.id !== state.cliente?.id;

        if (clienteMudou && cliente?.id) {
          // Tentar carregar sessão existente primeiro (apenas no cliente)
          const sessaoExistente = typeof window !== 'undefined' 
            ? persistenciaInteligente.recuperarSessaoCliente(cliente.id)
            : null;
          
          if (sessaoExistente) {
            sessionLogger.info('Carregando sessão existente do cliente', { clienteNome: cliente.nome });
            set({
              cliente: sessaoExistente.cliente,
              ambientes: sessaoExistente.ambientes,
              valorTotalAmbientes: sessaoExistente.ambientes.reduce((total, amb) => total + amb.valorTotal, 0),
              orcamentoConfigurado: sessaoExistente.orcamento.configurado,
              valorNegociado: sessaoExistente.orcamento.valorNegociado,
              formasPagamento: sessaoExistente.orcamento.formasPagamento,
              descontoReal: sessaoExistente.orcamento.descontoReal || 0,
              ultimaAtualizacao: new Date().toISOString()
            }, false, 'definirCliente');
            return;
          }
        }

        set((state) => {
          return {
            cliente,
            // Limpar ambientes e orçamento se cliente mudou
            ambientes: clienteMudou ? [] : state.ambientes,
            valorTotalAmbientes: clienteMudou ? 0 : state.valorTotalAmbientes,
            orcamentoConfigurado: clienteMudou ? false : state.orcamentoConfigurado,
            valorNegociado: clienteMudou ? 0 : state.valorNegociado,
            formasPagamento: clienteMudou ? 0 : state.formasPagamento,
            descontoReal: clienteMudou ? 0 : state.descontoReal,
            ultimaAtualizacao: new Date().toISOString()
          };
        }, false, 'definirCliente');

        // Salvar automaticamente após mudança
        setTimeout(() => {
          get().salvarSessaoAtual();
        }, 100);
      },

      limparCliente: () => {
        console.log('🧹 SessaoStore.limparCliente');
        set({
          cliente: null,
          ambientes: [],
          valorTotalAmbientes: 0,
          orcamentoConfigurado: false,
          valorNegociado: 0,
          formasPagamento: 0,
          descontoReal: 0,
          ultimaAtualizacao: new Date().toISOString()
        }, false, 'limparCliente');
      },

      // === AÇÕES PARA AMBIENTES ===
      definirAmbientes: (ambientes) => {
        const state = get();
        
        // Verificar se os ambientes realmente mudaram
        const ambientesIguais = state.ambientes.length === ambientes.length && 
          state.ambientes.every((amb, index) => amb.id === ambientes[index]?.id);
        
        if (ambientesIguais) {
          return; // Não fazer nada se os ambientes são iguais
        }
        
        const valorTotal = ambientes.reduce((total, ambiente) => total + ambiente.valorTotal, 0);
        
        console.log('📋 SessaoStore.definirAmbientes:', {
          quantidade: ambientes.length,
          valorTotal
        });
        
        set({
          ambientes,
          valorTotalAmbientes: valorTotal,
          ultimaAtualizacao: new Date().toISOString()
        }, false, 'definirAmbientes');
      },

      adicionarAmbiente: (ambiente) => {
        console.log('➕ SessaoStore.adicionarAmbiente:', ambiente.nome);
        
        set((state) => {
          const novosAmbientes = [...state.ambientes, ambiente];
          const valorTotal = novosAmbientes.reduce((total, amb) => total + amb.valorTotal, 0);
          
          return {
            ambientes: novosAmbientes,
            valorTotalAmbientes: valorTotal,
            ultimaAtualizacao: new Date().toISOString()
          };
        }, false, 'adicionarAmbiente');

        // Salvar automaticamente após mudança
        setTimeout(() => {
          get().salvarSessaoAtual();
        }, 100);
      },

      removerAmbiente: (ambienteId) => {
        console.log('➖ SessaoStore.removerAmbiente:', ambienteId);
        
        set((state) => {
          const novosAmbientes = state.ambientes.filter(amb => amb.id !== ambienteId);
          const valorTotal = novosAmbientes.reduce((total, amb) => total + amb.valorTotal, 0);
          
          return {
            ambientes: novosAmbientes,
            valorTotalAmbientes: valorTotal,
            ultimaAtualizacao: new Date().toISOString()
          };
        }, false, 'removerAmbiente');
      },

      // === AÇÕES PARA ORÇAMENTO ===
      definirOrcamento: (valorNegociado, formasPagamento, descontoReal = 0) => {
        console.log('💰 SessaoStore.definirOrcamento:', { valorNegociado, formasPagamento, descontoReal });
        
        set({
          orcamentoConfigurado: formasPagamento > 0,
          valorNegociado,
          formasPagamento,
          descontoReal,
          ultimaAtualizacao: new Date().toISOString()
        }, false, 'definirOrcamento');

        // Salvar automaticamente após mudança
        setTimeout(() => {
          get().salvarSessaoAtual();
        }, 100);
      },

      limparOrcamento: () => {
        console.log('🧹 SessaoStore.limparOrcamento');
        set({
          orcamentoConfigurado: false,
          valorNegociado: 0,
          formasPagamento: 0,
          descontoReal: 0,
          ultimaAtualizacao: new Date().toISOString()
        }, false, 'limparOrcamento');
      },

      // === AÇÕES PARA SESSÃO ===
      limparSessaoCompleta: () => {
        console.log('🧹 SessaoStore.limparSessaoCompleta');
        const state = get();
        
        // Limpar persistência se houver cliente ativo (apenas no cliente)
        if (state.cliente?.id && typeof window !== 'undefined') {
          persistenciaInteligente.limparSessaoCliente(state.cliente.id);
        }
        
        set({
          cliente: null,
          ambientes: [],
          valorTotalAmbientes: 0,
          orcamentoConfigurado: false,
          valorNegociado: 0,
          formasPagamento: 0,
          descontoReal: 0,
          ultimaAtualizacao: new Date().toISOString()
        }, false, 'limparSessaoCompleta');
      },

      // === AÇÕES PARA PERSISTÊNCIA INTELIGENTE ===
      carregarSessaoCliente: (clienteId: string) => {
        console.log('📂 SessaoStore.carregarSessaoCliente:', clienteId);
        
        // Só carregar no cliente para evitar erros SSR
        if (typeof window === 'undefined') {
          console.log('⚠️ carregarSessaoCliente ignorado durante SSR');
          return;
        }
        
        const sessaoSalva = persistenciaInteligente.recuperarSessaoCliente(clienteId);
        
        if (sessaoSalva) {
          console.log('✅ Sessão recuperada do cache:', sessaoSalva);
          set({
            cliente: sessaoSalva.cliente,
            ambientes: sessaoSalva.ambientes,
            valorTotalAmbientes: sessaoSalva.ambientes.reduce((total, amb) => total + amb.valorTotal, 0),
            orcamentoConfigurado: sessaoSalva.orcamento.configurado,
            valorNegociado: sessaoSalva.orcamento.valorNegociado,
            formasPagamento: sessaoSalva.orcamento.formasPagamento,
            descontoReal: sessaoSalva.orcamento.descontoReal || 0,
            ultimaAtualizacao: new Date().toISOString()
          }, false, 'carregarSessaoCliente');
        } else {
          console.log('📭 Nenhuma sessão encontrada para cliente:', clienteId);
        }
      },

      salvarSessaoAtual: () => {
        const state = get();
        
        if (!state.cliente?.id) {
          console.log('⚠️ Tentativa de salvar sessão sem cliente ativo');
          return;
        }

        const sessaoParaSalvar: SessaoCliente = {
          cliente: state.cliente,
          ambientes: state.ambientes,
          orcamento: {
            valorNegociado: state.valorNegociado,
            formasPagamento: state.formasPagamento,
            configurado: state.orcamentoConfigurado,
            descontoReal: state.descontoReal
          },
          metadata: {
            iniciadoEm: Date.now(),
            ultimaAtividade: Date.now(),
            versaoApp: '1.0.0'
          }
        };

        // Só salvar no cliente para evitar erros SSR
        if (typeof window !== 'undefined') {
          persistenciaInteligente.salvarSessaoCliente(state.cliente.id, sessaoParaSalvar);
          console.log('💾 Sessão atual salva para cliente:', state.cliente.nome);
        } else {
          console.log('⚠️ salvarSessaoAtual ignorado durante SSR');
        }
      },

      iniciarNovoFluxoCliente: (cliente: Cliente) => {
        console.log('🆕 SessaoStore.iniciarNovoFluxoCliente:', cliente.nome);
        
        // Limpar estado atual
        set({
          cliente,
          ambientes: [],
          valorTotalAmbientes: 0,
          orcamentoConfigurado: false,
          valorNegociado: 0,
          formasPagamento: 0,
          descontoReal: 0,
          ultimaAtualizacao: new Date().toISOString()
        }, false, 'iniciarNovoFluxoCliente');

        // Salvar novo fluxo limpo na persistência (apenas no cliente)
        if (typeof window !== 'undefined') {
          persistenciaInteligente.iniciarNovoFluxo(cliente.id, { cliente });
        }
      },

      // === GETTERS COMPUTADOS ===
      podeGerarOrcamento: () => {
        const state = get();
        return !!(state.cliente && state.ambientes.length > 0 && state.valorTotalAmbientes > 0);
      },

      podeGerarContrato: () => {
        const state = get();
        const podeOrcamento = state.podeGerarOrcamento();
        const temOrcamento = state.orcamentoConfigurado;
        const temPagamento = state.formasPagamento > 0;
        
        // Debug temporário
        console.log('🎯 podeGerarContrato:', {
          podeOrcamento,
          temOrcamento,
          temPagamento,
          cliente: state.cliente?.nome || 'null',
          ambientes: state.ambientes.length,
          valorTotal: state.valorTotalAmbientes,
          formasPagamento: state.formasPagamento,
          resultado: podeOrcamento && temOrcamento && temPagamento
        });
        
        return podeOrcamento && temOrcamento && temPagamento;
      },

      obterResumo: () => {
        const state = get();
        return {
          temCliente: !!state.cliente,
          quantidadeAmbientes: state.ambientes.length,
          valorTotal: state.valorTotalAmbientes,
          orcamentoConfigurado: state.orcamentoConfigurado,
          formasPagamento: state.formasPagamento,
          podeAvancar: state.podeGerarOrcamento(),
          podeFinalizarContrato: state.podeGerarContrato()
        };
      }
    }),
    {
      name: 'sessao-store', // nome para dev tools
    }
  )
);

// Hook personalizado para facilitar o uso
export const useSessao = () => {
  const store = useSessaoStore();
  
  // Proteger contra erros de hidratação
  if (typeof window === 'undefined') {
    // Durante SSR, retornar estado padrão baseado na store
    return {
      ...store,
      cliente: null,
      ambientes: [],
      valorTotalAmbientes: 0,
      orcamentoConfigurado: false,
      valorNegociado: 0,
      formasPagamento: 0,
      descontoReal: 0,
      podeGerarOrcamento: () => false,
      podeGerarContrato: () => false,
    };
  }
  
  // Debug opcional: monitorar estado (pode ser removido em produção)
  // console.log('🔄 useSessao estado:', {
  //   cliente: store.cliente?.nome || 'null',
  //   clienteId: store.cliente?.id || 'null',
  //   ambientes: store.ambientes.length
  // });
  
  return store;
};