import type { Loja } from '@/types/sistema';

// Mock data para desenvolvimento - ALINHADO COM SUPABASE
export const mockLojas: Loja[] = [
  {
    id: '1',
    nome: 'Fluyt São Paulo - Centro',
    endereco: 'Av. Paulista, 1000 - Centro, São Paulo/SP',
    telefone: '(11) 98765-4321',
    email: 'centro@fluyt.com.br',
    empresa_id: '1',
    gerente_id: 'gerente-1-uuid',
    ativo: true,
    createdAt: '2020-01-15T10:00:00Z',
    updatedAt: '2020-01-15T10:00:00Z',
    
    // Campos calculados/relacionados
    empresa: 'Fluyt Móveis & Design',
    gerente: 'Maria Silva'
  },
  {
    id: '2',
    nome: 'Fluyt Santos - Centro',
    endereco: 'Rua do Comércio, 500 - Centro, Santos/SP',
    telefone: '(13) 3456-7890',
    email: 'santos@fluyt.com.br',
    empresa_id: '2',
    gerente_id: 'gerente-2-uuid',
    ativo: true,
    createdAt: '2022-06-10T10:00:00Z',
    updatedAt: '2022-06-10T10:00:00Z',
    
    // Campos calculados/relacionados
    empresa: 'Fluyt Filial Santos',
    gerente: 'João Santos'
  },
  {
    id: '3',
    nome: 'Fluyt ABC - Shopping',
    endereco: 'Shopping ABC - Santo André/SP',
    telefone: '(11) 2345-6789',
    email: 'abc@fluyt.com.br',
    empresa_id: '1',
    gerente_id: 'gerente-3-uuid',
    ativo: false,
    createdAt: '2023-03-20T10:00:00Z',
    updatedAt: '2023-03-20T10:00:00Z',
    
    // Campos calculados/relacionados
    empresa: 'Fluyt Móveis & Design',
    gerente: 'Ana Costa'
  },
  {
    id: '4',
    nome: 'Fluyt Campinas - Norte',
    endereco: 'Av. Norte, 2000 - Campinas/SP',
    telefone: '(19) 9876-5432',
    email: 'campinas@fluyt.com.br',
    empresa_id: '3',
    gerente_id: 'gerente-4-uuid',
    ativo: true,
    createdAt: '2021-08-15T10:00:00Z',
    updatedAt: '2021-08-15T10:00:00Z',
    
    // Campos calculados/relacionados
    empresa: 'Fluyt Norte',
    gerente: 'Pedro Lima'
  },
  {
    id: '5',
    nome: 'Fluyt Sorocaba - Centro',
    endereco: 'Rua Central, 800 - Sorocaba/SP',
    telefone: '(15) 3333-4444',
    email: 'sorocaba@fluyt.com.br',
    empresa_id: '2',
    gerente_id: 'gerente-5-uuid',
    ativo: true,
    createdAt: '2023-01-10T10:00:00Z',
    updatedAt: '2023-01-10T10:00:00Z',
    
    // Campos calculados/relacionados
    empresa: 'Fluyt Filial Santos',
    gerente: 'Carla Mendes'
  }
];