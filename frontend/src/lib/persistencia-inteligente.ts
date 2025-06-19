/**
 * Sistema de Persistência Inteligente para Fluyt
 * 
 * Inspirado nas melhores práticas do GitHub, Linear e Notion:
 * - Persistência por contexto (cliente)
 * - Expiração automática de dados
 * - Cleanup inteligente de dados antigos
 * - Sistema de versioning para invalidação
 */

export interface DadosPersistidos<T = any> {
  data: T;
  clienteId: string;
  timestamp: number;
  expiresAt: number;
  version: string;
  lastActivity: number;
}

export interface SessaoCliente {
  cliente: any;
  ambientes: any[];
  orcamento: {
    valorNegociado: number;
    formasPagamento: number;
    configurado: boolean;
    descontoReal?: number;
  };
  metadata: {
    iniciadoEm: number;
    ultimaAtividade: number;
    versaoApp: string;
  };
}

class PersistenciaInteligente {
  private readonly TTL_SESSAO = 2 * 60 * 60 * 1000; // 2 horas para sessão ativa
  private readonly TTL_CLIENTE = 24 * 60 * 60 * 1000; // 24 horas para dados do cliente
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // Cleanup a cada 5 minutos
  private readonly MAX_SESSOES = 10; // Máximo de 10 clientes em cache
  private readonly APP_VERSION = '1.0.0';
  
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor() {
    // Só inicializar se estiver no cliente (browser)
    if (typeof window !== 'undefined') {
      this.iniciarCleanupAutomatico();
      this.limparSessoesExpiradas();
    }
  }

  /**
   * Salva dados de sessão por cliente com expiração inteligente
   */
  salvarSessaoCliente(clienteId: string, dados: SessaoCliente): void {
    if (typeof window === 'undefined') return; // SSR protection
    
    const chave = this.gerarChaveCliente(clienteId);
    const agora = Date.now();
    
    const dadosComWrapper: DadosPersistidos<SessaoCliente> = {
      data: {
        ...dados,
        metadata: {
          ...dados.metadata,
          ultimaAtividade: agora,
          versaoApp: this.APP_VERSION
        }
      },
      clienteId,
      timestamp: agora,
      expiresAt: agora + this.TTL_SESSAO,
      version: this.APP_VERSION,
      lastActivity: agora
    };

    try {
      localStorage.setItem(chave, JSON.stringify(dadosComWrapper));
      this.gerenciarLimiteCache();
      console.log('📦 Sessão salva para cliente:', clienteId);
    } catch (error) {
      console.warn('⚠️ Erro ao salvar sessão, liberando espaço...', error);
      this.liberarEspaco();
      try {
        localStorage.setItem(chave, JSON.stringify(dadosComWrapper));
      } catch (secondError) {
        console.error('❌ Falha crítica ao salvar após cleanup:', secondError);
      }
    }
  }

  /**
   * Recupera dados de sessão por cliente com validação de expiração
   */
  recuperarSessaoCliente(clienteId: string): SessaoCliente | null {
    const chave = this.gerarChaveCliente(clienteId);
    const dadosRaw = localStorage.getItem(chave);
    
    if (!dadosRaw) {
      console.log('📭 Nenhuma sessão encontrada para cliente:', clienteId);
      return null;
    }

    try {
      const dados: DadosPersistidos<SessaoCliente> = JSON.parse(dadosRaw);
      const agora = Date.now();

      // Verificar expiração
      if (agora > dados.expiresAt) {
        console.log('⏰ Sessão expirada para cliente:', clienteId);
        localStorage.removeItem(chave);
        return null;
      }

      // Verificar versão da aplicação
      if (dados.version !== this.APP_VERSION) {
        console.log('🔄 Versão incompatível, limpando sessão:', clienteId);
        localStorage.removeItem(chave);
        return null;
      }

      // Atualizar última atividade
      dados.lastActivity = agora;
      dados.data.metadata.ultimaAtividade = agora;
      localStorage.setItem(chave, JSON.stringify(dados));

      console.log('✅ Sessão recuperada para cliente:', clienteId);
      return dados.data;

    } catch (error) {
      console.error('❌ Erro ao recuperar sessão:', error);
      localStorage.removeItem(chave);
      return null;
    }
  }

  /**
   * Remove sessão específica de um cliente
   */
  limparSessaoCliente(clienteId: string): void {
    const chave = this.gerarChaveCliente(clienteId);
    localStorage.removeItem(chave);
    console.log('🧹 Sessão removida para cliente:', clienteId);
  }

  /**
   * Inicia novo fluxo para cliente (mantém configurações básicas)
   */
  iniciarNovoFluxo(clienteId: string, dadosBasicos: { cliente: any }): void {
    const sessaoLimpa: SessaoCliente = {
      cliente: dadosBasicos.cliente,
      ambientes: [],
      orcamento: {
        valorNegociado: 0,
        formasPagamento: 0,
        configurado: false
      },
      metadata: {
        iniciadoEm: Date.now(),
        ultimaAtividade: Date.now(),
        versaoApp: this.APP_VERSION
      }
    };

    this.salvarSessaoCliente(clienteId, sessaoLimpa);
    console.log('🆕 Novo fluxo iniciado para cliente:', clienteId);
  }

