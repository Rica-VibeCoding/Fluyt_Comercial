/**
 * HOOK DE CLIENTES COM INTEGRAÇÃO API + FALLBACK
 * Substitui use-clientes-realista.ts com estratégia API-first
 * Transparente para componentes - eles não sabem se estão usando API ou mock
 */

import { useState, useEffect, useCallback } from 'react';
import { clienteService, type ClienteServiceResponse, type ClienteListResponse } from '@/services/cliente-service';
import type { Cliente, ClienteFormData, FiltrosCliente, Vendedor } from '@/types/cliente';
import { useToast } from '@/hooks/globais/use-toast';
import { logConfig } from '@/lib/config';

// Dados de vendedores (mock temporário até integração completa)
const exemploVendedores: Vendedor[] = [
  { id: 'v1', nome: 'Ana Costa', perfil: 'VENDEDOR' },
  { id: 'v2', nome: 'Carlos Mendes', perfil: 'VENDEDOR' },
  { id: 'v3', nome: 'Pedro Santos', perfil: 'GERENTE' },
  { id: 'v4', nome: 'Marina Silva', perfil: 'VENDEDOR' }
];

export function useClientesApi() {
  // ============= ESTADO =============
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vendedores] = useState<Vendedor[]>(exemploVendedores);
  const [filtros, setFiltros] = useState<FiltrosCliente>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [ultimaFonte, setUltimaFonte] = useState<'api' | 'mock' | null>(null);
  const { toast } = useToast();

  // ============= HIDRATAÇÃO =============
  useEffect(() => {
    setIsHydrated(true);
    logConfig('useClientesApi: Hidratação completa');
  }, []);

  // ============= CARREGAR CLIENTES =============
  const carregarClientes = useCallback(async () => {
    if (!isHydrated) {
      logConfig('useClientesApi: Aguardando hidratação...');
      return;
    }
    
    setIsLoading(true);
    logConfig('useClientesApi: Carregando clientes...', { filtros });
    
    try {
      const response = await clienteService.listarClientes(filtros);
      
      if (response.success && response.data) {
        setClientes(response.data.items);
        setUltimaFonte(response.source);
        
        // Se usar mock, lançar erro ao invés de mostrar toast
        if (response.source === 'mock') {
          throw new Error('Backend não disponível. Verifique se o servidor está rodando.');
        }
        
        logConfig('useClientesApi: Clientes carregados com sucesso', {
          total: response.data.items.length,
          fonte: response.source
        });
      } else {
        throw new Error(response.error || 'Erro desconhecido ao carregar clientes');
      }
    } catch (error) {
      console.error('❌ useClientesApi: Erro ao carregar clientes:', error);
      const mensagemErro = error instanceof Error ? error.message : "Não foi possível carregar a lista de clientes.";
      toast({
        title: "Erro ao carregar clientes",
        description: mensagemErro,
        variant: "destructive"
      });
      setClientes([]);
      setUltimaFonte(null);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [filtros, toast, isHydrated]);

  // Carregar na inicialização e quando filtros mudarem
  useEffect(() => {
    carregarClientes();
  }, [carregarClientes]);

  // ============= BUSCAR CLIENTE POR ID =============
  const buscarClientePorId = useCallback(async (id: string): Promise<Cliente | null> => {
    logConfig('useClientesApi: Buscando cliente por ID...', { id });
    
    try {
      const response = await clienteService.buscarClientePorId(id);
      
      if (response.success && response.data) {
        logConfig('useClientesApi: Cliente encontrado', { nome: response.data.nome, fonte: response.source });
        return response.data;
      } else {
        logConfig('useClientesApi: Cliente não encontrado', { id, erro: response.error });
        return null;
      }
    } catch (error) {
      console.error('❌ useClientesApi: Erro ao buscar cliente:', error);
      return null;
    }
  }, []);

  // ============= ADICIONAR CLIENTE =============
  const adicionarCliente = useCallback(async (novoCliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>): Promise<Cliente | null> => {
    setIsLoading(true);
    logConfig('useClientesApi: Criando cliente...', { nome: novoCliente.nome });
    
    try {
      // Converter para formato de formulário
      const dadosFormulario: ClienteFormData = {
        nome: novoCliente.nome,
        cpf_cnpj: novoCliente.cpf_cnpj,
        rg_ie: novoCliente.rg_ie,
        email: novoCliente.email,
        telefone: novoCliente.telefone,
        tipo_venda: novoCliente.tipo_venda,
        logradouro: novoCliente.logradouro || '',
        numero: novoCliente.numero,
        complemento: novoCliente.complemento,
        bairro: novoCliente.bairro || '',
        cidade: novoCliente.cidade || '',
        uf: novoCliente.uf || '',
        cep: novoCliente.cep || '',
        procedencia_id: novoCliente.procedencia_id || '',
        vendedor_id: novoCliente.vendedor_id || '',
        observacoes: novoCliente.observacoes,
      };

      const response = await clienteService.criarCliente(dadosFormulario);
      
      if (response.success && response.data) {
        // Recarregar lista
        await carregarClientes();
        
        // Se foi salvo em mock, lançar erro
        if (response.source === 'mock') {
          throw new Error('Não foi possível conectar ao servidor. As alterações não foram salvas.');
        }
        
        toast({
          title: "Cliente cadastrado com sucesso!",
          description: `${response.data.nome} foi adicionado.`,
        });
        
        logConfig('useClientesApi: Cliente criado com sucesso', { 
          nome: response.data.nome, 
          fonte: response.source 
        });
        
        return response.data;
      } else {
        throw new Error(response.error || 'Erro ao criar cliente');
      }
    } catch (error) {
      console.error('❌ useClientesApi: Erro ao criar cliente:', error);
      const mensagemErro = error instanceof Error ? error.message : "Verifique os dados e tente novamente.";
      toast({
        title: "Erro ao cadastrar cliente",
        description: mensagemErro,
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [carregarClientes, toast]);

  // ============= ATUALIZAR CLIENTE =============
  const atualizarCliente = useCallback(async (id: string, dadosAtualizados: Partial<Cliente>): Promise<Cliente | null> => {
    setIsLoading(true);
    logConfig('useClientesApi: Atualizando cliente...', { id });
    
    try {
      const response = await clienteService.atualizarCliente(id, dadosAtualizados);
      
      if (response.success && response.data) {
        // Recarregar lista
        await carregarClientes();
        
        // Se foi salvo em mock, lançar erro
        if (response.source === 'mock') {
          throw new Error('Não foi possível conectar ao servidor. As alterações não foram salvas.');
        }
        
        toast({
          title: "Cliente atualizado com sucesso!",
          description: "Alterações sincronizadas com o servidor.",
        });
        
        logConfig('useClientesApi: Cliente atualizado com sucesso', { 
          id, 
          fonte: response.source 
        });
        
        return response.data;
      } else {
        throw new Error(response.error || 'Erro ao atualizar cliente');
      }
    } catch (error) {
      console.error('❌ useClientesApi: Erro ao atualizar cliente:', error);
      const mensagemErro = error instanceof Error ? error.message : "Tente novamente em alguns instantes.";
      toast({
        title: "Erro ao atualizar cliente",
        description: mensagemErro,
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [carregarClientes, toast]);

  // ============= REMOVER CLIENTE =============
  const removerCliente = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    logConfig('useClientesApi: Removendo cliente...', { id });
    
    try {
      const response = await clienteService.deletarCliente(id);
      
      if (response.success) {
        // Recarregar lista
        await carregarClientes();
        
        // Se foi removido em mock, lançar erro
        if (response.source === 'mock') {
          throw new Error('Não foi possível conectar ao servidor. A remoção não foi efetivada.');
        }
        
        toast({
          title: "Cliente removido",
          description: "Cliente removido do servidor.",
        });
        
        logConfig('useClientesApi: Cliente removido com sucesso', { 
          id, 
          fonte: response.source 
        });
        
        return true;
      } else {
        throw new Error(response.error || 'Erro ao remover cliente');
      }
    } catch (error) {
      console.error('❌ useClientesApi: Erro ao remover cliente:', error);
      const mensagemErro = error instanceof Error ? error.message : "Tente novamente em alguns instantes.";
      toast({
        title: "Erro ao remover cliente",
        description: mensagemErro,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [carregarClientes, toast]);

  // ============= STATUS DE CONECTIVIDADE =============
  const obterStatusConectividade = useCallback(async () => {
    try {
      return await clienteService.obterStatusConectividade();
    } catch (error) {
      console.error('❌ useClientesApi: Erro ao obter status:', error);
      return null;
    }
  }, []);

  // ============= RETURN =============
  return {
    // Dados
    clientes,
    vendedores,
    filtros,
    setFiltros,
    
    // Estados
    isLoading: isLoading || !isHydrated,
    isInitialized: isInitialized && isHydrated,
    ultimaFonte,
    
    // Ações CRUD
    adicionarCliente,
    atualizarCliente,
    removerCliente,
    buscarClientePorId,
    
    // Ações auxiliares
    carregarClientes,
    obterStatusConectividade,
    
    // Estatísticas
    totalClientes: clientes.length,
  };
}

// ============= LOGS DE INICIALIZAÇÃO =============

logConfig('🚀 useClientesApi carregado');
logConfig('🔀 Estratégia: API-first com fallback automático para mock');
logConfig('📡 Integração transparente para componentes');