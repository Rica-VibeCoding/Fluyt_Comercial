export interface Cliente {
  id: string;
  nome: string;
  cpf_cnpj: string;
  rg_ie?: string;
  email?: string;
  telefone: string;
  tipo_venda: 'NORMAL' | 'FUTURA';
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  endereco?: string;
  procedencia_id?: string;
  vendedor_id?: string;
  loja_id?: string;
  procedencia?: string;
  vendedor_nome?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface ClienteFormData {
  nome: string;
  cpf_cnpj: string;
  rg_ie?: string;
  email?: string;
  telefone: string;
  tipo_venda: 'NORMAL' | 'FUTURA';
  logradouro: string;
  numero?: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  procedencia_id: string;
  vendedor_id: string;
  observacoes?: string;
}

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