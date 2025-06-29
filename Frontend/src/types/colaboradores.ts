// ========================================
// TIPOS PARA MÓDULO COLABORADORES
// ========================================

// Base comum para entidades
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

// ========================================
// TIPOS DE COLABORADORES
// ========================================
export type CategoriaColaborador = 'FUNCIONARIO' | 'PARCEIRO';
export type TipoPercentual = 'VENDA' | 'CUSTO';

export interface TipoColaborador extends BaseEntity {
  nome: string;
  categoria: CategoriaColaborador;
  
  // Tipo de remuneração (EXCLUDENTE)
  tipoPercentual: TipoPercentual;
  percentualValor: number;
  
  // Valores fixos (apenas na tabela de tipos)
  minimoGarantido: number;
  salarioBase: number;
  valorPorServico: number;
  
  // Configurações operacionais
  opcionalNoOrcamento: boolean;
  ativo: boolean;
  ordemExibicao: number;
  descricao?: string;
}

// ========================================
// COLABORADORES INDIVIDUAIS
// ========================================
export interface Colaborador extends BaseEntity {
  nome: string;
  tipoColaboradorId: string;
  
  // Apenas dados pessoais e controle
  cpf?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  dataAdmissao?: string;
  ativo: boolean;
  observacoes?: string;
  
  // Dados relacionados (via JOIN)
  tipoColaborador?: TipoColaborador;
}

// ========================================
// FORMS DATA
// ========================================
export interface TipoColaboradorFormData {
  nome: string;
  categoria: CategoriaColaborador;
  tipoPercentual: TipoPercentual;
  percentualValor: number;
  minimoGarantido: number;
  salarioBase: number;
  valorPorServico: number;
  opcionalNoOrcamento: boolean;
  ordemExibicao: number;
  descricao?: string;
}

export interface ColaboradorFormData {
  nome: string;
  tipoColaboradorId: string;
  cpf?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  dataAdmissao?: string;
  observacoes?: string;
}

export interface TipoColaboradorUpdate {
  nome?: string;
  categoria?: CategoriaColaborador;
  tipoPercentual?: TipoPercentual;
  percentualValor?: number;
  minimoGarantido?: number;
  salarioBase?: number;
  valorPorServico?: number;
  opcionalNoOrcamento?: boolean;
  ativo?: boolean;
  ordemExibicao?: number;
  descricao?: string;
}

export interface ColaboradorUpdate {
  nome?: string;
  tipoColaboradorId?: string;
  cpf?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  dataAdmissao?: string;
  ativo?: boolean;
  observacoes?: string;
}

// ========================================
// FILTROS E LISTAGEM
// ========================================
export interface FiltrosTipoColaborador {
  busca?: string;
  categoria?: CategoriaColaborador | 'ALL';
  ativo?: boolean;
  opcionalNoOrcamento?: boolean;
}

export interface FiltrosColaborador {
  busca?: string;
  tipoColaboradorId?: string;
  categoria?: CategoriaColaborador | 'ALL';
  ativo?: boolean;
}

export interface ColaboradorListResponse {
  items: Colaborador[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ========================================
// CÁLCULOS DE REMUNERAÇÃO
// ========================================
export interface CalculoRemuneracao {
  colaboradorId: string;
  colaboradorNome: string;
  categoria: CategoriaColaborador;
  valorCalculado: number;
  detalhamento: {
    percentualVenda?: number;
    percentualCusto?: number;
    valorFixo?: number;
    minimoAplicado?: boolean;
  };
}

export interface ParametrosCalculo {
  valorVenda: number;
  custoFabrica: number;
  colaboradoresIncluidos: string[];
}

// ========================================
// TIPOS AUXILIARES
// ========================================
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

// ========================================
// CONSTANTES
// ========================================
export const CATEGORIAS_COLABORADOR = [
  { value: 'FUNCIONARIO', label: 'Funcionário' },
  { value: 'PARCEIRO', label: 'Parceiro' }
] as const;

export const TIPOS_COLABORADOR_PADRAO = {
  VENDEDOR: {
    nome: 'Vendedor',
    categoria: 'FUNCIONARIO' as CategoriaColaborador,
    percentualSobreVenda: 3.00,
    salarioBase: 4000.00
  },
  GERENTE: {
    nome: 'Gerente',
    categoria: 'FUNCIONARIO' as CategoriaColaborador,
    percentualSobreVenda: 2.00,
    salarioBase: 8000.00,
    minimoGarantido: 1500.00
  },
  MONTADOR: {
    nome: 'Montador',
    categoria: 'PARCEIRO' as CategoriaColaborador,
    percentualSobreCusto: 8.00,
    valorPorServico: 150.00,
    opcionalNoOrcamento: true
  },
  ARQUITETO: {
    nome: 'Arquiteto',
    categoria: 'PARCEIRO' as CategoriaColaborador,
    percentualSobreVenda: 10.00,
    minimoGarantido: 1500.00,
    opcionalNoOrcamento: true
  }
} as const; 