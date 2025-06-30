"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { UserPlus, User, Phone, Settings } from 'lucide-react';
import { Colaborador, ColaboradorFormData, TipoColaborador } from '@/types/colaboradores';

interface ColaboradorFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ColaboradorFormData) => void;
  editingColaborador?: Colaborador;
  tiposColaboradores: TipoColaborador[];
  isLoading?: boolean;
}

export function ColaboradorForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingColaborador, 
  tiposColaboradores,
  isLoading 
}: ColaboradorFormProps) {
  const [abaAtiva, setAbaAtiva] = useState('dados');

  const form = useForm<ColaboradorFormData>({
    defaultValues: {
      nome: editingColaborador?.nome || '',
      tipoColaboradorId: editingColaborador?.tipoColaboradorId || '',
      cpf: editingColaborador?.cpf || '',
      telefone: editingColaborador?.telefone || '',
      email: editingColaborador?.email || '',
      endereco: editingColaborador?.endereco || '',
      dataAdmissao: editingColaborador?.dataAdmissao || '',
      observacoes: editingColaborador?.observacoes || ''
    }
  });

  React.useEffect(() => {
    if (editingColaborador) {
      form.reset({
        nome: editingColaborador.nome,
        tipoColaboradorId: editingColaborador.tipoColaboradorId,
        cpf: editingColaborador.cpf || '',
        telefone: editingColaborador.telefone || '',
        email: editingColaborador.email || '',
        endereco: editingColaborador.endereco || '',
        dataAdmissao: editingColaborador.dataAdmissao || '',
        observacoes: editingColaborador.observacoes || ''
      });
    } else {
      form.reset({
        nome: '',
        tipoColaboradorId: '',
        cpf: '',
        telefone: '',
        email: '',
        endereco: '',
        dataAdmissao: '',
        observacoes: ''
      });
    }
    setAbaAtiva('dados');
  }, [editingColaborador, form]);

  const handleFormSubmit = (data: ColaboradorFormData) => {
    onSubmit(data);
  };

  const handleClose = () => {
    form.reset();
    setAbaAtiva('dados');
    onClose();
  };

  const handleTabChange = (value: string) => {
    setAbaAtiva(value);
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const tabs = [{
    id: 'dados',
    label: 'Dados Pessoais',
    icon: User
  }, {
    id: 'contato',
    label: 'Contato',
    icon: Phone
  }, {
    id: 'config',
    label: 'Configurações',
    icon: Settings
  }];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl h-[70vh] flex flex-col bg-white dark:bg-slate-900">
        <DialogHeader className="border-b border-slate-200 dark:border-slate-700 p-2 pb-1">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
              <UserPlus className="h-3 w-3 text-slate-500" />
            </div>
            <DialogTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {editingColaborador ? 'Editar Colaborador' : 'Novo Colaborador'}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="h-full flex flex-col">
              <div className="px-2 py-1 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <Tabs value={abaAtiva} onValueChange={handleTabChange}>
                  <TabsList className="grid w-full grid-cols-3 h-auto p-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {tabs.map(tab => {
                      const Icon = tab.icon;
                      return (
                        <TabsTrigger 
                          key={tab.id} 
                          value={tab.id} 
                          className="flex items-center justify-center gap-1 h-8 px-2 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 data-[state=active]:border-slate-300 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-slate-100"
                        >
                          <Icon className="h-3 w-3" />
                          <span className="font-medium text-xs">{tab.label}</span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex-1 overflow-y-auto">
                <Tabs value={abaAtiva} className="h-full">
                  <TabsContent value="dados" className="h-full p-2 mt-0">
                    <div className="h-full">
                      <div className="space-y-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                          <FormField
                            control={form.control}
                            name="nome"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel className="text-xs font-medium text-slate-700">Nome Completo *</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Nome completo do colaborador" 
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
                            name="tipoColaboradorId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-medium text-slate-700">Tipo de Colaborador *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-8 text-sm border-slate-300 focus:border-slate-400">
                                      <SelectValue placeholder="Selecione o tipo" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {tiposColaboradores
                                      .filter(tipo => tipo.ativo)
                                      .sort((a, b) => a.nome.localeCompare(b.nome))
                                      .map(tipo => (
                                        <SelectItem key={tipo.id} value={tipo.id}>
                                          {tipo.nome} ({tipo.categoria})
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
                            name="cpf"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-medium text-slate-700">CPF</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="000.000.000-00"
                                    className="h-8 text-sm border-slate-300 focus:border-slate-400"
                                    {...field}
                                    onChange={(e) => {
                                      const formatted = formatCPF(e.target.value);
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
                            name="dataAdmissao"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-medium text-slate-700">Data de Admissão</FormLabel>
                                <FormControl>
                                  <Input
                                    type="date"
                                    className="h-8 text-sm border-slate-300 focus:border-slate-400"
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
                  </TabsContent>

                  <TabsContent value="contato" className="h-full p-2 mt-0">
                    <div className="h-full">
                      <div className="space-y-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                          <FormField
                            control={form.control}
                            name="telefone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-medium text-slate-700">Telefone</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="(00) 00000-0000"
                                    className="h-8 text-sm border-slate-300 focus:border-slate-400"
                                    {...field}
                                    onChange={(e) => {
                                      const formatted = formatPhone(e.target.value);
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
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-medium text-slate-700">Email</FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    placeholder="email@exemplo.com"
                                    className="h-8 text-sm border-slate-300 focus:border-slate-400"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="endereco"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium text-slate-700">Endereço</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Endereço completo"
                                  className="h-8 text-sm border-slate-300 focus:border-slate-400"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="config" className="h-full p-2 mt-0">
                    <div className="h-full">
                      <div className="space-y-1">
                        <FormField
                          control={form.control}
                          name="observacoes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium text-slate-700">Observações</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Informações adicionais sobre o colaborador"
                                  rows={6}
                                  className="text-sm border-slate-300 focus:border-slate-400 resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription className="text-xs text-slate-500">
                                Informações adicionais que podem ser úteis sobre este colaborador
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <DialogFooter className="mt-6 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="h-8 px-3 text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !form.watch('nome') || !form.watch('tipoColaboradorId')}
                  className="h-8 px-3 text-xs bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800"
                >
                  {isLoading ? 'Salvando...' : editingColaborador ? 'Atualizar' : 'Criar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
} 