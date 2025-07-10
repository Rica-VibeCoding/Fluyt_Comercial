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

// Importar serviço de equipe para buscar vendedores reais
import { equipeService } from '@/services/equipe-service';

export function useClientesApi() {
  // ============= ESTADO =============
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [filtros, setFiltros] = useState<FiltrosCliente>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [ultimaFonte, setUltimaFonte] = useState<'api' | 'mock' | null>(null);
  const { toast } = useToast();

  // ============= CARREGAR VENDEDORES REAIS =============
  const carregarVendedores = useCallback(async () => {
    try {
      logConfig('useClientesApi: Carregando vendedores reais da API...');
      
      // Buscar vendedores da equipe (sem filtro de perfil por enquanto)
      const response = await equipeService.listar({});
      
      if (response.success && response.data) {
        // Converter funcionários para formato de vendedores
        const vendedoresReais: Vendedor[] = response.data.items.map(funcionario => ({
          id: funcionario.id,
          nome: funcionario.nome,
          perfil: funcionario.tipoFuncionario as 'VENDEDOR' | 'GERENTE'
        }));
        
        setVendedores(vendedoresReais);
        logConfig('useClientesApi: Vendedores carregados com sucesso', { 
          quantidade: vendedoresReais.length 
        });
      } else {
        throw new Error(response.error || 'Erro ao carregar vendedores');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar vendedores:', error);
      
      // Fallback com vendedores reais baseados na tabela cad_equipe vista no Supabase
      const vendedoresFallback: Vendedor[] = [
        { id: '98eb7f87-4c0c-481b-9f96-47131952e125', nome: 'Ricardo Nilton Borges', perfil: 'VENDEDOR' },
        { id: 'e4cb96eb-81dc-4d96-9389-fe68a276f215', nome: 'Carlos', perfil: 'VENDEDOR' },
        { id: '0c756322-619f-416f-9990-637d35ff4bf3', nome: 'Marcelo', perfil: 'GERENTE' }
      ];
      
      setVendedores(vendedoresFallback);
      logConfig('useClientesApi: Usando fallback com vendedores reais do Supabase');
      
      toast({
        title: "Aviso",
        description: "Usando dados temporários de vendedores. Verifique autenticação do backend.",
      });
    }
  }, [toast]);

  // ============= HIDRATAÇÃO =============
  useEffect(() => {
    setIsHydrated(true);
    logConfig('useClientesApi: Hidratação completa');
  }, []);

  // ============= CARREGAR VENDEDORES AO INICIALIZAR =============
  useEffect(() => {
    if (isHydrated) {
      carregarVendedores();
    }
  }, [isHydrated, carregarVendedores]);

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