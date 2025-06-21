import { useCallback } from 'react';
import type { Funcionario } from '@/types/sistema';

export function useEquipeUtils(funcionarios: Funcionario[]) {
  // Verificar duplicidade de email
  const verificarEmailDuplicado = useCallback((email: string, funcionarioId?: string): boolean => {
    return funcionarios.some(funcionario => 
      funcionario.email.toLowerCase() === email.toLowerCase() && 
      funcionario.id !== funcionarioId
    );
  }, [funcionarios]);

  // Obter funcionários ativos
  const obterFuncionariosAtivos = useCallback((): Funcionario[] => {
    return funcionarios.filter(funcionario => funcionario.ativo);
  }, [funcionarios]);

  // Obter funcionário por ID
  const obterFuncionarioPorId = useCallback((id: string): Funcionario | undefined => {
    return funcionarios.find(funcionario => funcionario.id === id);
  }, [funcionarios]);

  // Buscar funcionários
  const buscarFuncionarios = useCallback((termo: string): Funcionario[] => {
    if (!termo.trim()) return funcionarios;
    
    const termoBusca = termo.toLowerCase().trim();
    return funcionarios.filter(funcionario =>
      funcionario.nome.toLowerCase().includes(termoBusca) ||
      funcionario.email.toLowerCase().includes(termoBusca) ||
      funcionario.setor.toLowerCase().includes(termoBusca) ||
      funcionario.tipoFuncionario.toLowerCase().includes(termoBusca)
    );
  }, [funcionarios]);

  // Estatísticas
  const estatisticas = {
    total: funcionarios.length,
    ativos: funcionarios.filter(f => f.ativo).length,
    inativos: funcionarios.filter(f => !f.ativo).length,
    vendedores: funcionarios.filter(f => f.tipoFuncionario === 'VENDEDOR').length,
    gerentes: funcionarios.filter(f => f.tipoFuncionario === 'GERENTE').length,
    medidores: funcionarios.filter(f => f.tipoFuncionario === 'MEDIDOR').length,
    admins: funcionarios.filter(f => f.tipoFuncionario === 'ADMIN_MASTER').length
  };

  return {
    verificarEmailDuplicado,
    obterFuncionariosAtivos,
    obterFuncionarioPorId,
    buscarFuncionarios,
    estatisticas
  };
}