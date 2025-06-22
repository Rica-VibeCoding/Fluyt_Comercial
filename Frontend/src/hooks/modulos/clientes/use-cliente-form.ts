import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useMemo } from 'react';
import { Cliente, Vendedor, PROCEDENCIAS_PADRAO, ESTADOS_BRASIL } from '../../../types/cliente';

// Schema ajustado: APENAS NOME OBRIGATÓRIO
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
      uf: '',
      procedencia_id: '',
      vendedor_id: '',
      observacoes: ''
    }
  });

  // Preencher form ao editar cliente
  useEffect(() => {
    if (cliente) {
      form.reset({
        nome: cliente.nome,
        cpf_cnpj: cliente.cpf_cnpj || '',
        rg_ie: cliente.rg_ie || '',
        email: cliente.email || '',
        telefone: cliente.telefone || '',
        tipo_venda: cliente.tipo_venda,
        cep: cliente.cep || '',
        logradouro: cliente.logradouro || '',
        numero: cliente.numero || '',
        complemento: cliente.complemento || '',
        bairro: cliente.bairro || '',
        cidade: cliente.cidade || '',
        uf: (cliente.uf || '') as any,
        procedencia_id: cliente.procedencia_id || '',
        vendedor_id: cliente.vendedor_id || '',
        observacoes: cliente.observacoes || ''
      });
    }
  }, [cliente, form]);

  // Calcular abas preenchidas - agora com critérios mais flexíveis
  const abasPreenchidas = useMemo(() => {
    const values = form.watch();
    let preenchidas = 0;

    // Aba Essencial - apenas nome obrigatório
    if (values.nome) {
      preenchidas++;
    }

    // Aba Endereço - considera preenchida se tem pelo menos cidade
    if (values.cidade || values.cep || values.logradouro) {
      preenchidas++;
    }

    // Aba Config - considera preenchida se tem procedência ou vendedor
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