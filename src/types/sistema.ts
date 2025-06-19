// ========================================
// TIPOS DO MÓDULO SISTEMA
// ========================================

// Base comum para entidades
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

// ========================================
// EMPRESAS
// ========================================
export interface Empresa extends BaseEntity {
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  ativo: boolean;
  funcionarios?: number;
  dataFundacao?: string;
}

export interface EmpresaFormData {
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
}

// ========================================
// LOJAS
// ========================================
export interface Loja extends BaseEntity {
  nome: string;
  codigo: string;
  endereco: string;
  telefone: string;
  email: string;
  gerente: string;
  funcionarios: number;
  vendasMes: number;
  metaMes: number;
  ativa: boolean;
  empresaId: string;
  empresa?: string;
  dataAbertura: string;
}

export interface LojaFormData {
  nome: string;
  codigo: string;
  endereco: string;
  telefone: string;
  email: string;
  gerente: string;
  empresaId: string;
  metaMes: number;
}

// ========================================
// EQUIPE/FUNCIONÁRIOS
// ========================================
export type NivelAcesso = 'USUARIO' | 'SUPERVISOR' | 'GERENTE' | 'ADMIN';
export type TipoFuncionario = 'VENDEDOR' | 'GERENTE' | 'MEDIDOR' | 'ADMIN_MASTER';

export interface Funcionario extends BaseEntity {
  nome: string;
  email: string;
  telefone: string;
  setor: string;
  lojaId: string;
  loja?: string;
  salario: number;
  comissao: number;
  dataAdmissao: string;
  ativo: boolean;
  nivelAcesso: NivelAcesso;
  tipoFuncionario: TipoFuncionario;
  performance: number;
  
  // Configurações específicas por tipo
  configuracoes?: {
    limiteDesconto?: number;        // Para vendedores
    overrideComissao?: number;      // Para vendedores
    comissaoEspecifica?: number;    // Para gerentes
    minimoGarantido?: number;       // Para gerentes
    valorMedicao?: number;          // Para medidores
  };
}

export interface FuncionarioFormData {
  nome: string;
  email: string;
  telefone: string;
  setor: string;
  lojaId: string;
  salario: number;
  comissao: number;
  dataAdmissao: string;
  nivelAcesso: NivelAcesso;
  tipoFuncionario: TipoFuncionario;
  configuracoes?: Funcionario['configuracoes'];
}

// ========================================
// SETORES
// ========================================
export interface Setor extends BaseEntity {
  nome: string;
  descricao: string;
  funcionarios: number;
  ativo: boolean;
}

export interface SetorFormData {
  nome: string;
  descricao: string;
}

// ========================================
// REGRAS DE COMISSÃO
// ========================================
export type TipoComissao = 'VENDEDOR' | 'GERENTE';

export interface RegraComissao extends BaseEntity {
  tipo: TipoComissao;
  ordem: number;
  valorMinimo: number;
  valorMaximo: number | null;
  percentual: number;
  ativo: boolean;
  descricao?: string;
}

export interface RegraComissaoFormData {
  tipo: TipoComissao;
  valorMinimo: number;
  valorMaximo: number | null;
  percentual: number;
  descricao?: string;
}

// ========================================
// CONFIGURAÇÕES DA LOJA (Conforme template original)
// ========================================
export interface ConfiguracaoLoja {
  storeId: string;
  storeName: string;
  deflatorCost: number;                 // Deflator Custo Fábrica (%)
  discountLimitVendor: number;          // Limite Vendedor (%)
  discountLimitManager: number;         // Limite Gerente (%)
  discountLimitAdminMaster: number;     // Limite Admin Master (%)
  defaultMeasurementValue: number;      // Valor Padrão Medição (R$)
  freightPercentage: number;            // Percentual de Frete (%)
  initialNumber: number;                // Número Inicial
  numberFormat: string;                 // Formato (YYYY-NNNNNN, etc.)
  numberPrefix: string;                 // Prefixo (ORC, etc.)
  updatedAt: string;
}

export interface ConfiguracaoLojaFormData {
  storeId: string;
  deflatorCost: number;
  discountLimitVendor: number;
  discountLimitManager: number;
  discountLimitAdminMaster: number;
  defaultMeasurementValue: number;
  freightPercentage: number;
  initialNumber: number;
  numberFormat: string;
  numberPrefix: string;
}

// ========================================
// STATUS DE ORÇAMENTO
// ========================================
export interface StatusOrcamento extends BaseEntity {
  nome: string;
  cor: string;
  descricao: string;
  ordem: number;
  ativo: boolean;
  estadoFinal: boolean; // Se é um estado final do processo
}

export interface StatusOrcamentoFormData {
  nome: string;
  cor: string;
  descricao: string;
  ordem: number;
  estadoFinal: boolean;
}

// ========================================
// MONTADORES (Conforme template original)
// ========================================
export type CategoriaMontador = 'MARCENEIRO' | 'ELETRICISTA' | 'ENCANADOR' | 'GESSEIRO' | 'PINTOR' | 'OUTRO';

export interface Montador extends BaseEntity {
  nome: string;
  categoria: CategoriaMontador;
  valorFixo: number;
  telefone: string;
  ativo: boolean;
}

export interface MontadorFormData {
  nome: string;
  categoria: CategoriaMontador;
  valorFixo: number;
  telefone: string;
  cpf: string;
  email: string;
  valorHora: number;
  especialidade: string;
}

// ========================================
// TRANSPORTADORAS (Conforme template original)
// ========================================
export interface Transportadora extends BaseEntity {
  nomeEmpresa: string;
  valorFixo: number;
  telefone: string;
  email: string;
  ativo: boolean;
}

export interface TransportadoraFormData {
  nomeEmpresa: string;
  valorFixo: number;
  telefone: string;
  email: string;
}

// ========================================
// AUDITORIA
// ========================================
export type TipoAcaoAuditoria = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';

export interface LogAuditoria extends BaseEntity {
  usuarioId: string;
  usuarioNome: string;
  acao: TipoAcaoAuditoria;
  tabela: string;
  registroId: string;
  dadosAnteriores?: Record<string, any>;
  dadosNovos?: Record<string, any>;
  ip: string;
  userAgent: string;
  timestamp: string;
}

export interface FiltroAuditoria {
  usuario?: string;
  acao?: TipoAcaoAuditoria;
  tabela?: string;
  dataInicio?: string;
  dataFim?: string;
  busca?: string;
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

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ========================================
// ENUMS E CONSTANTES
// ========================================
export const CORES_STATUS = [
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#eab308', // yellow-500
  '#22c55e', // green-500
  '#06b6d4', // cyan-500
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
] as const;

export const CONFIGURACOES_PADRAO = {
  DESCONTO_MAXIMO_VENDEDOR: 10,
  COMISSAO_PADRAO_VENDEDOR: 3,
  COMISSAO_PADRAO_GERENTE: 2,
  META_PADRAO_LOJA: 100000,
  VALOR_HORA_MONTADOR: 50,
  VALOR_KM_TRANSPORTE: 2.5,
} as const;