"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { UserCog, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { TipoColaboradorTable } from './tipo-colaborador-table';
import { useTiposColaboradores } from '@/hooks/modulos/sistema/use-tipos-colaboradores';
import { TipoColaborador, TipoColaboradorFormData, CATEGORIAS_COLABORADOR, TIPOS_PERCENTUAL } from '@/types/colaboradores';

export function GestaoTiposColaboradores() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoColaborador | undefined>();

  const {
    tipos,
    loading,
    filtros,
    setFiltros,
    criarTipo,
    atualizarTipo,
    alternarStatusTipo,
    excluirTipo,
    formLoading
  } = useTiposColaboradores();

  const form = useForm<TipoColaboradorFormData>({
    defaultValues: {
      nome: '',
      categoria: 'FUNCIONARIO',
      tipoPercentual: 'VENDA',
      percentualValor: 0,
      minimoGarantido: 0,
      salarioBase: 0,
      valorPorServico: 0,
      opcionalNoOrcamento: false,
      descricao: ''
    }
  });

  const handleOpenForm = () => {
    setEditingTipo(undefined);
    form.reset({
      nome: '',
      categoria: 'FUNCIONARIO',
      tipoPercentual: 'VENDA',
      percentualValor: 0,
      minimoGarantido: 0,
      salarioBase: 0,
      valorPorServico: 0,
      opcionalNoOrcamento: false,
      descricao: ''
    });
    setIsDialogOpen(true);
  };

  const handleEditTipo = (tipo: TipoColaborador) => {
    setEditingTipo(tipo);
    form.reset({
      nome: tipo.nome,
      categoria: tipo.categoria,
      tipoPercentual: tipo.tipoPercentual,
      percentualValor: tipo.percentualValor,
      minimoGarantido: tipo.minimoGarantido,
      salarioBase: tipo.salarioBase,
      valorPorServico: tipo.valorPorServico,
      opcionalNoOrcamento: tipo.opcionalNoOrcamento,
      descricao: tipo.descricao || ''
    });
    setIsDialogOpen(true);
  };

  const handleCloseForm = () => {
    setIsDialogOpen(false);
    setEditingTipo(undefined);
    form.reset();
  };

  // Validação customizada para pelo menos uma base de pagamento
  const validatePaymentBase = (data: TipoColaboradorFormData) => {
    const hasPaymentBase = data.percentualValor > 0 || data.salarioBase > 0 || data.valorPorServico > 0 || data.minimoGarantido > 0;
    return hasPaymentBase;
  };

  const handleSubmitForm = async (data: TipoColaboradorFormData) => {
    // Validar se tem pelo menos uma base de pagamento
    if (!validatePaymentBase(data)) {
      form.setError('root', {
        message: 'É obrigatório definir pelo menos uma base de pagamento (Percentual, Salário Base, Valor por Serviço ou Mínimo Garantido)'
      });
      return;
    }

    try {
      if (editingTipo) {
        await atualizarTipo(editingTipo.id, data);
      } else {
        await criarTipo(data);
      }
      handleCloseForm();
    } catch (error) {
      // Erro já tratado nos hooks
      console.error('Erro ao salvar tipo:', error);
    }
  };

  const handleDeleteTipo = async (id: string) => {
    try {
      await excluirTipo(id);
    } catch (error) {
      // Erro já tratado nos hooks
      console.error('Erro ao excluir tipo:', error);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await alternarStatusTipo(id);
    } catch (error) {
      // Erro já tratado nos hooks
      console.error('Erro ao alterar status:', error);
    }
  };

  const handleFiltroChange = (campo: string, valor: any) => {
    setFiltros({
      ...filtros,
      [campo]: valor
    });
  };

  return (
    <div className="space-y-3">
      {/* Header de Ações - Buscador + Novo Tipo na mesma linha */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        {/* Buscador */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar tipos por nome, categoria ou descrição..."
            value={filtros.busca || ''}
            onChange={(e) => handleFiltroChange('busca', e.target.value)}
            className="pl-10 h-10 border-gray-200 focus:border-slate-400 focus:ring-slate-400 bg-white shadow-sm"
            disabled={loading}
          />
        </div>

        {/* Filtros adicionais */}
        <Select
          value={filtros.categoria || 'ALL'}
          onValueChange={(value) => handleFiltroChange('categoria', value)}
          disabled={loading}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas</SelectItem>
            <SelectItem value="FUNCIONARIO">Funcionário</SelectItem>
            <SelectItem value="PARCEIRO">Parceiro</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filtros.ativo === undefined ? 'ALL' : filtros.ativo.toString()}
          onValueChange={(value) => handleFiltroChange('ativo', value === 'ALL' ? undefined : value === 'true')}
          disabled={loading}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            <SelectItem value="true">Ativo</SelectItem>
            <SelectItem value="false">Inativo</SelectItem>
          </SelectContent>
        </Select>

        {/* Dialog de formulário */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleOpenForm}
              className="gap-1.5 h-8 px-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg font-medium text-white text-xs"
              disabled={loading}
            >
              <UserCog className="h-3.5 w-3.5" />
              Novo Tipo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl h-[70vh] flex flex-col bg-white dark:bg-slate-900">
            <DialogHeader className="border-b border-slate-200 dark:border-slate-700 p-2 pb-1">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                  <UserCog className="h-3 w-3 text-slate-500" />
                </div>
                <DialogTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {editingTipo ? 'Editar Tipo de Colaborador' : 'Novo Tipo de Colaborador'}
                </DialogTitle>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-hidden">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmitForm)} className="h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto p-2">
                    <div className="space-y-1">
                      
                      {/* Dados Básicos */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                        <FormField
                          control={form.control}
                          name="nome"
                          rules={{ required: 'Nome é obrigatório' }}
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel className="text-xs font-medium text-slate-700">Nome *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Ex: Vendedor, Montador, Arquiteto" 
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
                          name="categoria"
                          rules={{ required: 'Categoria é obrigatória' }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium text-slate-700">Categoria *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-8 text-sm border-slate-300 focus:border-slate-400">
                                    <SelectValue placeholder="Selecione a categoria" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {CATEGORIAS_COLABORADOR.map(categoria => (
                                    <SelectItem key={categoria.value} value={categoria.value}>
                                      {categoria.label}
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
                          name="tipoPercentual"
                          rules={{ required: 'Tipo de percentual é obrigatório' }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium text-slate-700">Tipo Percentual *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-8 text-sm border-slate-300 focus:border-slate-400">
                                    <SelectValue placeholder="Selecione o tipo" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {TIPOS_PERCENTUAL.map(tipo => (
                                    <SelectItem key={tipo.value} value={tipo.value}>
                                      {tipo.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Bases de Pagamento */}
                      <div className="mt-4">
                        <FormLabel className="text-xs font-medium text-slate-700 mb-2 block">
                          Bases de Pagamento * (pelo menos uma obrigatória)
                        </FormLabel>
                        
                        <div className="grid grid-cols-2 gap-1">
                          <FormField
                            control={form.control}
                            name="percentualValor"
                            rules={{ min: { value: 0, message: 'Percentual deve ser positivo' } }}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-medium text-slate-700">Percentual (%)</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    placeholder="0.00"
                                    className="h-8 text-sm border-slate-300 focus:border-slate-400"
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="salarioBase"
                            rules={{ min: { value: 0, message: 'Salário deve ser positivo' } }}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-medium text-slate-700">Salário Base (R$)</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    className="h-8 text-sm border-slate-300 focus:border-slate-400"
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="valorPorServico"
                            rules={{ min: { value: 0, message: 'Valor deve ser positivo' } }}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-medium text-slate-700">Valor por Serviço (R$)</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    className="h-8 text-sm border-slate-300 focus:border-slate-400"
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="minimoGarantido"
                            rules={{ min: { value: 0, message: 'Valor deve ser positivo' } }}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-medium text-slate-700">Mínimo Garantido (R$)</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    className="h-8 text-sm border-slate-300 focus:border-slate-400"
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Configurações */}
                      <div className="mt-4">
                        <FormField
                          control={form.control}
                          name="opcionalNoOrcamento"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-300 p-2">
                              <div className="space-y-0.5">
                                <FormLabel className="text-xs font-medium text-slate-700">
                                  Opcional no Orçamento
                                </FormLabel>
                                <FormDescription className="text-xs">
                                  Se marcado, será opcional na criação de orçamentos
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Descrição */}
                      <div className="mt-4">
                        <FormField
                          control={form.control}
                          name="descricao"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium text-slate-700">Descrição</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder="Descrição opcional do tipo de colaborador"
                                  className="text-sm min-h-[60px] resize-none border-slate-300 focus:border-slate-400"
                                  rows={2}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Exibir erro de validação global */}
                      {form.formState.errors.root && (
                        <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
                          {form.formState.errors.root.message}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 pt-1">
                    <div className="flex justify-end items-center gap-1">
                      <button 
                        type="button" 
                        onClick={handleCloseForm}
                        className="px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                        disabled={formLoading}
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit"
                        disabled={formLoading}
                        className="px-4 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium border border-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {formLoading ? (
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                            Salvando...
                          </div>
                        ) : editingTipo ? 'Atualizar Tipo' : 'Salvar Tipo'}
                      </button>
                    </div>
                  </div>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela */}
      <TipoColaboradorTable
        tipos={tipos}
        onEdit={handleEditTipo}
        onDelete={handleDeleteTipo}
        onToggleStatus={handleToggleStatus}
        loading={loading}
      />
    </div>
  );
} 