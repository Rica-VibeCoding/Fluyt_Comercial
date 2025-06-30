/**
 * Service para gerenciamento de Colaboradores
 * Integração com API backend via Supabase
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  TipoColaborador,
  TipoColaboradorFormData,
  TipoColaboradorUpdate,
  TipoColaboradorListResponse,
  FiltrosTipoColaborador,
  Colaborador,
  ColaboradorFormData,
  ColaboradorUpdate,
  ColaboradorListResponse,
  FiltrosColaborador
} from '@/types/colaboradores';

// ========================================
// VALIDAÇÕES E UTILITÁRIOS
// ========================================

/**
 * Verifica se o Supabase está configurado e disponível
 */
function validateSupabaseConnection() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase não configurado. Verifique as variáveis de ambiente.');
  }
  return true;
}

/**
 * Mapeia dados do banco (snake_case) para aplicação (camelCase)
 */
function mapTipoFromDatabase(item: any): TipoColaborador {
  return {
    id: item.id,
    nome: item.nome,
    categoria: item.categoria,
    tipoPercentual: item.tipo_percentual,
    percentualValor: Number(item.percentual_valor) || 0,
    minimoGarantido: Number(item.minimo_garantido) || 0,
    salarioBase: Number(item.salario_base) || 0,
    valorPorServico: Number(item.valor_por_servico) || 0,
    opcionalNoOrcamento: Boolean(item.opcional_no_orcamento),
    ativo: Boolean(item.ativo),
    descricao: item.descricao || '',
    createdAt: item.created_at,
    updatedAt: item.updated_at
  };
}

/**
 * Mapeia dados da aplicação (camelCase) para banco (snake_case)
 */
function mapTipoToDatabase(dados: TipoColaboradorFormData | TipoColaboradorUpdate) {
  const mapped: any = {};
  
  if ('nome' in dados && dados.nome !== undefined) mapped.nome = dados.nome;
  if ('categoria' in dados && dados.categoria !== undefined) mapped.categoria = dados.categoria;
  if ('tipoPercentual' in dados && dados.tipoPercentual !== undefined) mapped.tipo_percentual = dados.tipoPercentual;
  if ('percentualValor' in dados && dados.percentualValor !== undefined) mapped.percentual_valor = dados.percentualValor;
  if ('minimoGarantido' in dados && dados.minimoGarantido !== undefined) mapped.minimo_garantido = dados.minimoGarantido;
  if ('salarioBase' in dados && dados.salarioBase !== undefined) mapped.salario_base = dados.salarioBase;
  if ('valorPorServico' in dados && dados.valorPorServico !== undefined) mapped.valor_por_servico = dados.valorPorServico;
  if ('opcionalNoOrcamento' in dados && dados.opcionalNoOrcamento !== undefined) mapped.opcional_no_orcamento = dados.opcionalNoOrcamento;
  if ('ativo' in dados && dados.ativo !== undefined) mapped.ativo = dados.ativo;
  if ('descricao' in dados && dados.descricao !== undefined) mapped.descricao = dados.descricao;
  
  return mapped;
}

// ========================================
// TIPOS DE COLABORADORES
// ========================================

export class TiposColaboradorService {
  
  /**
   * Lista todos os tipos de colaboradores com filtros
   */
  static async listar(filtros: FiltrosTipoColaborador = {}): Promise<TipoColaboradorListResponse> {
    try {
      validateSupabaseConnection();

      let query = supabase!
        .from('c_tipo_de_colaborador')
        .select(`
          id,
          nome,
          categoria,
          tipo_percentual,
          percentual_valor,
          minimo_garantido,
          salario_base,
          valor_por_servico,
          opcional_no_orcamento,
          ativo,
          descricao,
          created_at,
          updated_at
        `)
        .order('nome', { ascending: true });

      // Aplicar filtros
      if (filtros.busca) {
        query = query.ilike('nome', `%${filtros.busca}%`);
      }

      if (filtros.categoria && filtros.categoria !== 'ALL') {
        query = query.eq('categoria', filtros.categoria);
      }

      if (filtros.ativo !== undefined) {
        query = query.eq('ativo', filtros.ativo);
      }

      if (filtros.opcionalNoOrcamento !== undefined) {
        query = query.eq('opcional_no_orcamento', filtros.opcionalNoOrcamento);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Erro ao listar tipos de colaboradores:', error);
        throw new Error(`Falha ao carregar tipos de colaboradores: ${error.message}`);
      }

      // Mapear dados do banco para formato da aplicação
      const items: TipoColaborador[] = (data || []).map(mapTipoFromDatabase);

      return {
        items,
        total: count || items.length,
        page: 1,
        limit: 1000,
        totalPages: 1
      };
    } catch (error) {
      console.error('Erro no serviço de tipos de colaboradores:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro desconhecido ao carregar tipos de colaboradores');
    }
  }

