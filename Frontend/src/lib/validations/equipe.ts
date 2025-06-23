import { z } from 'zod';

// Schema de validação para funcionário
export const funcionarioSchema = z.object({
  nome: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo'),
    
  email: z.string()
    .email('Email inválido')
    .min(5, 'Email muito curto'),
    
  telefone: z.string()
    .min(10, 'Telefone inválido')
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Formato inválido. Use: (11) 99999-9999'),
    
  tipoFuncionario: z.enum(['VENDEDOR', 'GERENTE', 'MEDIDOR', 'ADMIN_MASTER'], {
    required_error: 'Selecione o tipo de funcionário',
  }),
  
  nivelAcesso: z.enum(['USUARIO', 'SUPERVISOR', 'GERENTE', 'ADMIN'], {
    required_error: 'Selecione o nível de acesso',
  }),
  
  lojaId: z.string()
    .uuid('Selecione uma loja válida'),
    
  setorId: z.string()
    .optional()
    .nullable()
    .refine((val) => !val || val === '' || /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val), {
      message: 'Selecione um setor válido'
    }),
    
  salario: z.number()
    .min(0, 'Salário não pode ser negativo')
    .max(999999, 'Salário muito alto'),
    
  comissao: z.number()
    .min(0, 'Comissão não pode ser negativa')
    .max(100, 'Comissão não pode exceder 100%'),
    
  dataAdmissao: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
    
  configuracoes: z.object({
    limiteDesconto: z.number().min(0).max(100).optional(),
    valorMedicao: z.number().min(0).optional(),
    minimoGarantido: z.number().min(0).optional(),
  }).optional(),
});

// Validação condicional baseada no tipo
export const funcionarioSchemaCompleto = funcionarioSchema.refine(
  (data) => {
    // Se for medidor, valor por medição é obrigatório
    if (data.tipoFuncionario === 'MEDIDOR') {
      return data.configuracoes?.valorMedicao !== undefined && data.configuracoes.valorMedicao > 0;
    }
    return true;
  },
  {
    message: 'Valor por medição é obrigatório para medidores',
    path: ['configuracoes', 'valorMedicao'],
  }
);

export type FuncionarioFormData = z.infer<typeof funcionarioSchema>;