import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, DollarSign, Search, Filter } from 'lucide-react';
import { useComissoes } from '@/hooks/modulos/sistema/use-comissoes';
import { ComissaoTable } from './comissao-table';
import type { RegraComissaoFormData } from '@/types/sistema';
import { useForm } from 'react-hook-form';

export function GestaoComissoes() {
  const {
    regrasComissao,
    loading,
    estatisticas,
    criarRegraComissao,
    atualizarRegraComissao,
    excluirRegraComissao,
    buscarRegras
  } = useComissoes();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRegra, setEditingRegra] = useState<any>(null);
  const [termoBusca, setTermoBusca] = useState('');

  const form = useForm<RegraComissaoFormData>({
    defaultValues: {
      tipo: 'VENDEDOR',
      valorMinimo: 0,
      valorMaximo: null,
      percentual: 0
    }
  });

  // Filtrar regras baseado na busca
  const regrasFiltradas = termoBusca ? buscarRegras(termoBusca) : regrasComissao;

  const handleSubmit = async (data: RegraComissaoFormData) => {
    let sucesso = false;
    if (editingRegra) {
      sucesso = await atualizarRegraComissao(editingRegra.id, data);
    } else {
      sucesso = await criarRegraComissao(data);
    }

    if (sucesso) {
      handleCloseDialog();
    }
  };

  const handleEdit = (regra: any) => {
    setEditingRegra(regra);
    form.reset({
      tipo: regra.tipo,
      valorMinimo: regra.valorMinimo,
      valorMaximo: regra.valorMaximo,
      percentual: regra.percentual,
      descricao: regra.descricao
    });
    setIsDialogOpen(true);
  };

  const handleNewRegra = () => {
    setEditingRegra(null);
    form.reset({
      tipo: 'VENDEDOR',
      valorMinimo: 0,
      valorMaximo: null,
      percentual: 0
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingRegra(null);
    form.reset({
      tipo: 'VENDEDOR',
      valorMinimo: 0,
      valorMaximo: null,
      percentual: 0
    });
  };

  return (
    <div className="space-y-3">
      {/* Header de Ações - Buscador + Nova Regra na mesma linha */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        {/* Buscador */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar regras por tipo, percentual ou descrição..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="pl-10 h-10 border-gray-200 focus:border-slate-400 focus:ring-slate-400 bg-white shadow-sm"
          />
        </div>

        {/* Botão Nova Regra */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleNewRegra} 
              className="gap-1.5 h-8 px-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg font-medium text-white text-xs"
            >
              <DollarSign className="h-3.5 w-3.5" />
              Nova Regra
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl h-[70vh] flex flex-col bg-white dark:bg-slate-900">
            <DialogHeader className="border-b border-slate-200 dark:border-slate-700 p-2 pb-1">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                  <DollarSign className="h-3 w-3 text-slate-500" />
                </div>
                <DialogTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {editingRegra ? 'Editar Regra de Comissão' : 'Nova Regra de Comissão'}
                </DialogTitle>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-hidden">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto p-2">
                    <div className="space-y-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                        <FormField
                          control={form.control}
                          name="tipo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium text-slate-700">Tipo de Funcionário *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-8 text-sm border-slate-300 focus:border-slate-400">
                                    <SelectValue placeholder="Selecione o tipo" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="VENDEDOR">Vendedor</SelectItem>
                                  <SelectItem value="GERENTE">Gerente</SelectItem>
                                  <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="percentual"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium text-slate-700">Percentual (%) *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                  placeholder="5.0" 
                                  className="h-8 text-sm border-slate-300 focus:border-slate-400" 
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="valorMinimo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium text-slate-700">Valor Mínimo (R$) *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="1000.00" 
                                  className="h-8 text-sm border-slate-300 focus:border-slate-400" 
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="valorMaximo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium text-slate-700">Valor Máximo (R$)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="10000.00 (opcional)" 
                                  className="h-8 text-sm border-slate-300 focus:border-slate-400" 
                                  {...field}
                                  value={field.value || ''}
                                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                />
                              </FormControl>
                              <FormDescription className="text-xs text-slate-500">
                                Deixe vazio para sem limite máximo
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="descricao"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel className="text-xs font-medium text-slate-700">Descrição</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Descrição da regra de comissão..."
                                  className="min-h-[60px] text-sm border-slate-300 focus:border-slate-400"
                                  {...field}
                                  value={field.value || ''}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 pt-1">
                    <div className="flex justify-end items-center gap-1">
                      <button 
                        type="button" 
                        onClick={handleCloseDialog}
                        className="px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                        disabled={loading}
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit"
                        disabled={loading}
                        className="px-4 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium border border-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                            Salvando...
                          </div>
                        ) : editingRegra ? 'Atualizar Regra' : 'Salvar Regra'}
                      </button>
                    </div>
                  </div>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela de Regras */}
      <ComissaoTable
        regras={regrasFiltradas}
        onEdit={handleEdit}
        onDelete={excluirRegraComissao}
        loading={loading}
      />
    </div>
  );
}