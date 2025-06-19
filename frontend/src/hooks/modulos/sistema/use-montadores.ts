import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { Montador, MontadorFormData } from '@/types/sistema';
import { useLocalStorage } from '@/hooks/globais/use-local-storage';

// Mock data para desenvolvimento
const mockMontadores: Montador[] = [
  {
    id: '1',
    nome: 'João Silva - Marcenaria',
    categoria: 'MARCENEIRO',
    valorFixo: 150,
    telefone: '(11) 99999-1111',
    ativo: true,
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    nome: 'Carlos Oliveira - Elétrica',
    categoria: 'ELETRICISTA',
    valorFixo: 120,
    telefone: '(11) 99999-2222',
    ativo: true,
    createdAt: '2024-01-16T10:00:00Z'
  },
  {
    id: '3',
    nome: 'Pedro Santos - Hidráulica',
    categoria: 'ENCANADOR',
    valorFixo: 100,
    telefone: '(11) 99999-3333',
    ativo: false,
    createdAt: '2024-01-17T10:00:00Z'
  },
  {
    id: '4',
    nome: 'Roberto Lima - Gesso',
    categoria: 'GESSEIRO',
    valorFixo: 80,
    telefone: '(11) 99999-4444',
    ativo: true,
    createdAt: '2024-01-18T10:00:00Z'
  },
  {
    id: '5',
    nome: 'Antonio Costa - Pintura',
    categoria: 'PINTOR',
    valorFixo: 90,
    telefone: '(11) 99999-5555',
    ativo: true,
    createdAt: '2024-01-19T10:00:00Z'
  }
];

