import { useState, useCallback } from 'react';
import { Colaborador, ColaboradorFormData, TipoColaborador } from '@/types/colaboradores';

// Dados mock temporários
const mockColaboradores: Colaborador[] = [
  {
    id: '1',
    nome: 'João Silva Santos',
    tipoColaboradorId: '1', // Vendedor
    cpf: '123.456.789-01',
    telefone: '(11) 99999-1234',
    email: 'joao.silva@email.com',
    endereco: 'Rua das Flores, 123 - São Paulo, SP',
    dataAdmissao: '2023-01-15',
    ativo: true,
    observacoes: 'Vendedor experiente, especialista em móveis planejados para cozinha',
    createdAt: new Date().toISOString(),
    tipoColaborador: {
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
      createdAt: new Date().toISOString()
    }
  },
  {
    id: '2',
    nome: 'Maria Oliveira Costa',
    tipoColaboradorId: '2', // Gerente
    cpf: '987.654.321-02',
    telefone: '(11) 98888-5678',
    email: 'maria.oliveira@email.com',
    endereco: 'Av. Paulista, 456 - São Paulo, SP',
    dataAdmissao: '2022-03-01',
    ativo: true,
    observacoes: 'Gerente de vendas com foco em grandes projetos corporativos',
    createdAt: new Date().toISOString(),
    tipoColaborador: {
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
      createdAt: new Date().toISOString()
    }
  },
  {
    id: '3',
    nome: 'Carlos Montagem Ltda',
    tipoColaboradorId: '3', // Montador
    cpf: '456.789.123-03',
    telefone: '(11) 97777-9012',
    email: 'carlos@montagemlimitada.com.br',
    endereco: 'Rua dos Montadores, 789 - Guarulhos, SP',
    dataAdmissao: '2023-06-10',
    ativo: true,
    observacoes: 'Empresa especializada em montagem de móveis planejados, atende região metropolitana',
    createdAt: new Date().toISOString(),
    tipoColaborador: {
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
      createdAt: new Date().toISOString()
    }
  },
  {
    id: '4',
    nome: 'Ana Arquitetura & Design',
    tipoColaboradorId: '4', // Arquiteto
    telefone: '(11) 96666-3456',
    email: 'ana@arquiteturadesign.com.br',
    endereco: 'Rua do Design, 321 - Vila Madalena, SP',
    dataAdmissao: '2023-02-20',
    ativo: true,
    observacoes: 'Arquiteta especializada em projetos residenciais de alto padrão',
    createdAt: new Date().toISOString(),
    tipoColaborador: {
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
      createdAt: new Date().toISOString()
    }
  }
];

export function useColaboradores(tiposColaboradores: TipoColaborador[]) {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>(mockColaboradores);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createColaborador = useCallback(async (data: ColaboradorFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Buscar o tipo de colaborador
      const tipoColaborador = tiposColaboradores.find(t => t.id === data.tipoColaboradorId);
      
      const newColaborador: Colaborador = {
        id: Date.now().toString(),
        ...data,
        ativo: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tipoColaborador
      };
      
      setColaboradores(prev => [...prev, newColaborador]);
      return newColaborador;
    } catch (err) {
      const errorMessage = 'Erro ao criar colaborador';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [tiposColaboradores]);

  const updateColaborador = useCallback(async (id: string, data: ColaboradorFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Buscar o tipo de colaborador
      const tipoColaborador = tiposColaboradores.find(t => t.id === data.tipoColaboradorId);
      
      setColaboradores(prev => prev.map(colaborador => 
        colaborador.id === id 
          ? { 
              ...colaborador, 
              ...data, 
              tipoColaborador,
              updatedAt: new Date().toISOString() 
            }
          : colaborador
      ));
      
      return colaboradores.find(c => c.id === id);
    } catch (err) {
      const errorMessage = 'Erro ao atualizar colaborador';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [colaboradores, tiposColaboradores]);

  const deleteColaborador = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setColaboradores(prev => prev.filter(colaborador => colaborador.id !== id));
    } catch (err) {
      const errorMessage = 'Erro ao excluir colaborador';
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
      
      setColaboradores(prev => prev.map(colaborador => 
        colaborador.id === id 
          ? { ...colaborador, ativo: !colaborador.ativo, updatedAt: new Date().toISOString() }
          : colaborador
      ));
    } catch (err) {
      const errorMessage = 'Erro ao alterar status do colaborador';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  return {
    colaboradores,
    isLoading,
    error,
    createColaborador,
    updateColaborador,
    deleteColaborador,
    toggleAtivo,
    getColaboradorById,
    getColaboradoresByTipo,
    getColaboradoresByCategoria
  };
} 