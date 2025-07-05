import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { ConfiguracaoLoja, ConfiguracaoLojaFormData } from '@/types/sistema';
import { useLocalStorage } from '@/hooks/globais/use-local-storage';

// Mock data baseado no template original
const mockLojas = [
  { id: '1', name: 'Loja Centro' },
  { id: '2', name: 'Loja Shopping Norte' },
  { id: '3', name: 'Loja Sul' }
];

const mockConfiguracoes: ConfiguracaoLoja[] = [
  {
    storeId: '1',
    storeName: 'Loja Centro',
    discountLimitVendor: 10,
    discountLimitManager: 20,
    discountLimitAdminMaster: 50,
    defaultMeasurementValue: 120,
    freightPercentage: 8.5,
    initialNumber: 1001,
    numberFormat: 'YYYY-NNNNNN',
    numberPrefix: 'ORC',
    updatedAt: '2024-06-01'
  },
  {
    storeId: '2',
    storeName: 'Loja Shopping Norte',
    discountLimitVendor: 8,
    discountLimitManager: 18,
    discountLimitAdminMaster: 45,
    defaultMeasurementValue: 150,
    freightPercentage: 10.0,
    initialNumber: 2001,
    numberFormat: 'YYYY-NNNNNN',
    numberPrefix: 'ORC',
    updatedAt: '2024-06-01'
  },
  {
    storeId: '3',
    storeName: 'Loja Sul',
    discountLimitVendor: 12,
    discountLimitManager: 25,
    discountLimitAdminMaster: 55,
    defaultMeasurementValue: 100,
    freightPercentage: 7.5,
    initialNumber: 3001,
    numberFormat: 'MM-YYYY-NNNN',
    numberPrefix: 'ORC',
    updatedAt: '2024-06-01'
  }
];

export function useConfigLoja() {
  const [configuracoes, setConfiguracoes, clearConfiguracoes] = useLocalStorage<ConfiguracaoLoja[]>('fluyt_config_lojas', mockConfiguracoes);
  const [loading, setLoading] = useState(false);

  // Validar configuração
  const validarConfiguracao = useCallback((dados: ConfiguracaoLojaFormData): string[] => {
    const erros: string[] = [];

    // Validar limites de desconto (hierarquia)
    if (dados.discountLimitVendor > dados.discountLimitManager) {
      erros.push('Limite do vendedor não pode ser maior que o do gerente');
    }

    if (dados.discountLimitManager > dados.discountLimitAdminMaster) {
      erros.push('Limite do gerente não pode ser maior que o do admin master');
    }

    // Validar percentuais
    if (dados.freightPercentage < 0 || dados.freightPercentage > 100) {
      erros.push('Percentual de frete deve estar entre 0% e 100%');
    }

    // Validar valor padrão de medição
    if (dados.defaultMeasurementValue <= 0) {
      erros.push('Valor padrão de medição deve ser maior que zero');
    }

    // Validar número inicial
    if (dados.initialNumber <= 0) {
      erros.push('Número inicial deve ser maior que zero');
    }

    // Validar prefixo
    if (!dados.numberPrefix || dados.numberPrefix.trim().length === 0) {
      erros.push('Prefixo é obrigatório');
    }

    return erros;
  }, []);

  // Obter configuração por loja
  const obterConfiguracao = useCallback((storeId: string): ConfiguracaoLoja | null => {
    return configuracoes.find(config => config.storeId === storeId) || null;
  }, [configuracoes]);

  // Salvar configuração
  const salvarConfiguracao = useCallback(async (dados: ConfiguracaoLojaFormData): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Validações
      const erros = validarConfiguracao(dados);

      if (erros.length > 0) {
        erros.forEach(erro => toast.error(erro));
        return false;
      }

      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Encontrar nome da loja
      const loja = mockLojas.find(l => l.id === dados.storeId);
      
      const configAtualizada: ConfiguracaoLoja = {
        ...dados,
        storeName: loja?.name || 'Loja Desconhecida',
        updatedAt: new Date().toISOString().split('T')[0]
      };

      // Atualizar ou criar configuração
      setConfiguracoes(prev => {
        const index = prev.findIndex(config => config.storeId === dados.storeId);
        if (index >= 0) {
          const newConfigs = [...prev];
          newConfigs[index] = configAtualizada;
          return newConfigs;
        } else {
          return [...prev, configAtualizada];
        }
      });

      toast.success('Configurações salvas com sucesso!');
      return true;

    } catch (error) {
      toast.error('Erro ao salvar configurações');
      return false;
    } finally {
      setLoading(false);
    }
  }, [validarConfiguracao, setConfiguracoes]);



  // Gerar exemplo de numeração
  const gerarExemploNumeracao = useCallback((prefix: string, format: string, initialNumber: number): string => {
    const ano = new Date().getFullYear().toString();
    const mes = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const numero = initialNumber.toString().padStart(6, '0');

    const exemplo = format
      .replace('YYYY', ano)
      .replace('MM', mes)
      .replace(/N+/g, numero);

    return `${prefix}-${exemplo}`;
  }, []);

  // Obter lojas disponíveis
  const obterLojas = useCallback(() => {
    return mockLojas;
  }, []);

  // Resetar dados para mock inicial
  const resetarDados = useCallback(() => {
    clearConfiguracoes();
    toast.success('Dados resetados para configuração inicial!');
  }, [clearConfiguracoes]);

  // Estatísticas
  const estatisticas = {
    totalLojas: mockLojas.length,
    lojasConfiguradas: configuracoes.length,
    lojasNaoConfiguradas: mockLojas.length - configuracoes.length,
    limiteDescontoMedio: configuracoes.length > 0
      ? configuracoes.reduce((sum, config) => sum + config.discountLimitVendor, 0) / configuracoes.length
      : 0
  };

  return {
    configuracoes,
    loading,
    estatisticas,
    obterConfiguracao,
    salvarConfiguracao,
    gerarExemploNumeracao,
    obterLojas,
    resetarDados,
    validarConfiguracao
  };
}