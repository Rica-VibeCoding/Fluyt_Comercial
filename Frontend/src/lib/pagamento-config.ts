/**
 * CONFIGURAÇÕES DE PAGAMENTO
 * Centraliza todas as configurações hardcoded do sistema
 */

export const PAGAMENTO_CONFIG = {
  // Configurações do Cartão de Crédito
  cartao: {
    taxaPadrao: 3.5,           // Taxa padrão em %
    maxParcelas: 12,           // Máximo de parcelas permitidas
    minParcelas: 1,            // Mínimo de parcelas
    placeholder: '3,5',        // Placeholder para o campo de taxa
  },

  // Configurações do Financiamento
  financeira: {
    percentualPadrao: 1.8,     // Percentual padrão em %
    maxParcelas: 60,           // Máximo de parcelas permitidas
    minParcelas: 1,            // Mínimo de parcelas
    placeholder: '1,8',        // Placeholder para o campo percentual
  },

  // Configurações do Boleto
  boleto: {
    maxParcelas: 12,           // Máximo de parcelas permitidas
    minParcelas: 1,            // Mínimo de parcelas
  },

  // Configurações À Vista
  aVista: {
    parcelas: 1,               // Sempre 1 parcela
  },

  // Configurações Gerais
  geral: {
    valorMinimo: 0.01,         // Valor mínimo permitido
    taxaMaxima: 50,            // Taxa máxima permitida em %
    taxaMinima: 0,             // Taxa mínima permitida em %
  },

  // Configurações de Validação
  validacao: {
    maxParcelasGlobal: 60,     // Limite global de parcelas
    minValorParcela: 10,       // Valor mínimo por parcela
  },

  // Placeholders e Labels
  ui: {
    placeholders: {
      valor: 'R$ 0,00',
      parcelas: '1',
      taxa: '0,0',
      data: '',
    },
    labels: {
      valor: 'Valor',
      parcelas: 'Número de Parcelas',
      taxa: 'Taxa (%)',
      data: 'Data',
      valorPresente: 'Valor Presente',
      desconto: 'Desconto',
    },
  },

  // Mensagens de Erro
  mensagens: {
    valorInvalido: 'Valor deve ser maior que zero',
    parcelasInvalidas: 'Número de parcelas inválido',
    taxaInvalida: 'Taxa deve estar entre {min}% e {max}%',
    dataInvalida: 'Data deve ser hoje ou no futuro',
    valorExcedido: 'Valor excede o disponível',
  },
} as const;

// Tipos derivados das configurações
export type TipoPagamento = keyof typeof PAGAMENTO_CONFIG extends 'geral' | 'validacao' | 'ui' | 'mensagens' 
  ? never 
  : keyof typeof PAGAMENTO_CONFIG;

export type ConfiguracaoPagamento = typeof PAGAMENTO_CONFIG[TipoPagamento];

// Função utilitária para obter configurações por tipo
export const getConfigPagamento = (tipo: 'cartao' | 'financeira' | 'boleto' | 'aVista') => {
  return PAGAMENTO_CONFIG[tipo];
};

// Função utilitária para obter limites de parcelas
export const getLimitesParcelas = (tipo: 'cartao' | 'financeira' | 'boleto' | 'aVista') => {
  const config = getConfigPagamento(tipo);
  return {
    min: 'minParcelas' in config ? config.minParcelas : 1,
    max: 'maxParcelas' in config ? config.maxParcelas : ('parcelas' in config ? config.parcelas : 1),
  };
};

// Função utilitária para obter taxa padrão
export const getTaxaPadrao = (tipo: 'cartao' | 'financeira') => {
  const config = getConfigPagamento(tipo);
  return 'taxaPadrao' in config ? config.taxaPadrao : 
         'percentualPadrao' in config ? config.percentualPadrao : 0;
};

// Função utilitária para obter placeholder de taxa
export const getPlaceholderTaxa = (tipo: 'cartao' | 'financeira') => {
  const config = getConfigPagamento(tipo);
  return 'placeholder' in config ? config.placeholder : '0,0';
};