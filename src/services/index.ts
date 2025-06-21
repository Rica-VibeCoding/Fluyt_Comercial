/**
 * ÍNDICE DE SERVIÇOS
 * Exporta todos os serviços de integração com o backend
 */

// Cliente API
export { apiClient } from './api-client';
export { clienteService } from './cliente-service';

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

// Helpers de conversão
export {
  converterClienteBackendParaFrontend,
  converterFormDataParaPayload,
} from './api-client';