export interface Acabamento {
  id: string;
  tipo: 'Porta' | 'Caixa' | 'Painel' | 'Porta de Vidro';
  cor: string;
  espessura: string;
  material: string;
  valor: number;
}

export interface Ambiente {
  id: string;
  nome: string;
  acabamentos: Acabamento[];
  valorTotal: number;
  clienteId?: string;
  criadoEm?: string;
  importadoEm?: string;
  origem?: 'manual' | 'xml';
}

export interface AmbienteFormData {
  nome: string;
  acabamentos: Omit<Acabamento, 'id'>[];
  valorTotal: number;
}