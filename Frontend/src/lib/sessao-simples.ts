/**
 * SESSÃO ULTRA SIMPLES - RESET TOTAL
 * Uma única fonte de verdade, máxima simplicidade
 * 
 * ETAPA 2: Tipos movidos para @/types/orcamento (centralizados)
 */

import { 
  Cliente, 
  Ambiente, 
  FormaPagamento,
  SessaoOrcamento,
  // Aliases temporários para compatibilidade
  ClienteSimples,
  AmbienteSimples,
  SessaoSimples
} from '../types/orcamento';

// Re-export para compatibilidade
export type { 
  Cliente, 
  Ambiente, 
  FormaPagamento,
  SessaoOrcamento,
  ClienteSimples,
  AmbienteSimples,
  SessaoSimples 
};

class SessaoSimplesManager {
  private readonly CHAVE = 'fluyt_sessao_simples';
  
  // Carregar sessão
  public carregar(): SessaoSimples {
    if (typeof window === 'undefined') {
      console.log('🔒 [SSR] Retornando estado vazio (servidor)');
      return this.getEstadoVazio();
    }
    
    try {
      const dados = localStorage.getItem(this.CHAVE);
      if (dados) {
        const sessao = JSON.parse(dados) as SessaoSimples;
        // Garantir compatibilidade com versões antigas
        if (!sessao.formasPagamento) {
          sessao.formasPagamento = [];
        }
        console.log('📥 [LOAD] Sessão carregada do localStorage:', {
          cliente: sessao.cliente?.nome || 'null',
          ambientes: sessao.ambientes.length,
          valorTotal: sessao.valorTotal,
          formas: sessao.formasPagamento.length
        });
        return sessao;
      } else {
        console.log('📭 [LOAD] Nenhuma sessão encontrada no localStorage');
      }
    } catch (error) {
      console.warn('❌ [LOAD] Erro ao carregar sessão:', error);
    }
    
    const estadoVazio = this.getEstadoVazio();
    console.log('🆕 [LOAD] Retornando estado vazio');
    return estadoVazio;
  }
  
