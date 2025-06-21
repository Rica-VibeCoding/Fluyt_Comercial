import { useMemo } from 'react';
import { useSessao } from '../../../../store/sessao-store';
import { ContratoData } from '../../../../types/contrato';

// Hook para validações específicas do contrato
export function useContractValidation() {
  const { cliente, ambientes, podeGerarOrcamento, podeGerarContrato } = useSessao();

  const validacoes = useMemo(() => {
    const erros: Array<{ tipo: 'cliente' | 'ambiente' | 'orcamento'; mensagem: string }> = [];

    // Validação de cliente
    if (!cliente) {
      erros.push({
        tipo: 'cliente',
        mensagem: 'Nenhum cliente selecionado. Selecione um cliente para continuar.'
      });
    }

    // Validação de ambientes
    if (ambientes.length === 0) {
      erros.push({
        tipo: 'ambiente',
        mensagem: 'Nenhum ambiente configurado. Configure pelo menos um ambiente para gerar o contrato.'
      });
    }

    // Validação de orçamento
    if (!podeGerarOrcamento) {
      erros.push({
        tipo: 'orcamento',
        mensagem: 'Orçamento incompleto. Finalize a configuração do orçamento antes de gerar o contrato.'
      });
    }

    return {
      erros,
      temErros: erros.length > 0,
      clienteValido: !!cliente,
      ambientesValidos: ambientes.length > 0,
      orcamentoValido: podeGerarOrcamento,
      contratoValido: podeGerarContrato && !!cliente && ambientes.length > 0
    };
  }, [cliente, ambientes, podeGerarOrcamento, podeGerarContrato]);

  return validacoes;
}

// Validações detalhadas dos dados do contrato
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateContractData(contratoData: ContratoData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validações obrigatórias
  if (!contratoData.cliente.nome.trim()) {
    errors.push("Nome do cliente é obrigatório");
  }

  if (!contratoData.cliente.cpf.trim()) {
    errors.push("CPF do cliente é obrigatório");
  }

  if (!contratoData.cliente.telefone.trim()) {
    errors.push("Telefone do cliente é obrigatório");
  }

  if (!contratoData.cliente.endereco.trim()) {
    errors.push("Endereço do cliente é obrigatório");
  }

  if (contratoData.ambientes.length === 0) {
    errors.push("Pelo menos um ambiente deve ser configurado");
  }

  if (contratoData.valor_final <= 0) {
    errors.push("Valor final do contrato deve ser maior que zero");
  }

  if (!contratoData.prazo_entrega.trim()) {
    errors.push("Prazo de entrega é obrigatório");
  }

  if (!contratoData.vendedor.trim()) {
    errors.push("Vendedor responsável é obrigatório");
  }

  if (!contratoData.gerente.trim()) {
    errors.push("Gerente responsável é obrigatório");
  }

  // Validações de formato
  const cpfPattern = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
  if (contratoData.cliente.cpf && !cpfPattern.test(contratoData.cliente.cpf)) {
    warnings.push("Formato do CPF pode estar incorreto");
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (contratoData.cliente.email && !emailPattern.test(contratoData.cliente.email)) {
    warnings.push("Formato do e-mail pode estar incorreto");
  }

  // Validações de valores
  contratoData.ambientes.forEach((ambiente, index) => {
    if (ambiente.valor <= 0) {
      warnings.push(`Valor do ambiente "${ambiente.nome}" deve ser maior que zero`);
    }
    if (!ambiente.descricao.trim()) {
      warnings.push(`Descrição do ambiente "${ambiente.nome}" está vazia`);
    }
  });

  // Validação de consistência financeira
  const somaAmbientes = contratoData.ambientes.reduce((sum, amb) => sum + amb.valor, 0);
  const valorComDesconto = somaAmbientes * (1 - contratoData.desconto);
  const diferenca = Math.abs(valorComDesconto - contratoData.valor_final);
  
  if (diferenca > 0.01) { // Tolerância para arredondamento
    warnings.push("Valor final não confere com a soma dos ambientes e desconto aplicado");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function getValidationSummary(validation: ValidationResult): string {
  if (validation.isValid) {
    return validation.warnings.length > 0 
      ? `✅ Contrato válido (${validation.warnings.length} avisos)`
      : "✅ Contrato válido e completo";
  }
  
  return `❌ ${validation.errors.length} erro(s) encontrado(s)`;
}