import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import type { ConfiguracaoLoja, ConfiguracaoLojaFormData } from '@/types/sistema';
import { apiClient } from '@/services/api-client';
import { ConfigLojaValidator } from '@/lib/validations/config-loja';
import { useApiCrud } from '@/hooks/globais/use-api-crud';
import { NumberingFormatter } from '@/lib/utils/numbering-formatter';

// Adapter para usar com hook CRUD genérico
const configLojaApiAdapter = {
  list: async (filters?: any) => {
    const response = await apiClient.listarConfiguracoes(filters);
    // A API retorna {success: true, data: {items: [...], total: 2}}
    // Mas use-api-crud espera {success: true, data: [...]}
    if (response.success && response.data && (response.data as any).data) {
      return {
        success: true,
        data: (response.data as any).data  // Corrige aninhamento extra
      };
    }
    return response;
  },
  getById: (id: string) => apiClient.request(`/api/v1/config-loja/${id}`),
  create: (data: ConfiguracaoLojaFormData) => apiClient.criarConfiguracao(data),
  update: async (id: string, data: Partial<ConfiguracaoLojaFormData>) => {
    const response = await apiClient.atualizarConfiguracao(id, data);
    // Corrigir aninhamento para updates também
    if (response.success && response.data && (response.data as any).data) {
      return {
        success: true,
        data: (response.data as any).data
      };
    }
    return response;
  },
  delete: (id: string) => apiClient.excluirConfiguracao(id)
};

