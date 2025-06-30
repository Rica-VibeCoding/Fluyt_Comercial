/**
 * Hook para gerenciamento de Tipos de Colaboradores
 * Integra com API real via service
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { TiposColaboradorService } from '@/services/colaboradores-service';
import {
  TipoColaborador,
  TipoColaboradorFormData,
  FiltrosTipoColaborador,
  TipoColaboradorListResponse
} from '@/types/colaboradores';

interface UseTiposColaboradoresOptions {
  carregarAoIniciar?: boolean;
  filtrosIniciais?: FiltrosTipoColaborador;
}

interface UseTiposColaboradoresReturn {
  // Estado
  tipos: TipoColaborador[];
  loading: boolean;
  error: string | null;
  
  // Filtros
  filtros: FiltrosTipoColaborador;
  setFiltros: (filtros: FiltrosTipoColaborador) => void;
  limparFiltros: () => void;
  
  // Operações CRUD
  carregarTipos: () => Promise<void>;
  criarTipo: (dados: TipoColaboradorFormData) => Promise<void>;
  atualizarTipo: (id: string, dados: TipoColaboradorFormData) => Promise<void>;
  alternarStatusTipo: (id: string) => Promise<void>;
  excluirTipo: (id: string) => Promise<void>;
  
  // Busca específica
  buscarTipoPorId: (id: string) => Promise<TipoColaborador | null>;
  
  // Dados computados
  tiposAtivos: TipoColaborador[];
  tiposFuncionarios: TipoColaborador[];
  tiposParceiros: TipoColaborador[];
  totalTipos: number;
  
  // Estados dos formulários
  formLoading: boolean;
}

const FILTROS_INICIAIS: FiltrosTipoColaborador = {
  busca: '',
  categoria: 'ALL',
  ativo: undefined,
  opcionalNoOrcamento: undefined
};

export function useTiposColaboradores(options: UseTiposColaboradoresOptions = {}): UseTiposColaboradoresReturn {
  const {
    carregarAoIniciar = true,
    filtrosIniciais = FILTROS_INICIAIS
  } = options;

  // Estados principais
  const [tipos, setTipos] = useState<TipoColaborador[]>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltrosTipoColaborador>(filtrosIniciais);
  const [initialized, setInitialized] = useState(false);

  // Função para carregar tipos (memoizada para evitar re-renders desnecessários)
  const carregarTipos = useCallback(async () => {
    if (loading) return; // Evitar múltiplas chamadas simultâneas
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Carregando tipos de colaboradores com filtros:', filtros);
      
      const response: TipoColaboradorListResponse = await TiposColaboradorService.listar(filtros);
      
      console.log('✅ Tipos carregados:', response.items.length);
      setTipos(response.items);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar tipos de colaboradores';
      console.error('❌ Erro ao carregar tipos:', err);
      setError(errorMessage);
      
      // Só mostrar toast se não for o primeiro carregamento
      if (initialized) {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
      if (!initialized) {
        setInitialized(true);
      }
    }
  }, [loading, initialized]); // REMOVIDO 'filtros' da dependência

  // Criar novo tipo
  const criarTipo = useCallback(async (dados: TipoColaboradorFormData) => {
    try {
      setFormLoading(true);
      console.log('➕ Criando novo tipo:', dados.nome);
      
      const novoTipo = await TiposColaboradorService.criar(dados);
      
      // Atualizar lista local
      setTipos(prev => {
        const updated = [...prev, novoTipo].sort((a, b) => a.nome.localeCompare(b.nome));
        console.log('✅ Tipo criado e adicionado à lista');
        return updated;
      });
      
      toast.success(`Tipo "${dados.nome}" criado com sucesso!`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar tipo de colaborador';
      console.error('❌ Erro ao criar tipo:', err);
      toast.error(errorMessage);
      throw err;
    } finally {
      setFormLoading(false);
    }
  }, []);

  // Atualizar tipo existente
  const atualizarTipo = useCallback(async (id: string, dados: TipoColaboradorFormData) => {
    try {
      setFormLoading(true);
      console.log('✏️ Atualizando tipo:', id, dados.nome);
      
      const tipoAtualizado = await TiposColaboradorService.atualizar(id, dados);
      
      // Atualizar lista local
      setTipos(prev => {
        const updated = prev.map(tipo => tipo.id === id ? tipoAtualizado : tipo)
                          .sort((a, b) => a.nome.localeCompare(b.nome));
        console.log('✅ Tipo atualizado na lista');
        return updated;
      });
      
      toast.success(`Tipo "${dados.nome}" atualizado com sucesso!`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar tipo de colaborador';
      console.error('❌ Erro ao atualizar tipo:', err);
      toast.error(errorMessage);
      throw err;
    } finally {
      setFormLoading(false);
    }
  }, []);

  // Alternar status do tipo
  const alternarStatusTipo = useCallback(async (id: string) => {
    try {
      console.log('🔄 Alternando status do tipo:', id);
      
      const tipoAtualizado = await TiposColaboradorService.alternarStatus(id);
      
      // Atualizar lista local
      setTipos(prev => {
        const updated = prev.map(tipo => tipo.id === id ? tipoAtualizado : tipo);
        console.log('✅ Status alterado na lista');
        return updated;
      });
      
      const statusText = tipoAtualizado.ativo ? 'ativado' : 'desativado';
      toast.success(`Tipo "${tipoAtualizado.nome}" ${statusText} com sucesso!`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao alterar status do tipo';
      console.error('❌ Erro ao alterar status:', err);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Excluir tipo
  const excluirTipo = useCallback(async (id: string) => {
    try {
      const tipoParaExcluir = tipos.find(t => t.id === id);
      console.log('🗑️ Excluindo tipo:', id, tipoParaExcluir?.nome);
      
      await TiposColaboradorService.excluir(id);
      
      // Remover da lista local
      setTipos(prev => {
        const updated = prev.filter(tipo => tipo.id !== id);
        console.log('✅ Tipo removido da lista');
        return updated;
      });
      
      toast.success(`Tipo "${tipoParaExcluir?.nome || 'desconhecido'}" excluído com sucesso!`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir tipo de colaborador';
      console.error('❌ Erro ao excluir tipo:', err);
      toast.error(errorMessage);
      throw err;
    }
  }, [tipos]);

  // Buscar tipo específico por ID
  const buscarTipoPorId = useCallback(async (id: string): Promise<TipoColaborador | null> => {
    try {
      console.log('🔍 Buscando tipo por ID:', id);
      return await TiposColaboradorService.buscarPorId(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar tipo de colaborador';
      console.error('❌ Erro ao buscar tipo:', err);
      toast.error(errorMessage);
      return null;
    }
  }, []);

  // Limpar filtros
  const limparFiltros = useCallback(() => {
    console.log('🧹 Limpando filtros');
    setFiltros(FILTROS_INICIAIS);
  }, []);

  // Dados computados usando useMemo para otimização
  const tiposAtivos = useMemo(() => 
    tipos.filter(tipo => tipo.ativo), 
    [tipos]
  );

  const tiposFuncionarios = useMemo(() => 
    tipos.filter(tipo => tipo.categoria === 'FUNCIONARIO'), 
    [tipos]
  );

  const tiposParceiros = useMemo(() => 
    tipos.filter(tipo => tipo.categoria === 'PARCEIRO'), 
    [tipos]
  );

  const totalTipos = useMemo(() => tipos.length, [tipos]);

  // Effect para carregar dados inicial
  useEffect(() => {
    if (carregarAoIniciar && !initialized) {
      console.log('🚀 Carregamento inicial dos tipos');
      carregarTipos();
    }
  }, [carregarAoIniciar, initialized, carregarTipos]);

  // Effect para recarregar quando filtros mudarem (apenas após inicialização)
  useEffect(() => {
    if (initialized) {
      console.log('🔄 Filtros alterados, recarregando tipos');
      carregarTipos();
    }
  }, [filtros, initialized]); // REMOVIDO 'carregarTipos' da dependência

  return {
    // Estado
    tipos,
    loading,
    error,
    
    // Filtros
    filtros,
    setFiltros,
    limparFiltros,
    
    // Operações CRUD
    carregarTipos,
    criarTipo,
    atualizarTipo,
    alternarStatusTipo,
    excluirTipo,
    
    // Busca específica
    buscarTipoPorId,
    
    // Dados computados
    tiposAtivos,
    tiposFuncionarios,
    tiposParceiros,
    totalTipos,
    
    // Estados dos formulários
    formLoading
  };
} 