import { useState, useEffect, useCallback } from 'react';
import { Cliente, FiltrosCliente, Vendedor } from '@/types/cliente';
import { ClienteStore } from '@/lib/store/cliente-store';
import { useToast } from '@/hooks/globais/use-toast';

const exemploVendedores: Vendedor[] = [
  { id: 'v1', nome: 'Ana Costa', perfil: 'VENDEDOR' },
  { id: 'v2', nome: 'Carlos Mendes', perfil: 'VENDEDOR' },
  { id: 'v3', nome: 'Pedro Santos', perfil: 'GERENTE' },
  { id: 'v4', nome: 'Marina Silva', perfil: 'VENDEDOR' }
];

export function useClientesRealista() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vendedores] = useState<Vendedor[]>(exemploVendedores);
  const [filtros, setFiltros] = useState<FiltrosCliente>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const { toast } = useToast();

  // Garantir hidratação no cliente
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Carregar clientes iniciais
  const carregarClientes = useCallback(async () => {
    if (!isHydrated) return;
    
    setIsLoading(true);
    try {
      let clientesCarregados: Cliente[];
      
      if (Object.keys(filtros).length > 0 && (filtros.busca || filtros.tipo_venda || filtros.procedencia_id || filtros.vendedor_id)) {
        // Buscar com filtros
        clientesCarregados = await ClienteStore.buscarComFiltros({
          busca: filtros.busca,
          tipo_venda: filtros.tipo_venda,
          procedencia: filtros.procedencia_id,
          vendedor_id: filtros.vendedor_id
        });
      } else {
        // Buscar todos
        clientesCarregados = await ClienteStore.buscarTodos();
      }
      
      setClientes(clientesCarregados);
      console.log('📊 Clientes carregados:', clientesCarregados.length);
    } catch (error) {
      console.error('❌ Erro ao carregar clientes:', error);
      toast({
        title: "Erro ao carregar clientes",
        description: "Não foi possível carregar a lista de clientes.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [filtros, toast, isHydrated]);

  // Carregar na inicialização
  useEffect(() => {
    carregarClientes();
  }, [carregarClientes]);

  // Buscar cliente específico por ID
  const buscarClientePorId = useCallback(async (id: string): Promise<Cliente | null> => {
    try {
      return await ClienteStore.buscarPorId(id);
    } catch (error) {
      console.error('❌ Erro ao buscar cliente:', error);
      return null;
    }
  }, []);

  // Adicionar cliente
  const adicionarCliente = useCallback(async (novoCliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    try {
      const cliente = await ClienteStore.criar(novoCliente);
      
      // Recarregar lista
      await carregarClientes();
      
      toast({
        title: "Cliente cadastrado com sucesso!",
        description: `${cliente.nome} foi adicionado à sua base de dados.`,
      });
      
      return cliente;
    } catch (error) {
      console.error('❌ Erro ao criar cliente:', error);
      toast({
        title: "Erro ao cadastrar cliente",
        description: "Verifique os dados e tente novamente.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [carregarClientes, toast]);

  // Atualizar cliente
  const atualizarCliente = useCallback(async (id: string, dadosAtualizados: Partial<Cliente>) => {
    setIsLoading(true);
    try {
      const clienteAtualizado = await ClienteStore.atualizar(id, dadosAtualizados);
      
      if (!clienteAtualizado) {
        throw new Error('Cliente não encontrado');
      }
      
      // Recarregar lista
      await carregarClientes();
      
      toast({
        title: "Cliente atualizado com sucesso!",
        description: "As alterações foram salvas.",
      });
      
      return clienteAtualizado;
    } catch (error) {
      console.error('❌ Erro ao atualizar cliente:', error);
      toast({
        title: "Erro ao atualizar cliente",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [carregarClientes, toast]);

  // Remover cliente
  const removerCliente = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await ClienteStore.deletar(id);
      
      // Recarregar lista
      await carregarClientes();
      
      toast({
        title: "Cliente removido",
        description: "O cliente foi removido da base de dados.",
      });
    } catch (error) {
      console.error('❌ Erro ao remover cliente:', error);
      toast({
        title: "Erro ao remover cliente",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [carregarClientes, toast]);

  // Limpar dados de desenvolvimento
  const limparDados = useCallback(() => {
    ClienteStore.limpar();
    setClientes([]);
    toast({
      title: "Dados limpos",
      description: "Todos os clientes foram removidos. Recarregue a página.",
    });
  }, [toast]);

  return {
    clientes,
    vendedores,
    filtros,
    setFiltros,
    isLoading: isLoading || !isHydrated,
    isInitialized: isInitialized && isHydrated,
    adicionarCliente,
    atualizarCliente,
    removerCliente,
    buscarClientePorId,
    limparDados,
    totalClientes: clientes.length
  };
}