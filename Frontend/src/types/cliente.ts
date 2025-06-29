/**
 * Interface principal de Cliente
 * ✅ ALINHADA COM BACKEND: ClienteResponse (schemas.py)
 * Campos compatíveis com API FastAPI + Supabase
 */
export interface Cliente {
  id: string;
  nome: string;
  cpf_cnpj?: string;
  rg_ie?: string;
  email?: string;
  telefone?: string;
  tipo_venda: 'NORMAL' | 'FUTURA';
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  endereco?: string; // Compatibilidade com versões antigas
  procedencia_id?: string;
  vendedor_id?: string;
  loja_id?: string;
  procedencia?: string; // Vem de JOIN no backend
  vendedor_nome?: string; // Vem de JOIN no backend
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Dados de formulário para criar/editar cliente
 * ✅ ALINHADA COM BACKEND: ClienteCreate (schemas.py)
 * APENAS NOME É OBRIGATÓRIO - todos os outros campos são opcionais
 */
export interface ClienteFormData {
  nome: string; // ÚNICO CAMPO OBRIGATÓRIO
  cpf_cnpj?: string;
  rg_ie?: string;
  email?: string;
  telefone?: string;
  tipo_venda: 'NORMAL' | 'FUTURA';
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  procedencia_id?: string;
  vendedor_id?: string;
  observacoes?: string;
}

/**
 * Filtros para busca de clientes
 * ✅ ALINHADA COM BACKEND: FiltrosCliente (schemas.py)
 * Suporta busca por texto, filtros por categoria e período
 */
export interface FiltrosCliente {
  busca?: string;
  tipo_venda?: 'NORMAL' | 'FUTURA' | '';
  procedencia_id?: string;
  vendedor_id?: string;
  data_inicio?: string;
  data_fim?: string;
}

export interface Vendedor {
  id: string;
  nome: string;
  email?: string;
  perfil: 'VENDEDOR' | 'GERENTE' | 'MEDIDOR' | 'ADMIN_MASTER';
}

export interface Procedencia {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

export const PROCEDENCIAS_PADRAO = [
  'Indicação Amigo',
  'Facebook',
  'Google',
  'Site',
  'WhatsApp', 
  'Loja Física',
  'Outros'
] as const;

export const ESTADOS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
] as const;