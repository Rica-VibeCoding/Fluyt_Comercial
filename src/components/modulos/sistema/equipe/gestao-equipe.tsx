import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, UserCog, Search, Filter, UserPlus, User, Building, Settings, CheckCircle } from 'lucide-react';
import { useEquipe } from '@/hooks/modulos/sistema/use-equipe';
import { FuncionarioTable } from './funcionario-table';
import type { FuncionarioFormData } from '@/types/sistema';
import { useForm } from 'react-hook-form';

export function GestaoEquipe() {
  const {
    funcionarios,
    loading,
    estatisticas,
    criarFuncionario,
    atualizarFuncionario,
    alternarStatusFuncionario,
    excluirFuncionario,
    buscarFuncionarios,
    lojas,
    setores
  } = useEquipe();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFuncionario, setEditingFuncionario] = useState<any>(null);
  const [termoBusca, setTermoBusca] = useState('');
  const [abaAtiva, setAbaAtiva] = useState('dados');

  const form = useForm<FuncionarioFormData>({
    defaultValues: {
    nome: '',
    email: '',
    telefone: '',
    setor: '',
    lojaId: '',
    salario: 0,
    comissao: 0,
    dataAdmissao: '',
    nivelAcesso: 'USUARIO',
    tipoFuncionario: 'VENDEDOR'
    }
  });

  // Filtrar funcionários baseado na busca
  const funcionariosFiltrados = termoBusca ? buscarFuncionarios(termoBusca) : funcionarios;

  const handleSubmit = async (data: FuncionarioFormData) => {
    let sucesso = false;
    if (editingFuncionario) {
      sucesso = await atualizarFuncionario(editingFuncionario.id, data);
    } else {
      sucesso = await criarFuncionario(data);
    }

    if (sucesso) {
      handleCloseDialog();
    }
  };

  const handleEdit = (funcionario: any) => {
    setEditingFuncionario(funcionario);
    form.reset({
      nome: funcionario.nome,
      email: funcionario.email,
      telefone: funcionario.telefone,
      setor: funcionario.setor,
      lojaId: funcionario.lojaId,
      salario: funcionario.salario,
      comissao: funcionario.comissao,
      dataAdmissao: funcionario.dataAdmissao,
      nivelAcesso: funcionario.nivelAcesso,
      tipoFuncionario: funcionario.tipoFuncionario,
      configuracoes: funcionario.configuracoes
    });
    setIsDialogOpen(true);
  };

  const handleNewFuncionario = () => {
    setEditingFuncionario(null);
    setAbaAtiva('dados');
    form.reset({
      nome: '',
      email: '',
      telefone: '',
      setor: '',
      lojaId: '',
      salario: 0,
      comissao: 0,
      dataAdmissao: '',
      nivelAcesso: 'USUARIO',
      tipoFuncionario: 'VENDEDOR'
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingFuncionario(null);
    setAbaAtiva('dados');
    form.reset({
      nome: '',
      email: '',
      telefone: '',
      setor: '',
      lojaId: '',
      salario: 0,
      comissao: 0,
      dataAdmissao: '',
      nivelAcesso: 'USUARIO',
      tipoFuncionario: 'VENDEDOR'
    });
  };

  const handleTabChange = (value: string) => {
    setAbaAtiva(value);
  };

  const formatarTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  const tabs = [{
    id: 'dados',
    label: 'Dados Pessoais',
    icon: User
  }, {
    id: 'trabalho',
    label: 'Trabalho',
    icon: Building
  }, {
    id: 'config',
    label: 'Configurações',
    icon: Settings
  }];

  return (
    <div className="space-y-3">
      {/* Header de Ações - Buscador + Novo Colaborador na mesma linha */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        {/* Buscador */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar funcionários por nome, email, tipo ou setor..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="pl-10 h-10 border-gray-200 focus:border-slate-400 focus:ring-slate-400 bg-white shadow-sm"
          />
        </div>

        {/* Botão Novo Colaborador */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleNewFuncionario}
              className="gap-1.5 h-8 px-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg font-medium text-white text-xs"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Novo Colaborador
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl h-[70vh] flex flex-col bg-white dark:bg-slate-900">
            <DialogHeader className="border-b border-slate-200 dark:border-slate-700 p-2 pb-1">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                  <UserPlus className="h-3 w-3 text-slate-500" />
                </div>
                <DialogTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {editingFuncionario ? 'Editar Colaborador' : 'Novo Colaborador'}
              </DialogTitle>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-hidden">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="h-full flex flex-col">
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
                                        placeholder="Digite o nome completo" 
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
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs font-medium text-slate-700">Email *</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="email"
                                        placeholder="funcionario@empresa.com" 
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
                                    <FormLabel className="text-xs font-medium text-slate-700">Telefone *</FormLabel>
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
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="trabalho" className="h-full p-2 mt-0">
                        <div className="h-full">
                          <div className="space-y-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                              <FormField
                                control={form.control}
                                name="tipoFuncionario"
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
                                        <SelectItem value="ADMINISTRATIVO">Administrativo</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="lojaId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs font-medium text-slate-700">Loja *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger className="h-8 text-sm border-slate-300 focus:border-slate-400">
                                          <SelectValue placeholder="Selecione a loja" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {lojas.map((loja) => (
                                          <SelectItem key={loja.id} value={loja.id}>
                                            {loja.nome}
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
                                name="setor"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs font-medium text-slate-700">Setor</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger className="h-8 text-sm border-slate-300 focus:border-slate-400">
                                          <SelectValue placeholder="Selecione o setor" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {setores.map((setor) => (
                                          <SelectItem key={setor.id} value={setor.id}>
                                            {setor.nome}
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
                                name="dataAdmissao"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs font-medium text-slate-700">Data Admissão</FormLabel>
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

                              <FormField
                                control={form.control}
                                name="salario"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs font-medium text-slate-700">Salário (R$)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="3000.00" 
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
                                name="comissao"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs font-medium text-slate-700">Comissão (%)</FormLabel>
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
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="config" className="h-full p-2 mt-0">
                        <div className="h-full">
                          <div className="space-y-1">
                            <div className="grid grid-cols-1 gap-1">
                              <FormField
                                control={form.control}
                                name="nivelAcesso"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs font-medium text-slate-700">Nível de Acesso *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger className="h-8 text-sm border-slate-300 focus:border-slate-400">
                                          <SelectValue placeholder="Selecione o nível" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="USUARIO">Usuário</SelectItem>
                                        <SelectItem value="GERENTE">Gerente</SelectItem>
                                        <SelectItem value="ADMIN">Administrador</SelectItem>
                                        <SelectItem value="MASTER">Master</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormDescription className="text-xs text-slate-500">
                                      Define as permissões do usuário no sistema
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
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
                        ) : editingFuncionario ? 'Atualizar Funcionário' : 'Salvar Funcionário'}
                      </button>
                    </div>
                  </div>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela de Funcionários */}
      <FuncionarioTable
        funcionarios={funcionariosFiltrados}
        onEdit={handleEdit}
        onDelete={excluirFuncionario}
        onToggleStatus={alternarStatusFuncionario}
        loading={loading}
      />
    </div>
  );
}