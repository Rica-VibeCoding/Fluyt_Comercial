/**
 * Serviço de API para Equipe/Funcionários
 * Conecta com o backend FastAPI para operações CRUD de funcionários
 * SEGUE O PADRÃO DE empresa-service.ts QUE ESTÁ FUNCIONANDO
 */

import { API_CONFIG, logConfig } from '@/lib/config';
import { apiClient } from './api-client';
import type { Funcionario, FuncionarioFormData } from '@/types/sistema';

// Tipos alinhados com backend
export interface FuncionarioBackend {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  perfil: 'VENDEDOR' | 'GERENTE' | 'MEDIDOR' | 'ADMIN_MASTER';
  nivel_acesso: 'USUARIO' | 'SUPERVISOR' | 'GERENTE' | 'ADMIN';
  loja_id?: string;
  setor_id?: string;
  salario?: number;
  data_admissao?: string;
  limite_desconto?: number;
  comissao_percentual_vendedor?: number;
  comissao_percentual_gerente?: number;
  tem_minimo_garantido?: boolean;
  valor_minimo_garantido?: number;
  valor_medicao?: number;
  override_comissao?: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  
  // Campos relacionados (vindos dos JOINs)
  loja_nome?: string;
  setor_nome?: string;
}

export interface FuncionarioCreatePayload {
  nome: string;
  email?: string;
  telefone?: string;
  perfil: string;
  nivel_acesso: string;
  loja_id?: string;
  setor_id?: string;
  salario?: number;
  data_admissao?: string;
  limite_desconto?: number;
  comissao_percentual_vendedor?: number;
  comissao_percentual_gerente?: number;
  tem_minimo_garantido?: boolean;
  valor_minimo_garantido?: number;
  valor_medicao?: number;
  override_comissao?: number;
}

// Interface removida - conversão agora é feita no api-client

