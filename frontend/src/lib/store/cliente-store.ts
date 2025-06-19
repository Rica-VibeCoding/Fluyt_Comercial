import { Cliente } from '@/types/cliente';

// Simulação de backend com localStorage
export class ClienteStore {
  private static STORAGE_KEY = 'fluyt_clientes';

  // Dados iniciais para primeira execução
  private static dadosIniciais: Cliente[] = [
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

  // Inicializar dados se não existirem
  public static init(): void {
    if (typeof window === 'undefined') return;
    
    const dados = localStorage.getItem(this.STORAGE_KEY);
    if (!dados) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.dadosIniciais));
      console.log('📦 ClienteStore inicializado com dados padrão');
    }
  }

  // Buscar todos os clientes
  public static async buscarTodos(): Promise<Cliente[]> {
    await this.delay(300); // Simular latência de API
    
    if (typeof window === 'undefined') return this.dadosIniciais;
    
    const dados = localStorage.getItem(this.STORAGE_KEY);
    return dados ? JSON.parse(dados) : this.dadosIniciais;
  }

  // Buscar cliente por ID
  public static async buscarPorId(id: string): Promise<Cliente | null> {
    console.log('🔍 ClienteStore.buscarPorId:', id);
    
    const clientes = await this.buscarTodos();
    const cliente = clientes.find(c => c.id === id);
    
    console.log('📋 Cliente encontrado:', cliente?.nome || 'Não encontrado');
    return cliente || null;
  }

  // Criar novo cliente
  public static async criar(cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>): Promise<Cliente> {
    await this.delay(500);
    
    const novoCliente: Cliente = {
      ...cliente,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const clientes = await this.buscarTodos();
    const novosClientes = [novoCliente, ...clientes];
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(novosClientes));
    console.log('✅ Cliente criado:', novoCliente.nome);
    
    return novoCliente;
  }

  // Atualizar cliente
  public static async atualizar(id: string, dados: Partial<Cliente>): Promise<Cliente | null> {
    await this.delay(400);
    
    const clientes = await this.buscarTodos();
    const index = clientes.findIndex(c => c.id === id);
    
    if (index === -1) return null;
    
    const clienteAtualizado = {
      ...clientes[index],
      ...dados,
      updated_at: new Date().toISOString()
    };
    
    clientes[index] = clienteAtualizado;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(clientes));
    
    console.log('📝 Cliente atualizado:', clienteAtualizado.nome);
    return clienteAtualizado;
  }

  // Deletar cliente
  public static async deletar(id: string): Promise<boolean> {
    await this.delay(300);
    
    const clientes = await this.buscarTodos();
    const novosClientes = clientes.filter(c => c.id !== id);
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(novosClientes));
    console.log('🗑️ Cliente deletado, ID:', id);
    
    return true;
  }

  // Buscar com filtros
  public static async buscarComFiltros(filtros: {
    busca?: string;
    tipo_venda?: string;
    procedencia?: string;
    vendedor_id?: string;
  }): Promise<Cliente[]> {
    await this.delay(200);
    
    let clientes = await this.buscarTodos();
    
    if (filtros.busca) {
      const termo = filtros.busca.toLowerCase();
      clientes = clientes.filter(cliente => 
        cliente.nome.toLowerCase().includes(termo) ||
        cliente.cpf_cnpj.includes(termo) ||
        cliente.telefone.includes(termo) ||
        cliente.email?.toLowerCase().includes(termo)
      );
    }

    if (filtros.tipo_venda) {
      clientes = clientes.filter(c => c.tipo_venda === filtros.tipo_venda);
    }

    if (filtros.procedencia) {
      clientes = clientes.filter(c => c.procedencia === filtros.procedencia);
    }

    if (filtros.vendedor_id) {
      clientes = clientes.filter(c => c.vendedor_id === filtros.vendedor_id);
    }

    return clientes;
  }

  // Limpar todos os dados (para desenvolvimento)
  public static limpar(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('🧹 ClienteStore limpo');
    }
  }

  // Delay helper para simular latência
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Inicializar automaticamente apenas no cliente
if (typeof window !== 'undefined') {
  // Usar setTimeout para evitar problemas de hidratação
  setTimeout(() => {
    ClienteStore.init();
  }, 0);
}