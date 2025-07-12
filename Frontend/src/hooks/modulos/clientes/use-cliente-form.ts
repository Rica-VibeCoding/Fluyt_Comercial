import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMemo } from 'react';
import { ESTADOS_BRASIL } from '../../../types/cliente';

// Schema foi mantido como estava, validando a estrutura dos dados
const clienteSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cpf_cnpj: z.string().optional(),
  rg_ie: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
  telefone: z.string().optional(),
  tipo_venda: z.enum(['NORMAL', 'FUTURA']),
  cep: z.string().optional(),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  uf: z.enum([...ESTADOS_BRASIL, '']).optional(),
  procedencia_id: z.string().optional(),
  vendedor_id: z.string().optional(),
  observacoes: z.string().optional()
});

type ClienteFormData = z.infer<typeof clienteSchema>;

interface UseClienteFormProps {
  // O hook agora recebe os valores iniciais diretamente
  valoresIniciais: Partial<ClienteFormData>;
  onSalvar: (dados: any) => Promise<void>;
}

export function useClienteForm({ valoresIniciais, onSalvar }: UseClienteFormProps) {
  const form = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    // O formulário é inicializado com os valores recebidos
    defaultValues: valoresIniciais
  });

  // A lógica complexa de useEffect foi REMOVIDA.
  // A responsabilidade de fornecer os valores corretos agora é do componente pai.

  // O cálculo das abas preenchidas foi mantido como estava
  const abasPreenchidas = useMemo(() => {
    const values = form.watch();
    let preenchidas = 0;

    if (values.nome) {
      preenchidas++;
    }
    if (values.cidade || values.cep || values.logradouro) {
      preenchidas++;
    }
    if (values.procedencia_id || values.vendedor_id) {
      preenchidas++;
    }
    return preenchidas;
  }, [form.watch()]);

  const onSubmit = async (data: ClienteFormData) => {
    try {
      await onSalvar(data);
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
    }
  };

  return {
    form,
    onSubmit,
    abasPreenchidas
  };
}