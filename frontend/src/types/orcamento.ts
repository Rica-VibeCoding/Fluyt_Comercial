/**
 * Tipos centralizados para o módulo de orçamento
 * 
 * ETAPA 2: Unificação de tipos duplicados
 * - Movidos de sessao-simples.ts e orcamento-store.ts
 * - Fonte única de verdade para tipagem
 */

// === TIPOS BÁSICOS ===

export interface Cliente {
  id: string;
  nome: string;
}

export interface Ambiente {
  id: string;
  nome: string;
  valor: number;
}

export interface FormaPagamento {
  id: string;
  tipo: 'a-vista' | 'boleto' | 'cartao' | 'financeira';
  valor: number;
  valorPresente: number;
  parcelas?: number;
  dados: any; // dados específicos de cada modal
  criadaEm: string;
  travada?: boolean; // para futura funcionalidade de travamento
}

// === TIPOS DE DADOS ESPECÍFICOS DOS MODAIS ===

export interface DadosAVista {
  data?: string;
  observacoes?: string;
}

export interface DadosBoleto {
  parcelas: number;
  vencimento?: string;
  observacoes?: string;
}

export interface DadosCartao {
  vezes: number;
  taxa?: number;
  bandeira?: string;
  observacoes?: string;
}

export interface DadosFinanceira {
  percentual: number;
  parcelas: number;
  taxa?: number;
  observacoes?: string;
}

// === TIPOS DE SESSÃO ===

export interface SessaoOrcamento {
  cliente: Cliente | null;
  ambientes: Ambiente[];
  valorTotal: number;
  formasPagamento: FormaPagamento[];
}

// === TIPOS PARA ZUSTAND STORE ===

export interface EstadosComputados {
  valorTotalFormas: number;
  valorPresenteTotal: number;
  valorRestante: number;
  descontoPercentual: number;
  valorNegociado: number;
}

export interface EstadosUI {
  loading: boolean;
  erro: string | null;
}

export interface EstadosModais {
  modalFormasAberto: boolean;
  modalAVistaAberto: boolean;
  modalBoletoAberto: boolean;
  modalCartaoAberto: boolean;
  modalFinanceiraAberto: boolean;
  formaEditando: FormaPagamento | null;
}

// === TIPOS DE AÇÕES ===

export interface AcoesCliente {
  definirCliente: (cliente: Cliente | null) => void;
  limparCliente: () => void;
}

export interface AcoesAmbientes {
  definirAmbientes: (ambientes: Ambiente[]) => void;
  adicionarAmbiente: (ambiente: Ambiente) => void;
  removerAmbiente: (id: string) => void;
}

export interface AcoesFormaPagamento {
  adicionarFormaPagamento: (forma: Omit<FormaPagamento, 'id' | 'criadaEm'>) => void;
  editarFormaPagamento: (id: string, dadosAtualizados: Partial<Omit<FormaPagamento, 'id' | 'criadaEm'>>) => void;
  removerFormaPagamento: (id: string) => void;
  toggleTravamentoForma: (id: string) => void;
}

export interface AcoesDesconto {
  definirDesconto: (percentual: number) => void;
}

export interface AcoesModais {
  abrirModalFormas: () => void;
  fecharModalFormas: () => void;
  abrirModalEdicao: (forma: FormaPagamento) => void;
  fecharModalEdicao: () => void;
}

export interface AcoesUI {
  setLoading: (loading: boolean) => void;
  setErro: (erro: string | null) => void;
}

export interface AcoesValidacao {
  podeGerarOrcamento: () => boolean;
  podeGerarContrato: () => boolean;
}

export interface AcoesLimpeza {
  limparTudo: () => void;
}

export interface AcoesDebug {
  debug: () => void;
}

// === ESTADO COMPLETO DA STORE ===

export interface OrcamentoState extends 
  SessaoOrcamento,
  EstadosComputados,
  EstadosUI,
  EstadosModais,
  AcoesCliente,
  AcoesAmbientes,
  AcoesFormaPagamento,
  AcoesDesconto,
  AcoesModais,
  AcoesUI,
  AcoesValidacao,
  AcoesLimpeza,
  AcoesDebug {}

// === TIPOS PARA PROPS DE COMPONENTES ===

export interface OrcamentoHeaderProps {
  cliente: Cliente | null;
  valorTotal: number;
  valorTotalFormas: number;
  valorRestante: number;
}

export interface OrcamentoValoresProps {
  valorTotal: number;
  valorTotalFormas: number;
  valorPresenteTotal: number;
  valorRestante: number;
  descontoPercentual: number;
  onDescontoChange: (percentual: number) => void;
}

export interface OrcamentoAmbientesProps {
  ambientes: Ambiente[];
  valorTotal: number;
}

export interface OrcamentoPagamentosProps {
  formasPagamento: FormaPagamento[];
  valorMaximo: number;
  valorJaAlocado: number;
  onAbrirModalFormas: () => void;
  onEditarForma: (forma: FormaPagamento) => void;
  onRemoverForma: (id: string) => void;
}

export interface OrcamentoModalsProps {
  modalFormasAberto: boolean;
  modalAVistaAberto: boolean;
  modalBoletoAberto: boolean;
  modalCartaoAberto: boolean;
  modalFinanceiraAberto: boolean;
  formaEditando: FormaPagamento | null;
  valorMaximo: number;
  valorJaAlocado: number;
  onCloseModalFormas: () => void;
  onCloseModalEdicao: () => void;
  onFormaPagamentoAdicionada: (forma: { tipo: string; valor?: number; detalhes?: any }) => void;
  onAtualizarForma: (dados: any, tipo: 'a-vista' | 'boleto' | 'cartao' | 'financeira') => void;
}

// === ALIASES PARA COMPATIBILIDADE (temporário durante migração) ===

/** @deprecated Use Cliente */
export type ClienteSimples = Cliente;

/** @deprecated Use Cliente */
export type ClienteOrcamento = Cliente;

/** @deprecated Use Ambiente */
export type AmbienteSimples = Ambiente;

/** @deprecated Use Ambiente */
export type AmbienteOrcamento = Ambiente;

/** @deprecated Use FormaPagamento */
export type FormaPagamentoOrcamento = FormaPagamento;

/** @deprecated Use SessaoOrcamento */
export type SessaoSimples = SessaoOrcamento; 