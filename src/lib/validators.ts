/**
 * VALIDATORS COMPARTILHADOS
 * Funções de validação reutilizáveis para o módulo de orçamento
 */

import { FormaPagamento } from '@/types/orcamento';

// Resultado de validação padrão
export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

// Validar se valor está dentro do limite disponível
export const validarValorDisponivel = (
  valor: number,
  valorMaximo: number,
  valorJaAlocado: number,
  redistribuicaoAtiva?: boolean // 🆕 FASE 1: Permitir bypass quando redistribuição ativa
): ValidationResult => {
  const valorRestante = valorMaximo - valorJaAlocado;
  
  if (valor <= 0) {
    return {
      isValid: false,
      message: 'Valor deve ser maior que zero'
    };
  }
  
  // 🆕 PULAR validação de limite quando redistribuição automática está ativa
  if (redistribuicaoAtiva) {
    console.log('🔄 Validação de limite ignorada - redistribuição automática ativa');
    return { isValid: true };
  }
  
  if (valor > valorRestante) {
    return {
      isValid: false,
      message: `Valor excede o disponível: R$ ${valorRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    };
  }
  
  return { isValid: true };
};

// 🆕 FASE 1: Função auxiliar para verificar se redistribuição automática está ativa
// AGORA: Sistema é manual por padrão (via botão "Atualizar")
export const isRedistribuicaoAutomaticaAtiva = (): boolean => {
  try {
    const sessionData = localStorage.getItem('fluyt_sessao_simples');
    const session = sessionData ? JSON.parse(sessionData) : {};
    // Default: redistribuição é MANUAL (false) - só ativa via botão
    return session.redistribuicaoAutomatica === true;
  } catch {
    return false; // Default: manual via botão "Atualizar"
  }
};

// Validar se a soma das formas não excede o valor negociado
export const validarSomaFormas = (
  formas: FormaPagamento[],
  valorNegociado: number
): ValidationResult => {
  const somaFormas = formas.reduce((total, forma) => total + forma.valor, 0);
  
  if (somaFormas > valorNegociado) {
    const excesso = somaFormas - valorNegociado;
    return {
      isValid: false,
      message: `Soma das formas excede o valor negociado em R$ ${excesso.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    };
  }
  
  return { isValid: true };
};

// Validar se todas as formas têm valores válidos
export const validarFormas = (formas: FormaPagamento[]): ValidationResult => {
  for (const forma of formas) {
    if (forma.valor <= 0) {
      return {
        isValid: false,
        message: `Forma "${forma.tipo}" tem valor inválido`
      };
    }
    
    if (forma.parcelas && forma.parcelas < 1) {
      return {
        isValid: false,
        message: `Forma "${forma.tipo}" tem número de parcelas inválido`
      };
    }
  }
  
  return { isValid: true };
};

// Validar se o desconto está dentro dos limites
export const validarDesconto = (
  desconto: number,
  valorOriginal: number
): ValidationResult => {
  if (desconto < 0) {
    return {
      isValid: false,
      message: 'Desconto não pode ser negativo'
    };
  }
  
  if (desconto > 100) {
    return {
      isValid: false,
      message: 'Desconto não pode ser maior que 100%'
    };
  }
  
  const valorComDesconto = valorOriginal - (valorOriginal * desconto / 100);
  if (valorComDesconto <= 0) {
    return {
      isValid: false,
      message: 'Desconto resulta em valor zero ou negativo'
    };
  }
  
  return { isValid: true };
};

// Validar se a taxa está dentro dos limites razoáveis
export const validarTaxa = (taxa: number): ValidationResult => {
  if (taxa < 0) {
    return {
      isValid: false,
      message: 'Taxa não pode ser negativa'
    };
  }
  
  if (taxa > 50) {
    return {
      isValid: false,
      message: 'Taxa muito alta (máximo 50%)'
    };
  }
  
  return { isValid: true };
};

// Validar se o número de parcelas está dentro dos limites
export const validarNumeroParcelas = (
  parcelas: number,
  tipoFormaPagamento: 'a-vista' | 'boleto' | 'cartao' | 'financeira'
): ValidationResult => {
  if (parcelas < 1) {
    return {
      isValid: false,
      message: 'Número de parcelas deve ser pelo menos 1'
    };
  }
  
  // Limites específicos por tipo
  const limites = {
    'a-vista': 1,
    'boleto': 60,
    'cartao': 12,
    'financeira': 60
  };
  
  const limite = limites[tipoFormaPagamento];
  
  if (parcelas > limite) {
    return {
      isValid: false,
      message: `Máximo de ${limite} parcelas para ${tipoFormaPagamento}`
    };
  }
  
  return { isValid: true };
};

// Validar se uma data está no futuro - SEM problemas de fuso horário
export const validarDataFutura = (data: string): ValidationResult => {
  if (!data) {
    return {
      isValid: false,
      message: 'Data é obrigatória'
    };
  }
  
  // Obter data atual no formato YYYY-MM-DD de forma segura
  const hoje = new Date();
  const anoHoje = hoje.getFullYear();
  const mesHoje = String(hoje.getMonth() + 1).padStart(2, '0');
  const diaHoje = String(hoje.getDate()).padStart(2, '0');
  const dataHojeString = `${anoHoje}-${mesHoje}-${diaHoje}`;
  
  // Comparar strings de data diretamente (YYYY-MM-DD)
  if (data < dataHojeString) {
    return {
      isValid: false,
      message: 'Data deve ser hoje ou no futuro'
    };
  }
  
  return { isValid: true };
};

// Validação completa de uma forma de pagamento
export const validarFormaPagamento = (
  forma: Partial<FormaPagamento>,
  valorMaximo: number,
  valorJaAlocado: number
): ValidationResult => {
  if (!forma.tipo) {
    return { isValid: false, message: 'Tipo da forma de pagamento é obrigatório' };
  }
  
  if (!forma.valor || forma.valor <= 0) {
    return { isValid: false, message: 'Valor é obrigatório e deve ser maior que zero' };
  }
  
  // Validar valor disponível
  const validacaoValor = validarValorDisponivel(forma.valor, valorMaximo, valorJaAlocado);
  if (!validacaoValor.isValid) {
    return validacaoValor;
  }
  
  // Validar número de parcelas se especificado
  if (forma.parcelas) {
    const validacaoParcelas = validarNumeroParcelas(forma.parcelas, forma.tipo);
    if (!validacaoParcelas.isValid) {
      return validacaoParcelas;
    }
  }
  
  return { isValid: true };
};