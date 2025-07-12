/**
 * Barrel exports para componentes do sistema
 */

// Debug
export { DebugWrapper } from './debug-wrapper';

// Empresas
export { GestaoEmpresas } from './empresas/gestao-empresas';
export { EmpresaForm } from './empresas/empresa-form';
export { EmpresaTable } from './empresas/empresa-table';

// Lojas
export { default as GestaoLojas } from './lojas/gestao-lojas';

// Equipe
export { GestaoEquipe } from './equipe/gestao-equipe';
export { FuncionarioTable } from './equipe/funcionario-table';

// Setores
export { GestaoSetores } from './setores/gestao-setores';
export { SetorForm } from './setores/setor-form';
export { SetorTable } from './setores/setor-table';

// Comissões
export { GestaoComissoes } from './comissoes/gestao-comissoes';
export { ComissaoTable } from './comissoes/comissao-table';

// Configurações
export { ConfigLoja } from './configuracoes/config-loja';
export { GestaoConfigLoja } from './configuracoes/gestao-config-loja';
export { ConfigLojaTable } from './configuracoes/config-loja-table';
export { ConfigLojaForm } from './configuracoes/config-loja-form';
export { ResetDados } from './configuracoes/reset-dados';
export { TesteConectividade } from './configuracoes/teste-conectividade';

// Colaboradores (substitui Prestadores)
export { GestaoTiposColaboradores, GestaoColaboradoresIndividuais } from './colaboradores';

// Status de Orçamento
export { GestaoStatusOrcamento } from './status-orcamento';

// Procedências
export { GestaoProcedencias } from './procedencias';