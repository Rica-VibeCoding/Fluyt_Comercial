/**
 * Store Zustand centralizada para módulos do sistema
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Empresa, Funcionario, Setor, Loja, RegraComissao, Montador, Transportadora } from '@/types/sistema';

interface SistemaState {
  // Estados de dados
  empresas: Empresa[];
  funcionarios: Funcionario[];
  setores: Setor[];
  lojas: Loja[];
  regrasComissao: RegraComissao[];
  montadores: Montador[];
  transportadoras: Transportadora[];
  
  // Estados de loading
  loadingEmpresas: boolean;
  loadingFuncionarios: boolean;
  loadingSetores: boolean;
  loadingLojas: boolean;
  loadingRegrasComissao: boolean;
  loadingMontadores: boolean;
  loadingTransportadoras: boolean;
  
  // Estados de erro
  erroEmpresas: string | null;
  erroFuncionarios: string | null;
  erroSetores: string | null;
  erroLojas: string | null;
  erroRegrasComissao: string | null;
  erroMontadores: string | null;
  erroTransportadoras: string | null;
  
  // Ações para empresas
  setEmpresas: (empresas: Empresa[]) => void;
  adicionarEmpresa: (empresa: Empresa) => void;
  atualizarEmpresa: (id: string, dadosAtualizados: Partial<Empresa>) => void;
  removerEmpresa: (id: string) => void;
  setLoadingEmpresas: (loading: boolean) => void;
  setErroEmpresas: (erro: string | null) => void;
  
  // Ações para funcionários
  setFuncionarios: (funcionarios: Funcionario[]) => void;
  adicionarFuncionario: (funcionario: Funcionario) => void;
  atualizarFuncionario: (id: string, dadosAtualizados: Partial<Funcionario>) => void;
  removerFuncionario: (id: string) => void;
  setLoadingFuncionarios: (loading: boolean) => void;
  setErroFuncionarios: (erro: string | null) => void;
  
  // Ações para setores
  setSetores: (setores: Setor[]) => void;
  adicionarSetor: (setor: Setor) => void;
  atualizarSetor: (id: string, dadosAtualizados: Partial<Setor>) => void;
  removerSetor: (id: string) => void;
  setLoadingSetores: (loading: boolean) => void;
  setErroSetores: (erro: string | null) => void;
  
  // Ações para lojas
  setLojas: (lojas: Loja[]) => void;
  adicionarLoja: (loja: Loja) => void;
  atualizarLoja: (id: string, dadosAtualizados: Partial<Loja>) => void;
  removerLoja: (id: string) => void;
  setLoadingLojas: (loading: boolean) => void;
  setErroLojas: (erro: string | null) => void;
  
  // Ações para regras de comissão
  setRegrasComissao: (regras: RegraComissao[]) => void;
  adicionarRegraComissao: (regra: RegraComissao) => void;
  atualizarRegraComissao: (id: string, dadosAtualizados: Partial<RegraComissao>) => void;
  removerRegraComissao: (id: string) => void;
  setLoadingRegrasComissao: (loading: boolean) => void;
  setErroRegrasComissao: (erro: string | null) => void;
  
  // Ações para montadores
  setMontadores: (montadores: Montador[]) => void;
  adicionarMontador: (montador: Montador) => void;
  atualizarMontador: (id: string, dadosAtualizados: Partial<Montador>) => void;
  removerMontador: (id: string) => void;
  setLoadingMontadores: (loading: boolean) => void;
  setErroMontadores: (erro: string | null) => void;
  
  // Ações para transportadoras
  setTransportadoras: (transportadoras: Transportadora[]) => void;
  adicionarTransportadora: (transportadora: Transportadora) => void;
  atualizarTransportadora: (id: string, dadosAtualizados: Partial<Transportadora>) => void;
  removerTransportadora: (id: string) => void;
  setLoadingTransportadoras: (loading: boolean) => void;
  setErroTransportadoras: (erro: string | null) => void;
}

export const useSistemaStore = create<SistemaState>()(
  devtools(
    (set) => ({
      // Estados iniciais
      empresas: [],
      funcionarios: [],
      setores: [],
      lojas: [],
      regrasComissao: [],
      montadores: [],
      transportadoras: [],
      
      // Loading states
      loadingEmpresas: false,
      loadingFuncionarios: false,
      loadingSetores: false,
      loadingLojas: false,
      loadingRegrasComissao: false,
      loadingMontadores: false,
      loadingTransportadoras: false,
      
      // Error states
      erroEmpresas: null,
      erroFuncionarios: null,
      erroSetores: null,
      erroLojas: null,
      erroRegrasComissao: null,
      erroMontadores: null,
      erroTransportadoras: null,
      
      // Empresas
      setEmpresas: (empresas) => set({ empresas }),
      adicionarEmpresa: (empresa) => set((state) => ({ 
        empresas: [...state.empresas, empresa] 
      })),
      atualizarEmpresa: (id, dadosAtualizados) => set((state) => ({
        empresas: state.empresas.map(empresa => 
          empresa.id === id ? { ...empresa, ...dadosAtualizados } : empresa
        )
      })),
      removerEmpresa: (id) => set((state) => ({
        empresas: state.empresas.filter(empresa => empresa.id !== id)
      })),
      setLoadingEmpresas: (loading) => set({ loadingEmpresas: loading }),
      setErroEmpresas: (erro) => set({ erroEmpresas: erro }),
      
      // Funcionários
      setFuncionarios: (funcionarios) => set({ funcionarios }),
      adicionarFuncionario: (funcionario) => set((state) => ({ 
        funcionarios: [...state.funcionarios, funcionario] 
      })),
      atualizarFuncionario: (id, dadosAtualizados) => set((state) => ({
        funcionarios: state.funcionarios.map(funcionario => 
          funcionario.id === id ? { ...funcionario, ...dadosAtualizados } : funcionario
        )
      })),
      removerFuncionario: (id) => set((state) => ({
        funcionarios: state.funcionarios.filter(funcionario => funcionario.id !== id)
      })),
      setLoadingFuncionarios: (loading) => set({ loadingFuncionarios: loading }),
      setErroFuncionarios: (erro) => set({ erroFuncionarios: erro }),
      
      // Setores
      setSetores: (setores) => set({ setores }),
      adicionarSetor: (setor) => set((state) => ({ 
        setores: [...state.setores, setor] 
      })),
      atualizarSetor: (id, dadosAtualizados) => set((state) => ({
        setores: state.setores.map(setor => 
          setor.id === id ? { ...setor, ...dadosAtualizados } : setor
        )
      })),
      removerSetor: (id) => set((state) => ({
        setores: state.setores.filter(setor => setor.id !== id)
      })),
      setLoadingSetores: (loading) => set({ loadingSetores: loading }),
      setErroSetores: (erro) => set({ erroSetores: erro }),
      
      // Lojas
      setLojas: (lojas) => set({ lojas }),
      adicionarLoja: (loja) => set((state) => ({ 
        lojas: [...state.lojas, loja] 
      })),
      atualizarLoja: (id, dadosAtualizados) => set((state) => ({
        lojas: state.lojas.map(loja => 
          loja.id === id ? { ...loja, ...dadosAtualizados } : loja
        )
      })),
      removerLoja: (id) => set((state) => ({
        lojas: state.lojas.filter(loja => loja.id !== id)
      })),
      setLoadingLojas: (loading) => set({ loadingLojas: loading }),
      setErroLojas: (erro) => set({ erroLojas: erro }),
      
      // Regras de Comissão
      setRegrasComissao: (regras) => set({ regrasComissao: regras }),
      adicionarRegraComissao: (regra) => set((state) => ({ 
        regrasComissao: [...state.regrasComissao, regra] 
      })),
      atualizarRegraComissao: (id, dadosAtualizados) => set((state) => ({
        regrasComissao: state.regrasComissao.map(regra => 
          regra.id === id ? { ...regra, ...dadosAtualizados } : regra
        )
      })),
      removerRegraComissao: (id) => set((state) => ({
        regrasComissao: state.regrasComissao.filter(regra => regra.id !== id)
      })),
      setLoadingRegrasComissao: (loading) => set({ loadingRegrasComissao: loading }),
      setErroRegrasComissao: (erro) => set({ erroRegrasComissao: erro }),
      
      // Montadores
      setMontadores: (montadores) => set({ montadores }),
      adicionarMontador: (montador) => set((state) => ({ 
        montadores: [...state.montadores, montador] 
      })),
      atualizarMontador: (id, dadosAtualizados) => set((state) => ({
        montadores: state.montadores.map(montador => 
          montador.id === id ? { ...montador, ...dadosAtualizados } : montador
        )
      })),
      removerMontador: (id) => set((state) => ({
        montadores: state.montadores.filter(montador => montador.id !== id)
      })),
      setLoadingMontadores: (loading) => set({ loadingMontadores: loading }),
      setErroMontadores: (erro) => set({ erroMontadores: erro }),
      
      // Transportadoras
      setTransportadoras: (transportadoras) => set({ transportadoras }),
      adicionarTransportadora: (transportadora) => set((state) => ({ 
        transportadoras: [...state.transportadoras, transportadora] 
      })),
      atualizarTransportadora: (id, dadosAtualizados) => set((state) => ({
        transportadoras: state.transportadoras.map(transportadora => 
          transportadora.id === id ? { ...transportadora, ...dadosAtualizados } : transportadora
        )
      })),
      removerTransportadora: (id) => set((state) => ({
        transportadoras: state.transportadoras.filter(transportadora => transportadora.id !== id)
      })),
      setLoadingTransportadoras: (loading) => set({ loadingTransportadoras: loading }),
      setErroTransportadoras: (erro) => set({ erroTransportadoras: erro }),
    }),
    { name: 'sistema-store' }
  )
);