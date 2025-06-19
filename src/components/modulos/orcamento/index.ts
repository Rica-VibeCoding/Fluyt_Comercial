/**
 * EXPORTS CENTRALIZADOS - MÓDULO ORÇAMENTO
 * Facilita imports e mantém organização
 */

// Componentes principais da página
export { OrcamentoHeader } from './orcamento-header';
export { OrcamentoAmbientes } from './orcamento-ambientes';
export { OrcamentoValores } from './orcamento-valores';
export { OrcamentoPagamentos } from './orcamento-pagamentos';
export { OrcamentoModals } from './orcamento-modals';

// Componentes de lista e formulários
export { ListaFormasPagamento } from './lista-formas-pagamento';

// Modais individuais
export { ModalFormasPagamento } from './modal-formas-pagamento';
export { ModalAVista } from './modal-a-vista';
export { ModalBoleto } from './modal-boleto';
export { ModalCartao } from './modal-cartao';
export { ModalFinanceira } from './modal-financeira';

// Componentes base reutilizáveis
export { ModalPagamentoBase } from './ModalPagamentoBase';
export { CampoValor } from './CampoValor';

// Tabela consolidada
export { TabelaPagamentosConsolidada } from './tabela-pagamentos-consolidada';
export { CelulaEditavel } from './celula-editavel';