export interface FuncionarioListResponse {
  items: FuncionarioBackend[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface FuncionarioFiltros {
  busca?: string;
  perfil?: string;
  setor_id?: string;
  data_inicio?: string;
  data_fim?: string;
  page?: number;
  limit?: number;
  signal?: AbortSignal;
}

// Classe de serviço seguindo padrão de empresas
class EquipeService {
  constructor() {
    logConfig('EquipeService inicializado com conversões centralizadas');
  }

  /**
   * Converte dados do frontend (camelCase) para backend (snake_case)
   * CENTRALIZA TODAS AS CONVERSÕES AQUI
   */
  private converterParaBackend(dados: FuncionarioFormData): FuncionarioCreatePayload {
    return {
      nome: dados.nome,
      email: dados.email || undefined,
      telefone: dados.telefone || undefined,
      perfil: dados.tipoFuncionario, // tipoFuncionario → perfil
      nivel_acesso: dados.nivelAcesso,
      loja_id: dados.lojaId || undefined, // Não enviar se vazio
      setor_id: dados.setorId || undefined, // Não enviar se vazio
      salario: dados.salario || undefined,
      data_admissao: dados.dataAdmissao || undefined,
      
      // Mapear comissão baseada no tipo
      comissao_percentual_vendedor: dados.tipoFuncionario === 'VENDEDOR' ? dados.comissao : undefined,
      comissao_percentual_gerente: dados.tipoFuncionario === 'GERENTE' ? dados.comissao : undefined,
      
      // Configurações especiais
      limite_desconto: dados.configuracoes?.limiteDesconto,
      valor_medicao: dados.configuracoes?.valorMedicao,
      valor_minimo_garantido: dados.configuracoes?.minimoGarantido,
    };
  }

  /**
   * Converte dados do backend (snake_case) para frontend (camelCase)
   * ÚNICA CONVERSÃO - NÃO DUPLICAR NO HOOK!
   */
  private converterParaFrontend(funcionarioBackend: FuncionarioBackend): Funcionario {
    return {
      // IDs e campos básicos
      id: funcionarioBackend.id,
      nome: funcionarioBackend.nome,
      email: funcionarioBackend.email || '',
      telefone: funcionarioBackend.telefone || '',
      
      // Relacionamentos
      setorId: funcionarioBackend.setor_id || '',
      setor: funcionarioBackend.setor_nome || '',
      lojaId: funcionarioBackend.loja_id || '',
      loja: funcionarioBackend.loja_nome || '',
      
      // Campos financeiros
      salario: funcionarioBackend.salario || 0,
      comissao: funcionarioBackend.comissao_percentual_vendedor || 
                funcionarioBackend.comissao_percentual_gerente || 0,
      
      // Campos de trabalho
      dataAdmissao: funcionarioBackend.data_admissao || '',
      ativo: funcionarioBackend.ativo,
      
      // Conversão importante: perfil → tipoFuncionario
      tipoFuncionario: funcionarioBackend.perfil,
      nivelAcesso: funcionarioBackend.nivel_acesso,
      
      // Campo calculado
      performance: 0,
      
      // Configurações especiais
      configuracoes: {
        limiteDesconto: funcionarioBackend.limite_desconto || 0,
        valorMedicao: funcionarioBackend.valor_medicao || 0,
        minimoGarantido: funcionarioBackend.valor_minimo_garantido || 0,
      },
      
      // Timestamps
      createdAt: funcionarioBackend.created_at,
      updatedAt: funcionarioBackend.updated_at,
    };
  }

  /**
   * Lista funcionários com filtros e paginação
   */
  async listar(filtros: FuncionarioFiltros = {}): Promise<{ success: boolean; data?: FuncionarioListResponse; error?: string }> {
    try {
      logConfig('📡 Listando funcionários via API...', { filtros });
      
      // Usar método do apiClient
      const response = await apiClient.listarFuncionarios(filtros);

      if (response.success && response.data) {
        // Converter cada item do backend para frontend
        const itemsConvertidos = response.data.items.map(item => 
          this.converterParaFrontend(item)
        );

        logConfig('✅ Funcionários carregados e convertidos', { 
          total: response.data.total,
          convertidos: itemsConvertidos.length 
        });

        return {
          success: true,
          data: {
            ...response.data,
            items: itemsConvertidos as any // Cast necessário por causa da conversão
          }
        };
      } else {
        throw new Error(response.error || 'Erro ao carregar funcionários');
      }
    } catch (error: any) {
      // Tratamento de erro específico
      let mensagemErro = 'Erro ao carregar funcionários';
      
      if (error.message?.includes('403') || error.message?.includes('Not authenticated')) {
        mensagemErro = 'Sessão expirada. Faça login novamente.';
      } else if (error.message?.includes('Failed to fetch')) {
        mensagemErro = 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
      } else if (error.message?.includes('timeout')) {
        mensagemErro = 'Servidor demorou muito para responder. Tente novamente.';
      }

      logConfig('❌ Erro ao listar funcionários:', error.message);
      return {
        success: false,
        error: mensagemErro
      };
    }
  }

  /**
   * Busca um funcionário específico por ID
   */
  async buscarPorId(id: string): Promise<{ success: boolean; data?: Funcionario; error?: string }> {
    try {
      logConfig('📡 Buscando funcionário via API...', { id });
      
      const response = await apiClient.buscarFuncionarioPorId(id);

      if (response.success && response.data) {
        const funcionarioConvertido = this.converterParaFrontend(response.data);
        logConfig('✅ Funcionário encontrado e convertido');
        
        return {
          success: true,
          data: funcionarioConvertido
        };
      } else {
        throw new Error(response.error || 'Funcionário não encontrado');
      }
    } catch (error: any) {
      logConfig('❌ Erro ao buscar funcionário:', error.message);
      return {
        success: false,
        error: error.message || 'Erro ao buscar funcionário'
      };
    }
  }

  /**
   * Cria um novo funcionário
   */
  async criar(dados: FuncionarioFormData): Promise<{ success: boolean; data?: Funcionario; error?: string }> {
    try {
      logConfig('📡 Criando funcionário via API...', { nome: dados.nome });
      logConfig('📦 Dados originais:', dados);
      
      // NÃO converter aqui - apiClient já faz a conversão
      // Passar direto os dados do formulário
      const response = await apiClient.criarFuncionario(dados);

      if (response.success && response.data) {
        const funcionarioCriado = this.converterParaFrontend(response.data);
        logConfig('✅ Funcionário criado e convertido');
        
        return {
          success: true,
          data: funcionarioCriado
        };
      } else {
        throw new Error(response.error || 'Erro ao criar funcionário');
      }
    } catch (error: any) {
      // Tratamento de erro específico
      let mensagemErro = 'Erro ao criar funcionário';
      
      if (error.message?.includes('duplicate') || error.message?.includes('já cadastrado')) {
        mensagemErro = 'Já existe um funcionário com este nome';
      } else if (error.message?.includes('validation')) {
        mensagemErro = 'Verifique os dados informados';
      } else if (error.message?.includes('Failed to fetch')) {
        mensagemErro = 'Erro de conexão com o servidor';
      }

      logConfig('❌ Erro ao criar funcionário:', error.message);
      return {
        success: false,
        error: mensagemErro
      };
    }
  }

  /**
   * Atualiza um funcionário existente
   */
  async atualizar(id: string, dados: Partial<FuncionarioFormData>): Promise<{ success: boolean; data?: Funcionario; error?: string }> {
    try {
      logConfig('📡 Atualizando funcionário via API...', { id });
      
      // NÃO converter aqui - apiClient já faz a conversão
      // Passar direto os dados parciais
      const response = await apiClient.atualizarFuncionario(id, dados);

      if (response.success && response.data) {
        const funcionarioAtualizado = this.converterParaFrontend(response.data);
        logConfig('✅ Funcionário atualizado e convertido');
        
        return {
          success: true,
          data: funcionarioAtualizado
        };
      } else {
        throw new Error(response.error || 'Erro ao atualizar funcionário');
      }
    } catch (error: any) {
      logConfig('❌ Erro ao atualizar funcionário:', error.message);
      return {
        success: false,
        error: error.message || 'Erro ao atualizar funcionário'
      };
    }
  }

  /**
   * Alterna status ativo/inativo
   */
  async alternarStatus(id: string): Promise<{ success: boolean; data?: Funcionario; error?: string }> {
    try {
      logConfig('📡 Alternando status do funcionário...', { id });
      
      // Buscar funcionário atual para saber o status
      const funcionarioAtual = await this.buscarPorId(id);
      if (!funcionarioAtual.success || !funcionarioAtual.data) {
        throw new Error('Funcionário não encontrado');
      }
      
      // Atualizar apenas o campo ativo
      const payload = { ativo: !funcionarioAtual.data.ativo };
      
      const response = await apiClient.atualizarFuncionario(id, payload);

      if (response.success && response.data) {
        const funcionarioAtualizado = this.converterParaFrontend(response.data);
        logConfig('✅ Status alterado com sucesso');
        
        return {
          success: true,
          data: funcionarioAtualizado
        };
      } else {
        throw new Error(response.error || 'Erro ao alterar status');
      }
    } catch (error: any) {
      logConfig('❌ Erro ao alterar status:', error.message);
      return {
        success: false,
        error: error.message || 'Erro ao alterar status'
      };
    }
  }

  /**
   * Exclui um funcionário (soft delete)
   */
  async excluir(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      logConfig('📡 Excluindo funcionário via API...', { id });
      
      const response = await apiClient.excluirFuncionario(id);

      if (response.success) {
        logConfig('✅ Funcionário excluído via API');
        return {
          success: true
        };
      } else {
        throw new Error(response.error || 'Erro ao excluir funcionário');
      }
    } catch (error: any) {
      logConfig('❌ Erro ao excluir funcionário:', error.message);
      return {
        success: false,
        error: error.message || 'Erro ao excluir funcionário'
      };
    }
  }

  /**
   * Verifica se um nome está disponível
   */
  async verificarNome(nome: string, funcionarioId?: string): Promise<{ success: boolean; data?: { disponivel: boolean; nome: string }; error?: string }> {
    try {
      const response = await apiClient.verificarNomeFuncionario(nome, funcionarioId);

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data
        };
      } else {
        throw new Error(response.error || 'Erro ao verificar nome');
      }
    } catch (error: any) {
      logConfig('❌ Erro ao verificar nome:', error.message);
      return {
        success: false,
        error: error.message || 'Erro ao verificar nome'
      };
    }
  }

  /**
   * Teste de conectividade (endpoint público)
   */
  async testePublico(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await apiClient.testePublicoEquipe();

      if (response.success) {
        return {
          success: true,
          data: response.data
        };
      } else {
        throw new Error(response.error || 'Erro no teste de conectividade');
      }
    } catch (error: any) {
      logConfig('❌ Erro no teste público:', error.message);
      return {
        success: false,
        error: error.message || 'Erro no teste de conectividade'
      };
    }
  }
}

// Instância singleton
export const equipeService = new EquipeService();

// Log de inicialização
logConfig('🚀 EquipeService carregado com conversões centralizadas');