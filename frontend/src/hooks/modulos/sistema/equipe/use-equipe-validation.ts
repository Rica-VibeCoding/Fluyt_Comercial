import { useCallback } from 'react';
import type { FuncionarioFormData } from '@/types/sistema';

export function useEquipeValidation() {
  // Validar dados do funcionário
  const validarFuncionario = useCallback((dados: FuncionarioFormData): string[] => {
    const erros: string[] = [];

    if (!dados.nome || dados.nome.trim().length < 2) {
      erros.push('Nome deve ter pelo menos 2 caracteres');
    }

    if (!dados.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
      erros.push('Email inválido');
    }

    if (!dados.telefone || dados.telefone.replace(/[^\d]/g, '').length < 10) {
      erros.push('Telefone inválido');
    }

    if (!dados.setor) {
      erros.push('Setor é obrigatório');
    }

    if (!dados.lojaId) {
      erros.push('Loja é obrigatória');
    }

    if (!dados.nivelAcesso) {
      erros.push('Nível de acesso é obrigatório');
    }

    if (!dados.tipoFuncionario) {
      erros.push('Tipo de funcionário é obrigatório');
    }

    if (dados.salario < 0) {
      erros.push('Salário deve ser um valor positivo');
    }

    if (dados.comissao < 0 || dados.comissao > 100) {
      erros.push('Comissão deve estar entre 0% e 100%');
    }

    if (!dados.dataAdmissao) {
      erros.push('Data de admissão é obrigatória');
    }

    // Validações específicas por tipo
    if (dados.tipoFuncionario === 'MEDIDOR' && (!dados.configuracoes?.valorMedicao || dados.configuracoes.valorMedicao <= 0)) {
      erros.push('Valor por medição é obrigatório para medidores');
    }

    return erros;
  }, []);

  return {
    validarFuncionario
  };
}