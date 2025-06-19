import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Plus, Layers, Search, Filter } from 'lucide-react';
import { useSetores } from '@/hooks/modulos/sistema/use-setores';
import { SetorTable } from './setor-table';
import type { SetorFormData } from '@/types/sistema';
import { useForm } from 'react-hook-form';

export function GestaoSetores() {
  const {
    setores,
    loading,
    estatisticas,
    criarSetor,
    atualizarSetor,
    excluirSetor,
    buscarSetores
  } = useSetores();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSetor, setEditingSetor] = useState<any>(null);
  const [termoBusca, setTermoBusca] = useState('');

  const form = useForm<SetorFormData>({
    defaultValues: {
      nome: ''
    }
  });

  // Filtrar setores baseado na busca
  const setoresFiltrados = termoBusca ? buscarSetores(termoBusca) : setores;

  const handleSubmit = async (data: SetorFormData) => {
    let sucesso = false;
    if (editingSetor) {
      sucesso = await atualizarSetor(editingSetor.id, data);
    } else {
      sucesso = await criarSetor(data);
    }

    if (sucesso) {
      handleCloseDialog();
    }
  };

  const handleEdit = (setor: any) => {
    setEditingSetor(setor);
    form.reset({
      nome: setor.nome
    });
    setIsDialogOpen(true);
  };

  const handleNewSetor = () => {
    setEditingSetor(null);
    form.reset({
      nome: ''
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSetor(null);
    form.reset({
      nome: ''
    });
  };

  return (
    <div className="space-y-3">
      {/* Header de Ações - Buscador + Novo Setor na mesma linha */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        {/* Buscador */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar setores por nome..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="pl-10 h-10 border-gray-200 focus:border-slate-400 focus:ring-slate-400 bg-white shadow-sm"
          />
        </div>

        {/* Botão Novo Setor */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleNewSetor}
              className="gap-1.5 h-8 px-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg font-medium text-white text-xs"
            >
              <Layers className="h-3.5 w-3.5" />
              Novo Setor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl h-[70vh] flex flex-col bg-white dark:bg-slate-900">
            <DialogHeader className="border-b border-slate-200 dark:border-slate-700 p-2 pb-1">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                  <Layers className="h-3 w-3 text-slate-500" />
                </div>
                <DialogTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {editingSetor ? 'Editar Setor' : 'Novo Setor'}
                </DialogTitle>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-hidden">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto p-2">
                    <div className="space-y-1">
                      <div className="grid grid-cols-1 gap-1">
                        <FormField
                          control={form.control}
                          name="nome"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium text-slate-700">Nome do Setor *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Digite o nome do setor" 
                                  className="h-8 text-sm border-slate-300 focus:border-slate-400" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Campo descrição removido - estrutura Supabase só tem nome */}
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
                        ) : editingSetor ? 'Atualizar Setor' : 'Salvar Setor'}
                      </button>
                    </div>
                  </div>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela de Setores */}
      <SetorTable
        setores={setoresFiltrados}
        onEdit={handleEdit}
        onDelete={excluirSetor}
        loading={loading}
      />
    </div>
  );
}