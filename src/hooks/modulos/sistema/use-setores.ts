import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { Setor, SetorFormData } from '@/types/sistema';
import { useLocalStorage } from '@/hooks/globais/use-local-storage';

// Mock data para desenvolvimento
const mockSetores: Setor[] = [
  {
    id: '1',
    nome: 'Vendas',
    descricao: 'Equipe responsável pela venda de produtos e atendimento ao cliente',
    funcionarios: 8,
    ativo: true,
    createdAt: '2024-01-10T10:00:00Z'
  },
  {
    id: '2',
    nome: 'Medição',
    descricao: 'Profissionais responsáveis por medições e projetos técnicos',
    funcionarios: 3,
    ativo: true,
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '3',
    nome: 'Montagem',
    descricao: 'Equipe de montadores e instaladores',
    funcionarios: 5,
    ativo: true,
    createdAt: '2024-02-01T10:00:00Z'
  },
  {
    id: '4',
    nome: 'Administrativo',
    descricao: 'Setor administrativo e financeiro',
    funcionarios: 0,
    ativo: false,
    createdAt: '2024-02-10T10:00:00Z'
  }
];

export function useSetores() {
  const [setores, setSetores, clearSetores] = useLocalStorage<Setor[]>('fluyt_setores', mockSetores);
  const [loading, setLoading] = useState(false);

  // Validar dados do setor
  const validarSetor = useCallback((dados: SetorFormData): string[] => {
    const erros: string[] = [];

    if (!dados.nome || dados.nome.trim().length < 2) {
      erros.push('Nome do setor deve ter pelo menos 2 caracteres');
    }

    if (dados.descricao && dados.descricao.trim().length > 0 && dados.descricao.trim().length < 10) {
      erros.push('Descrição deve ter pelo menos 10 caracteres se preenchida');
    }

    return erros;
  }, []);

  // Verificar duplicidade de nome
  const verificarNomeDuplicado = useCallback((nome: string, setorId?: string): boolean => {
    return setores.some(setor => 
      setor.nome.toLowerCase() === nome.toLowerCase() && 
      setor.id !== setorId
    );
  }, [setores]);

  // Criar setor
  const criarSetor = useCallback(async (dados: SetorFormData): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Validações
      const erros = validarSetor(dados);
      
      if (verificarNomeDuplicado(dados.nome)) {
        erros.push('Nome do setor já cadastrado');
      }

      if (erros.length > 0) {
        erros.forEach(erro => toast.error(erro));
        return false;
      }

      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const novoSetor: Setor = {
        id: Date.now().toString(),
        ...dados,
        funcionarios: 0,
        ativo: true,
        createdAt: new Date().toISOString()
      };

      setSetores(prev => [...prev, novoSetor]);
      toast.success('Setor criado com sucesso!');
      return true;

    } catch (error) {
      toast.error('Erro ao criar setor');
      return false;
    } finally {
      setLoading(false);
    }
  }, [validarSetor, verificarNomeDuplicado]);

  // Atualizar setor
  const atualizarSetor = useCallback(async (id: string, dados: SetorFormData): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Validações
      const erros = validarSetor(dados);
      
      if (verificarNomeDuplicado(dados.nome, id)) {
        erros.push('Nome do setor já cadastrado');
      }

      if (erros.length > 0) {
        erros.forEach(erro => toast.error(erro));
        return false;
      }

      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSetores(prev => prev.map(setor => 
        setor.id === id 
          ? { ...setor, ...dados, updatedAt: new Date().toISOString() }
          : setor
      ));

      toast.success('Setor atualizado com sucesso!');
      return true;

    } catch (error) {
      toast.error('Erro ao atualizar setor');
      return false;
    } finally {
      setLoading(false);
    }
  }, [validarSetor, verificarNomeDuplicado]);

  // Alternar status do setor
  const alternarStatusSetor = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setSetores(prev => prev.map(setor => 
        setor.id === id 
          ? { ...setor, ativo: !setor.ativo, updatedAt: new Date().toISOString() }
          : setor
      ));

      const setor = setores.find(s => s.id === id);
      const novoStatus = !setor?.ativo ? 'ativado' : 'desativado';
      toast.success(`Setor ${novoStatus} com sucesso!`);

    } catch (error) {
      toast.error('Erro ao alterar status do setor');
    } finally {
      setLoading(false);
    }
  }, [setores]);

  // Excluir setor
  const excluirSetor = useCallback(async (id: string): Promise<boolean> => {
    const setor = setores.find(s => s.id === id);
    
    if (!setor) {
      toast.error('Setor não encontrado');
      return false;
    }

    // Verificar se tem funcionários vinculados
    if (setor.funcionarios && setor.funcionarios > 0) {
      toast.error('Não é possível excluir setor com funcionários vinculados');
      return false;
    }

    setLoading(true);
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setSetores(prev => prev.filter(s => s.id !== id));
      toast.success('Setor excluído com sucesso!');
      return true;

    } catch (error) {
      toast.error('Erro ao excluir setor');
      return false;
    } finally {
      setLoading(false);
    }
  }, [setores]);

  // Obter setores ativos
  const obterSetoresAtivos = useCallback((): Setor[] => {
    return setores.filter(setor => setor.ativo);
  }, [setores]);

  // Obter setor por ID
  const obterSetorPorId = useCallback((id: string): Setor | undefined => {
    return setores.find(setor => setor.id === id);
  }, [setores]);

  // Buscar setores
  const buscarSetores = useCallback((termo: string): Setor[] => {
    if (!termo.trim()) return setores;
    
    const termoBusca = termo.toLowerCase().trim();
    return setores.filter(setor =>
      setor.nome.toLowerCase().includes(termoBusca) ||
      setor.descricao.toLowerCase().includes(termoBusca)
    );
  }, [setores]);

  // Estatísticas
  const estatisticas = {
    total: setores.length,
    ativos: setores.filter(s => s.ativo).length,
    inativos: setores.filter(s => !s.ativo).length,
    totalFuncionarios: setores.reduce((total, setor) => total + (setor.funcionarios || 0), 0)
  };

  // Resetar dados para mock inicial
  const resetarDados = useCallback(() => {
    clearSetores();
    toast.success('Dados resetados para configuração inicial!');
  }, [clearSetores]);

  return {
    setores,
    loading,
    estatisticas,
    criarSetor,
    atualizarSetor,
    alternarStatusSetor,
    excluirSetor,
    obterSetoresAtivos,
    obterSetorPorId,
    buscarSetores,
    resetarDados
  };
}