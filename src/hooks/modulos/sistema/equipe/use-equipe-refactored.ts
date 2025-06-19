import { useCallback } from 'react';
import { toast } from 'sonner';
import type { Funcionario } from '@/types/sistema';
import { useLocalStorage } from '@/hooks/globais/use-local-storage';
import { useEmpresas } from '../use-empresas';
import { useLojas } from '../use-lojas';
import { useSetores } from '../use-setores';
import { useEquipeCrud } from './use-equipe-crud';
import { useEquipeUtils } from './use-equipe-utils';
import { mockFuncionarios } from './mock-data';

export function useEquipeRefactored() {
  const [funcionarios, setFuncionarios, clearFuncionarios] = useLocalStorage<Funcionario[]>('fluyt_funcionarios', mockFuncionarios);
  
  // Hooks especializados
  const {
    loading,
    criarFuncionario,
    atualizarFuncionario,
    alternarStatusFuncionario,
    excluirFuncionario
  } = useEquipeCrud(funcionarios, setFuncionarios);

  const {
    verificarEmailDuplicado,
    obterFuncionariosAtivos,
    obterFuncionarioPorId,
    buscarFuncionarios,
    estatisticas
  } = useEquipeUtils(funcionarios);

  // Hooks para relacionamentos
  const { obterEmpresasAtivas } = useEmpresas();
  const { obterLojasAtivas } = useLojas();
  const { obterSetoresAtivos } = useSetores();

  // Resetar dados para mock inicial
  const resetarDados = useCallback(() => {
    clearFuncionarios();
    toast.success('Dados resetados para configuração inicial!');
  }, [clearFuncionarios]);

  return {
    funcionarios,
    loading,
    estatisticas,
    criarFuncionario,
    atualizarFuncionario,
    alternarStatusFuncionario,
    excluirFuncionario,
    obterFuncionariosAtivos,
    obterFuncionarioPorId,
    buscarFuncionarios,
    resetarDados,
    // Dados para relacionamentos
    empresas: obterEmpresasAtivas(),
    lojas: obterLojasAtivas(),
    setores: obterSetoresAtivos()
  };
}