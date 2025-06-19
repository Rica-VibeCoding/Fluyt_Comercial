import { useCallback } from 'react';
import type { RegraComissao } from '@/types/sistema';

export function useComissoesUtils(regrasComissao: RegraComissao[]) {
  // Gerar próxima ordem
  const gerarProximaOrdem = useCallback((tipo: string): number => {
    const regrasDoTipo = regrasComissao.filter(regra => regra.tipo === tipo);
    return regrasDoTipo.length > 0 ? Math.max(...regrasDoTipo.map(r => r.ordem)) + 1 : 1;
  }, [regrasComissao]);

  // Obter regras por tipo
  const obterRegrasPorTipo = useCallback((tipo: string): RegraComissao[] => {
    return regrasComissao
      .filter(regra => regra.tipo === tipo && regra.ativo)
      .sort((a, b) => a.ordem - b.ordem);
  }, [regrasComissao]);

  // Calcular comissão
  const calcularComissao = useCallback((valor: number, tipo: string): { percentual: number; valor: number; regraId: string } | null => {
    const regrasAplicaveis = obterRegrasPorTipo(tipo);
    
    for (const regra of regrasAplicaveis) {
      const valorMax = regra.valorMaximo || Infinity;
      if (valor >= regra.valorMinimo && valor <= valorMax) {
        return {
          percentual: regra.percentual,
          valor: (valor * regra.percentual) / 100,
          regraId: regra.id
        };
      }
    }
    
    return null;
  }, [obterRegrasPorTipo]);

  // Buscar regras
  const buscarRegras = useCallback((termo: string): RegraComissao[] => {
    if (!termo.trim()) return regrasComissao;
    
    const termoBusca = termo.toLowerCase().trim();
    return regrasComissao.filter(regra =>
      regra.tipo.toLowerCase().includes(termoBusca) ||
      (regra.descricao && regra.descricao.toLowerCase().includes(termoBusca)) ||
      regra.percentual.toString().includes(termoBusca)
    );
  }, [regrasComissao]);

  // Estadísticas
  const estatisticas = {
    total: regrasComissao.length,
    ativas: regrasComissao.filter(r => r.ativo).length,
    inativas: regrasComissao.filter(r => !r.ativo).length,
    vendedores: regrasComissao.filter(r => r.tipo === 'VENDEDOR').length,
    gerentes: regrasComissao.filter(r => r.tipo === 'GERENTE').length,
    percentualMedio: regrasComissao.length > 0 
      ? regrasComissao.reduce((acc, regra) => acc + regra.percentual, 0) / regrasComissao.length 
      : 0
  };

  return {
    gerarProximaOrdem,
    obterRegrasPorTipo,
    calcularComissao,
    buscarRegras,
    estatisticas
  };
}