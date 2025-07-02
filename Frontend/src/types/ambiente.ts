// ============= TIPOS COMPATÍVEIS COM BACKEND =============

export interface Ambiente {
  // Campos obrigatórios
  id: string;
  cliente_id: string; // OBRIGATÓRIO - relacionamento com cliente
  nome: string;
  
  // Campos monetários separados (como no backend)
  valor_custo_fabrica?: number;
  valor_venda?: number;
  
  // Campos de controle de importação
  data_importacao?: string; // ISO date string
  hora_importacao?: string; // Time string HH:MM:SS
  origem: 'manual' | 'xml';
  
  // Campos relacionados (vem de JOINs)
  cliente_nome?: string;
  
  // Materiais opcionais (JSONB do backend)
  materiais?: any; // Flexível para comportar qualquer estrutura
  
  // Controle do sistema
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}

// ============= TIPOS PARA FORMULÁRIOS =============

export interface AmbienteFormData {
  nome: string;
  cliente_id: string; // OBRIGATÓRIO
  valor_custo_fabrica?: number;
  valor_venda?: number;
  data_importacao?: string;
  hora_importacao?: string;
  origem: 'manual' | 'xml';
}

export interface AmbienteUpdateData {
  nome?: string;
  cliente_id?: string;
  valor_custo_fabrica?: number;
  valor_venda?: number;
  data_importacao?: string;
  hora_importacao?: string;
  origem?: 'manual' | 'xml';
}

// ============= TIPOS PARA FILTROS =============

export interface FiltrosAmbiente {
  busca?: string; // Busca por nome
  cliente_id?: string; // Filtrar por cliente específico
  origem?: 'manual' | 'xml'; // Filtrar por origem
  data_inicio?: string; // ISO date
  data_fim?: string; // ISO date
  valor_min?: number;
  valor_max?: number;
  incluir_materiais?: boolean; // Incluir dados JSON de materiais na resposta
}

// Alias para compatibilidade
export type AmbienteFiltros = FiltrosAmbiente;

// ============= TIPOS PARA MATERIAIS =============

export interface AmbienteMaterial {
  id: string;
  ambiente_id: string;
  materiais_json: any; // JSONB flexível
  xml_hash?: string;
  created_at: string;
  updated_at: string;
}

export interface AmbienteMaterialFormData {
  ambiente_id: string;
  materiais_json: any;
  xml_hash?: string;
}

// ============= TIPOS PARA RESPOSTAS DA API =============

export interface AmbienteListResponse {
  items: Ambiente[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}


