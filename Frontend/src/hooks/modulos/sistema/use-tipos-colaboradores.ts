import { useState, useCallback } from 'react';
import { TipoColaborador, TipoColaboradorFormData } from '@/types/colaboradores';

// Dados mock temporários
const mockTipos: TipoColaborador[] = [
  {
    id: '1',
    nome: 'Vendedor',
    categoria: 'FUNCIONARIO',
    tipoPercentual: 'VENDA',
    percentualValor: 3.0,
    minimoGarantido: 0,
    salarioBase: 4000.0,
    valorPorServico: 0,
    opcionalNoOrcamento: false,
    ativo: true,
    ordemExibicao: 1,
    createdAt: new Date().toISOString(),
    descricao: 'Responsável pelas vendas diretas aos clientes'
  },
  {
    id: '2',
    nome: 'Gerente',
    categoria: 'FUNCIONARIO',
    tipoPercentual: 'VENDA',
    percentualValor: 2.0,
    minimoGarantido: 1500.0,
    salarioBase: 8000.0,
    valorPorServico: 0,
    opcionalNoOrcamento: false,
    ativo: true,
    ordemExibicao: 2,
    createdAt: new Date().toISOString(),
    descricao: 'Supervisão da equipe e gestão de vendas'
  },
  {
    id: '3',
    nome: 'Montador',
    categoria: 'PARCEIRO',
    tipoPercentual: 'CUSTO',
    percentualValor: 8.0,
    minimoGarantido: 0,
    salarioBase: 0,
    valorPorServico: 150.0,
    opcionalNoOrcamento: true,
    ativo: true,
    ordemExibicao: 3,
    createdAt: new Date().toISOString(),
    descricao: 'Montagem de móveis no local do cliente'
  },
  {
    id: '4',
    nome: 'Arquiteto',
    categoria: 'PARCEIRO',
    tipoPercentual: 'VENDA',
    percentualValor: 10.0,
    minimoGarantido: 1500.0,
    salarioBase: 0,
    valorPorServico: 0,
    opcionalNoOrcamento: true,
    ativo: true,
    ordemExibicao: 4,
    createdAt: new Date().toISOString(),
    descricao: 'Projetos arquitetônicos personalizados'
  }
];

export function useTiposColaboradores() {
  const [tipos, setTipos] = useState<TipoColaborador[]>(mockTipos);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTipo = useCallback(async (data: TipoColaboradorFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newTipo: TipoColaborador = {
        id: Date.now().toString(),
        ...data,
        ativo: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setTipos(prev => [...prev, newTipo].sort((a, b) => a.ordemExibicao - b.ordemExibicao));
      return newTipo;
    } catch (err) {
      const errorMessage = 'Erro ao criar tipo de colaborador';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTipo = useCallback(async (id: string, data: TipoColaboradorFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setTipos(prev => prev.map(tipo => 
        tipo.id === id 
          ? { ...tipo, ...data, updatedAt: new Date().toISOString() }
          : tipo
      ).sort((a, b) => a.ordemExibicao - b.ordemExibicao));
      
      return tipos.find(t => t.id === id);
    } catch (err) {
      const errorMessage = 'Erro ao atualizar tipo de colaborador';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [tipos]);

  const deleteTipo = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setTipos(prev => prev.filter(tipo => tipo.id !== id));
    } catch (err) {
      const errorMessage = 'Erro ao excluir tipo de colaborador';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleAtivo = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setTipos(prev => prev.map(tipo => 
        tipo.id === id 
          ? { ...tipo, ativo: !tipo.ativo, updatedAt: new Date().toISOString() }
          : tipo
      ));
    } catch (err) {
      const errorMessage = 'Erro ao alterar status do tipo';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTipoById = useCallback((id: string) => {
    return tipos.find(tipo => tipo.id === id);
  }, [tipos]);

  const getTiposByCategoria = useCallback((categoria: 'FUNCIONARIO' | 'PARCEIRO') => {
    return tipos.filter(tipo => tipo.categoria === categoria && tipo.ativo);
  }, [tipos]);

  return {
    tipos,
    isLoading,
    error,
    createTipo,
    updateTipo,
    deleteTipo,
    toggleAtivo,
    getTipoById,
    getTiposByCategoria
  };
} 