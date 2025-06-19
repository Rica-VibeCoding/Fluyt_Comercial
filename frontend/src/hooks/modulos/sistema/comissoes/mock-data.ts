import type { RegraComissao } from '@/types/sistema';

// Mock data para desenvolvimento
export const mockRegrasComissao: RegraComissao[] = [
  {
    id: '1',
    tipo: 'VENDEDOR',
    ordem: 1,
    valorMinimo: 0,
    valorMaximo: 50000,
    percentual: 2.5,
    ativo: true,
    descricao: 'Comissão básica para vendas até R$ 50.000',
    createdAt: '2024-01-10T10:00:00Z'
  },
  {
    id: '2',
    tipo: 'VENDEDOR',
    ordem: 2,
    valorMinimo: 50001,
    valorMaximo: 100000,
    percentual: 3.0,
    ativo: true,
    descricao: 'Comissão intermediária para vendas de R$ 50.001 a R$ 100.000',
    createdAt: '2024-01-10T10:00:00Z'
  },
  {
    id: '3',
    tipo: 'VENDEDOR',
    ordem: 3,
    valorMinimo: 100001,
    valorMaximo: null,
    percentual: 3.5,
    ativo: true,
    descricao: 'Comissão premium para vendas acima de R$ 100.000',
    createdAt: '2024-01-10T10:00:00Z'
  },
  {
    id: '4',
    tipo: 'GERENTE',
    ordem: 1,
    valorMinimo: 0,
    valorMaximo: 200000,
    percentual: 1.5,
    ativo: true,
    descricao: 'Comissão de gerência para vendas da equipe até R$ 200.000',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '5',
    tipo: 'GERENTE',
    ordem: 2,
    valorMinimo: 200001,
    valorMaximo: null,
    percentual: 2.0,
    ativo: true,
    descricao: 'Comissão de gerência para vendas da equipe acima de R$ 200.000',
    createdAt: '2024-01-15T10:00:00Z'
  }
];