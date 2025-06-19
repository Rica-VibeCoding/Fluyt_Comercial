import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { Funcionario, FuncionarioFormData } from '@/types/sistema';
import { useLojas } from '../use-lojas';
import { useEquipeValidation } from './use-equipe-validation';
import { useEquipeUtils } from './use-equipe-utils';

export function useEquipeCrud(
  funcionarios: Funcionario[],
  setFuncionarios: (funcionarios: Funcionario[] | ((prev: Funcionario[]) => Funcionario[])) => void
) {
  const [loading, setLoading] = useState(false);
  const { obterLojasAtivas } = useLojas();
  const { validarFuncionario } = useEquipeValidation();
  const { verificarEmailDuplicado } = useEquipeUtils(funcionarios);

  // Criar funcionário
  const criarFuncionario = useCallback(async (dados: FuncionarioFormData): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Validações
      const erros = validarFuncionario(dados);
      
      if (verificarEmailDuplicado(dados.email)) {
        erros.push('Email já cadastrado');
      }

      if (erros.length > 0) {
        erros.forEach(erro => toast.error(erro));
        return false;
      }

      // Buscar nome da loja
      const lojas = obterLojasAtivas();
      const loja = lojas.find(l => l.id === dados.lojaId);

      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const novoFuncionario: Funcionario = {
        id: Date.now().toString(),
        ...dados,
        loja: loja?.nome || '',
        ativo: true,
        performance: 0,
        createdAt: new Date().toISOString()
      };

      setFuncionarios(prev => [...prev, novoFuncionario]);
      toast.success('Funcionário criado com sucesso!');
      return true;

    } catch (error) {
      toast.error('Erro ao criar funcionário');
      return false;
    } finally {
      setLoading(false);
    }
  }, [validarFuncionario, verificarEmailDuplicado, obterLojasAtivas, setFuncionarios]);

  // Atualizar funcionário
  const atualizarFuncionario = useCallback(async (id: string, dados: FuncionarioFormData): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Validações
      const erros = validarFuncionario(dados);
      
      if (verificarEmailDuplicado(dados.email, id)) {
        erros.push('Email já cadastrado');
      }

      if (erros.length > 0) {
        erros.forEach(erro => toast.error(erro));
        return false;
      }

      // Buscar nome da loja
      const lojas = obterLojasAtivas();
      const loja = lojas.find(l => l.id === dados.lojaId);

      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setFuncionarios(prev => prev.map(funcionario => 
        funcionario.id === id 
          ? { ...funcionario, ...dados, loja: loja?.nome || '', updatedAt: new Date().toISOString() }
          : funcionario
      ));

      toast.success('Funcionário atualizado com sucesso!');
      return true;

    } catch (error) {
      toast.error('Erro ao atualizar funcionário');
      return false;
    } finally {
      setLoading(false);
    }
  }, [validarFuncionario, verificarEmailDuplicado, obterLojasAtivas, setFuncionarios]);

  // Alternar status do funcionário
  const alternarStatusFuncionario = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setFuncionarios(prev => prev.map(funcionario => 
        funcionario.id === id 
          ? { ...funcionario, ativo: !funcionario.ativo, updatedAt: new Date().toISOString() }
          : funcionario
      ));

      const funcionario = funcionarios.find(f => f.id === id);
      const novoStatus = !funcionario?.ativo ? 'ativado' : 'desativado';
      toast.success(`Funcionário ${novoStatus} com sucesso!`);

    } catch (error) {
      toast.error('Erro ao alterar status do funcionário');
    } finally {
      setLoading(false);
    }
  }, [funcionarios, setFuncionarios]);

  // Excluir funcionário
  const excluirFuncionario = useCallback(async (id: string): Promise<boolean> => {
    const funcionario = funcionarios.find(f => f.id === id);
    
    if (!funcionario) {
      toast.error('Funcionário não encontrado');
      return false;
    }

    setLoading(true);
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setFuncionarios(prev => prev.filter(f => f.id !== id));
      toast.success('Funcionário excluído com sucesso!');
      return true;

    } catch (error) {
      toast.error('Erro ao excluir funcionário');
      return false;
    } finally {
      setLoading(false);
    }
  }, [funcionarios, setFuncionarios]);

  return {
    loading,
    criarFuncionario,
    atualizarFuncionario,
    alternarStatusFuncionario,
    excluirFuncionario
  };
}