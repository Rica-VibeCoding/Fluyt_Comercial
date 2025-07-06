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
  nome: string;         // ✅ único obrigatório
  cnpj?: string;        // ✅ opcional
  email?: string;       // ✅ opcional
  telefone?: string;    // ✅ opcional
  endereco?: string;    // ✅ opcional
  ativo: boolean;
  total_lojas: number;  // ✅ contagem automática de lojas (alinhado com backend)
  lojas_ativas: number; // ✅ contagem de lojas ativas (alinhado com backend)
}

export interface EmpresaFormData {
  nome: string;         // ✅ único obrigatório
  cnpj?: string;        // ✅ opcional
  email?: string;       // ✅ opcional
  telefone?: string;    // ✅ opcional
  endereco?: string;    // ✅ opcional
}

// ========================================
// LOJAS
// ========================================
export interface Loja extends BaseEntity {
  nome: string;                    // ✅ ÚNICO OBRIGATÓRIO
  endereco?: string;               // ✅ opcional (alinhado com Supabase)
  telefone?: string;               // ✅ opcional (alinhado com Supabase)
  email?: string;                  // ✅ opcional (alinhado com Supabase)
  empresa_id?: string;             // ✅ opcional (alinhado com Supabase: empresa_id)
  gerente_id?: string;             // ✅ opcional (alinhado com Supabase: gerente_id UUID)
  ativo: boolean;                  // ✅ campo soft delete (alinhado com Supabase)
  
  // Campos calculados/relacionados (não existem na tabela)
  empresa?: string;                // Nome da empresa (via JOIN)
  gerente?: string;                // Nome do gerente (via JOIN)
}

export interface LojaFormData {
  nome: string;                    // ✅ ÚNICO OBRIGATÓRIO
  endereco?: string;               // ✅ opcional
  telefone?: string;               // ✅ opcional
  email?: string;                  // ✅ opcional
  empresa_id?: string;             // ✅ opcional
  gerente_id?: string;             // ✅ opcional
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
  setorId: string;  // ⚠️ MUDOU: agora é UUID, não nome!
  setor?: string;   // ✅ OPCIONAL: nome do setor (via JOIN)
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
  setorId: string;  // ⚠️ MUDOU: agora é UUID, não nome!
  lojaId: string;
  salario: number;
  comissao: number;
  dataAdmissao: string;
  ativo?: boolean;
  nivelAcesso: NivelAcesso;
  tipoFuncionario: TipoFuncionario;
  configuracoes?: Funcionario['configuracoes'];
}

// ========================================
// SETORES
// ========================================
export interface Setor extends BaseEntity {
  nome: string;
  descricao?: string;
  funcionarios: number;
  ativo: boolean;
}

export interface SetorFormData {
  nome: string;
  descricao?: string;
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
  discountLimitVendor: number;          // Limite Vendedor (%)
  discountLimitManager: number;         // Limite Gerente (%)
  discountLimitAdminMaster: number;     // Limite Admin Master (%)
  defaultMeasurementValue: number;      // Valor Padrão Medição (R$)
  freightPercentage: number;            // Percentual de Frete (%)
  assemblyPercentage: number;           // Percentual de Montagem (%)
  executiveProjectPercentage: number;   // Percentual de Projeto Executivo (%)
  initialNumber: number;                // Número Inicial
  numberFormat: string;                 // Formato (YYYY-NNNNNN, etc.)
  numberPrefix: string;                 // Prefixo (ORC, etc.)
  updatedAt: string;
}

export interface ConfiguracaoLojaFormData {
  id?: string; // ID da configuração (usado no update)
  storeId: string;
  discountLimitVendor: number;
  discountLimitManager: number;
  discountLimitAdminMaster: number;
  defaultMeasurementValue: number;
  freightPercentage: number;
  assemblyPercentage: number;
  executiveProjectPercentage: number;
  initialNumber: number;
  numberFormat: string;
  numberPrefix: string;
}

// ========================================
// STATUS DE ORÇAMENTO
// ========================================
export interface StatusOrcamento extends BaseEntity {
  nome: string;
  descricao?: string;
  cor?: string;
  ordem: number;
  ativo: boolean;
}

export interface StatusOrcamentoFormData {
  nome: string;
  descricao?: string;
  cor?: string;
  ordem: number;
  ativo?: boolean;
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