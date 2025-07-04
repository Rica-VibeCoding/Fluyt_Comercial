/**
 * ÍNDICE DE SERVIÇOS
 * Exporta todos os serviços de integração com o backend
 */

// Cliente API
export { apiClient } from './api-client';
export { clienteService } from './cliente-service';
export { empresaService } from './empresa-service';
export { setoresService } from './setores-service';
export { orcamentoService } from './orcamento-service';

// Tipos
export type {
  ClienteBackend,
  ClienteCreatePayload,
  ApiResponse,
  ApiListResponse,
} from './api-client';

export type {
  ClienteServiceResponse,
  ClienteListResponse,
} from './cliente-service';

export type {
  EmpresaAPI,
  EmpresaCreatePayload,
  EmpresaUpdatePayload,
  EmpresaListResponse,
  EmpresaFiltros,
} from './empresa-service';

export type {
  OrcamentoBackend,
  FormaPagamentoBackend,
  StatusOrcamento,
  OrcamentoCreatePayload,
  FormaPagamentoCreatePayload,
  FiltrosOrcamento,
} from './orcamento-service';

// Helpers de conversão
export {
  converterClienteBackendParaFrontend,
  converterFormDataParaPayload,
} from './api-client';

export {
  converterEmpresaAPIParaFrontend,
  converterEmpresaFormDataParaPayload,
} from './empresa-service';