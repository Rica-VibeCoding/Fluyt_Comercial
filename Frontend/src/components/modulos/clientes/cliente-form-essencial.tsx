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
import { UseFormReturn } from 'react-hook-form';

interface ClienteFormEssencialProps {
  form: UseFormReturn<any>;
}

export function ClienteFormEssencial({ form }: ClienteFormEssencialProps) {
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