/**
 * Barrel exports para todos os hooks
 */

// Hooks globais
export { useCurrencyInput } from './globais/use-currency-input';
export { useLocalStorage } from './globais/use-local-storage';
export { useIsMobile } from './globais/use-mobile';
export { usePersistenciaSessao } from './globais/use-persistencia-sessao';
export { useStepper } from './globais/use-stepper';
export { useToast } from './globais/use-toast';
export { useClienteSelecionado } from './globais/use-cliente-selecionado';

// Hooks de módulos - Clientes
export { useClientesApi } from './modulos/clientes/use-clientes-api';
export { useClienteForm } from './modulos/clientes/use-cliente-form';

// Hooks de módulos - Ambientes
export { useAmbientes } from './modulos/ambientes/use-ambientes';
export { useAmbientesSessao } from './modulos/ambientes/use-ambientes-sessao';

// Hooks de módulos - Orçamento
// export { useSimulador } from './modulos/orcamento/use-simulador';
// export { useFormaPagamentoCalculator } from './modulos/orcamento/use-forma-pagamento-calculator';
// export { useValorRedistributor } from './modulos/orcamento/use-valor-redistributor';
// export { useDescontoRealCalculator } from './modulos/orcamento/use-desconto-real-calculator';
// export { useSessaoIntegrada } from './modulos/orcamento/use-sessao-integrada';
// export { useSessaoIntegradaSingleton } from './modulos/orcamento/use-sessao-integrada-singleton';

// Hooks de módulos - Sistema
export { useComissoes } from './modulos/sistema/use-comissoes';
export { useConfigLoja } from './modulos/sistema/use-config-loja';
export { useEmpresas } from './modulos/sistema/use-empresas';
export { useEmpresasStore } from './modulos/sistema/use-empresas-store';
export { useEquipe } from './modulos/sistema/use-equipe';
export { useLojas } from './modulos/sistema/use-lojas';
export { useSetores } from './modulos/sistema/use-setores';
export { useTiposColaboradores } from './modulos/sistema/use-tipos-colaboradores';
export { useColaboradores } from './modulos/sistema/use-colaboradores';