  /**
   * Lista todas as sessões ativas (para debug)
   */
  listarSessoesAtivas(): Array<{ clienteId: string; ultimaAtividade: number; tempoRestante: number }> {
    const sessoes: Array<{ clienteId: string; ultimaAtividade: number; tempoRestante: number }> = [];
    const agora = Date.now();

    Object.keys(localStorage).forEach(chave => {
      if (chave.startsWith('fluyt-sessao-')) {
        try {
          const dados: DadosPersistidos = JSON.parse(localStorage.getItem(chave) || '{}');
          if (dados.expiresAt > agora) {
            sessoes.push({
              clienteId: dados.clienteId,
              ultimaAtividade: dados.lastActivity,
              tempoRestante: dados.expiresAt - agora
            });
          }
        } catch (error) {
          // Sessão corrompida, remover
          localStorage.removeItem(chave);
        }
      }
    });

    return sessoes.sort((a, b) => b.ultimaAtividade - a.ultimaAtividade);
  }

  /**
   * Força limpeza de todas as sessões
   */
  limparTodasSessoes(): void {
    Object.keys(localStorage).forEach(chave => {
      if (chave.startsWith('fluyt-sessao-')) {
        localStorage.removeItem(chave);
      }
    });
    console.log('🧹 Todas as sessões foram removidas');
  }

  /**
   * Obtém estatísticas de uso do cache
   */
  obterEstatisticas() {
    const sessoes = this.listarSessoesAtivas();
    const tamanhoTotal = this.calcularTamanhoCache();
    
    return {
      sessoesAtivas: sessoes.length,
      tamanhoCache: tamanhoTotal,
      sessoes: sessoes,
      limiteCache: this.MAX_SESSOES,
      versaoApp: this.APP_VERSION
    };
  }

  // === MÉTODOS PRIVADOS ===

  private gerarChaveCliente(clienteId: string): string {
    return `fluyt-sessao-${clienteId}`;
  }

  private iniciarCleanupAutomatico(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    this.cleanupTimer = setInterval(() => {
      this.limparSessoesExpiradas();
    }, this.CLEANUP_INTERVAL);
  }

  limparSessoesExpiradas(): void {
    if (typeof window === 'undefined') return; // SSR protection
    
    const agora = Date.now();
    let removidas = 0;

    Object.keys(localStorage).forEach(chave => {
      if (chave.startsWith('fluyt-sessao-')) {
        try {
          const dados: DadosPersistidos = JSON.parse(localStorage.getItem(chave) || '{}');
          if (agora > dados.expiresAt) {
            localStorage.removeItem(chave);
            removidas++;
          }
        } catch (error) {
          // Dados corrompidos, remover
          localStorage.removeItem(chave);
          removidas++;
        }
      }
    });

    if (removidas > 0) {
      console.log(`🧹 ${removidas} sessões expiradas removidas automaticamente`);
    }
  }

  private gerenciarLimiteCache(): void {
    const sessoes = this.listarSessoesAtivas();
    
    if (sessoes.length > this.MAX_SESSOES) {
      // Remover as sessões mais antigas
      const paraRemover = sessoes
        .sort((a, b) => a.ultimaAtividade - b.ultimaAtividade)
        .slice(0, sessoes.length - this.MAX_SESSOES);

      paraRemover.forEach(sessao => {
        this.limparSessaoCliente(sessao.clienteId);
      });

      console.log(`🧹 ${paraRemover.length} sessões antigas removidas (limite: ${this.MAX_SESSOES})`);
    }
  }

  private liberarEspaco(): void {
    // Remover primeiro as sessões expiradas
    this.limparSessoesExpiradas();
    
    // Se ainda não há espaço, remover as mais antigas
    const sessoes = this.listarSessoesAtivas();
    if (sessoes.length > 0) {
      const maisAntiga = sessoes.sort((a, b) => a.ultimaAtividade - b.ultimaAtividade)[0];
      this.limparSessaoCliente(maisAntiga.clienteId);
      console.log('🧹 Sessão mais antiga removida para liberar espaço');
    }
  }

  private calcularTamanhoCache(): number {
    let tamanho = 0;
    Object.keys(localStorage).forEach(chave => {
      if (chave.startsWith('fluyt-sessao-')) {
        tamanho += (localStorage.getItem(chave) || '').length;
      }
    });
    return tamanho;
  }

  /**
   * Cleanup ao destruir a instância
   */
  destruir(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
}

// Instância singleton
export const persistenciaInteligente = new PersistenciaInteligente();

// Hook personalizado para React
export function usePersistenciaCliente(clienteId: string | undefined) {
  if (!clienteId) {
    return {
      salvar: () => {},
      recuperar: () => null,
      limpar: () => {},
      iniciarNovoFluxo: () => {}
    };
  }

  return {
    salvar: (dados: SessaoCliente) => persistenciaInteligente.salvarSessaoCliente(clienteId, dados),
    recuperar: () => persistenciaInteligente.recuperarSessaoCliente(clienteId),
    limpar: () => persistenciaInteligente.limparSessaoCliente(clienteId),
    iniciarNovoFluxo: (dadosBasicos: { cliente: any }) => 
      persistenciaInteligente.iniciarNovoFluxo(clienteId, dadosBasicos)
  };
}

// Cleanup global (para usar em useEffect de componentes principais)
export function configurarCleanupGlobal() {
  // Cleanup ao fechar a página
  window.addEventListener('beforeunload', () => {
    persistenciaInteligente.destruir();
  });

  // Cleanup quando a aba perde foco por muito tempo
  let timeoutInativo: NodeJS.Timeout;
  
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Usuário saiu da aba, iniciar timer de inatividade
      timeoutInativo = setTimeout(() => {
        persistenciaInteligente.limparSessoesExpiradas();
      }, 10 * 60 * 1000); // 10 minutos
    } else {
      // Usuário voltou para a aba
      if (timeoutInativo) {
        clearTimeout(timeoutInativo);
      }
    }
  });
}