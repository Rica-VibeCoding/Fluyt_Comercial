import { Cliente } from '@/types/cliente';

// Simulação de backend com localStorage
export class ClienteStore {
  private static STORAGE_KEY = 'fluyt_clientes';

  // DADOS MOCKADOS REMOVIDOS - Agora usa apenas dados reais do Supabase

  // Inicialização limpa - sem criação automática de dados mockados
  public static init(): void {
    if (typeof window === 'undefined') return;
    console.log('📦 ClienteStore inicializado - usando apenas dados reais do Supabase');
  }

  // Buscar todos os clientes
  public static async buscarTodos(): Promise<Cliente[]> {
    await this.delay(300); // Simular latência de API
    
    if (typeof window === 'undefined') return [];
    
    const dados = localStorage.getItem(this.STORAGE_KEY);
    return dados ? JSON.parse(dados) : [];
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

// AUTO-INICIALIZAÇÃO REMOVIDA - sem criação automática de dados mockados
// O ClienteStore deve ser usado apenas como interface para localStorage
// Os dados reais vêm do backend/Supabase via API