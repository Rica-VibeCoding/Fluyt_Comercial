/**
 * INTERFACE UNIFICADA DE CLIENTE
 * Resolve mismatch entre orçamento e contrato
 */

// Cliente básico usado no orçamento
export interface ClienteBasico {
  id: string;
  nome: string;
}

// Dados complementares para contrato
export interface DadosComplementaresCliente {
  cpf_cnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: {
    logradouro?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
    cep?: string;
  };
}

// Cliente completo (união de básico + complementares)
export interface ClienteCompleto extends ClienteBasico, DadosComplementaresCliente {}

// Helper para verificar se cliente tem dados completos
export function clienteTemDadosCompletos(cliente: ClienteCompleto): boolean {
  return !!(
    cliente.cpf_cnpj &&
    cliente.telefone &&
    cliente.email &&
    cliente.endereco?.logradouro
  );
}

// Helper para gerar endereço formatado
export function formatarEnderecoCliente(cliente: ClienteCompleto): string {
  const endereco = cliente.endereco;
  if (!endereco) return 'Endereço não informado';
  
  const partes = [
    endereco.logradouro,
    endereco.numero,
    endereco.bairro,
    `${endereco.cidade}/${endereco.uf}`,
    endereco.cep ? `CEP: ${endereco.cep}` : null
  ].filter(Boolean);
  
  return partes.join(', ') || 'Endereço não informado';
}

// Fallbacks para dados faltantes
export const CLIENTE_FALLBACKS = {
  cpf_cnpj: 'CPF/CNPJ não informado',
  telefone: 'Telefone não informado', 
  email: 'E-mail não informado',
  endereco: 'Endereço não informado'
} as const;