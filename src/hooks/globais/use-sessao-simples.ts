/**
 * Hook ULTRA SIMPLES para sessão
 * Máxima simplicidade, zero complexidade
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { sessaoSimples, type SessaoSimples, type ClienteSimples, type AmbienteSimples } from '@/lib/sessao-simples';

export function useSessaoSimples() {
  // 🔒 PROTEÇÃO CONTRA DOUBLE EXECUTION (React Strict Mode em desenvolvimento)
  const inicializadoRef = useRef(false);
  
  const [sessao, setSessao] = useState<SessaoSimples>(() => {
    // Evitar erro SSR - retornar estado vazio no servidor
    if (typeof window === 'undefined') {
      return { cliente: null, ambientes: [], valorTotal: 0, formasPagamento: [] };
    }
    
    // Em desenvolvimento com Strict Mode, evitar carregamento duplo
    if (!inicializadoRef.current) {
      inicializadoRef.current = true;
      console.log('🔄 [STRICT MODE SAFE] Inicializando sessão (primeira execução)');
      return sessaoSimples.carregar();
    } else {
      console.log('⚠️ [STRICT MODE] Evitando segunda inicialização');
      return sessaoSimples.carregar(); // Ainda carregar para consistência
    }
  });

  // Atualizar estado quando localStorage mudar (entre componentes)
  useEffect(() => {
    // 🔒 PROTEÇÃO: Só configurar listeners após primeira inicialização
    if (!inicializadoRef.current) return;
    
    const handleStorageChange = () => {
      console.log('📡 [STORAGE EVENT] Sessão alterada externamente');
      setSessao(sessaoSimples.carregar());
    };

    console.log('🎧 [LISTENERS] Configurando event listeners para sessão');
    
    // Escutar mudanças no localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Escutar mudanças customizadas (mesmo componente)
    window.addEventListener('sessaoSimples-changed', handleStorageChange);
    
    return () => {
      console.log('🧹 [CLEANUP] Removendo event listeners');
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sessaoSimples-changed', handleStorageChange);
    };
  }, []); // Dependência vazia - configurar apenas uma vez
  
  // Atualizar estado quando sessão mudar
  const atualizarSessao = useCallback(() => {
    setSessao(sessaoSimples.carregar());
  }, []);
  
  // Definir cliente
  const definirCliente = useCallback((cliente: ClienteSimples) => {
    const novaSessao = sessaoSimples.definirCliente(cliente);
    setSessao(novaSessao);
  }, []);
  
  // Definir cliente com contexto (para navegação)
  const definirClienteComContexto = useCallback((cliente: ClienteSimples, preservarAmbientes: boolean = true) => {
    const novaSessao = sessaoSimples.definirClienteComContexto(cliente, preservarAmbientes);
    setSessao(novaSessao);
  }, []);
  
  // Definir ambientes
  const definirAmbientes = useCallback((ambientes: AmbienteSimples[]) => {
    const novaSessao = sessaoSimples.definirAmbientes(ambientes);
    setSessao(novaSessao);
  }, []);
  
  // Limpar tudo
  const limparSessao = useCallback(() => {
    const novaSessao = sessaoSimples.limpar();
    setSessao(novaSessao);
  }, []);
  
  // Carregar cliente da URL (preservando contexto de navegação)
  const carregarClienteDaURL = useCallback((clienteId: string, clienteNome: string) => {
    console.log('🔄 [URL LOAD] carregarClienteDaURL chamado:', { clienteId, clienteNome });
    
    // 🔒 PROTEÇÃO: Só executar se hook foi inicializado
    if (!inicializadoRef.current) {
      console.log('⚠️ [URL LOAD] Hook não inicializado, aguardando...');
      // Tentar novamente após inicialização
      setTimeout(() => carregarClienteDaURL(clienteId, clienteNome), 100);
      return;
    }
    
    const sessaoAtual = sessaoSimples.carregar();
    
    // Se não tem cliente ou é diferente, definir novo PRESERVANDO ambientes (navegação)
    if (!sessaoAtual.cliente || sessaoAtual.cliente.id !== clienteId) {
      console.log('📥 [URL LOAD] Definindo cliente da URL com contexto preservado');
      const novaSessao = sessaoSimples.definirClienteComContexto({ id: clienteId, nome: clienteNome }, true);
      setSessao(novaSessao);
    } else {
      console.log('✅ [URL LOAD] Cliente já carregado, mantendo estado atual');
    }
  }, []);
  
  // Debug
  const debug = useCallback(() => {
    sessaoSimples.debug();
  }, []);
  
  return {
    // Estado
    cliente: sessao.cliente,
    ambientes: sessao.ambientes,
    valorTotal: sessao.valorTotal,
    
    // Validações
    temCliente: !!sessao.cliente,
    temAmbientes: sessao.ambientes.length > 0,
    podeGerarOrcamento: sessaoSimples.podeGerarOrcamento(),
    
    // Ações
    definirCliente,
    definirClienteComContexto,
    definirAmbientes,
    limparSessao,
    carregarClienteDaURL,
    atualizarSessao,
    debug
  };
}