  /**
   * Busca um tipo de colaborador específico por ID
   */
  static async buscarPorId(id: string): Promise<TipoColaborador | null> {
    try {
      validateSupabaseConnection();

      if (!id) {
        throw new Error('ID é obrigatório');
      }

      const { data, error } = await supabase!
        .from('c_tipo_de_colaborador')
        .select(`
          id,
          nome,
          categoria,
          tipo_percentual,
          percentual_valor,
          minimo_garantido,
          salario_base,
          valor_por_servico,
          opcional_no_orcamento,
          ativo,
          descricao,
          created_at,
          updated_at
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar tipo de colaborador:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      return mapTipoFromDatabase(data);
    } catch (error) {
      console.error('Erro ao buscar tipo de colaborador:', error);
      return null;
    }
  }

  /**
   * Cria um novo tipo de colaborador
   */
  static async criar(dados: TipoColaboradorFormData): Promise<TipoColaborador> {
    try {
      validateSupabaseConnection();

      // Validar dados obrigatórios
      if (!dados.nome?.trim()) {
        throw new Error('Nome é obrigatório');
      }
      if (!dados.categoria) {
        throw new Error('Categoria é obrigatória');
      }
      if (!dados.tipoPercentual) {
        throw new Error('Tipo de percentual é obrigatório');
      }

      const dataToInsert = {
        ...mapTipoToDatabase(dados),
        ativo: true, // Sempre criar como ativo
      };

      const { data, error } = await supabase!
        .from('c_tipo_de_colaborador')
        .insert(dataToInsert)
        .select(`
          id,
          nome,
          categoria,
          tipo_percentual,
          percentual_valor,
          minimo_garantido,
          salario_base,
          valor_por_servico,
          opcional_no_orcamento,
          ativo,
          descricao,
          created_at,
          updated_at
        `)
        .single();

      if (error) {
        console.error('Erro ao criar tipo de colaborador:', error);
        throw new Error(`Falha ao criar tipo de colaborador: ${error.message}`);
      }

      if (!data) {
        throw new Error('Nenhum dado retornado após criação');
      }

      return mapTipoFromDatabase(data);
    } catch (error) {
      console.error('Erro ao criar tipo de colaborador:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro desconhecido ao criar tipo de colaborador');
    }
  }

  /**
   * Atualiza um tipo de colaborador existente
   */
  static async atualizar(id: string, dados: TipoColaboradorUpdate): Promise<TipoColaborador> {
    try {
      validateSupabaseConnection();

      if (!id) {
        throw new Error('ID é obrigatório');
      }

      const updateData = mapTipoToDatabase(dados);

      if (Object.keys(updateData).length === 0) {
        throw new Error('Nenhum dado fornecido para atualização');
      }

      const { data, error } = await supabase!
        .from('c_tipo_de_colaborador')
        .update(updateData)
        .eq('id', id)
        .select(`
          id,
          nome,
          categoria,
          tipo_percentual,
          percentual_valor,
          minimo_garantido,
          salario_base,
          valor_por_servico,
          opcional_no_orcamento,
          ativo,
          descricao,
          created_at,
          updated_at
        `)
        .single();

      if (error) {
        console.error('Erro ao atualizar tipo de colaborador:', error);
        throw new Error(`Falha ao atualizar tipo de colaborador: ${error.message}`);
      }

      if (!data) {
        throw new Error('Tipo de colaborador não encontrado');
      }

      return mapTipoFromDatabase(data);
    } catch (error) {
      console.error('Erro ao atualizar tipo de colaborador:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro desconhecido ao atualizar tipo de colaborador');
    }
  }

  /**
   * Alterna o status ativo/inativo de um tipo de colaborador
   */
  static async alternarStatus(id: string): Promise<TipoColaborador> {
    try {
      // Primeiro buscar o status atual
      const tipoAtual = await this.buscarPorId(id);
      if (!tipoAtual) {
        throw new Error('Tipo de colaborador não encontrado');
      }

      // Alternar status
      return await this.atualizar(id, { ativo: !tipoAtual.ativo });
    } catch (error) {
      console.error('Erro ao alternar status do tipo de colaborador:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro desconhecido ao alternar status');
    }
  }

  /**
   * Exclui um tipo de colaborador
   */
  static async excluir(id: string): Promise<void> {
    try {
      validateSupabaseConnection();

      if (!id) {
        throw new Error('ID é obrigatório');
      }

      const { error } = await supabase!
        .from('c_tipo_de_colaborador')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir tipo de colaborador:', error);
        throw new Error(`Falha ao excluir tipo de colaborador: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao excluir tipo de colaborador:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro desconhecido ao excluir tipo de colaborador');
    }
  }
}

// ========================================
// COLABORADORES INDIVIDUAIS
// ========================================

/**
 * Mapeia dados de colaborador do banco (snake_case) para aplicação (camelCase)
 */
function mapColaboradorFromDatabase(item: any): Colaborador {
  return {
    id: item.id,
    nome: item.nome,
    tipoColaboradorId: item.tipo_colaborador_id,
    cpf: item.cpf,
    telefone: item.telefone,
    email: item.email,
    endereco: item.endereco,
    dataAdmissao: item.data_admissao,
    ativo: Boolean(item.ativo),
    observacoes: item.observacoes,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    tipoColaborador: item.c_tipo_de_colaborador ? {
      id: item.c_tipo_de_colaborador.id,
      nome: item.c_tipo_de_colaborador.nome,
      categoria: item.c_tipo_de_colaborador.categoria,
      tipoPercentual: 'VENDA' as const,
      percentualValor: 0,
      minimoGarantido: 0,
      salarioBase: 0,
      valorPorServico: 0,
      opcionalNoOrcamento: false,
      ativo: true,
      createdAt: item.c_tipo_de_colaborador.created_at || new Date().toISOString(),
      updatedAt: item.c_tipo_de_colaborador.updated_at
    } : undefined
  };
}

/**
 * Mapeia dados de colaborador da aplicação (camelCase) para banco (snake_case)
 */
function mapColaboradorToDatabase(dados: ColaboradorFormData | ColaboradorUpdate) {
  const mapped: any = {};
  
  if ('nome' in dados && dados.nome !== undefined) mapped.nome = dados.nome;
  if ('tipoColaboradorId' in dados && dados.tipoColaboradorId !== undefined) mapped.tipo_colaborador_id = dados.tipoColaboradorId;
  if ('cpf' in dados && dados.cpf !== undefined) mapped.cpf = dados.cpf;
  if ('telefone' in dados && dados.telefone !== undefined) mapped.telefone = dados.telefone;
  if ('email' in dados && dados.email !== undefined) mapped.email = dados.email;
  if ('endereco' in dados && dados.endereco !== undefined) mapped.endereco = dados.endereco;
  if ('dataAdmissao' in dados && dados.dataAdmissao !== undefined) mapped.data_admissao = dados.dataAdmissao;
  if ('ativo' in dados && dados.ativo !== undefined) mapped.ativo = dados.ativo;
  if ('observacoes' in dados && dados.observacoes !== undefined) mapped.observacoes = dados.observacoes;
  
  return mapped;
}

export class ColaboradoresService {
  
