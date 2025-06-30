// ============= TIPOS COMPATÍVEIS COM BACKEND =============

export interface Ambiente {
  // Campos obrigatórios
  id: string;
  clienteId: string; // OBRIGATÓRIO - relacionamento com cliente
  nome: string;
  
  // Campos monetários separados (como no backend)
  valorCustoFabrica?: number;
  valorVenda?: number;
  
  // Campos de controle de importação
  dataImportacao?: string; // ISO date string
  horaImportacao?: string; // Time string HH:MM:SS
  origem: 'manual' | 'xml';
  
  // Campos relacionados (vem de JOINs)
  clienteNome?: string;
  
  // Materiais opcionais (JSONB do backend)
  materiais?: any; // Flexível para comportar qualquer estrutura
  
  // Controle do sistema
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

// ============= TIPOS PARA FORMULÁRIOS =============

export interface AmbienteFormData {
  nome: string;
  clienteId: string; // OBRIGATÓRIO
  valorCustoFabrica?: number;
  valorVenda?: number;
  dataImportacao?: string;
  horaImportacao?: string;
  origem: 'manual' | 'xml';
}

export interface AmbienteUpdateData {
  nome?: string;
  clienteId?: string;
  valorCustoFabrica?: number;
  valorVenda?: number;
  dataImportacao?: string;
  horaImportacao?: string;
  origem?: 'manual' | 'xml';
}

// ============= TIPOS PARA FILTROS =============

export interface FiltrosAmbiente {
  busca?: string; // Busca por nome
  clienteId?: string; // Filtrar por cliente específico
  origem?: 'manual' | 'xml'; // Filtrar por origem
  dataInicio?: string; // ISO date
  dataFim?: string; // ISO date
  valorMin?: number;
  valorMax?: number;
  incluir_materiais?: boolean; // Incluir dados JSON de materiais na resposta
}

// Alias para compatibilidade
export type AmbienteFiltros = FiltrosAmbiente;

// ============= TIPOS PARA MATERIAIS =============

export interface AmbienteMaterial {
  id: string;
  ambienteId: string;
  materiaisJson: any; // JSONB flexível
  xmlHash?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AmbienteMaterialFormData {
  ambienteId: string;
  materiaisJson: any;
  xmlHash?: string;
}

// ============= TIPOS PARA RESPOSTAS DA API =============

export interface AmbienteListResponse {
  items: Ambiente[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ============= TIPOS PARA CONVERSÃO BACKEND ↔ FRONTEND =============

export interface AmbienteBackend {
  id: string;
  cliente_id: string;
  nome: string;
  valor_custo_fabrica?: number;
  valor_venda?: number;
  data_importacao?: string;
  hora_importacao?: string;
  origem: 'manual' | 'xml';
  cliente_nome?: string;
  materiais?: any;
  created_at: string;
  updated_at: string;
}

