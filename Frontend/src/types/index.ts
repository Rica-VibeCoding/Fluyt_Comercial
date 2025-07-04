/**
 * Barrel exports para todos os tipos TypeScript
 */

// Tipos de ambiente
export type { Ambiente, AmbienteFormData } from './ambiente';

// Tipos de cliente
export type { Cliente, ClienteFormData } from './cliente';

// Tipos de contrato - tipos de exemplo, não implementados ainda

// Tipos de simulador/orçamento
export type { 
  FormaPagamento, 
  DadosAVista,
  DadosBoleto,
  DadosCartao,
  DadosFinanceira
} from './orcamento';

// Tipos do sistema
export type { 
  Empresa, 
  EmpresaFormData,
  Funcionario, 
  FuncionarioFormData,
  Setor, 
  SetorFormData,
  Loja, 
  LojaFormData,
  RegraComissao, 
  RegraComissaoFormData,
  Montador, 
  MontadorFormData,
  Transportadora, 
  TransportadoraFormData,
  BaseEntity
} from './sistema';