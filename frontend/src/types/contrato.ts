export interface Cliente {
  nome: string;
  cpf: string;
  endereco: string;
  telefone: string;
  email: string;
}

export interface Ambiente {
  nome: string;
  valor: number;
  descricao: string;
  categoria: string;
}

export interface Loja {
  nome: string;
  cnpj: string;
  endereco: string;
  telefone: string;
  email: string;
}

// ✅ FASE 2: Interfaces expandidas para dados avançados
export interface FormaPagamentoContrato {
  tipo: 'a-vista' | 'boleto' | 'cartao' | 'financeira';
  valor: number;
  valorPresente: number;
  parcelas?: number;
  dados: any; // dados específicos editáveis
  descricao: string; // descrição formatada para exibição
}

export interface CronogramaItem {
  numero: number;
  tipo: string;
  valor: number;
  valorPresente: number;
  data: string;
  observacoes?: string;
}

export interface DadosFinanceiros {
  valorNegociado: number;
  valorPresenteTotal: number;
  descontoReal: number;
  taxaDesconto: number;
}

export interface ContratoData {
  numero: string;
  cliente: Cliente;
  ambientes: Ambiente[];
  valor_total: number;
  desconto: number;
  valor_final: number;
  prazo_entrega: string;
  condicoes: string;
  vendedor: string;
  gerente: string;
  loja: Loja;
  data_criacao: string;
  status: 'RASCUNHO' | 'PRONTO' | 'ENVIADO' | 'ASSINADO';
  
  // ✅ FASE 2: Dados avançados preservados
  formasPagamento?: FormaPagamentoContrato[];
  cronogramaPagamentos?: CronogramaItem[];
  dadosFinanceiros?: DadosFinanceiros;
}

export const contratoMock: ContratoData = {
  numero: "2025-001",
  cliente: {
    nome: "João Silva Santos",
    cpf: "123.456.789-00",
    endereco: "Rua das Flores, 123, Centro - São Paulo/SP, CEP: 01234-567",
    telefone: "(11) 99999-9999",
    email: "joao.silva@email.com"
  },
  ambientes: [
    {
      nome: "Cozinha Planejada",
      valor: 15000,
      descricao: "Cozinha completa com bancada em mármore e armários modulares em MDF",
      categoria: "Cozinha"
    },
    {
      nome: "Dormitório Master",
      valor: 12000,
      descricao: "Quarto com guarda-roupa planejado, cabeceira e criados-mudos",
      categoria: "Dormitório"
    },
    {
      nome: "Banheiro Social",
      valor: 8000,
      descricao: "Banheiro com móveis planejados e acabamentos de primeira linha",
      categoria: "Banheiro"
    }
  ],
  valor_total: 35000,
  desconto: 0.1, // 10%
  valor_final: 31500,
  prazo_entrega: "60 dias úteis",
  condicoes: "50% na assinatura do contrato, 50% na entrega",
  vendedor: "Ana Costa",
  gerente: "Carlos Mendes",
  loja: {
    nome: "Fluyt Móveis Planejados Ltda",
    cnpj: "12.345.678/0001-90",
    endereco: "Av. Paulista, 1000, Bela Vista - São Paulo/SP, CEP: 01310-100",
    telefone: "(11) 3333-4444",
    email: "contato@fluyt.com.br"
  },
  data_criacao: "2024-12-01",
  status: "RASCUNHO"
};