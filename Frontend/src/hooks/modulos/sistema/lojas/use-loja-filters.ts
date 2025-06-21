import { useState, useMemo, useCallback } from 'react';
import type { Loja } from '@/types/sistema';

// Tipos para filtros
export interface LojaFilters {
  busca: string;
  empresa: string;
  status: 'todos' | 'ativas' | 'inativas';
  performance: 'todos' | 'acima' | 'abaixo';
}

// Hook especializado para filtros e busca de lojas
export function useLojaFilters(lojas: Loja[]) {
  const [filtros, setFiltros] = useState<LojaFilters>({
    busca: '',
    empresa: '',
    status: 'todos',
    performance: 'todos'
  });

  // Lojas filtradas
  const lojasFiltradas = useMemo(() => {
    return lojas.filter(loja => {
      // Filtro de busca
      if (filtros.busca) {
        const busca = filtros.busca.toLowerCase();
        const matches = 
          loja.nome.toLowerCase().includes(busca) ||
          loja.codigo.toLowerCase().includes(busca) ||
          loja.endereco.toLowerCase().includes(busca) ||
          loja.gerente.toLowerCase().includes(busca) ||
          loja.empresa.toLowerCase().includes(busca);
        
        if (!matches) return false;
      }

      // Filtro de empresa
      if (filtros.empresa && loja.empresaId !== filtros.empresa) {
        return false;
      }

      // Filtro de status
      if (filtros.status !== 'todos') {
        if (filtros.status === 'ativas' && !loja.ativa) return false;
        if (filtros.status === 'inativas' && loja.ativa) return false;
      }

      // Filtro de performance
      if (filtros.performance !== 'todos') {
        const performance = loja.metaMes > 0 ? (loja.vendasMes / loja.metaMes) * 100 : 0;
        if (filtros.performance === 'acima' && performance < 100) return false;
        if (filtros.performance === 'abaixo' && performance >= 100) return false;
      }

      return true;
    });
  }, [lojas, filtros]);

  // Atualizar filtro específico
  const atualizarFiltro = useCallback(<K extends keyof LojaFilters>(
    campo: K, 
    valor: LojaFilters[K]
  ) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  }, []);

  // Limpar filtros
  const limparFiltros = useCallback(() => {
    setFiltros({
      busca: '',
      empresa: '',
      status: 'todos',
      performance: 'todos'
    });
  }, []);

  // Verificar se há filtros ativos
  const temFiltrosAtivos = useMemo(() => {
    return filtros.busca !== '' || 
           filtros.empresa !== '' || 
           filtros.status !== 'todos' || 
           filtros.performance !== 'todos';
  }, [filtros]);

  // Contar resultados
  const contadores = useMemo(() => {
    const total = lojas.length;
    const filtradas = lojasFiltradas.length;
    const ativas = lojasFiltradas.filter(l => l.ativa).length;
    const inativas = filtradas - ativas;
    
    return {
      total,
      filtradas,
      ativas,
      inativas
    };
  }, [lojas.length, lojasFiltradas]);

  return {
    filtros,
    lojasFiltradas,
    atualizarFiltro,
    limparFiltros,
    temFiltrosAtivos,
    contadores
  };
}