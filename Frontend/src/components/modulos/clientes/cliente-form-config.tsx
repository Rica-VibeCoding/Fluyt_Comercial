import {
  FormControl,
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
import { Textarea } from '../../ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { Vendedor } from '../../../types/cliente';
import { useProcedencias } from '../../../hooks/data/use-procedencias';
import { useUsuarioLogado } from '../../../hooks/globais/use-usuario-logado';
import { useEffect } from 'react';

interface ClienteFormConfigProps {
  form: UseFormReturn<any>;
  vendedores: Vendedor[];
}

export function ClienteFormConfig({ form, vendedores }: ClienteFormConfigProps) {
  const { procedencias, isLoading: loadingProcedencias } = useProcedencias();
  
  // PROTEÇÃO: Hook sempre executa, mas só usa dados se estivermos no painel
  const { usuarioId, isVendedor, nome } = useUsuarioLogado();
  const isInPainel = typeof window !== 'undefined' && window.location.pathname.startsWith('/painel');

  // Auto-preencher vendedor com usuário logado se for vendedor e campo estiver vazio
  useEffect(() => {
    // PROTEÇÃO: Só executar se estivermos no painel
    if (!isInPainel) return;
    
    const vendedorAtual = form.getValues('vendedor_id');
    
    // Se campo vendedor está vazio E usuário é vendedor E usuário está na lista de vendedores
    if (!vendedorAtual && isVendedor && usuarioId) {
      const usuarioNaLista = vendedores.find(v => v.id === usuarioId);
      
      if (usuarioNaLista) {
        form.setValue('vendedor_id', usuarioId);
        console.log(`✅ Auto-preenchido vendedor: ${nome} (${usuarioId})`);
      }
    }
  }, [form, isVendedor, usuarioId, vendedores, nome, isInPainel]);
  
  return (
    <div className="space-y-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
        <FormField
          control={form.control}
          name="procedencia_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-slate-700">Procedência</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={loadingProcedencias}
              >
                <FormControl>
                  <SelectTrigger className="h-8 text-sm border-slate-300 focus:border-slate-400">
                    <SelectValue placeholder={loadingProcedencias ? "Carregando..." : "Como conheceu?"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {procedencias.map(proc => (
                    <SelectItem key={proc.id} value={proc.id}>
                      {proc.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vendedor_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-slate-700">Vendedor Responsável</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-8 text-sm border-slate-300 focus:border-slate-400">
                    <SelectValue placeholder="Selecione o vendedor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {vendedores.map(vendedor => (
                    <SelectItem key={vendedor.id} value={vendedor.id}>
                      {vendedor.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="observacoes"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel className="text-xs font-medium text-slate-700">Observações</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Observações adicionais sobre o cliente..."
                  className="min-h-[60px] text-sm border-slate-300 focus:border-slate-400"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}