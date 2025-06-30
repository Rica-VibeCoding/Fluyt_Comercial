/**
 * Hook para gerenciamento de Colaboradores Individuais
 * Integra com API real via ColaboradoresService
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { ColaboradoresService } from '@/services/colaboradores-service';
import {
  Colaborador,
  ColaboradorFormData,
  ColaboradorUpdate,
  FiltrosColaborador,
  ColaboradorListResponse,
  TipoColaborador
} from '@/types/colaboradores';

interface UseColaboradoresOptions {
  carregarAoIniciar?: boolean;
  filtrosIniciais?: FiltrosColaborador;
}

interface UseColaboradoresReturn {
  // Estado
  colaboradores: Colaborador[];
  loading: boolean;
  error: string | null;
  
  // Filtros
  filtros: FiltrosColaborador;
  setFiltros: (filtros: FiltrosColaborador) => void;
  limparFiltros: () => void;
  
  // Operações CRUD
  carregarColaboradores: () => Promise<void>;
  criarColaborador: (dados: ColaboradorFormData) => Promise<void>;
  atualizarColaborador: (id: string, dados: ColaboradorFormData) => Promise<void>;
  alternarStatusColaborador: (id: string) => Promise<void>;
  excluirColaborador: (id: string) => Promise<void>;
  
  // Busca específica
  buscarColaboradorPorId: (id: string) => Promise<Colaborador | null>;
  
  // Dados computados
  colaboradoresAtivos: Colaborador[];
  colaboradoresFuncionarios: Colaborador[];
  colaboradoresParceiros: Colaborador[];
  totalColaboradores: number;
  
  // Métodos auxiliares (compatibilidade)
  createColaborador: (data: ColaboradorFormData) => Promise<Colaborador>;
  updateColaborador: (id: string, data: ColaboradorFormData) => Promise<Colaborador | undefined>;
  deleteColaborador: (id: string) => Promise<void>;
  toggleAtivo: (id: string) => Promise<void>;
  getColaboradorById: (id: string) => Colaborador | undefined;
  getColaboradoresByTipo: (tipoColaboradorId: string) => Colaborador[];
  getColaboradoresByCategoria: (categoria: 'FUNCIONARIO' | 'PARCEIRO') => Colaborador[];
  
  // Estados dos formulários
  formLoading: boolean;
  isLoading: boolean; // Alias para compatibilidade
}

const FILTROS_INICIAIS: FiltrosColaborador = {
  busca: '',
  categoria: 'ALL',
  ativo: undefined,
  tipoColaboradorId: undefined
};

export function useColaboradores(
  tiposColaboradores?: TipoColaborador[], 
  options: UseColaboradoresOptions = {}
): UseColaboradoresReturn {
  const {
    carregarAoIniciar = true,
    filtrosIniciais = FILTROS_INICIAIS
  } = options;

  // Estados principais
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltrosColaborador>(filtrosIniciais);
  const [initialized, setInitialized] = useState(false);

  // Função para carregar colaboradores
  const carregarColaboradores = useCallback(async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Carregando colaboradores com filtros:', filtros);
      
      const response: ColaboradorListResponse = await ColaboradoresService.listar(filtros);
      
      console.log('✅ Colaboradores carregados:', response.items.length);
      setColaboradores(response.items);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar colaboradores';
      console.error('❌ Erro ao carregar colaboradores:', err);
      setError(errorMessage);
      
      if (initialized) {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
      if (!initialized) {
        setInitialized(true);
      }
    }
  }, [loading, initialized]);

  // Criar novo colaborador
  const criarColaborador = useCallback(async (dados: ColaboradorFormData) => {
    try {
      setFormLoading(true);
      console.log('➕ Criando novo colaborador:', dados.nome);
      
      const novoColaborador = await ColaboradoresService.criar(dados);
      
      setColaboradores(prev => {
        const updated = [...prev, novoColaborador].sort((a, b) => a.nome.localeCompare(b.nome));
        console.log('✅ Colaborador criado e adicionado à lista');
        return updated;
      });
      
      toast.success(`Colaborador "${dados.nome}" criado com sucesso!`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar colaborador';
      console.error('❌ Erro ao criar colaborador:', err);
      toast.error(errorMessage);
      throw err;
    } finally {
      setFormLoading(false);
    }
  }, []);

  // Atualizar colaborador existente
  const atualizarColaborador = useCallback(async (id: string, dados: ColaboradorFormData) => {
    try {
      setFormLoading(true);
      console.log('✏️ Atualizando colaborador:', id, dados.nome);
      
      const colaboradorAtualizado = await ColaboradoresService.atualizar(id, dados);
      
      setColaboradores(prev => {
        const updated = prev.map(colaborador => colaborador.id === id ? colaboradorAtualizado : colaborador)
                          .sort((a, b) => a.nome.localeCompare(b.nome));
        console.log('✅ Colaborador atualizado na lista');
        return updated;
      });
      
      toast.success(`Colaborador "${dados.nome}" atualizado com sucesso!`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar colaborador';
      console.error('❌ Erro ao atualizar colaborador:', err);
      toast.error(errorMessage);
      throw err;
    } finally {
      setFormLoading(false);
    }
  }, []);

  // Alternar status do colaborador
  const alternarStatusColaborador = useCallback(async (id: string) => {
    try {
      console.log('🔄 Alternando status do colaborador:', id);
      
      const colaboradorAtualizado = await ColaboradoresService.alternarStatus(id);
      
      setColaboradores(prev => {
        const updated = prev.map(colaborador => colaborador.id === id ? colaboradorAtualizado : colaborador);
        console.log('✅ Status alterado na lista');
        return updated;
      });
      
      const statusText = colaboradorAtualizado.ativo ? 'ativado' : 'desativado';
      toast.success(`Colaborador "${colaboradorAtualizado.nome}" ${statusText} com sucesso!`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao alterar status do colaborador';
      console.error('❌ Erro ao alterar status:', err);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Excluir colaborador
  const excluirColaborador = useCallback(async (id: string) => {
    try {
      const colaboradorParaExcluir = colaboradores.find(c => c.id === id);
      console.log('🗑️ Excluindo colaborador:', id, colaboradorParaExcluir?.nome);
      
      await ColaboradoresService.excluir(id);
      
      setColaboradores(prev => {
        const updated = prev.filter(colaborador => colaborador.id !== id);
        console.log('✅ Colaborador removido da lista');
        return updated;
      });
      
      toast.success(`Colaborador "${colaboradorParaExcluir?.nome || 'desconhecido'}" excluído com sucesso!`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir colaborador';
      console.error('❌ Erro ao excluir colaborador:', err);
      toast.error(errorMessage);
      throw err;
    }
  }, [colaboradores]);

  // Buscar colaborador específico por ID
  const buscarColaboradorPorId = useCallback(async (id: string): Promise<Colaborador | null> => {
    try {
      console.log('🔍 Buscando colaborador por ID:', id);
      return await ColaboradoresService.buscarPorId(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar colaborador';
      console.error('❌ Erro ao buscar colaborador:', err);
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
  const colaboradoresAtivos = useMemo(() => 
    colaboradores.filter(colaborador => colaborador.ativo), 
    [colaboradores]
  );

  const colaboradoresFuncionarios = useMemo(() => 
    colaboradores.filter(colaborador => colaborador.tipoColaborador?.categoria === 'FUNCIONARIO'), 
    [colaboradores]
  );

  const colaboradoresParceiros = useMemo(() => 
    colaboradores.filter(colaborador => colaborador.tipoColaborador?.categoria === 'PARCEIRO'), 
    [colaboradores]
  );

  const totalColaboradores = useMemo(() => colaboradores.length, [colaboradores]);

  // Métodos de compatibilidade com interface anterior
  const createColaborador = useCallback(async (data: ColaboradorFormData): Promise<Colaborador> => {
    await criarColaborador(data);
    // Retornar o colaborador criado (buscar na lista atualizada)
    const colaboradorCriado = colaboradores.find(c => c.nome === data.nome);
    return colaboradorCriado || colaboradores[colaboradores.length - 1];
  }, [criarColaborador, colaboradores]);

  const updateColaborador = useCallback(async (id: string, data: ColaboradorFormData): Promise<Colaborador | undefined> => {
    await atualizarColaborador(id, data);
    return colaboradores.find(c => c.id === id);
  }, [atualizarColaborador, colaboradores]);

  const deleteColaborador = useCallback(async (id: string) => {
    await excluirColaborador(id);
  }, [excluirColaborador]);

  const toggleAtivo = useCallback(async (id: string) => {
    await alternarStatusColaborador(id);
  }, [alternarStatusColaborador]);

  const getColaboradorById = useCallback((id: string) => {
    return colaboradores.find(colaborador => colaborador.id === id);
  }, [colaboradores]);

  const getColaboradoresByTipo = useCallback((tipoColaboradorId: string) => {
    return colaboradores.filter(colaborador => 
      colaborador.tipoColaboradorId === tipoColaboradorId && colaborador.ativo
    );
  }, [colaboradores]);

  const getColaboradoresByCategoria = useCallback((categoria: 'FUNCIONARIO' | 'PARCEIRO') => {
    return colaboradores.filter(colaborador => 
      colaborador.tipoColaborador?.categoria === categoria && colaborador.ativo
    );
  }, [colaboradores]);

  // Effect para carregar dados inicial
  useEffect(() => {
    if (carregarAoIniciar && !initialized) {
      console.log('🚀 Carregamento inicial dos colaboradores');
      carregarColaboradores();
    }
  }, [carregarAoIniciar, initialized, carregarColaboradores]);

  // Effect para recarregar quando filtros mudarem (apenas após inicialização)
  useEffect(() => {
    if (initialized) {
      console.log('🔄 Filtros alterados, recarregando colaboradores');
      carregarColaboradores();
    }
  }, [filtros, initialized]);

  return {
    // Estado
    colaboradores,
    loading,
    error,
    
    // Filtros
    filtros,
    setFiltros,
    limparFiltros,
    
    // Operações CRUD
    carregarColaboradores,
    criarColaborador,
    atualizarColaborador,
    alternarStatusColaborador,
    excluirColaborador,
    
    // Busca específica
    buscarColaboradorPorId,
    
    // Dados computados
    colaboradoresAtivos,
    colaboradoresFuncionarios,
    colaboradoresParceiros,
    totalColaboradores,
    
    // Métodos de compatibilidade
    createColaborador,
    updateColaborador,
    deleteColaborador,
    toggleAtivo,
    getColaboradorById,
    getColaboradoresByTipo,
    getColaboradoresByCategoria,
    
    // Estados dos formulários
    formLoading,
    isLoading: loading // Alias para compatibilidade
  };
} 