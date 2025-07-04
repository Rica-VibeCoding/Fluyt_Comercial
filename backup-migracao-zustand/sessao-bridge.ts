/**
 * Bridge para sincronização entre sistemas de sessão
 * 
 * Facilita migração gradual de sessaoSimples → sessaoStore (Zustand)
 * Preparado para integração futura com Supabase
 */

import { sessaoSimples, type SessaoSimples, type ClienteSimples, type AmbienteSimples } from './sessao-simples';
import { useSessaoStore } from '@/store/sessao-store';
import type { Cliente } from '@/types/cliente';
import type { Ambiente } from '@/types/ambiente';

interface BridgeOptions {
  preservarSessaoSimples?: boolean;
  debugMode?: boolean;
}

export class SessaoBridge {
  private static instance: SessaoBridge;
  private debugMode: boolean = false;

  private constructor() {}

  public static getInstance(): SessaoBridge {
    if (!SessaoBridge.instance) {
      SessaoBridge.instance = new SessaoBridge();
    }
    return SessaoBridge.instance;
  }

  /**
   * Sincroniza dados do sistema simples para o Zustand store
   */
  public sincronizarSimples_ParaZustand(options: BridgeOptions = {}): boolean {
    try {
      const sessaoAtual = sessaoSimples.carregar();
      const zustandStore = useSessaoStore.getState();

      if (options.debugMode) {
        console.log('🔄 Bridge: Sincronizando sessaoSimples → Zustand', {
          cliente: sessaoAtual.cliente?.nome || 'null',
          ambientes: sessaoAtual.ambientes.length,
          valorTotal: sessaoAtual.valorTotal
        });
      }

      // 1. Sincronizar cliente se existir
      if (sessaoAtual.cliente) {
        const clienteZustand: Cliente = {
          id: sessaoAtual.cliente.id,
          nome: sessaoAtual.cliente.nome,
          cpf_cnpj: '',
          telefone: '',
          tipo_venda: 'NORMAL' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        zustandStore.definirCliente(clienteZustand);
      }

      // 2. Sincronizar ambientes se existirem
      if (sessaoAtual.ambientes.length > 0) {
        const ambientesZustand: Ambiente[] = sessaoAtual.ambientes.map(amb => ({
          id: amb.id,
          nome: amb.nome,
          cliente_id: sessaoAtual.cliente?.id || '',
          valor_venda: amb.valor,
          origem: 'manual' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        zustandStore.definirAmbientes(ambientesZustand);
      }

      return true;
    } catch (error) {
      console.error('❌ Erro na sincronização sessaoSimples → Zustand:', error);
      return false;
    }
  }

  /**
   * Sincroniza dados do Zustand store para o sistema simples
   */
  public sincronizarZustand_ParaSimples(options: BridgeOptions = {}): boolean {
    try {
      const zustandState = useSessaoStore.getState();

      if (options.debugMode) {
        console.log('🔄 Bridge: Sincronizando Zustand → sessaoSimples', {
          cliente: zustandState.cliente?.nome || 'null',
          ambientes: zustandState.ambientes.length,
          valorTotal: zustandState.valorTotalAmbientes
        });
      }

      // 1. Sincronizar cliente se existir
      if (zustandState.cliente) {
        const clienteSimples: ClienteSimples = {
          id: zustandState.cliente.id,
          nome: zustandState.cliente.nome
        };

        // 2. Sincronizar ambientes se existirem
        const ambientesSimples: AmbienteSimples[] = zustandState.ambientes.map(amb => ({
          id: amb.id,
          nome: amb.nome,
          valor: amb.valor_venda || 0
        }));

        // Usar o método com contexto para preservar dados
        sessaoSimples.definirClienteComContexto(clienteSimples, true);
        sessaoSimples.definirAmbientes(ambientesSimples);
      }

      return true;
    } catch (error) {
      console.error('❌ Erro na sincronização Zustand → sessaoSimples:', error);
      return false;
    }
  }

  /**
   * Sincronização bidirecional inteligente
   * Detecta qual sistema tem dados mais recentes e sincroniza
   */
  public sincronizarBidirecional(options: BridgeOptions = {}): boolean {
    try {
      const sessaoAtual = sessaoSimples.carregar();
      const zustandState = useSessaoStore.getState();

      // Detectar qual sistema tem dados
      const temDadosSimples = !!(sessaoAtual.cliente && sessaoAtual.ambientes.length > 0);
      const temDadosZustand = !!(zustandState.cliente && zustandState.ambientes.length > 0);

      if (options.debugMode) {
        console.log('🔄 Bridge: Sincronização bidirecional', {
          temDadosSimples,
          temDadosZustand,
          estrategia: temDadosSimples && !temDadosZustand ? 'simples → zustand' :
                     !temDadosSimples && temDadosZustand ? 'zustand → simples' :
                     'manter ambos'
        });
      }

      // Estratégia de sincronização
      if (temDadosSimples && !temDadosZustand) {
        return this.sincronizarSimples_ParaZustand(options);
      } else if (!temDadosSimples && temDadosZustand) {
        return this.sincronizarZustand_ParaSimples(options);
      } else if (temDadosSimples && temDadosZustand) {
        // Ambos têm dados - priorizar Zustand por ser mais recente
        if (options.debugMode) {
          console.log('ℹ️ Ambos sistemas têm dados - priorizando Zustand');
        }
        return this.sincronizarZustand_ParaSimples(options);
      }

      return true;
    } catch (error) {
      console.error('❌ Erro na sincronização bidirecional:', error);
      return false;
    }
  }

  /**
   * Utilitário para debug
   */
  public debug(): void {
    const sessaoAtual = sessaoSimples.carregar();
    const zustandState = useSessaoStore.getState();

    console.log('🔍 Bridge Debug:', {
      sessaoSimples: {
        cliente: sessaoAtual.cliente?.nome || 'null',
        ambientes: sessaoAtual.ambientes.length,
        valorTotal: sessaoAtual.valorTotal
      },
      zustandStore: {
        cliente: zustandState.cliente?.nome || 'null',
        ambientes: zustandState.ambientes.length,
        valorTotal: zustandState.valorTotalAmbientes,
        orcamentoConfigurado: zustandState.orcamentoConfigurado
      }
    });
  }

  /**
   * Configurar modo debug
   */
  public setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }
}

// Instância singleton para uso global
export const sessaoBridge = SessaoBridge.getInstance();

// Hook React para uso em componentes
export function useSessaoBridge() {
  return {
    sincronizarParaZustand: (options?: BridgeOptions) => 
      sessaoBridge.sincronizarSimples_ParaZustand(options),
    
    sincronizarParaSimples: (options?: BridgeOptions) => 
      sessaoBridge.sincronizarZustand_ParaSimples(options),
    
    sincronizarBidirecional: (options?: BridgeOptions) => 
      sessaoBridge.sincronizarBidirecional(options),
    
    debug: () => sessaoBridge.debug()
  };
} 