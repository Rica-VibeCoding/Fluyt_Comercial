/**
 * Tratamento centralizado de erros no frontend
 */

export interface ErrorResponse {
  message: string;
  status?: number;
  detail?: string;
}

/**
 * Extrai mensagem de erro de diferentes formatos de resposta
 */
export function extractErrorMessage(error: any): string {
  // Se for string direta
  if (typeof error === 'string') {
    return error;
  }

  // Se tiver response do axios
  if (error.response?.data) {
    const data = error.response.data;
    
    // FastAPI retorna detail
    if (data.detail) {
      return data.detail;
    }
    
    // Outros formatos comuns
    if (data.message) {
      return data.message;
    }
    
    if (data.error) {
      return data.error;
    }
    
    // Fallback para string do objeto
    if (typeof data === 'string') {
      return data;
    }
  }

  // Se tiver mensagem direta
  if (error.message) {
    return error.message;
  }

  // Mensagem padrão por código de status
  if (error.response?.status) {
    return getDefaultMessageByStatus(error.response.status);
  }

  // Fallback final
  return 'Erro desconhecido. Por favor, tente novamente.';
}

/**
 * Retorna mensagem padrão baseada no status HTTP
 */
function getDefaultMessageByStatus(status: number): string {
  switch (status) {
    case 400:
      return 'Dados inválidos. Verifique as informações e tente novamente.';
    case 401:
      return 'Sessão expirada. Por favor, faça login novamente.';
    case 403:
      return 'Você não tem permissão para realizar esta ação.';
    case 404:
      return 'Recurso não encontrado.';
    case 409:
      return 'Conflito ao processar solicitação. O recurso já existe.';
    case 422:
      return 'Dados inválidos. Verifique os campos obrigatórios.';
    case 500:
      return 'Erro interno do servidor. Por favor, tente novamente mais tarde.';
    case 502:
      return 'Servidor indisponível. Verifique se o backend está rodando.';
    case 503:
      return 'Serviço temporariamente indisponível.';
    default:
      return `Erro ${status}. Por favor, tente novamente.`;
  }
}

/**
 * Verifica se o erro é de rede/conexão
 */
export function isNetworkError(error: any): boolean {
  return !error.response && error.request;
}

/**
 * Formata erro para exibição amigável ao usuário
 */
export function formatUserError(error: any): ErrorResponse {
  const message = extractErrorMessage(error);
  const status = error.response?.status;
  
  return {
    message,
    status,
    detail: error.response?.data?.detail
  };
}