  /**
   * Lista todos os colaboradores com filtros
   */
  static async listar(filtros: FiltrosColaborador = {}): Promise<ColaboradorListResponse> {
    try {
      validateSupabaseConnection();

      let query = supabase!
        .from('c_colaboradores')
        .select(`
          id,
          nome,
          tipo_colaborador_id,
          cpf,
          telefone,
          email,
          endereco,
          data_admissao,
          ativo,
          observacoes,
          created_at,
          updated_at,
          c_tipo_de_colaborador!inner (
            id,
            nome,
            categoria
          )
        `)
        .order('nome', { ascending: true });

      // Aplicar filtros
      if (filtros.busca) {
        query = query.or(`nome.ilike.%${filtros.busca}%,cpf.ilike.%${filtros.busca}%`);
      }

      if (filtros.tipoColaboradorId) {
        query = query.eq('tipo_colaborador_id', filtros.tipoColaboradorId);
      }

      if (filtros.categoria && filtros.categoria !== 'ALL') {
        query = query.eq('c_tipo_de_colaborador.categoria', filtros.categoria);
      }

      if (filtros.ativo !== undefined) {
        query = query.eq('ativo', filtros.ativo);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Erro ao listar colaboradores:', error);
        throw new Error(`Falha ao carregar colaboradores: ${error.message}`);
      }

      // Mapear dados do banco para formato da aplicação
      const items: Colaborador[] = (data || []).map(mapColaboradorFromDatabase);

      return {
        items,
        total: count || items.length,
        page: 1,
        limit: 1000,
        totalPages: 1
      };
    } catch (error) {
      console.error('Erro no serviço de colaboradores:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro desconhecido ao carregar colaboradores');
    }
  }

