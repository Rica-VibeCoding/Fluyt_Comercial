import { useCallback } from 'react';
import { toast } from 'sonner';
import type { RegraComissao } from '@/types/sistema';
import { useLocalStorage } from '@/hooks/globais/use-local-storage';
import { useComissoesCrud } from './use-comissoes-crud';
import { useComissoesUtils } from './use-comissoes-utils';
import { mockRegrasComissao } from './mock-data';

export function useComissoesRefactored() {
  const [regrasComissao, setRegrasComissao, clearRegrasComissao] = useLocalStorage<RegraComissao[]>('fluyt_regras_comissao', mockRegrasComissao);
  
  // Hooks especializados
  const {
    loading,
    criarRegraComissao,
    atualizarRegraComissao,
    alternarStatusRegra,
    excluirRegraComissao
  } = useComissoesCrud(regrasComissao, setRegrasComissao);

  const {
    gerarProximaOrdem,
    obterRegrasPorTipo,
    calcularComissao,
    buscarRegras,
    estatisticas
  } = useComissoesUtils(regrasComissao);

  // Resetar dados para mock inicial
  const resetarDados = useCallback(() => {
    clearRegrasComissao();
    toast.success('Dados resetados para configuração inicial!');
  }, [clearRegrasComissao]);

  return {
    regrasComissao,
    loading,
    estatisticas,
    criarRegraComissao,
    atualizarRegraComissao,
    alternarStatusRegra,
    excluirRegraComissao,
    obterRegrasPorTipo,
    calcularComissao,
    buscarRegras,
    resetarDados
  };
}