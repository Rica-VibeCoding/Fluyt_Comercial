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
      const items: Colaborador[] = (data || []).map(item => ({
        id: item.id,
        nome: item.nome,
        tipoColaboradorId: item.tipo_colaborador_id,
        cpf: item.cpf,
        telefone: item.telefone,
        email: item.email,
        endereco: item.endereco,
        dataAdmissao: item.data_admissao,
        ativo: item.ativo || false,
        observacoes: item.observacoes,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        tipoColaborador: item.c_tipo_de_colaborador ? {
          id: item.c_tipo_de_colaborador.id,
          nome: item.c_tipo_de_colaborador.nome,
          categoria: item.c_tipo_de_colaborador.categoria
        } : undefined
      }));

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

  // TODO: Implementar outros métodos CRUD para colaboradores individuais
  // (criar, atualizar, excluir, buscarPorId, alternarStatus)
}

export default {
  TiposColaboradorService,
  ColaboradoresService
}; 