/**
 * FORMATTERS COMPARTILHADOS
 * Funções de formatação reutilizáveis em todo o sistema
 */

// Formatar valor em moeda brasileira
export const formatarMoeda = (valor: number | null | undefined): string => {
  if (valor === null || valor === undefined || isNaN(valor) || valor === 0) {
    return 'R$ 0,00';
  }
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

// Formatar valor de input para moeda (para campos de entrada)
export const formatarValorInput = (value: string): string => {
  const numero = value.replace(/\D/g, '');
  const valorNumerico = parseInt(numero) / 100;
  return valorNumerico.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

// Formatar percentual
export const formatarPercentual = (valor: number | null | undefined, casasDecimais: number = 1): string => {
  if (valor === null || valor === undefined || isNaN(valor)) {
    return '0%';
  }
  return `${valor.toFixed(casasDecimais)}%`;
};

// Formatar taxa de input (para campos de entrada)
export const formatarTaxaInput = (value: string): string => {
  // Permite apenas números e vírgula/ponto
  const numero = value.replace(/[^\d,.]/, '').replace('.', ',');
  
  // Limita a 2 casas decimais
  const partes = numero.split(',');
  if (partes[1] && partes[1].length > 2) {
    partes[1] = partes[1].substring(0, 2);
  }
  
  return partes.join(',');
};

// Formatar data para padrão brasileiro
export const formatarData = (data: string | Date): string => {
  const dataObj = typeof data === 'string' ? new Date(data) : data;
  return dataObj.toLocaleDateString('pt-BR');
};

// Formatar data e hora para padrão brasileiro
export const formatarDataHora = (dataIso?: string | null, horaIso?: string | null): string => {
  // Versão com dois parâmetros (campos separados)
  if (dataIso && horaIso) {
    try {
      // Combina data e hora: "2025-01-07" + "T" + "14:30:00" = "2025-01-07T14:30:00"
      const dataHoraCombinada = `${dataIso}T${horaIso}`;
      const data = new Date(dataHoraCombinada);
      if (isNaN(data.getTime())) return '--';
      
      return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }) + ' - ' + data.toLocaleTimeString('pt-BR', {
        hour: '2-digit', 
        minute: '2-digit'
      });
    } catch {
      return '--';
    }
  }
  
  // Versão com um parâmetro (ISO datetime)
  if (!dataIso) return '--';
  
  const data = new Date(dataIso);
  if (isNaN(data.getTime())) return '--';
  
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }) + ' - ' + data.toLocaleTimeString('pt-BR', {
    hour: '2-digit', 
    minute: '2-digit'
  });
};

// Formatar data para input (YYYY-MM-DD) - SEM problemas de fuso horário
export const formatarDataInput = (data: string | Date): string => {
  if (typeof data === 'string') {
    return converterDataParaInput(data);
  }
  
  // Para objetos Date, usar método seguro
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
};

// Obter data atual no formato YYYY-MM-DD SEM problemas de fuso horário
export const obterDataAtualInput = (): string => {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
};

// Converter data string para formato input SEM problemas de fuso horário
export const converterDataParaInput = (dataString: string): string => {
  if (!dataString) return '';
  
  // Se já está no formato correto YYYY-MM-DD, retorna como está
  if (/^\d{4}-\d{2}-\d{2}$/.test(dataString)) {
    return dataString;
  }
  
  // Se é uma string de data ISO, extrai apenas a parte da data
  if (dataString.includes('T')) {
    return dataString.split('T')[0];
  }
  
  // Para outros formatos, tenta converter preservando a data local
  try {
    const data = new Date(dataString + 'T00:00:00'); // Força hora local
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  } catch {
    return '';
  }
};

// Converter valor formatado para número
export const parseValorMoeda = (valorFormatado: string): number => {
  return parseFloat(valorFormatado.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
};

/**
 * Converte string monetária BR para número - VERSÃO ROBUSTA
 * Aceita formatos: "R$ 1.234,56", "1234.56", "1.234,56", "1234,56"
 * @param valor - String com valor monetário
 * @returns Número decimal
 */
export const parseMoedaBR = (valor: string | number): number => {
  // Se já é número, retorna
  if (typeof valor === 'number') return valor;
  
  // Remove espaços e símbolo de moeda
  const limpo = valor.trim().replace(/R\$\s*/g, '');
  
  // Se está vazio, retorna 0
  if (!limpo) return 0;
  
  // Detecta formato: se tem vírgula após ponto = formato BR (1.234,56)
  const temVirgulaAposPonto = limpo.lastIndexOf(',') > limpo.lastIndexOf('.');
  
  if (temVirgulaAposPonto) {
    // Formato BR: remove pontos e substitui vírgula por ponto
    return parseFloat(limpo.replace(/\./g, '').replace(',', '.')) || 0;
  } else {
    // Formato US ou sem separadores: remove vírgulas
    return parseFloat(limpo.replace(/,/g, '')) || 0;
  }
};

/**
 * Formata número como moeda BR - VERSÃO UNIFICADA
 * @param valor - Número ou string a ser formatado
 * @param exibirSimbolo - Se deve exibir "R$" (padrão: true)
 * @returns String formatada como moeda BR
 */
export const formatarMoedaBR = (valor: number | string | null | undefined, exibirSimbolo = true): string => {
  if (valor === null || valor === undefined) {
    return exibirSimbolo ? 'R$ 0,00' : '0,00';
  }
  
  const numero = typeof valor === 'string' ? parseMoedaBR(valor) : valor;
  
  if (isNaN(numero)) {
    return exibirSimbolo ? 'R$ 0,00' : '0,00';
  }
  
  if (exibirSimbolo) {
    return numero.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }
  
  return numero.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Converter taxa formatada para número
export const parseTaxa = (taxaFormatada: string): number => {
  return parseFloat(taxaFormatada.replace(',', '.')) || 0;
};