  // Salvar sessão
  public salvar(sessao: SessaoSimples): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.CHAVE, JSON.stringify(sessao));
      console.log('💾 Sessão salva:', sessao);
      
      // Disparar evento customizado para sincronização
      window.dispatchEvent(new CustomEvent('sessaoSimples-changed'));
    } catch (error) {
      console.warn('Erro ao salvar sessão:', error);
    }
  }
  
  // Definir cliente (comportamento original - limpa ambientes se cliente diferente)
  public definirCliente(cliente: ClienteSimples): SessaoSimples {
    const sessaoAtual = this.carregar();
    const novaSessao: SessaoSimples = {
      ...sessaoAtual,
      cliente,
      // Se mudou cliente, limpar ambientes e formas
      ambientes: sessaoAtual.cliente?.id === cliente.id ? sessaoAtual.ambientes : [],
      valorTotal: sessaoAtual.cliente?.id === cliente.id ? sessaoAtual.valorTotal : 0,
      formasPagamento: sessaoAtual.cliente?.id === cliente.id ? sessaoAtual.formasPagamento : []
    };
    
    this.salvar(novaSessao);
    return novaSessao;
  }
  
  // Definir cliente preservando contexto (para navegação URL)
  public definirClienteComContexto(cliente: ClienteSimples, preservarAmbientes: boolean = true): SessaoSimples {
    const sessaoAtual = this.carregar();
    const novaSessao: SessaoSimples = {
      ...sessaoAtual,
      cliente,
      // Preservar ambientes se solicitado e cliente for o mesmo
      ambientes: (preservarAmbientes && sessaoAtual.cliente?.id === cliente.id) ? 
                 sessaoAtual.ambientes : 
                 preservarAmbientes ? sessaoAtual.ambientes : [],
      valorTotal: (preservarAmbientes && sessaoAtual.cliente?.id === cliente.id) ? 
                  sessaoAtual.valorTotal : 
                  preservarAmbientes ? sessaoAtual.valorTotal : 0,
      formasPagamento: (preservarAmbientes && sessaoAtual.cliente?.id === cliente.id) ? 
                       sessaoAtual.formasPagamento : 
                       preservarAmbientes ? sessaoAtual.formasPagamento : []
    };
    
    this.salvar(novaSessao);
    return novaSessao;
  }
  
  // Verificar se é navegação URL (preservar contexto)
  private isNavegacaoURL(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Se tem parâmetros na URL, é navegação de continuidade
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('clienteId');
  }
  
  // Definir ambientes
  public definirAmbientes(ambientes: AmbienteSimples[]): SessaoSimples {
    const sessaoAtual = this.carregar();
    const valorTotal = ambientes.reduce((total, amb) => total + amb.valor, 0);
    
    const novaSessao: SessaoSimples = {
      ...sessaoAtual,
      ambientes,
      valorTotal
    };
    
    this.salvar(novaSessao);
    return novaSessao;
  }

  // Adicionar ambiente individual
  public adicionarAmbiente(ambiente: AmbienteSimples): SessaoSimples {
    const sessaoAtual = this.carregar();
    const novosAmbientes = [...sessaoAtual.ambientes, ambiente];
    return this.definirAmbientes(novosAmbientes);
  }

  // Remover ambiente individual
  public removerAmbiente(ambienteId: string): SessaoSimples {
    const sessaoAtual = this.carregar();
    const novosAmbientes = sessaoAtual.ambientes.filter(amb => amb.id !== ambienteId);
    return this.definirAmbientes(novosAmbientes);
  }

  // Atualizar ambiente específico
  public atualizarAmbiente(id: string, dadosAtualizados: Partial<AmbienteSimples>): SessaoSimples {
    const sessaoAtual = this.carregar();
    const novosAmbientes = sessaoAtual.ambientes.map(ambiente => 
      ambiente.id === id ? { ...ambiente, ...dadosAtualizados } : ambiente
    );
    return this.definirAmbientes(novosAmbientes);
  }

  // === MÉTODOS PARA FORMAS DE PAGAMENTO ===

  // Adicionar forma de pagamento
  public adicionarFormaPagamento(forma: Omit<FormaPagamento, 'id' | 'criadaEm'>): SessaoSimples {
    const sessaoAtual = this.carregar();
    const novaForma: FormaPagamento = {
      ...forma,
      id: `forma_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      criadaEm: new Date().toISOString()
    };
    
    const novaSessao: SessaoSimples = {
      ...sessaoAtual,
      formasPagamento: [...sessaoAtual.formasPagamento, novaForma]
    };
    
    this.salvar(novaSessao);
    console.log('➕ Forma de pagamento adicionada:', novaForma);
    return novaSessao;
  }

  // Remover forma de pagamento
  public removerFormaPagamento(id: string): SessaoSimples {
    const sessaoAtual = this.carregar();
    const novaSessao: SessaoSimples = {
      ...sessaoAtual,
      formasPagamento: sessaoAtual.formasPagamento.filter(forma => forma.id !== id)
    };
    
    this.salvar(novaSessao);
    console.log('🗑️ Forma de pagamento removida:', id);
    return novaSessao;
  }

  // Editar forma de pagamento
  public editarFormaPagamento(id: string, dadosAtualizados: Partial<Omit<FormaPagamento, 'id' | 'criadaEm'>>): SessaoSimples {
    const sessaoAtual = this.carregar();
    const novaSessao: SessaoSimples = {
      ...sessaoAtual,
      formasPagamento: sessaoAtual.formasPagamento.map(forma => 
        forma.id === id ? { ...forma, ...dadosAtualizados } : forma
      )
    };
    
    this.salvar(novaSessao);
    console.log('✏️ Forma de pagamento editada:', id, dadosAtualizados);
    return novaSessao;
  }

  // Obter formas de pagamento
  public obterFormasPagamento(): FormaPagamento[] {
    const sessao = this.carregar();
    return sessao.formasPagamento;
  }

  // Obter valor total das formas de pagamento
  public obterValorTotalFormas(): number {
    const formas = this.obterFormasPagamento();
    return formas.reduce((total, forma) => total + forma.valor, 0);
  }

  // Obter valor presente total das formas
  public obterValorPresenteTotal(): number {
    const formas = this.obterFormasPagamento();
    return formas.reduce((total, forma) => total + forma.valorPresente, 0);
  }

  // Obter valor restante para alocação
  public obterValorRestante(): number {
    const sessao = this.carregar();
    const valorTotalFormas = this.obterValorTotalFormas();
    return sessao.valorTotal - valorTotalFormas;
  }

  // Limpar tudo
  public limpar(): SessaoSimples {
    const sessaoVazia = this.getEstadoVazio();
    this.salvar(sessaoVazia);
    return sessaoVazia;
  }
  
  // Verificar se pode gerar orçamento
  public podeGerarOrcamento(): boolean {
    const sessao = this.carregar();
    return !!(sessao.cliente && sessao.ambientes.length > 0 && sessao.valorTotal > 0);
  }

  // Verificar se pode gerar contrato
  public podeGerarContrato(): boolean {
    const sessao = this.carregar();
    const podeOrcamento = this.podeGerarOrcamento();
    const temFormasPagamento = sessao.formasPagamento.length > 0;
    const valorAlocado = this.obterValorTotalFormas();
    const valorCompleto = valorAlocado >= sessao.valorTotal;
    
    return podeOrcamento && temFormasPagamento && valorCompleto;
  }

  // Obter resumo da sessão (compatibilidade com Zustand)
  public obterResumo() {
    const sessao = this.carregar();
    return {
      temCliente: !!sessao.cliente,
      quantidadeAmbientes: sessao.ambientes.length,
      valorTotal: sessao.valorTotal,
      orcamentoConfigurado: sessao.formasPagamento.length > 0,
      formasPagamento: sessao.formasPagamento.length,
      podeAvancar: this.podeGerarOrcamento(),
      podeFinalizarContrato: this.podeGerarContrato()
    };
  }

  // === MÉTODOS DE COMPATIBILIDADE COM ZUSTAND ===

  // Alias para compatibilidade com use-ambientes-sessao.ts
  public get valorTotalAmbientes(): number {
    return this.carregar().valorTotal;
  }
  
  // Estado vazio
  private getEstadoVazio(): SessaoSimples {
    return {
      cliente: null,
      ambientes: [],
      valorTotal: 0,
      formasPagamento: []
    };
  }
  
  // Debug
  public debug(): void {
    console.log('🔍 DEBUG SESSÃO SIMPLES:', this.carregar());
  }
}

// Instância singleton
export const sessaoSimples = new SessaoSimplesManager();