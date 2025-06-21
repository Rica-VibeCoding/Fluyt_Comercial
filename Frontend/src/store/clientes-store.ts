/**
 * Store Zustand para gerenciamento de clientes
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Cliente } from '@/types/cliente';

interface ClientesState {
  // Estado dos dados
  clientes: Cliente[];
  clienteSelecionado: Cliente | null;
  
  // Estados de UI
  loading: boolean;
  erro: string | null;
  totalPaginas: number;
  paginaAtual: number;
  
  // Filtros
  filtros: {
    busca: string;
    tipoVenda: string;
    procedencia: string;
    vendedor: string;
  };
  
  // Ações de dados
  setClientes: (clientes: Cliente[]) => void;
  adicionarCliente: (cliente: Cliente) => void;
  atualizarCliente: (id: string, dadosAtualizados: Partial<Cliente>) => void;
  removerCliente: (id: string) => void;
  selecionarCliente: (cliente: Cliente | null) => void;
  
  // Ações de UI
  setLoading: (loading: boolean) => void;
  setErro: (erro: string | null) => void;
  setPaginacao: (pagina: number, total: number) => void;
  
  // Ações de filtros
  setFiltros: (filtros: Partial<ClientesState['filtros']>) => void;
  limparFiltros: () => void;
  
  // Ações de busca
  buscarClientes: (termo: string) => Cliente[];
  obterClientePorId: (id: string) => Cliente | undefined;
}

const filtrosIniciais = {
  busca: '',
  tipoVenda: '',
  procedencia: '',
  vendedor: ''
};

export const useClientesStore = create<ClientesState>()(
  devtools(
    (set, get) => ({
      // Estado inicial
      clientes: [],
      clienteSelecionado: null,
      loading: false,
      erro: null,
      totalPaginas: 0,
      paginaAtual: 1,
      filtros: filtrosIniciais,
      
      // Ações de dados
      setClientes: (clientes) => set({ clientes }),
      
      adicionarCliente: (cliente) => set((state) => ({
        clientes: [...state.clientes, cliente]
      })),
      
      atualizarCliente: (id, dadosAtualizados) => set((state) => ({
        clientes: state.clientes.map(cliente => 
          cliente.id === id ? { ...cliente, ...dadosAtualizados } : cliente
        ),
        clienteSelecionado: state.clienteSelecionado?.id === id 
          ? { ...state.clienteSelecionado, ...dadosAtualizados }
          : state.clienteSelecionado
      })),
      
      removerCliente: (id) => set((state) => ({
        clientes: state.clientes.filter(cliente => cliente.id !== id),
        clienteSelecionado: state.clienteSelecionado?.id === id 
          ? null 
          : state.clienteSelecionado
      })),
      
      selecionarCliente: (cliente) => set({ clienteSelecionado: cliente }),
      
      // Ações de UI
      setLoading: (loading) => set({ loading }),
      setErro: (erro) => set({ erro }),
      setPaginacao: (pagina, total) => set({ 
        paginaAtual: pagina, 
        totalPaginas: total 
      }),
      
      // Ações de filtros
      setFiltros: (novosFiltros) => set((state) => ({
        filtros: { ...state.filtros, ...novosFiltros }
      })),
      
      limparFiltros: () => set({ filtros: filtrosIniciais }),
      
      // Ações de busca
      buscarClientes: (termo) => {
        const { clientes } = get();
        if (!termo.trim()) return clientes;
        
        const termoBusca = termo.toLowerCase();
        return clientes.filter(cliente =>
          cliente.nome.toLowerCase().includes(termoBusca) ||
          cliente.email.toLowerCase().includes(termoBusca) ||
          cliente.telefone.includes(termoBusca) ||
          cliente.cpf_cnpj.includes(termoBusca)
        );
      },
      
      obterClientePorId: (id) => {
        const { clientes } = get();
        return clientes.find(cliente => cliente.id === id);
      }
    }),
    { name: 'clientes-store' }
  )
);