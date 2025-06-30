// Utilitários para formatação de dados do contrato

import { formatarMoedaBR } from '@/lib/formatters';

// Usa função unificada de formatação monetária
export const formatarMoeda = (valor: number): string => {
  return formatarMoedaBR(valor);
};

export const formatarTelefone = (telefone: string): string => {
  const cleaned = telefone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  
  return telefone;
};

export const formatarCPFCNPJ = (documento: string): string => {
  const cleaned = documento.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    // CPF
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
  } else if (cleaned.length === 14) {
    // CNPJ
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
  }
  
  return documento;
};

export const formatarData = (data: string): string => {
  try {
    return new Date(data).toLocaleDateString('pt-BR');
  } catch {
    return data;
  }
};

export const formatarPercentual = (valor: number): string => {
  return `${(valor * 100).toFixed(1)}%`;
};