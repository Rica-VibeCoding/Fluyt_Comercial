/**
 * HOOK DE AMBIENTES - INTEGRAÇÃO TOTAL COM BACKEND
 * Remove todos os dados mock e usa apenas API real
 * Compatível com estrutura Supabase: c_ambientes + c_ambientes_material
 */

import { useState, useEffect, useCallback } from 'react';
import { ambientesService } from '@/services/ambientes-service';
import { logConfig } from '@/lib/config';
import { extractErrorMessage } from '@/lib/error-handler';
import type { 
  Ambiente, 
  AmbienteFormData, 
  AmbienteUpdateData, 
  FiltrosAmbiente 
} from '@/types/ambiente';

export const useAmbientes = (clienteId?: string) => {
  // ============= ESTADO =============
  const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);

  // ============= CARREGAR AMBIENTES =============
  const carregarAmbientes = useCallback(async (filtros?: FiltrosAmbiente) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Sempre incluir materiais por padrão para melhor UX
      const filtrosComCliente = clienteId ? { 
        ...filtros, 
        cliente_id: clienteId,
        incluir_materiais: true // Forçar sempre true
      } : {
        ...filtros,
        incluir_materiais: true // Forçar sempre true
      };
      
      logConfig('🔄 Carregando ambientes...', { 
        cliente_id: clienteId, 
        filtros: filtrosComCliente,
        incluindo_materiais: filtrosComCliente.incluir_materiais 
      });
      
      const response = await ambientesService.listar(filtrosComCliente);
      
      if (response.success && response.data) {
        setAmbientes(response.data.items);
        setIsConnected(true);
        logConfig('✅ Ambientes carregados com sucesso', { 
          total: response.data.items.length,
          com_materiais: filtrosComCliente.incluir_materiais,
          source: response.source 
        });
      } else {
        setError(response.error || 'Erro ao carregar ambientes');
        setIsConnected(false);
        logConfig('❌ Erro ao carregar ambientes:', response.error);
      }
    } catch (error) {
      const errorMsg = extractErrorMessage(error);
      setError(errorMsg);
      setIsConnected(false);
      logConfig('❌ Erro inesperado ao carregar ambientes:', errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [clienteId]);

  // ============= CRIAR AMBIENTE =============
  const adicionarAmbiente = async (dados: AmbienteFormData): Promise<boolean> => {
    if (!clienteId) {
      setError('Cliente ID é obrigatório para criar ambiente');
      return false;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      logConfig('🔄 Criando ambiente...', { nome: dados.nome, clienteId });
      
      // Garantir que clienteId está no payload
      const dadosCompletos: AmbienteFormData = {
        ...dados,
        cliente_id: clienteId,
        origem: dados.origem || 'manual'
      };
      
      const response = await ambientesService.criar(dadosCompletos);
      
      if (response.success && response.data) {
        // Adicionar o novo ambiente à lista
        setAmbientes(prev => [...prev, response.data!]);
        setIsConnected(true);
        logConfig('✅ Ambiente criado com sucesso', { 
          id: response.data.id,
          nome: response.data.nome 
        });
        return true;
      } else {
        setError(response.error || 'Erro ao criar ambiente');
        setIsConnected(false);
        logConfig('❌ Erro ao criar ambiente:', response.error);
        return false;
      }
    } catch (error) {
      const errorMsg = extractErrorMessage(error);
      setError(errorMsg);
      setIsConnected(false);
      logConfig('❌ Erro inesperado ao criar ambiente:', errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ============= ATUALIZAR AMBIENTE =============
  const atualizarAmbiente = async (id: string, dados: AmbienteUpdateData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      logConfig('🔄 Atualizando ambiente...', { id, dados });
      
      const response = await ambientesService.atualizar(id, dados);
      
      if (response.success && response.data) {
        // Atualizar o ambiente na lista
        setAmbientes(prev => 
          prev.map(ambiente => 
            ambiente.id === id ? response.data! : ambiente
          )
        );
        setIsConnected(true);
        logConfig('✅ Ambiente atualizado com sucesso', { 
          id: response.data.id,
          nome: response.data.nome 
        });
        return true;
      } else {
        setError(response.error || 'Erro ao atualizar ambiente');
        setIsConnected(false);
        logConfig('❌ Erro ao atualizar ambiente:', response.error);
        return false;
      }
    } catch (error) {
      const errorMsg = extractErrorMessage(error);
      setError(errorMsg);
      setIsConnected(false);
      logConfig('❌ Erro inesperado ao atualizar ambiente:', errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ============= REMOVER AMBIENTE =============
  const removerAmbiente = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      logConfig('🔄 Removendo ambiente...', { id });
      
      const response = await ambientesService.deletar(id);
      
      if (response.success) {
        // Remover o ambiente da lista
        setAmbientes(prev => prev.filter(ambiente => ambiente.id !== id));
        setIsConnected(true);
        logConfig('✅ Ambiente removido com sucesso', { id });
        return true;
      } else {
        setError(response.error || 'Erro ao remover ambiente');
        setIsConnected(false);
        logConfig('❌ Erro ao remover ambiente:', response.error);
        return false;
      }
    } catch (error) {
      const errorMsg = extractErrorMessage(error);
      setError(errorMsg);
      setIsConnected(false);
      logConfig('❌ Erro inesperado ao remover ambiente:', errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ============= BUSCAR AMBIENTE POR ID =============
  const buscarAmbientePorId = async (id: string, incluirMateriais: boolean = false): Promise<Ambiente | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      logConfig('🔄 Buscando ambiente por ID...', { id, incluirMateriais });
      
      const response = await ambientesService.obterPorId(id, incluirMateriais);
      
      if (response.success && response.data) {
        setIsConnected(true);
        logConfig('✅ Ambiente encontrado', { 
          id: response.data.id,
          nome: response.data.nome 
        });
        return response.data;
      } else {
        setError(response.error || 'Ambiente não encontrado');
        setIsConnected(false);
        logConfig('❌ Erro ao buscar ambiente:', response.error);
        return null;
      }
    } catch (error) {
      const errorMsg = extractErrorMessage(error);
      setError(errorMsg);
      setIsConnected(false);
      logConfig('❌ Erro inesperado ao buscar ambiente:', errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // ============= VERIFICAR CONECTIVIDADE =============
  const verificarConectividade = async (): Promise<boolean> => {
    try {
      // Fazer uma chamada simples para verificar se o backend está acessível
      // Não incluir materiais para teste mais rápido
      const response = await ambientesService.listar({ incluir_materiais: false });
      const conectado = response.success === true;
      setIsConnected(conectado);
      return conectado;
    } catch {
      setIsConnected(false);
      return false;
    }
  };

  // ============= LIMPAR ERRO =============
  const limparError = () => {
    setError(null);
  };

  // ============= RECARREGAR =============
  const recarregar = () => {
    carregarAmbientes();
  };

  // ============= CARREGAR AUTOMATICAMENTE =============
  useEffect(() => {
    if (clienteId) {
      carregarAmbientes();
    }
  }, [clienteId]); // REMOVIDO carregarAmbientes para evitar loop

  // ============= CÁLCULOS =============
  const valorTotalGeral = ambientes.reduce((total, ambiente) => {
    return total + (ambiente.valor_venda || ambiente.valor_custo_fabrica || 0);
  }, 0);

  const totalAmbientes = ambientes.length;
  const ambientesManual = ambientes.filter(a => a.origem === 'manual').length;
  const ambientesXML = ambientes.filter(a => a.origem === 'xml').length;

  // ============= RETORNO =============
  return {
    // Dados
    ambientes,
    totalAmbientes,
    ambientesManual,
    ambientesXML,
    valorTotalGeral,
    
    // Estado
    isLoading,
    error,
    isConnected,
    
    // Ações
    carregarAmbientes,
    adicionarAmbiente,
    atualizarAmbiente,
    removerAmbiente,
    buscarAmbientePorId,
    verificarConectividade,
    limparError,
    recarregar,
  };
};