  /**
   * Busca um colaborador específico por ID
   */
  static async buscarPorId(id: string): Promise<Colaborador | null> {
    try {
      validateSupabaseConnection();

      if (!id) {
        throw new Error('ID é obrigatório');
      }

      const { data, error } = await supabase!
        .from('c_colaboradores')
        .select(`
          id,
          nome,
          tipo_colaborador_id,
          cpf,
          telefone,
          email,
          endereco,
          data_admissao,
          ativo,
          observacoes,
          created_at,
          updated_at,
          c_tipo_de_colaborador (
            id,
            nome,
            categoria
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar colaborador:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      return mapColaboradorFromDatabase(data);
    } catch (error) {
      console.error('Erro ao buscar colaborador:', error);
      return null;
    }
  }

  /**
   * Cria um novo colaborador
   */
  static async criar(dados: ColaboradorFormData): Promise<Colaborador> {
    try {
      validateSupabaseConnection();

      // Validar dados obrigatórios
      if (!dados.nome?.trim()) {
        throw new Error('Nome é obrigatório');
      }
      if (!dados.tipoColaboradorId) {
        throw new Error('Tipo de colaborador é obrigatório');
      }

      // Validar CPF se fornecido
      if (dados.cpf && !(await this.verificarCpfDisponivel(dados.cpf))) {
        throw new Error('CPF já está em uso por outro colaborador');
      }

      // Validar email se fornecido
      if (dados.email && !(await this.verificarEmailDisponivel(dados.email))) {
        throw new Error('Email já está em uso por outro colaborador');
      }

      const dataToInsert = {
        ...mapColaboradorToDatabase(dados),
        ativo: true, // Sempre criar como ativo
      };

      const { data, error } = await supabase!
        .from('c_colaboradores')
        .insert(dataToInsert)
        .select(`
          id,
          nome,
          tipo_colaborador_id,
          cpf,
          telefone,
          email,
          endereco,
          data_admissao,
          ativo,
          observacoes,
          created_at,
          updated_at,
          c_tipo_de_colaborador (
            id,
            nome,
            categoria
          )
        `)
        .single();

      if (error) {
        console.error('Erro ao criar colaborador:', error);
        throw new Error(`Falha ao criar colaborador: ${error.message}`);
      }

      if (!data) {
        throw new Error('Nenhum dado retornado após criação');
      }

      return mapColaboradorFromDatabase(data);
    } catch (error) {
      console.error('Erro ao criar colaborador:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro desconhecido ao criar colaborador');
    }
  }

  /**
   * Atualiza um colaborador existente
   */
  static async atualizar(id: string, dados: ColaboradorUpdate): Promise<Colaborador> {
    try {
      validateSupabaseConnection();

      if (!id) {
        throw new Error('ID é obrigatório');
      }

      // Validar CPF se fornecido
      if (dados.cpf && !(await this.verificarCpfDisponivel(dados.cpf, id))) {
        throw new Error('CPF já está em uso por outro colaborador');
      }

      // Validar email se fornecido
      if (dados.email && !(await this.verificarEmailDisponivel(dados.email, id))) {
        throw new Error('Email já está em uso por outro colaborador');
      }

      const updateData = mapColaboradorToDatabase(dados);

      if (Object.keys(updateData).length === 0) {
        throw new Error('Nenhum dado fornecido para atualização');
      }

      const { data, error } = await supabase!
        .from('c_colaboradores')
        .update(updateData)
        .eq('id', id)
        .select(`
          id,
          nome,
          tipo_colaborador_id,
          cpf,
          telefone,
          email,
          endereco,
          data_admissao,
          ativo,
          observacoes,
          created_at,
          updated_at,
          c_tipo_de_colaborador (
            id,
            nome,
            categoria
          )
        `)
        .single();

      if (error) {
        console.error('Erro ao atualizar colaborador:', error);
        throw new Error(`Falha ao atualizar colaborador: ${error.message}`);
      }

      if (!data) {
        throw new Error('Colaborador não encontrado');
      }

      return mapColaboradorFromDatabase(data);
    } catch (error) {
      console.error('Erro ao atualizar colaborador:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro desconhecido ao atualizar colaborador');
    }
  }

  /**
   * Alterna o status ativo/inativo de um colaborador
   */
  static async alternarStatus(id: string): Promise<Colaborador> {
    try {
      // Primeiro buscar o status atual
      const colaboradorAtual = await this.buscarPorId(id);
      if (!colaboradorAtual) {
        throw new Error('Colaborador não encontrado');
      }

      // Alternar status
      return await this.atualizar(id, { ativo: !colaboradorAtual.ativo });
    } catch (error) {
      console.error('Erro ao alternar status do colaborador:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro desconhecido ao alternar status');
    }
  }

  /**
   * Exclui um colaborador
   */
  static async excluir(id: string): Promise<void> {
    try {
      validateSupabaseConnection();

      if (!id) {
        throw new Error('ID é obrigatório');
      }

      const { error } = await supabase!
        .from('c_colaboradores')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir colaborador:', error);
        throw new Error(`Falha ao excluir colaborador: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao excluir colaborador:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro desconhecido ao excluir colaborador');
    }
  }

  /**
   * Verifica se CPF está disponível
   */
  static async verificarCpfDisponivel(cpf: string, excludeId?: string): Promise<boolean> {
    try {
      validateSupabaseConnection();

      if (!cpf?.trim()) {
        return true; // CPF vazio é considerado disponível
      }

      let query = supabase!
        .from('c_colaboradores')
        .select('id')
        .eq('cpf', cpf);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao verificar CPF:', error);
        return false;
      }

      return !data || data.length === 0;
    } catch (error) {
      console.error('Erro ao verificar disponibilidade do CPF:', error);
      return false;
    }
  }

  /**
   * Verifica se email está disponível
   */
  static async verificarEmailDisponivel(email: string, excludeId?: string): Promise<boolean> {
    try {
      validateSupabaseConnection();

      if (!email?.trim()) {
        return true; // Email vazio é considerado disponível
      }

      let query = supabase!
        .from('c_colaboradores')
        .select('id')
        .eq('email', email);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao verificar email:', error);
        return false;
      }

      return !data || data.length === 0;
    } catch (error) {
      console.error('Erro ao verificar disponibilidade do email:', error);
      return false;
    }
  }
}

export default {
  TiposColaboradorService,
  ColaboradoresService
}; 