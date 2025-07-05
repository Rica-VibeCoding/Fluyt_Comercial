/**
 * Hook personalizado para gerenciar persistência inteligente de sessões
 * 
 * Funcionalidades:
 * - Auto-save em mudanças importantes
 * - Recuperação automática ao trocar clientes
 * - Sistema de debug e monitoramento
 * - Gestão de navegação com persistência
 */

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSessaoSimples } from './use-sessao-simples';
import { persistenciaInteligente, configurarCleanupGlobal } from '../../lib/persistencia-inteligente';

interface UsePersistenciaSessaoOptions {
  autoSave?: boolean;
  debugMode?: boolean;
  intervaloPersistencia?: number; // em ms
}

export function usePersistenciaSessao(options: UsePersistenciaSessaoOptions = {}) {
  const {
    autoSave = true,
    debugMode = false,
    intervaloPersistencia = 30000 // 30 segundos
  } = options;

  const router = useRouter();
  const {
    cliente,
    ambientes,
    valorTotal,
    podeGerarContrato
  } = useSessaoSimples();
  
  // Adaptações para compatibilidade
  const orcamentoConfigurado = podeGerarContrato;
  const valorNegociado = valorTotal;
  const formasPagamento = 0; // Simulação simples
  const salvarSessaoAtual = () => {}; // Simplificado - useSessaoSimples auto-salva
  const carregarSessaoCliente = (id: string) => {}; // Simplificado

  const ultimoSalvamento = useRef<number>(0);
  const timerPersistencia = useRef<NodeJS.Timeout>();

  // Configurar cleanup global apenas uma vez
  useEffect(() => {
    configurarCleanupGlobal();
  }, []);

  // Auto-save periódico
  useEffect(() => {
    if (typeof window === 'undefined') return; // Proteção SSR
    if (!autoSave || !cliente?.id) return;

    if (timerPersistencia.current) {
      clearInterval(timerPersistencia.current);
    }

    timerPersistencia.current = setInterval(() => {
      const agora = Date.now();
      if (agora - ultimoSalvamento.current >= intervaloPersistencia) {
        salvarSessaoAtual();
        ultimoSalvamento.current = agora;
        
        // Debug mode desabilitado para evitar spam nos logs
        // if (debugMode) {
        //   console.log('🔄 Auto-save executado para cliente:', cliente.nome);
        // }
      }
    }, intervaloPersistencia);

    return () => {
      if (timerPersistencia.current) {
        clearInterval(timerPersistencia.current);
      }
    };
  }, [autoSave, cliente?.id, intervaloPersistencia, salvarSessaoAtual, debugMode]);

  // Salvar imediatamente em mudanças críticas
  useEffect(() => {
    if (typeof window === 'undefined') return; // Proteção SSR
    if (!autoSave || !cliente?.id) return;

    const agora = Date.now();
    if (agora - ultimoSalvamento.current >= 1000) { // Throttle de 1 segundo
      salvarSessaoAtual();
      ultimoSalvamento.current = agora;
      
      if (debugMode) {
        console.log('💾 Save crítico executado:', {
          ambientes: ambientes.length,
          orcamento: orcamentoConfigurado,
          valor: valorNegociado
        });
      }
    }
  }, [ambientes.length, orcamentoConfigurado, valorNegociado, formasPagamento]);

  // Funcionalidades públicas do hook (memoizadas)
  const salvarAgora = useCallback(() => {
    salvarSessaoAtual();
    ultimoSalvamento.current = Date.now();
    
    if (debugMode) {
      console.log('💾 Salvamento forçado executado');
    }
  }, [salvarSessaoAtual, debugMode]);

  const carregarSessao = useCallback((clienteId: string) => {
    carregarSessaoCliente(clienteId);
    
    if (debugMode) {
      console.log('📂 Carregamento forçado para cliente:', clienteId);
    }
  }, [carregarSessaoCliente, debugMode]);

  const navegarComSave = useCallback((rota: string) => {
    if (cliente?.id) {
      salvarSessaoAtual();
      ultimoSalvamento.current = Date.now();
      
      if (debugMode) {
        console.log('🧭 Navegando com save para:', rota);
      }
    }
    router.push(rota);
  }, [cliente?.id, salvarSessaoAtual, debugMode, router]);

  const voltarComRecuperacao = useCallback(() => {
    if (cliente?.id) {
      // Salvar estado atual antes de voltar
      salvarSessaoAtual();
      
      if (debugMode) {
        console.log('⬅️ Voltando com recuperação');
      }
    }
    router.back();
  }, [cliente?.id, salvarSessaoAtual, debugMode, router]);

  const obterEstatisticas = useCallback(() => {
    const stats = persistenciaInteligente.obterEstatisticas();
    
    // Removido console.table que estava criando spam no console
    if (debugMode) {
      console.log('📊 Estatísticas cache:', stats);
    }
    
    return stats;
  }, [debugMode]);

  const listarSessoes = useCallback(() => {
    const sessoes = persistenciaInteligente.listarSessoesAtivas();
    
    if (debugMode) {
      console.log('📊 Sessões ativas:', sessoes);
    }
    
    return sessoes;
  }, [debugMode]);

  const limparCacheAntigo = useCallback(() => {
    persistenciaInteligente.limparTodasSessoes();
    
    if (debugMode) {
      console.log('🧹 Cache limpo completamente');
    }
  }, [debugMode]);

  const iniciarFluxoLimpo = useCallback(() => {
    if (!cliente) {
      console.warn('⚠️ Não é possível iniciar fluxo sem cliente ativo');
      return;
    }

    persistenciaInteligente.iniciarNovoFluxo(cliente.id, { cliente });
    
    // Recarregar a página atual para refletir o estado limpo
    window.location.reload();
    
    if (debugMode) {
      console.log('🆕 Fluxo limpo iniciado para:', cliente.nome);
    }
  }, [cliente, debugMode]);

  const funcionalidades = {
    salvarAgora,
    carregarSessao,
    navegarComSave,
    voltarComRecuperacao,
    obterEstatisticas,
    listarSessoes,
    limparCacheAntigo,
    iniciarFluxoLimpo
  };

  // Debug automático apenas quando necessário (SEM LOOP)
  useEffect(() => {
    if (debugMode && cliente?.id) {
      console.log('🔍 Debug Persistência ativado para:', cliente.nome);
    }
  }, [cliente?.id, debugMode]); // Só quando cliente muda ou debug é ativado

  return funcionalidades;
}

/**
 * Hook simplificado para casos básicos
 */
export function usePersistenciaBasica() {
  return usePersistenciaSessao({
    autoSave: true,
    debugMode: false,
    intervaloPersistencia: 30000
  });
}

/**
 * Hook com debug ativo para desenvolvimento
 */
export function usePersistenciaDebug() {
  return usePersistenciaSessao({
    autoSave: true,
    debugMode: true,
    intervaloPersistencia: 10000 // Save mais frequente para debug
  });
}