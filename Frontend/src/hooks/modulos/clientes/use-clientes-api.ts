/**
 * HOOK DE CLIENTES COM INTEGRAÇÃO API + FALLBACK
 * Substitui use-clientes-realista.ts com estratégia API-first
 * Transparente para componentes - eles não sabem se estão usando API ou mock
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { clienteService, converterClienteAPIParaFrontend, type ClienteListResponse } from '@/services/cliente-service';
import type { Cliente, ClienteFormData, FiltrosCliente, Vendedor } from '@/types/cliente';
import { toast } from 'sonner';
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
  const [erro, setErro] = useState<string | null>(null);
  
  // Ref para verificar se componente ainda está montado
  const isMountedRef = useRef(true);
  
  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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
      
      toast.error('Aviso: Usando dados temporários de vendedores. Verifique autenticação do backend.');
    }
  }, []);

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
    setErro(null);
    logConfig('useClientesApi: Carregando clientes...', { filtros });
    
    try {
      const response = await clienteService.listar(filtros);
      
      if (response.success && response.data) {
        // Converter clientes da API para formato frontend
        const clientesConvertidos = response.data.items.map(converterClienteAPIParaFrontend);
        setClientes(clientesConvertidos);
        
        logConfig('useClientesApi: Clientes carregados com sucesso', {
          total: response.data.items.length
        });
      } else {
        throw new Error(response.error || 'Erro desconhecido ao carregar clientes');
      }
    } catch (error) {
      console.error('❌ useClientesApi: Erro ao carregar clientes:', error);
      
      // Tratamento específico de erros
      let mensagemErro = "Não foi possível carregar a lista de clientes.";
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          mensagemErro = "Erro de conexão com o servidor. Verifique se o backend está rodando.";
        } else if (error.message.includes('403') || error.message.includes('Not authenticated')) {
          mensagemErro = "Sessão expirada. Faça login novamente.";
          // Limpar dados de autenticação inválidos
          localStorage.removeItem('fluyt_auth_token');
          localStorage.removeItem('fluyt_refresh_token');
          localStorage.removeItem('fluyt_user');
          
          // Redirecionar para login se não estiver na página de login
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
            return;
          }
        } else if (error.message.includes('timeout')) {
          mensagemErro = "Conexão muito lenta. Tente novamente.";
        } else {
          mensagemErro = error.message;
        }
      }
      
      setErro(mensagemErro);
      toast.error(mensagemErro);
      setClientes([]);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [filtros, isHydrated]);

  // Carregar na inicialização e quando filtros mudarem
  useEffect(() => {
    if (isHydrated) {
      carregarClientes();
    }
  }, [filtros, isHydrated, carregarClientes]);

  // ============= BUSCAR CLIENTE POR ID =============
  const buscarClientePorId = useCallback(async (id: string): Promise<Cliente | null> => {
    logConfig('useClientesApi: Buscando cliente por ID...', { id });
    
    try {
      const response = await clienteService.buscarPorId(id);
      
      if (response.success && response.data) {
        const clienteConvertido = converterClienteAPIParaFrontend(response.data);
        logConfig('useClientesApi: Cliente encontrado');
        return clienteConvertido;
      } else {
        logConfig('useClientesApi: Cliente não encontrado', { id, erro: response.error });
        return null;
      }
    } catch (error) {
      console.error('❌ useClientesApi: Erro ao buscar cliente:', error);
      return null;
    }
  }, []);

  // ============= VERIFICAR DADOS COMPLETOS =============
  const verificarDadosCompletos = useCallback((cliente: Cliente): boolean => {
    return !!(
      cliente?.cpf_cnpj && 
      cliente?.telefone && 
      cliente?.email &&
      cliente?.logradouro &&
      cliente?.cidade &&
      cliente?.uf &&
      !cliente.cpf_cnpj.includes('não informado')
    );
  }, []);

  // ============= DETERMINAR STATUS BASEADO EM REGRAS =============
  const determinarStatusCliente = useCallback((cliente: Cliente, statusList: any[]): string | null => {
    if (!statusList.length) return null;

    // Buscar status por ordem na tabela c_status_orcamento
    const statusOrdem1 = statusList.find(s => s.ordem === 1)?.id; // Cadastrado
    const statusOrdem2 = statusList.find(s => s.ordem === 2)?.id; // Ambiente Importado  
    const statusOrdem3 = statusList.find(s => s.ordem === 3)?.id; // Orçamento
    const statusOrdem4 = statusList.find(s => s.ordem === 4)?.id; // Negociação
    const statusOrdem5 = statusList.find(s => s.ordem === 5)?.id; // Fechado

    // REGRA 4: Se tem contrato → ordem 4 (Fechado preserva ordem 5)
    // TODO: Verificar se cliente tem contrato quando módulo contratos estiver pronto
    
    // REGRA 3: Se tem plano de pagamento salvo → ordem 3 (Orçamento)
    // TODO: Verificar se cliente tem orçamento/pagamento quando módulo estiver pronto
    
    // REGRA 2: Se tem ambiente importado/criado → ordem 2 (Ambiente Importado)
    // TODO: Verificar se cliente tem ambientes quando módulo estiver pronto
    
    // REGRA 1: Cliente recém cadastrado → ordem 1 (Cadastrado)
    // Se não tem status_id ou status inválido, usar ordem 1
    if (!cliente.status_id || !statusList.find(s => s.id === cliente.status_id)) {
      return statusOrdem1 || null;
    }

    // Manter status atual se válido
    return cliente.status_id;
  }, []);

  // ============= ADICIONAR CLIENTE =============
  const adicionarCliente = useCallback(async (novoCliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>, statusList: any[] = []): Promise<Cliente | null> => {
    setIsLoading(true);
    logConfig('useClientesApi: Criando cliente...', { nome: novoCliente.nome });
    
    try {
      // REGRA: Cliente recém cadastrado recebe status ordem 1 (Cadastrado)
      const statusInicial = statusList.find(s => s.ordem === 1)?.id || null;
      
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
        status_id: statusInicial || '',
        observacoes: novoCliente.observacoes,
      };

      const response = await clienteService.criar(dadosFormulario);
      
      if (response.success && response.data) {
        // Em vez de recarregar a lista inteira, o que é lento,
        // adicionamos o cliente retornado pela API (com o ID correto)
        // diretamente no topo da lista local.
        const clienteConvertido = converterClienteAPIParaFrontend(response.data);
        setClientes(prevClientes => [clienteConvertido, ...prevClientes]);
        
        toast.success(`Cliente ${response.data.nome} foi adicionado.`);
        
        logConfig('useClientesApi: Cliente criado com sucesso', { 
          nome: response.data.nome
        });
        
        return clienteConvertido;
      } else {
        throw new Error(response.error || 'Erro ao criar cliente');
      }
    } catch (error) {
      console.error('❌ useClientesApi: Erro ao criar cliente:', error);
      
      // Tratamento específico de erros
      let mensagemErro = "Verifique os dados e tente novamente.";
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          mensagemErro = "Erro de conexão com o servidor. Verifique se o backend está rodando.";
        } else if (error.message.includes('403') || error.message.includes('Not authenticated')) {
          mensagemErro = "Sessão expirada. Faça login novamente.";
          // Limpar dados de autenticação inválidos
          localStorage.removeItem('fluyt_auth_token');
          localStorage.removeItem('fluyt_refresh_token');
          localStorage.removeItem('fluyt_user');
          
          // Redirecionar para login se não estiver na página de login
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
            return null;
          }
        } else if (error.message.includes('timeout')) {
          mensagemErro = "Conexão muito lenta. Tente novamente.";
        } else if (error.message.includes('duplicat') || error.message.includes('unique')) {
          mensagemErro = "CPF/CNPJ já cadastrado no sistema.";
        } else if (error.message.includes('validation')) {
          mensagemErro = "Dados inválidos. Verifique os campos obrigatórios.";
        } else {
          mensagemErro = error.message;
        }
      }
      
      toast.error(`Erro ao cadastrar cliente: ${mensagemErro}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [carregarClientes]);

  // ============= ATUALIZAR CLIENTE =============
  const atualizarCliente = useCallback(async (id: string, dadosAtualizados: Partial<Cliente>): Promise<Cliente | null> => {
    setIsLoading(true);
    logConfig('useClientesApi: Atualizando cliente...', { id });
    
    try {
      const response = await clienteService.atualizar(id, dadosAtualizados);
      
      if (response.success && response.data) {
        const clienteConvertido = converterClienteAPIParaFrontend(response.data);

        setClientes(prevClientes =>
          prevClientes.map(c => {
            if (c.id === id) {
              // ✨ FIX: Mescla inteligente para não perder dados de JOIN (como `procedencia` e `vendedor_nome`)
              // A resposta da API de atualização não contém os nomes, apenas os IDs.
              // Mantemos os nomes do estado anterior e atualizamos o resto.
              return { ...c, ...clienteConvertido };
            }
            return c;
          })
        );
        
        toast.success(`Cliente "${clienteConvertido.nome}" atualizado com sucesso!`);
        logConfig('useClientesApi: Cliente atualizado', { id });
        
        return clienteConvertido;
      } else {
        throw new Error(response.error || 'Erro ao atualizar cliente');
      }
    } catch (error) {
      console.error('❌ useClientesApi: Erro ao atualizar cliente:', error);
      
      // Tratamento específico de erros
      let mensagemErro = "Tente novamente em alguns instantes.";
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          mensagemErro = "Erro de conexão com o servidor. Verifique se o backend está rodando.";
        } else if (error.message.includes('403') || error.message.includes('Not authenticated')) {
          mensagemErro = "Sessão expirada. Faça login novamente.";
          // Limpar dados de autenticação inválidos
          localStorage.removeItem('fluyt_auth_token');
          localStorage.removeItem('fluyt_refresh_token');
          localStorage.removeItem('fluyt_user');
          
          // Redirecionar para login se não estiver na página de login
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
            return null;
          }
        } else {
          mensagemErro = error.message;
        }
      }
      
      toast.error(`Erro ao atualizar cliente: ${mensagemErro}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [carregarClientes]);

  // ============= REMOVER CLIENTE =============
  const removerCliente = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    logConfig('useClientesApi: Removendo cliente...', { id });
    
    try {
      const response = await clienteService.excluir(id);
      
      if (response.success) {
        // Recarregar lista
        await carregarClientes();
        
        toast.success("Cliente removido com sucesso!");
        
        logConfig('useClientesApi: Cliente removido com sucesso', { id });
        
        return true;
      } else {
        throw new Error(response.error || 'Erro ao remover cliente');
      }
    } catch (error) {
      console.error('❌ useClientesApi: Erro ao remover cliente:', error);
      
      // Tratamento específico de erros
      let mensagemErro = "Tente novamente em alguns instantes.";
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          mensagemErro = "Erro de conexão com o servidor. Verifique se o backend está rodando.";
        } else if (error.message.includes('403') || error.message.includes('Not authenticated')) {
          mensagemErro = "Sessão expirada. Faça login novamente.";
          // Limpar dados de autenticação inválidos
          localStorage.removeItem('fluyt_auth_token');
          localStorage.removeItem('fluyt_refresh_token');
          localStorage.removeItem('fluyt_user');
          
          // Redirecionar para login se não estiver na página de login
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
            return false;
          }
        } else {
          mensagemErro = error.message;
        }
      }
      
      toast.error(`Erro ao remover cliente: ${mensagemErro}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [carregarClientes]);

  // ============= STATUS DE CONECTIVIDADE =============
  const obterStatusConectividade = useCallback(async () => {
    try {
      return await clienteService.testePublico();
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
    erro,
    
    // Ações CRUD
    adicionarCliente,
    atualizarCliente,
    removerCliente,
    buscarClientePorId,
    
    // Ações auxiliares
    carregarClientes,
    obterStatusConectividade,
    verificarDadosCompletos,
    determinarStatusCliente,
    
    // Estatísticas
    totalClientes: clientes.length,
  };
}

// ============= LOGS DE INICIALIZAÇÃO =============

logConfig('🚀 useClientesApi carregado');
logConfig('🔀 Estratégia: API-first com autenticação JWT (padrão Empresas)');
logConfig('📡 Integração autenticada com backend FastAPI');