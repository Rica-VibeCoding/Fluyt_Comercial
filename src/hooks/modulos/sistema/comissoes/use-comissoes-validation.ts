import { useCallback } from 'react';
import type { RegraComissao, RegraComissaoFormData } from '@/types/sistema';

export function useComissoesValidation(regrasComissao: RegraComissao[]) {
  // Validar dados da regra de comissão
  const validarRegraComissao = useCallback((dados: RegraComissaoFormData): string[] => {
    const erros: string[] = [];

    if (!dados.tipo) {
      erros.push('Tipo de comissão é obrigatório');
    }

    if (dados.valorMinimo < 0) {
      erros.push('Valor mínimo deve ser maior ou igual a zero');
    }

    if (dados.valorMaximo !== null && dados.valorMaximo <= dados.valorMinimo) {
      erros.push('Valor máximo deve ser maior que o valor mínimo');
    }

    if (dados.percentual <= 0 || dados.percentual > 100) {
      erros.push('Percentual deve estar entre 0.01% e 100%');
    }

    return erros;
  }, []);

  // Verificar sobreposição de faixas
  const verificarSobreposicaoFaixas = useCallback((dados: RegraComissaoFormData, regraId?: string): boolean => {
    const regrasDoTipo = regrasComissao.filter(regra => 
      regra.tipo === dados.tipo && 
      regra.id !== regraId &&
      regra.ativo
    );

    return regrasDoTipo.some(regra => {
      const novoMin = dados.valorMinimo;
      const novoMax = dados.valorMaximo || Infinity;
      const existenteMin = regra.valorMinimo;
      const existenteMax = regra.valorMaximo || Infinity;

      // Verificar se há sobreposição
      return !(novoMax < existenteMin || novoMin > existenteMax);
    });
  }, [regrasComissao]);

  return {
    validarRegraComissao,
    verificarSobreposicaoFaixas
  };
}