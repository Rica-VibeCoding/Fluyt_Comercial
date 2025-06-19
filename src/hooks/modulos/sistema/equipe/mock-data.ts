import type { Funcionario } from '@/types/sistema';

// Mock data para desenvolvimento
export const mockFuncionarios: Funcionario[] = [
  {
    id: '1',
    nome: 'João Silva Santos',
    email: 'joao@fluyt.com.br',
    telefone: '(11) 98765-4321',
    setor: 'Vendas',
    lojaId: '1',
    loja: 'Fluyt Móveis & Design',
    salario: 3500,
    comissao: 3.5,
    dataAdmissao: '2024-01-25',
    ativo: true,
    nivelAcesso: 'USUARIO',
    tipoFuncionario: 'VENDEDOR',
    performance: 95,
    configuracoes: {
      limiteDesconto: 15,
      overrideComissao: 3.5
    },
    createdAt: '2024-01-25T10:00:00Z'
  },
  {
    id: '2',
    nome: 'Maria Fernanda Oliveira',
    email: 'maria@fluyt.com.br',
    telefone: '(11) 97777-8888',
    setor: 'Vendas',
    lojaId: '1',
    loja: 'Fluyt Móveis & Design',
    salario: 6000,
    comissao: 2,
    dataAdmissao: '2024-02-01',
    ativo: true,
    nivelAcesso: 'GERENTE',
    tipoFuncionario: 'GERENTE',
    performance: 88,
    configuracoes: {
      limiteDesconto: 25,
      comissaoEspecifica: 2,
      minimoGarantido: 3000
    },
    createdAt: '2024-02-01T10:00:00Z'
  },
  {
    id: '3',
    nome: 'Carlos Alberto Medeiros',
    email: 'carlos@fluyt.com.br',
    telefone: '(11) 99999-1234',
    setor: 'Medição',
    lojaId: '2',
    loja: 'Fluyt Filial Santos',
    salario: 2800,
    comissao: 0,
    dataAdmissao: '2024-02-10',
    ativo: true,
    nivelAcesso: 'USUARIO',
    tipoFuncionario: 'MEDIDOR',
    performance: 92,
    configuracoes: {
      valorMedicao: 150
    },
    createdAt: '2024-02-10T10:00:00Z'
  }
];