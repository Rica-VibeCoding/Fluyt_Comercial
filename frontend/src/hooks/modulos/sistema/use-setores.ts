import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { Setor, SetorFormData } from '@/types/sistema';
import { useLocalStorage } from '@/hooks/globais/use-local-storage';

// Mock data para desenvolvimento - compatível com Supabase
const mockSetores: Setor[] = [
  {
    id: 'b54209a6-50ac-41f6-bf2c-996b6fe0bf2d',
    nome: 'Medição',
    funcionarios: 0,
    createdAt: '2024-01-10T10:00:00Z'
  },
  {
    id: '2faea93f-ed12-476a-8320-48ee7cda5695',
    nome: 'Vendas',
    funcionarios: 4,
    createdAt: '2024-01-15T10:00:00Z'
  }
];

export function useSetores() {
  const [setores, setSetores, clearSetores] = useLocalStorage<Setor[]>('fluyt_setores', mockSetores);
  const [loading, setLoading] = useState(false);

  // Validar dados do setor (ultra simples)
  const validarSetor = useCallback((dados: SetorFormData): string[] => {
    const erros: string[] = [];

    if (!dados.nome || dados.nome.trim().length < 2) {
      erros.push('Nome do setor deve ter pelo menos 2 caracteres');
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
        nome: dados.nome,
        funcionarios: 0,
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
          ? { ...setor, nome: dados.nome, updatedAt: new Date().toISOString() }
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

  // Função removida: alternarStatusSetor (setores agora são globais, sem campo ativo)

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

  // Obter todos os setores (agora globais, sempre ativos)
  const obterSetoresAtivos = useCallback((): Setor[] => {
    return setores;
  }, [setores]);

  // Obter setor por ID
  const obterSetorPorId = useCallback((id: string): Setor | undefined => {
    return setores.find(setor => setor.id === id);
  }, [setores]);

  // Buscar setores (apenas por nome)
  const buscarSetores = useCallback((termo: string): Setor[] => {
    if (!termo.trim()) return setores;
    
    const termoBusca = termo.toLowerCase().trim();
    return setores.filter(setor =>
      setor.nome.toLowerCase().includes(termoBusca)
    );
  }, [setores]);

  // Estatísticas (simplificadas)
  const estatisticas = {
    total: setores.length,
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
    excluirSetor,
    obterSetoresAtivos,
    obterSetorPorId,
    buscarSetores,
    resetarDados
  };
}