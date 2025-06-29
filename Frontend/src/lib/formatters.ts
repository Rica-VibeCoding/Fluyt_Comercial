/**
 * FORMATTERS COMPARTILHADOS
 * Funções de formatação reutilizáveis em todo o sistema
 */

// Formatar valor em moeda brasileira
export const formatarMoeda = (valor: number): string => {
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
export const formatarPercentual = (valor: number, casasDecimais: number = 1): string => {
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
export const formatarDataHora = (dataIso?: string | null): string => {
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

// Converter taxa formatada para número
export const parseTaxa = (taxaFormatada: string): number => {
  return parseFloat(taxaFormatada.replace(',', '.')) || 0;
};