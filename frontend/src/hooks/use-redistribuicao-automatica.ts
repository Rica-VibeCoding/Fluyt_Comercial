/**
 * HOOK DE REDISTRIBUIÇÃO AUTOMÁTICA - FASE 1
 * 
 * Orquestra os hooks existentes para implementar redistribuição automática
 * sem modificar código que já funciona.
 * 
 * ESTRATÉGIA SEGURA:
 * - Não modifica useFormasPagamento ou useCalculadoraNegociacao
 * - Adiciona camada de orquestração opcional
 * - Sistema de undo com 3 snapshots máximo
 * - Toggle para ativar/desativar
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { FormaPagamento } from '@/types/orcamento';
import { CalculadoraNegociacao } from '@/lib/calculadora-negociacao';

// Configurações da redistribuição automática
const CONFIG_REDISTRIBUICAO = {
  enabled: false, // Agora manual via botão "Atualizar"
  debounceMs: 300, // Evita cálculos excessivos
  maxHistorico: 3, // Máximo 3 snapshots para undo
  algoritmo: 'proporcional' as const // Usar algoritmo já implementado
};

// Snapshot para sistema de undo
interface SnapshotFormas {
  id: string;
  timestamp: number;
  formas: FormaPagamento[];
  operacao: string;
}

// Interface do hook
interface UseRedistribuicaoAutomaticaProps {
  valorTotal: number;
  descontoPercentual: number;
  formasPagamento: FormaPagamento[];
  onFormasChange: (novasFormas: FormaPagamento[]) => void;
  enabled?: boolean;
}

interface UseRedistribuicaoAutomaticaReturn {
  // Estado
  isCalculating: boolean;
  canUndo: boolean;
  historico: SnapshotFormas[];
  
  // Ações
  redistributeOnFormChange: (formId: string, novoValor: number) => void;
  undo: () => void;
  clearHistory: () => void;
  
  // Configuração
  toggleEnabled: () => void;
  isEnabled: boolean;
}

export const useRedistribuicaoAutomatica = ({
  valorTotal,
  descontoPercentual,
  formasPagamento,
  onFormasChange,
  enabled = CONFIG_REDISTRIBUICAO.enabled
}: UseRedistribuicaoAutomaticaProps): UseRedistribuicaoAutomaticaReturn => {
  
  // Estados
  const [isCalculating, setIsCalculating] = useState(false);
  const [isEnabled, setIsEnabled] = useState(() => {
    // 🆕 FASE 1: Inicializar do localStorage para manter consistência
    try {
      const sessionData = localStorage.getItem('fluyt_sessao_simples');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        return session.redistribuicaoAutomatica !== false; // Default true
      }
    } catch (error) {
      console.warn('⚠️ Erro ao ler estado da redistribuição do localStorage:', error);
    }
    return enabled; // Fallback para prop
  });
  const [historico, setHistorico] = useState<SnapshotFormas[]>([]);
  
  // Refs para controle de debounce e proteção anti-loop
  const debounceRef = useRef<NodeJS.Timeout>();
  const isRedistributingRef = useRef(false); // Proteção anti-loop
  
  // Criar snapshot para undo
  const criarSnapshot = useCallback((operacao: string, formas: FormaPagamento[]) => {
    const snapshot: SnapshotFormas = {
      id: `snapshot_${Date.now()}`,
      timestamp: Date.now(),
      formas: JSON.parse(JSON.stringify(formas)), // Deep copy
      operacao
    };
    
    setHistorico(prev => {
      const novoHistorico = [snapshot, ...prev];
      // Manter apenas os últimos 3 snapshots
      return novoHistorico.slice(0, CONFIG_REDISTRIBUICAO.maxHistorico);
    });
  }, []);
  
  // Função principal de redistribuição
  const redistribuir = useCallback((
    formIdAlterada: string, 
    novoValor: number,
    formasOriginais: FormaPagamento[]
  ) => {
    if (!isEnabled) {
      console.log('🔴 Redistribuição automática desabilitada');
      return;
    }
    
    // 🛡️ PROTEÇÃO ANTI-LOOP: Evita redistribuições recursivas
    if (isRedistributingRef.current) {
      console.log('🛡️ Redistribuição bloqueada - já em andamento');
      return;
    }
    
    isRedistributingRef.current = true;
    setIsCalculating(true);
    
    try {
      // ✅ ALGORITMO CORRETO CONFORME DOCUMENTAÇÃO:
      // Preservar forma editada, redistribuir diferença apenas nas outras
      
      // 1. Calcular valor negociado atual
      const valorNegociadoAtual = valorTotal * (1 - descontoPercentual / 100);
      
      // 2. Preservar a forma que foi editada com o novo valor
      const formaEditada = { 
        ...formasOriginais.find(f => f.id === formIdAlterada)!,
        valor: Math.max(0, novoValor)
      };
      
      // 3. Identificar formas disponíveis para redistribuição (não travadas e não a editada)
      const formasParaRedistribuir = formasOriginais.filter(f => 
        f.id !== formIdAlterada && !f.travada
      );
      
      // 4. Calcular diferença a ser redistribuída
      const valorFormasFixas = formasOriginais
        .filter(f => f.id === formIdAlterada || f.travada)
        .reduce((sum, f) => sum + (f.id === formIdAlterada ? novoValor : f.valor), 0);
      
      const valorRestanteParaRedistribuir = valorNegociadoAtual - valorFormasFixas;
      
      console.log('🔄 Redistribuição automática (algoritmo correto):', {
        formEditada: formIdAlterada,
        valorAnterior: formasOriginais.find(f => f.id === formIdAlterada)?.valor,
        valorNovo: novoValor,
        valorNegociado: valorNegociadoAtual,
        valorRestante: valorRestanteParaRedistribuir,
        formasDisponiveis: formasParaRedistribuir.length
      });
      
      // 5. Redistribuir proporcionalmente nas outras formas
      let formasRedistribuidas = [];
      
      if (formasParaRedistribuir.length === 0) {
        // Não há formas para redistribuir, manter outras como estão
        formasRedistribuidas = formasOriginais.filter(f => f.id !== formIdAlterada);
      } else if (formasParaRedistribuir.length === 1) {
        // Uma única forma recebe toda a diferença
        const formaUnica = formasParaRedistribuir[0];
        formasRedistribuidas = formasOriginais.filter(f => f.id !== formIdAlterada).map(f =>
          f.id === formaUnica.id 
            ? { ...f, valor: Math.max(0, valorRestanteParaRedistribuir) }
            : f
        );
      } else {
        // Múltiplas formas: redistribuir proporcionalmente
        const somaAtual = formasParaRedistribuir.reduce((sum, f) => sum + f.valor, 0);
        
        formasRedistribuidas = formasOriginais.filter(f => f.id !== formIdAlterada).map(forma => {
          if (forma.travada || !formasParaRedistribuir.find(f => f.id === forma.id)) {
            // Forma travada ou não disponível: manter valor atual
            return forma;
          }
          
          // Calcular proporção e redistribuir
          const proporcao = somaAtual > 0 ? forma.valor / somaAtual : 1 / formasParaRedistribuir.length;
          const novoValorForma = valorRestanteParaRedistribuir * proporcao;
          
          return {
            ...forma,
            valor: Math.max(0, novoValorForma)
          };
        });
      }
      
      // 6. Resultado final: forma editada + formas redistribuídas
      const resultadoFinal = [formaEditada, ...formasRedistribuidas]
        .sort((a, b) => {
          // Manter ordem original
          const indexA = formasOriginais.findIndex(f => f.id === a.id);
          const indexB = formasOriginais.findIndex(f => f.id === b.id);
          return indexA - indexB;
        });
      
      // 7. Aplicar resultado final
      onFormasChange(resultadoFinal);
      
    } catch (error) {
      console.error('❌ Erro na redistribuição automática:', error);
      // Em caso de erro, manter estado original
    } finally {
      // 🛡️ IMPORTANTE: Sempre resetar flag de proteção
      isRedistributingRef.current = false;
      setIsCalculating(false);
    }
  }, [valorTotal, descontoPercentual, onFormasChange, isEnabled]);
  
  // Handler principal que será chamado quando forma for editada
  const redistributeOnFormChange = useCallback((formId: string, novoValor: number) => {
    // Criar snapshot ANTES da redistribuição
    criarSnapshot(
      `Editou ${formasPagamento.find(f => f.id === formId)?.tipo || 'forma'}: R$ ${novoValor.toLocaleString('pt-BR')}`,
      formasPagamento
    );
    
    // Limpar debounce anterior
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Aplicar redistribuição com debounce
    debounceRef.current = setTimeout(() => {
      redistribuir(formId, novoValor, formasPagamento);
    }, CONFIG_REDISTRIBUICAO.debounceMs);
    
  }, [formasPagamento, redistribuir, criarSnapshot]);
  
  // Sistema de undo
  const undo = useCallback(() => {
    if (historico.length === 0) {
      console.log('📝 Nenhuma operação para desfazer');
      return;
    }
    
    const ultimoSnapshot = historico[0];
    console.log('↩️ Desfazendo operação:', ultimoSnapshot.operacao);
    
    // Restaurar estado anterior
    onFormasChange(ultimoSnapshot.formas);
    
    // Remover snapshot do histórico
    setHistorico(prev => prev.slice(1));
    
  }, [historico, onFormasChange]);
  
  // Limpar histórico
  const clearHistory = useCallback(() => {
    setHistorico([]);
    console.log('🗑️ Histórico de redistribuição limpo');
  }, []);
  
  // Toggle de ativação
  const toggleEnabled = useCallback(() => {
    setIsEnabled(prev => {
      const novoEstado = !prev;
      console.log(`🔄 Redistribuição automática ${novoEstado ? 'ATIVADA' : 'DESATIVADA'}`);
      
      // 🆕 FASE 1: Salvar estado no localStorage para validações dos modais
      try {
        const sessionData = localStorage.getItem('fluyt_sessao_simples');
        if (sessionData) {
          const session = JSON.parse(sessionData);
          session.redistribuicaoAutomatica = novoEstado;
          localStorage.setItem('fluyt_sessao_simples', JSON.stringify(session));
        }
      } catch (error) {
        console.warn('⚠️ Erro ao salvar estado da redistribuição no localStorage:', error);
      }
      
      return novoEstado;
    });
  }, []);
  
  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);
  
  return {
    // Estado
    isCalculating,
    canUndo: historico.length > 0,
    historico,
    
    // Ações
    redistributeOnFormChange,
    undo,
    clearHistory,
    
    // Configuração
    toggleEnabled,
    isEnabled
  };
};