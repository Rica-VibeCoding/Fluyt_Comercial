import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Flag, Search, Filter } from 'lucide-react';
// import { useStatusOrcamento } from '@/hooks/modulos/sistema/use-status-orcamento';
// import { StatusTable } from './status-table';
// import type { StatusFormData } from '@/types/sistema';
import { useForm } from 'react-hook-form';

// Temporary type definition
interface StatusFormData {
  nome: string;
  cor: string;
  descricao?: string;
  ordem: number;
  ativo: boolean;
}

export function GestaoStatus() {
  // TODO: Implementar hook use-status-orcamento
  const statusList = [];
  const loading = false;
  const estatisticas = { total: 0, ativos: 0, inativos: 0 };
  const criarStatus = async (data: StatusFormData) => false;
  const atualizarStatus = async (id: string, data: StatusFormData) => false;
  const alternarStatusStatus = async (id: string) => {};
  const excluirStatus = async (id: string) => false;
  const buscarStatus = (termo: string) => [];

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<any>(null);
  const [termoBusca, setTermoBusca] = useState('');

  const form = useForm<StatusFormData>({
    defaultValues: {
      nome: '',
      cor: '#3B82F6',
      descricao: '',
      ordem: 1,
      ativo: true
    }
  });

  // Filtrar status baseado na busca
  const statusFiltrados = termoBusca ? buscarStatus(termoBusca) : statusList;

  const handleSubmit = async (data: StatusFormData) => {
    let sucesso = false;
    if (editingStatus) {
      sucesso = await atualizarStatus(editingStatus.id, data);
    } else {
      sucesso = await criarStatus(data);
    }

    if (sucesso) {
      handleCloseDialog();
    }
  };

  const handleEdit = (status: any) => {
    setEditingStatus(status);
    form.reset({
      nome: status.nome,
      cor: status.cor,
      descricao: status.descricao,
      ordem: status.ordem,
      ativo: status.ativo
    });
    setIsDialogOpen(true);
  };

  const handleNewStatus = () => {
    setEditingStatus(null);
    form.reset({
      nome: '',
      cor: '#3B82F6',
      descricao: '',
      ordem: 1,
      ativo: true
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingStatus(null);
    form.reset({
      nome: '',
      cor: '#3B82F6',
      descricao: '',
      ordem: 1,
      ativo: true
    });
  };

  const coresPreDefinidas = [
    { nome: 'Azul', valor: '#3B82F6' },
    { nome: 'Verde', valor: '#10B981' },
    { nome: 'Amarelo', valor: '#F59E0B' },
    { nome: 'Vermelho', valor: '#EF4444' },
    { nome: 'Roxo', valor: '#8B5CF6' },
    { nome: 'Rosa', valor: '#EC4899' },
    { nome: 'Indigo', valor: '#6366F1' },
    { nome: 'Cinza', valor: '#6B7280' }
  ];

  return (
    <div className="space-y-3">
      {/* Header de Ações - Buscador + Novo Status na mesma linha */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        {/* Buscador */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar status por nome ou descrição..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="pl-10 h-10 border-gray-200 focus:border-slate-400 focus:ring-slate-400 bg-white shadow-sm"
          />
        </div>

        {/* Botão Novo Status */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleNewStatus}
              className="gap-1.5 h-8 px-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg font-medium text-white text-xs"
            >
              <Flag className="h-3.5 w-3.5" />
              Novo Status
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl h-[70vh] flex flex-col bg-white dark:bg-slate-900">
            <DialogHeader className="border-b border-slate-200 dark:border-slate-700 p-2 pb-1">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                  <Flag className="h-3 w-3 text-slate-500" />
                </div>
                <DialogTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {editingStatus ? 'Editar Status' : 'Novo Status'}
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
                          name="nome"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel className="text-xs font-medium text-slate-700">Nome do Status *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Digite o nome do status" 
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
                          name="cor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium text-slate-700">Cor *</FormLabel>
                              <FormControl>
                                <div className="flex gap-1">
                                  <Input 
                                    type="color"
                                    className="w-12 h-8 p-1 border-slate-300 rounded"
                                    {...field}
                                  />
                                  <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className="h-8 text-sm border-slate-300 focus:border-slate-400 flex-1">
                                      <SelectValue placeholder="Cores predefinidas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {coresPreDefinidas.map((cor) => (
                                        <SelectItem key={cor.valor} value={cor.valor}>
                                          <div className="flex items-center gap-2">
                                            <div 
                                              className="w-4 h-4 rounded border border-slate-300"
                                              style={{ backgroundColor: cor.valor }}
                                            />
                                            {cor.nome}
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="ordem"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium text-slate-700">Ordem de Exibição</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  min="1"
                                  placeholder="1" 
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
                          name="descricao"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel className="text-xs font-medium text-slate-700">Descrição</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Descrição do status (opcional)..."
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
                        ) : editingStatus ? 'Atualizar Status' : 'Salvar Status'}
                      </button>
                    </div>
                  </div>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela de Status */}
      {/* TODO: Implementar StatusTable */}
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <p className="text-slate-500">Status Orçamento - Em desenvolvimento</p>
      </div>
    </div>
  );
} 