export function useMontadores() {
  const [montadores, setMontadores, clearMontadores] = useLocalStorage<Montador[]>('fluyt_montadores', mockMontadores);
  const [loading, setLoading] = useState(false);

  // Validar dados do montador
  const validarMontador = useCallback((dados: MontadorFormData): string[] => {
    const erros: string[] = [];

    if (!dados.nome || dados.nome.trim().length < 2) {
      erros.push('Nome deve ter pelo menos 2 caracteres');
    }

    if (!dados.categoria) {
      erros.push('Categoria é obrigatória');
    }

    if (!dados.valorFixo || dados.valorFixo <= 0) {
      erros.push('Valor fixo deve ser maior que zero');
    }

    if (!dados.telefone || dados.telefone.trim().length < 10) {
      erros.push('Telefone deve ter formato válido');
    }

    return erros;
  }, []);

  // Verificar duplicidade de nome
  const verificarNomeDuplicado = useCallback((nome: string, montadorId?: string): boolean => {
    const nomeLimpo = nome.trim().toLowerCase();
    return montadores.some(montador => 
      montador.nome.toLowerCase() === nomeLimpo && 
      montador.id !== montadorId
    );
  }, [montadores]);

  // Criar montador
  const criarMontador = useCallback(async (dados: MontadorFormData): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Validações
      const erros = validarMontador(dados);
      
      if (verificarNomeDuplicado(dados.nome)) {
        erros.push('Já existe um montador com este nome');
      }

      if (erros.length > 0) {
        erros.forEach(erro => toast.error(erro));
        return false;
      }

      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const novoMontador: Montador = {
        id: Date.now().toString(),
        ...dados,
        nome: dados.nome.trim(),
        ativo: true,
        createdAt: new Date().toISOString()
      };

      setMontadores(prev => [...prev, novoMontador]);
      toast.success('Montador cadastrado com sucesso!');
      return true;

    } catch (error) {
      toast.error('Erro ao cadastrar montador');
      return false;
    } finally {
      setLoading(false);
    }
  }, [validarMontador, verificarNomeDuplicado, setMontadores]);

  // Atualizar montador
  const atualizarMontador = useCallback(async (id: string, dados: MontadorFormData): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Validações
      const erros = validarMontador(dados);
      
      if (verificarNomeDuplicado(dados.nome, id)) {
        erros.push('Já existe um montador com este nome');
      }

      if (erros.length > 0) {
        erros.forEach(erro => toast.error(erro));
        return false;
      }

      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMontadores(prev => prev.map(montador => 
        montador.id === id 
          ? { 
              ...montador, 
              ...dados, 
              nome: dados.nome.trim(),
              updatedAt: new Date().toISOString() 
            }
          : montador
      ));

      toast.success('Montador atualizado com sucesso!');
      return true;

    } catch (error) {
      toast.error('Erro ao atualizar montador');
      return false;
    } finally {
      setLoading(false);
    }
  }, [validarMontador, verificarNomeDuplicado, setMontadores]);

  // Excluir montador
  const excluirMontador = useCallback(async (id: string): Promise<boolean> => {
    const montador = montadores.find(m => m.id === id);
    
    if (!montador) {
      toast.error('Montador não encontrado');
      return false;
    }

    setLoading(true);
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setMontadores(prev => prev.filter(m => m.id !== id));
      toast.success('Montador excluído com sucesso!');
      return true;

    } catch (error) {
      toast.error('Erro ao excluir montador');
      return false;
    } finally {
      setLoading(false);
    }
  }, [montadores, setMontadores]);

  // Alternar status ativo/inativo
  const alternarStatus = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 300));

      setMontadores(prev => prev.map(montador => 
        montador.id === id 
          ? { ...montador, ativo: !montador.ativo, updatedAt: new Date().toISOString() }
          : montador
      ));

      const montador = montadores.find(m => m.id === id);
      const novoStatus = !montador?.ativo ? 'ativado' : 'desativado';
      toast.success(`Montador ${novoStatus} com sucesso!`);

    } catch (error) {
      toast.error('Erro ao alterar status');
    } finally {
      setLoading(false);
    }
  }, [montadores, setMontadores]);

  // Buscar montadores
  const buscarMontadores = useCallback((termo: string): Montador[] => {
    if (!termo.trim()) return montadores;
    
    const termoBusca = termo.toLowerCase().trim();
    return montadores.filter(montador =>
      montador.nome.toLowerCase().includes(termoBusca) ||
      montador.categoria.toLowerCase().includes(termoBusca) ||
      montador.telefone.includes(termoBusca)
    );
  }, [montadores]);

  // Filtrar por categoria
  const filtrarPorCategoria = useCallback((categoria: string): Montador[] => {
    if (categoria === 'all') return montadores;
    return montadores.filter(montador => montador.categoria === categoria);
  }, [montadores]);

  // Filtrar por status
  const filtrarPorStatus = useCallback((ativo: boolean | 'all'): Montador[] => {
    if (ativo === 'all') return montadores;
    return montadores.filter(montador => montador.ativo === ativo);
  }, [montadores]);

  // Estatísticas
  const estatisticas = {
    total: montadores.length,
    ativos: montadores.filter(m => m.ativo).length,
    inativos: montadores.filter(m => !m.ativo).length,
    valorMedio: montadores.length > 0 
      ? montadores.reduce((sum, m) => sum + m.valorFixo, 0) / montadores.length
      : 0,
    porCategoria: {
      marceneiro: montadores.filter(m => m.categoria === 'MARCENEIRO').length,
      eletricista: montadores.filter(m => m.categoria === 'ELETRICISTA').length,
      encanador: montadores.filter(m => m.categoria === 'ENCANADOR').length,
      gesseiro: montadores.filter(m => m.categoria === 'GESSEIRO').length,
      pintor: montadores.filter(m => m.categoria === 'PINTOR').length,
      outro: montadores.filter(m => m.categoria === 'OUTRO').length
    }
  };

  // Resetar dados para mock inicial
  const resetarDados = useCallback(() => {
    clearMontadores();
    toast.success('Dados resetados para configuração inicial!');
  }, [clearMontadores]);

  return {
    montadores,
    loading,
    estatisticas,
    criarMontador,
    atualizarMontador,
    excluirMontador,
    alternarStatus,
    buscarMontadores,
    filtrarPorCategoria,
    filtrarPorStatus,
    resetarDados
  };
}