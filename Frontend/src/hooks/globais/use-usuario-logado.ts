/**
 * Hook para acessar dados do usuário logado
 * Busca informações do localStorage e fornece dados estruturados
 * Essencial para hierarquia: usuário → loja → vendedor → cliente → orçamento
 */

import { useState, useEffect } from 'react';
import { logConfig } from '@/lib/config';

// Tipos baseados na resposta real do backend (conforme visto nos logs)
export interface UsuarioLogado {
  id: string;
  email: string;
  nome: string;
  perfil: 'ADMIN_MASTER' | 'GERENTE' | 'VENDEDOR' | 'MEDIDOR';
  loja_id: string | null;
  empresa_id: string | null;
  ativo: boolean;
  funcao: string;
  loja_nome: string | null;
  empresa_nome: string | null;
}

export interface UseUsuarioLogadoReturn {
  usuario: UsuarioLogado | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  
  // Campos mais utilizados para facilitar acesso
  usuarioId: string | null;
  nome: string | null;
  email: string | null;
  lojaId: string | null;
  empresaId: string | null;
  perfil: string | null;
  
  // Verificações de perfil
  isVendedor: boolean;
  isGerente: boolean;
  isAdminMaster: boolean;
  
  // Funções utilitárias
  recarregarUsuario: () => void;
  limparUsuario: () => void;
}

export function useUsuarioLogado(): UseUsuarioLogadoReturn {
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // PROTEÇÃO SSR: Verificar se estamos no cliente
  const isClient = typeof window !== 'undefined';

  // Função para carregar dados do usuário do localStorage
  const carregarUsuario = () => {
    try {
      // PROTEÇÃO: Só executar no cliente
      if (!isClient) {
        setIsLoading(false);
        return;
      }
      
      // Buscar dados do usuário no localStorage
      const userData = localStorage.getItem('fluyt_user');
      
      if (userData) {
        const usuarioParsed = JSON.parse(userData) as UsuarioLogado;
        
        // Validar se tem dados essenciais
        if (usuarioParsed.id && usuarioParsed.email) {
          setUsuario(usuarioParsed);
          // logConfig('✅ useUsuarioLogado: Usuário carregado com sucesso', {
          //   id: usuarioParsed.id,
          //   nome: usuarioParsed.nome,
          //   email: usuarioParsed.email,
          //   loja_id: usuarioParsed.loja_id,
          //   perfil: usuarioParsed.perfil
          // });
        } else {
          // logConfig('⚠️ useUsuarioLogado: Dados do usuário incompletos');
          setUsuario(null);
        }
      } else {
        // logConfig('⚠️ useUsuarioLogado: Nenhum usuário encontrado no localStorage');
        setUsuario(null);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do usuário:', error);
      setUsuario(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para limpar dados do usuário
  const limparUsuario = () => {
    if (!isClient) return;
    
    localStorage.removeItem('fluyt_user');
    localStorage.removeItem('fluyt_auth_token');
    setUsuario(null);
    // logConfig('🧹 useUsuarioLogado: Dados do usuário limpos');
  };

  // Carregar usuário na inicialização - APENAS NO CLIENTE
  useEffect(() => {
    if (isClient) {
      carregarUsuario();
    } else {
      setIsLoading(false);
    }
  }, [isClient]);

  // Retornar dados estruturados
  return {
    // Dados principais
    usuario,
    isLoggedIn: !!usuario,
    isLoading,
    
    // Campos de acesso rápido
    usuarioId: usuario?.id || null,
    nome: usuario?.nome || null,
    email: usuario?.email || null,
    lojaId: usuario?.loja_id || null,
    empresaId: usuario?.empresa_id || null,
    perfil: usuario?.perfil || null,
    
    // Verificações de perfil
    isVendedor: usuario?.perfil === 'VENDEDOR',
    isGerente: usuario?.perfil === 'GERENTE',
    isAdminMaster: usuario?.perfil === 'ADMIN_MASTER',
    
    // Funções utilitárias
    recarregarUsuario: carregarUsuario,
    limparUsuario
  };
}

// Log de inicialização - DESABILITADO TEMPORARIAMENTE
// logConfig('🚀 Hook useUsuarioLogado carregado');