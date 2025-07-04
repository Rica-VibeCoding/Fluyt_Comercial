/**
 * Hook unificado para gerenciar sessão de ambientes
 * MIGRADO PARA useSessaoSimples - ETAPA 5 
 * Específico para módulo de móveis planejados
 */

import { useSessaoSimples } from '@/hooks/globais/use-sessao-simples';
import type { AmbienteSimples } from '@/lib/sessao-simples';

/**
 * Hook que unifica o acesso à sessão de ambientes
 * Interface compatível com versão Zustand anterior
 */
export function useAmbientesSessao() {
  const {
    cliente,
    ambientes,
    valorTotal,
    valorTotalAmbientes, // Alias de compatibilidade
    adicionarAmbiente,
    removerAmbiente,
    definirAmbientes,
    podeGerarOrcamento
  } = useSessaoSimples();

  // Interface unificada mantendo compatibilidade 100%
  return {
    // Cliente (idêntico)
    cliente,
    
    // Ambientes (agora nativamente AmbienteSimples)
    ambientes,
    valorTotalAmbientes: valorTotal, // Compatibilidade com nome anterior
    
    // Ambientes simplificados (já são nativamente simples)
    ambientesSimples: ambientes,
    valorTotalSimples: valorTotal,
    
    // Ações (interface idêntica)
    adicionarAmbiente,
    removerAmbiente,
    definirAmbientes,
    
    // Validações de negócio
    podeGerarOrcamento,
    
    // Helper para verificar se tem ambientes
    temAmbientes: ambientes.length > 0
  };
}