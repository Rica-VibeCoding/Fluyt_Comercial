/**
 * Hook unificado para gerenciar sessão de ambientes
 * Elimina duplicação entre useSessao e useSessaoSimples
 * Específico para módulo de móveis planejados
 */

import { useMemo } from 'react';
import { useSessao } from '@/store/sessao-store';

// Tipo simplificado para orçamento
interface AmbienteSimples {
  id: string;
  nome: string;
  valor: number;
}

/**
 * Hook que unifica o acesso à sessão de ambientes
 * Fornece interface única para dados completos e simplificados
 */
export function useAmbientesSessao() {
  const {
    cliente,
    ambientes,
    valorTotalAmbientes,
    adicionarAmbiente,
    removerAmbiente,
    definirAmbientes,
    podeGerarOrcamento
  } = useSessao();

  // Converte ambientes completos para formato simplificado quando necessário
  const ambientesSimples = useMemo<AmbienteSimples[]>(() => {
    if (!ambientes || ambientes.length === 0) return [];
    
    return ambientes.map(amb => ({
      id: amb.id,
      nome: amb.nome,
      valor: amb.valor_venda || amb.valor_custo_fabrica || 0
    }));
  }, [ambientes]);

  // Calcula valor total simplificado
  const valorTotalSimples = useMemo(() => {
    return ambientesSimples.reduce((total, amb) => total + amb.valor, 0);
  }, [ambientesSimples]);

  // Interface unificada que expõe ambas as visões
  return {
    // Cliente (sempre o mesmo)
    cliente,
    
    // Ambientes completos (para gestão detalhada)
    ambientes,
    valorTotalAmbientes,
    
    // Ambientes simplificados (para orçamento)
    ambientesSimples,
    valorTotalSimples,
    
    // Ações (sempre do sistema complexo)
    adicionarAmbiente,
    removerAmbiente,
    definirAmbientes,
    
    // Validações de negócio
    podeGerarOrcamento,
    
    // Helper para verificar se tem ambientes
    temAmbientes: ambientes.length > 0
  };
}