import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useMemo } from 'react';
import { Cliente, Vendedor, PROCEDENCIAS_PADRAO, ESTADOS_BRASIL } from '../../../types/cliente';

const clienteSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cpf_cnpj: z.string().min(11, 'CPF/CNPJ é obrigatório'),
  rg_ie: z.string().min(1, 'RG/IE é obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  tipo_venda: z.enum(['NORMAL', 'FUTURA']),
  cep: z.string().min(8, 'CEP é obrigatório'),
  logradouro: z.string().min(1, 'Logradouro é obrigatório'),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  uf: z.enum(ESTADOS_BRASIL),
  procedencia: z.string().min(1, 'Procedência é obrigatória'),
  vendedor_id: z.string().min(1, 'Vendedor é obrigatório'),
  observacoes: z.string().optional()
});

type ClienteFormData = z.infer<typeof clienteSchema>;

interface UseClienteFormProps {
  cliente?: Cliente | null;
  vendedores: Vendedor[];
  onSalvar: (dados: any) => Promise<void>;
  onFechar: () => void;
}

export function useClienteForm({ cliente, vendedores, onSalvar, onFechar }: UseClienteFormProps) {
  const form = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nome: '',
      cpf_cnpj: '',
      rg_ie: '',
      email: '',
      telefone: '',
      tipo_venda: 'NORMAL',
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: 'SP',
      procedencia: '',
      vendedor_id: '',
      observacoes: ''
    }
  });

  // Preencher form ao editar cliente
  useEffect(() => {
    if (cliente) {
      form.reset({
        nome: cliente.nome,
        cpf_cnpj: cliente.cpf_cnpj,
        rg_ie: cliente.rg_ie,
        email: cliente.email || '',
        telefone: cliente.telefone,
        tipo_venda: cliente.tipo_venda,
        cep: cliente.cep,
        logradouro: cliente.logradouro,
        numero: cliente.numero || '',
        complemento: cliente.complemento || '',
        bairro: cliente.bairro,
        cidade: cliente.cidade,
        uf: cliente.uf as any,
        procedencia: cliente.procedencia,
        vendedor_id: cliente.vendedor_id,
        observacoes: cliente.observacoes || ''
      });
    }
  }, [cliente, form]);

  // Calcular abas preenchidas
  const abasPreenchidas = useMemo(() => {
    const values = form.watch();
    let preenchidas = 0;

    // Aba Essencial
    if (values.nome && values.cpf_cnpj && values.rg_ie && values.telefone && values.tipo_venda) {
      preenchidas++;
    }

    // Aba Endereço
    if (values.cep && values.logradouro && values.bairro && values.cidade && values.uf) {
      preenchidas++;
    }

    // Aba Config
    if (values.procedencia && values.vendedor_id) {
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