export function useConfigLoja() {
  const {
    items: rawConfiguracoes,
    loading: crudLoading,
    createItem,
    updateItem,
    deleteItem,
    getById: getConfigById,
    loadItems: loadConfiguracoes
  } = useApiCrud(configLojaApiAdapter, {
    loadOnMount: false, // DESABILITADO - carregamento manual
    successMessages: {
      create: 'Configuração criada com sucesso!',
      update: 'Configuração atualizada com sucesso!',
      delete: 'Configuração excluída com sucesso!'
    }
  });


  // Validar configuração (usando validador centralizado)
  const validarConfiguracao = useCallback((dados: ConfiguracaoLojaFormData): string[] => {
    const validation = ConfigLojaValidator.validateConfigLoja(dados);
    return validation.errors;
  }, []);

  // Mapear dados do backend para frontend (usando useMemo para evitar loop)
  const configuracoes = useMemo(() => {
    if (!rawConfiguracoes || !Array.isArray(rawConfiguracoes)) {
      return [];
    }
    
    const mapped = rawConfiguracoes.map((config: any) => {
      return {
        id: config.id, // IMPORTANTE: Incluir ID para detectar updates
        storeId: config.store_id,
        storeName: config.store_name || config.loja_nome || 'Loja Desconhecida',
        discountLimitVendor: config.discount_limit_vendor,
        discountLimitManager: config.discount_limit_manager,
        discountLimitAdminMaster: config.discount_limit_admin_master,
        defaultMeasurementValue: config.default_measurement_value,
        freightPercentage: config.freight_percentage,
        assemblyPercentage: config.assembly_percentage,
        executiveProjectPercentage: config.executive_project_percentage,
        initialNumber: config.initial_number,
        numberFormat: config.number_format,
        numberPrefix: config.number_prefix,
        updatedAt: config.updated_at || new Date().toISOString().split('T')[0],
      };
    });
    return mapped;
  }, [rawConfiguracoes]);

  // Obter configuração por loja (usando hook CRUD)
  const obterConfiguracao = useCallback(async (storeId: string): Promise<ConfiguracaoLoja | null> => {
    const rawConfig = await getConfigById(storeId);
    if (!rawConfig) return null;

    return {
      storeId: (rawConfig as any).store_id,
      storeName: (rawConfig as any).store_name || (rawConfig as any).loja_nome || 'Loja Desconhecida',
      discountLimitVendor: (rawConfig as any).discount_limit_vendor,
      discountLimitManager: (rawConfig as any).discount_limit_manager,
      discountLimitAdminMaster: (rawConfig as any).discount_limit_admin_master,
      defaultMeasurementValue: (rawConfig as any).default_measurement_value,
      freightPercentage: (rawConfig as any).freight_percentage,
      assemblyPercentage: (rawConfig as any).assembly_percentage,
      executiveProjectPercentage: (rawConfig as any).executive_project_percentage,
      initialNumber: (rawConfig as any).initial_number,
      numberFormat: (rawConfig as any).number_format,
      numberPrefix: (rawConfig as any).number_prefix,
      updatedAt: (rawConfig as any).updated_at || new Date().toISOString().split('T')[0],
    };
  }, [getConfigById]);

  // Salvar configuração (usando hook CRUD)
  const salvarConfiguracao = useCallback(async (dados: ConfiguracaoLojaFormData): Promise<boolean> => {
    // Validações
    const erros = validarConfiguracao(dados);
    if (erros.length > 0) {
      erros.forEach(erro => toast.error(erro));
      return false;
    }

    // Se tem ID, é uma edição direta
    if (dados.id) {
      return await updateItem(dados.id, dados);
    }
    
    // Se não tem ID, verificar se já existe config para a loja
    const configExistente = configuracoes.find(config => config.storeId === dados.storeId);
    
    if (configExistente && configExistente.id) {
      return await updateItem(configExistente.id, dados);
    } else {
      return await createItem(dados);
    }
  }, [validarConfiguracao, configuracoes, updateItem, createItem]);



  // Gerar exemplo de numeração (usando utilitário)
  const gerarExemploNumeracao = useCallback((prefix: string, format: string, initialNumber: number): string => {
    return NumberingFormatter.generateExample(prefix, format, initialNumber);
  }, []);

  // Cache simples para lojas
  const lojasCache = useRef<Array<{ id: string; name: string }> | null>(null);

  // Obter lojas disponíveis
  const obterLojas = useCallback(async () => {
    // Retornar cache se já carregado
    if (lojasCache.current) {
      return lojasCache.current;
    }

    try {
      const response = await apiClient.listarLojas();
      
      if (response.success && response.data) {
        const lojas = response.data.items.map((loja: any) => ({
          id: loja.id,
          name: loja.nome || loja.name || 'Loja Desconhecida'
        }));
        lojasCache.current = lojas; // Armazenar no cache
        return lojas;
      } else {
        // Fallback para lojas padrão em caso de erro
        return [
          { id: '1', name: 'Loja Centro' },
          { id: '2', name: 'Loja Shopping Norte' },
          { id: '3', name: 'Loja Sul' }
        ];
      }
    } catch (error) {
      // Fallback para lojas padrão em caso de erro
      return [
        { id: '1', name: 'Loja Centro' },
        { id: '2', name: 'Loja Shopping Norte' },
        { id: '3', name: 'Loja Sul' }
      ];
    }
  }, []); // Sem dependências para evitar re-criações

  // Resetar dados (recarregar do servidor)
  const resetarDados = useCallback(async () => {
    try {
      await loadConfiguracoes();
      toast.success('Dados recarregados do servidor!');
    } catch (error) {
      toast.error('Erro ao recarregar dados');
    }
  }, [loadConfiguracoes]);

  // Estatísticas (usando useMemo para evitar recalcular sempre)
  const estatisticas = useMemo(() => ({
    totalLojas: 3, // Será calculado dinamicamente quando as lojas forem carregadas
    lojasConfiguradas: configuracoes.length,
    lojasNaoConfiguradas: Math.max(0, 3 - configuracoes.length),
    limiteDescontoMedio: configuracoes.length > 0
      ? configuracoes.reduce((sum, config) => sum + config.discountLimitVendor, 0) / configuracoes.length
      : 0
  }), [configuracoes]);

  return {
    configuracoes,
    loading: crudLoading,
    estatisticas,
    obterConfiguracao,
    salvarConfiguracao,
    gerarExemploNumeracao,
    obterLojas,
    resetarDados,
    validarConfiguracao,
    loadConfiguracoes // Expor para carregamento manual
  };
}