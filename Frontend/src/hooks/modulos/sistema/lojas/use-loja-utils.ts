import { useCallback } from 'react';
import type { Loja } from '@/types/sistema';

// Hook para utilitários e helpers de loja
export function useLojaUtils(lojas: Loja[]) {
  // Verificar duplicidade de código
  const verificarCodigoDuplicado = useCallback((codigo: string, lojaId?: string): boolean => {
    const codigoLimpo = codigo.trim().toUpperCase();
    return lojas.some(loja => 
      loja.codigo.toUpperCase() === codigoLimpo && 
      loja.id !== lojaId
    );
  }, [lojas]);

  // Gerar próximo código
  const gerarProximoCodigo = useCallback((empresaId: string): string => {
    const lojasEmpresa = lojas.filter(loja => loja.empresaId === empresaId);
    const numero = (lojasEmpresa.length + 1).toString().padStart(3, '0');
    
    // Usar as primeiras 2 letras da empresa como prefixo
    const prefixos: Record<string, string> = {
      '1': 'SP', // Fluyt São Paulo
      '2': 'ST', // Fluyt Santos
      '3': 'NR'  // Fluyt Norte
    };
    
    const prefixo = prefixos[empresaId] || 'FL';
    return `${prefixo}${numero}`;
  }, [lojas]);

  // Calcular estatísticas
  const calcularEstatisticas = useCallback(() => {
    const total = lojas.length;
    const ativas = lojas.filter(loja => loja.ativa).length;
    const inativas = total - ativas;
    
    const vendasTotal = lojas.reduce((acc, loja) => acc + (loja.vendasMes || 0), 0);
    const metaTotal = lojas.reduce((acc, loja) => acc + (loja.metaMes || 0), 0);
    const funcionariosTotal = lojas.reduce((acc, loja) => acc + (loja.funcionarios || 0), 0);
    
    const performanceMedia = metaTotal > 0 ? (vendasTotal / metaTotal) * 100 : 0;
    
    return {
      total,
      ativas,
      inativas,
      vendasTotal,
      metaTotal,
      funcionariosTotal,
      performanceMedia
    };
  }, [lojas]);

  // Formatar valores
  const formatarMoeda = useCallback((valor: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }, []);

  // Calcular performance de uma loja
  const calcularPerformance = useCallback((loja: Loja): number => {
    if (!loja.metaMes || loja.metaMes === 0) return 0;
    return (loja.vendasMes / loja.metaMes) * 100;
  }, []);

  // Obter lojas ativas para relacionamentos
  const obterLojasAtivas = useCallback(() => {
    return lojas.filter(loja => loja.ativa);
  }, [lojas]);

  return {
    verificarCodigoDuplicado,
    gerarProximoCodigo,
    calcularEstatisticas,
    formatarMoeda,
    calcularPerformance,
    obterLojasAtivas
  };
}