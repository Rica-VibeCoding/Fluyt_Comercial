import { useState, useCallback, useMemo } from 'react';
import { Cliente, FiltrosCliente, Vendedor } from '../../../types/cliente';
import { useToast } from '../../globais/use-toast';

// Dados de exemplo brasileiros realistas
const exemploClientes: Cliente[] = [
  {
    id: '1',
    nome: 'João Silva Santos',
    cpf_cnpj: '123.456.789-00',
    rg_ie: '12.345.678-9',
    email: 'joao.silva@gmail.com',
    telefone: '(11) 99999-1234',
    tipo_venda: 'NORMAL',
    procedencia: 'Instagram',
    vendedor_id: 'v1',
    vendedor_nome: 'Ana Costa',
    cep: '01310-100',
    logradouro: 'Av. Paulista',
    numero: '1234',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    uf: 'SP',
    observacoes: 'Cliente interessado em cozinha planejada',
    created_at: '2024-11-15T10:00:00Z',
    updated_at: '2024-11-15T10:00:00Z'
  },
  {
    id: '2',
    nome: 'Construtora ABC Ltda',
    cpf_cnpj: '12.345.678/0001-90',
    rg_ie: '123.456.789.123',
    email: 'contato@construtorabc.com.br',
    telefone: '(11) 3333-4444',
    tipo_venda: 'FUTURA',
    procedencia: 'Indicação Arquiteto',
    vendedor_id: 'v2',
    vendedor_nome: 'Carlos Mendes',
    cep: '09560-010',
    logradouro: 'Rua das Flores',
    numero: '567',
    bairro: 'Centro',
    cidade: 'São Caetano do Sul',
    uf: 'SP',
    observacoes: 'Projeto para 20 apartamentos',
    created_at: '2024-11-10T14:30:00Z',
    updated_at: '2024-11-10T14:30:00Z'
  },
  {
    id: '3',
    nome: 'Maria Fernanda Oliveira',
    cpf_cnpj: '987.654.321-00',
    rg_ie: '98.765.432-1',
    email: 'maria.fernanda@hotmail.com',
    telefone: '(11) 98888-5678',
    tipo_venda: 'NORMAL',
    procedencia: 'Site',
    vendedor_id: 'v1',
    vendedor_nome: 'Ana Costa',
    cep: '04038-001',
    logradouro: 'Rua Vergueiro',
    numero: '2345',
    bairro: 'Vila Mariana',
    cidade: 'São Paulo',
    uf: 'SP',
    observacoes: 'Quer orçamento para quarto e closet',
    created_at: '2024-11-12T09:15:00Z',
    updated_at: '2024-11-12T09:15:00Z'
  },
  {
    id: '4',
    nome: 'Roberto Carlos Mendonça',
    cpf_cnpj: '456.789.123-00',
    rg_ie: '45.678.912-3',
    email: 'roberto.mendonca@empresa.com',
    telefone: '(11) 97777-9012',
    tipo_venda: 'NORMAL',
    procedencia: 'Facebook',
    vendedor_id: 'v3',
    vendedor_nome: 'Pedro Santos',
    cep: '05424-000',
    logradouro: 'Rua Teodoro Sampaio',
    numero: '890',
    bairro: 'Pinheiros',
    cidade: 'São Paulo',
    uf: 'SP',
    created_at: '2024-11-08T16:45:00Z',
    updated_at: '2024-11-08T16:45:00Z'
  },
  {
    id: '5',
    nome: 'Luciana Pereira Silva',
    cpf_cnpj: '321.654.987-00',
    rg_ie: '32.165.498-7',
    email: 'luciana.pereira@gmail.com',
    telefone: '(11) 96666-3456',
    tipo_venda: 'FUTURA',
    procedencia: 'Indicação Amigo',
    vendedor_id: 'v2',
    vendedor_nome: 'Carlos Mendes',
    cep: '01227-200',
    logradouro: 'Rua Augusta',
    numero: '1500',
    bairro: 'Consolação',
    cidade: 'São Paulo',
    uf: 'SP',
    observacoes: 'Mudança em janeiro 2025',
    created_at: '2024-11-05T11:20:00Z',
    updated_at: '2024-11-05T11:20:00Z'
  }
];

const exemploVendedores: Vendedor[] = [
  { id: 'v1', nome: 'Ana Costa', perfil: 'VENDEDOR' },
  { id: 'v2', nome: 'Carlos Mendes', perfil: 'VENDEDOR' },
  { id: 'v3', nome: 'Pedro Santos', perfil: 'GERENTE' },
  { id: 'v4', nome: 'Marina Silva', perfil: 'VENDEDOR' }
];

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>(exemploClientes);
  const [vendedores] = useState<Vendedor[]>(exemploVendedores);
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