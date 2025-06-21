import { useState, useCallback, useMemo } from 'react';
import { Cliente, FiltrosCliente, Vendedor } from '../../../types/cliente';
import { useToast } from '../../globais/use-toast';

// DADOS MOCKADOS REMOVIDOS - Hook legado mantido apenas para compatibilidade
// Usar useClientesApi() ou useClientesRealista() para integração com Supabase

// DADOS MOCKADOS REMOVIDOS - usar dados reais do Supabase
const exemploVendedores: Vendedor[] = [];

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vendedores] = useState<Vendedor[]>([]);
  const [filtros, setFiltros] = useState<FiltrosCliente>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Debounced search
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClientes = useMemo(() => {
    let result = [...clientes];

    // Filtro de busca
    if (filtros.busca) {
      const termo = filtros.busca.toLowerCase();
      result = result.filter(cliente => 
        cliente.nome.toLowerCase().includes(termo) ||
        cliente.cpf_cnpj.includes(termo) ||
        cliente.telefone.includes(termo) ||
        cliente.email?.toLowerCase().includes(termo)
      );
    }

    // Filtro tipo de venda
    if (filtros.tipo_venda) {
      result = result.filter(cliente => cliente.tipo_venda === filtros.tipo_venda);
    }

    // Filtro procedência
    if (filtros.procedencia_id) {
      result = result.filter(cliente => cliente.procedencia === filtros.procedencia_id);
    }

    // Filtro vendedor
    if (filtros.vendedor_id) {
      result = result.filter(cliente => cliente.vendedor_id === filtros.vendedor_id);
    }

    // Filtro por período
    if (filtros.data_inicio && filtros.data_fim) {
      result = result.filter(cliente => {
        const dataCliente = new Date(cliente.created_at);
        const inicio = new Date(filtros.data_inicio!);
        const fim = new Date(filtros.data_fim!);
        return dataCliente >= inicio && dataCliente <= fim;
      });
    }

    return result;
  }, [clientes, filtros]);

  const adicionarCliente = useCallback(async (novoCliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    try {
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const cliente: Cliente = {
        ...novoCliente,
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setClientes(prev => [cliente, ...prev]);
      toast({
        title: "Cliente cadastrado com sucesso!",
        description: "O cliente foi adicionado à sua base de dados.",
      });
      return cliente;
    } catch (error) {
      toast({
        title: "Erro ao cadastrar cliente",
        description: "Verifique os dados e tente novamente.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const atualizarCliente = useCallback(async (id: string, dadosAtualizados: Partial<Cliente>) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setClientes(prev => prev.map(cliente => 
        cliente.id === id 
          ? { ...cliente, ...dadosAtualizados, updated_at: new Date().toISOString() }
          : cliente
      ));
      
      toast({
        title: "Cliente atualizado com sucesso!",
        description: "As alterações foram salvas.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar cliente",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const removerCliente = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setClientes(prev => prev.filter(cliente => cliente.id !== id));
      toast({
        title: "Cliente removido",
        description: "O cliente foi removido da base de dados.",
      });
    } catch (error) {
      toast({
        title: "Erro ao remover cliente",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    clientes: filteredClientes,
    vendedores,
    filtros,
    setFiltros,
    isLoading,
    adicionarCliente,
    atualizarCliente,
    removerCliente,
    totalClientes: clientes.length
  };
}