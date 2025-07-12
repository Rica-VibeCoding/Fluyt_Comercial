import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { UseFormReturn } from 'react-hook-form';
import { Cliente } from '../../../types/cliente';

interface ClienteFormEssencialProps {
  form: UseFormReturn<any>;
  cliente?: Cliente | null;
}

export function ClienteFormEssencial({ form, cliente }: ClienteFormEssencialProps) {
  // Mapeamento dos status com cores
  const statusMap: Record<string, { nome: string; cor: string; bgColor: string }> = {
    'dd03cda8-35a9-42fa-b783-8d9c9875e687': { 
      nome: 'Cadastrado', 
      cor: 'text-blue-600', 
      bgColor: 'bg-blue-50'
    },
    'ec43d8ce-17ac-41df-bb05-d60afff16d0f': { 
      nome: 'Ambiente Importado', 
      cor: 'text-purple-600', 
      bgColor: 'bg-purple-50'
    },
    '66941429-9249-407a-bb01-909a220c6029': { 
      nome: 'Orçamento', 
      cor: 'text-orange-600', 
      bgColor: 'bg-orange-50'
    },
    '99402de7-10b5-46c6-ab1e-cae86950f5cf': { 
      nome: 'Negociação', 
      cor: 'text-yellow-600', 
      bgColor: 'bg-yellow-50'
    },
    'ecc16853-fd4f-42d9-b957-d3f176fe23a5': { 
      nome: 'Fechado', 
      cor: 'text-green-600', 
      bgColor: 'bg-green-50'
    }
  };
  
  const getStatusDisplay = () => {
    if (!cliente?.status_id) return null;
    return statusMap[cliente.status_id] || { nome: 'Cadastrado', cor: 'text-blue-600', bgColor: 'bg-blue-50' };
  };
  const formatarCPFCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 11) {
      // CPF
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      // CNPJ
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  const formatarTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  return (
    <div className="space-y-1">
      {/* Exibir status atual se for edição */}
      {cliente && getStatusDisplay() && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Status Atual:</span>
            <Badge 
              className={`${getStatusDisplay()!.bgColor} ${getStatusDisplay()!.cor} border-0 font-medium`}
            >
              {getStatusDisplay()!.nome}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            O status é atualizado automaticamente conforme o progresso do cliente no sistema
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel className="text-xs font-medium text-slate-700">Nome Completo *</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome completo" className="h-8 text-sm border-slate-300 focus:border-slate-400" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cpf_cnpj"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-slate-700">CPF/CNPJ</FormLabel>
              <FormControl>
                <Input 
                  placeholder="000.000.000-00"
                  className="h-8 text-sm border-slate-300 focus:border-slate-400"
                  {...field}
                  onChange={(e) => {
                    const formatted = formatarCPFCNPJ(e.target.value);
                    field.onChange(formatted);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rg_ie"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-slate-700">RG/IE</FormLabel>
              <FormControl>
                <Input placeholder="12.345.678-9" className="h-8 text-sm border-slate-300 focus:border-slate-400" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-slate-700">Email</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="exemplo@email.com" 
                  className="h-8 text-sm border-slate-300 focus:border-slate-400"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="telefone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-slate-700">Telefone</FormLabel>
              <FormControl>
                <Input 
                  placeholder="(11) 99999-9999"
                  className="h-8 text-sm border-slate-300 focus:border-slate-400"
                  {...field}
                  onChange={(e) => {
                    const formatted = formatarTelefone(e.target.value);
                    field.onChange(formatted);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tipo_venda"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel className="text-xs font-medium text-slate-700">Tipo de Venda *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-8 text-sm border-slate-300 focus:border-slate-400">
                    <SelectValue placeholder="Selecione o tipo de venda" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="FUTURA">Futura</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription className="text-xs text-slate-500">
                Normal: venda imediata. Futura: venda programada para o futuro.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}