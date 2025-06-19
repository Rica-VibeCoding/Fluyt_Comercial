import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Plus, Building2, Search, Filter } from 'lucide-react';
import { useEmpresasReal } from '@/hooks/data/use-empresas-real';
import { EmpresaTable } from './empresa-table';
import type { EmpresaFormData } from '@/types/sistema';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export function GestaoEmpresas() {
  const {
    empresas,
    loading,
    totalEmpresas,
    empresasAtivas,
    buscarEmpresas,
    // 🔧 CRUD Functions (será implementado pelo Agente 3)
    criarEmpresa,
    atualizarEmpresa,
    excluirEmpresa,
    alternarStatusEmpresa
  } = useEmpresasReal();

  // Criar estatísticas no formato esperado pelo componente
  const estatisticas = {
    total: totalEmpresas,
    ativas: empresasAtivas,
    inativas: totalEmpresas - empresasAtivas,
    totalFuncionarios: 0 // Será implementado pelo backend
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<any>(null);
  const [termoBusca, setTermoBusca] = useState('');

  const form = useForm<EmpresaFormData>({
    defaultValues: {
      nome: '',
      cnpj: '',
      email: '',
      telefone: '',
      endereco: ''
    }
  });

  // Filtrar empresas baseado na busca
  const empresasFiltradas = termoBusca ? buscarEmpresas(termoBusca) : empresas;

  const handleSubmit = async (data: EmpresaFormData) => {
    let sucesso = false;
    if (editingEmpresa) {
      sucesso = await atualizarEmpresa(editingEmpresa.id, data);
    } else {
      sucesso = await criarEmpresa(data);
    }

    if (sucesso) {
      handleCloseDialog();
    }
  };

  const handleEdit = (empresa: any) => {
    setEditingEmpresa(empresa);
    form.reset({
      nome: empresa.nome,
      cnpj: empresa.cnpj || '',
      email: empresa.email || '',
      telefone: empresa.telefone || '',
      endereco: empresa.endereco || ''
    });
    setIsDialogOpen(true);
  };

  const handleNewEmpresa = () => {
    setEditingEmpresa(null);
    form.reset({
      nome: '',
      cnpj: '',
      email: '',
      telefone: '',
      endereco: ''
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingEmpresa(null);
    form.reset({
      nome: '',
      cnpj: '',
      email: '',
      telefone: '',
      endereco: ''
    });
  };

  const formatarCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
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
    <div className="space-y-3">
      {/* Header de Ações - Buscador + Nova Empresa na mesma linha */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        {/* Buscador */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar empresas por nome, CNPJ ou email..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="pl-10 h-10 border-gray-200 focus:border-slate-400 focus:ring-slate-400 bg-white shadow-sm"
          />
        </div>

        {/* Botão Nova Empresa */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={handleNewEmpresa}
                className="gap-1.5 h-8 px-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg font-medium text-white text-xs"
              >
                <Building2 className="h-3.5 w-3.5" />
                Nova Empresa
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl h-[70vh] flex flex-col bg-white dark:bg-slate-900">
            <DialogHeader className="border-b border-slate-200 dark:border-slate-700 p-2 pb-1">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                  <Building2 className="h-3 w-3 text-slate-500" />
                </div>
                <DialogTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {editingEmpresa ? 'Editar Empresa' : 'Nova Empresa'}
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
                              <FormLabel className="text-xs font-medium text-slate-700">Nome da Empresa *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Digite o nome da empresa" 
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
                          name="cnpj"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium text-slate-700">CNPJ</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="00.000.000/0000-00"
                                  className="h-8 text-sm border-slate-300 focus:border-slate-400"
                                  {...field}
                                  onChange={(e) => {
                                    const formatted = formatarCNPJ(e.target.value);
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
                          name="email"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel className="text-xs font-medium text-slate-700">Email</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email"
                                  placeholder="empresa@exemplo.com" 
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
                          name="endereco"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel className="text-xs font-medium text-slate-700">Endereço</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Endereço completo da empresa" 
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
                        ) : editingEmpresa ? 'Atualizar Empresa' : 'Salvar Empresa'}
                      </button>
                    </div>
                  </div>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela de Empresas */}
      <EmpresaTable
        empresas={empresasFiltradas}
        onEdit={handleEdit}
        onDelete={excluirEmpresa}
        onToggleStatus={alternarStatusEmpresa}
        loading={loading}
      />
    </div>
  );
}