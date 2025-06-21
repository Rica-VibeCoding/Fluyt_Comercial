import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Form } from '../../ui/form';
import { ClienteFormEssencial } from './cliente-form-essencial';
import { ClienteFormEndereco } from './cliente-form-endereco';
import { ClienteFormConfig } from './cliente-form-config';
import { useClienteForm } from '../../../hooks/modulos/clientes/use-cliente-form';
import { Cliente, Vendedor } from '../../../types/cliente';
import { User, MapPin, Settings, CheckCircle } from 'lucide-react';

interface ClienteModalProps {
  aberto: boolean;
  onFechar: () => void;
  cliente?: Cliente | null;
  vendedores: Vendedor[];
  onSalvar: (dados: any) => Promise<void>;
  isLoading: boolean;
}

export function ClienteModal({
  aberto,
  onFechar,
  cliente,
  vendedores,
  onSalvar,
  isLoading
}: ClienteModalProps) {
  const [abaAtiva, setAbaAtiva] = useState('essencial');

  const {
    form,
    onSubmit,
    abasPreenchidas
  } = useClienteForm({
    cliente,
    vendedores,
    onSalvar,
    onFechar
  });

  const handleTabChange = (value: string) => {
    setAbaAtiva(value);
  };

  const tabs = [{
    id: 'essencial',
    label: 'Informações Essenciais',
    icon: User
  }, {
    id: 'endereco',
    label: 'Endereço',
    icon: MapPin
  }, {
    id: 'config',
    label: 'Configurações',
    icon: Settings
  }];

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="max-w-2xl h-[70vh] flex flex-col bg-white dark:bg-slate-900">
        <DialogHeader className="border-b border-slate-200 dark:border-slate-700 p-2 pb-1">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
              <User className="h-3 w-3 text-slate-500" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {cliente ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="h-full flex flex-col">
              <div className="px-2 py-1 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <Tabs value={abaAtiva} onValueChange={handleTabChange}>
                  <TabsList className="grid w-full grid-cols-3 h-auto p-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {tabs.map(tab => {
                      const Icon = tab.icon;
                      const isCompleted = abasPreenchidas >= tabs.findIndex(t => t.id === tab.id) + 1;
                      return (
                        <TabsTrigger 
                          key={tab.id} 
                          value={tab.id} 
                          className="flex items-center justify-center gap-1 h-8 px-2 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 data-[state=active]:border-slate-300 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-slate-100"
                        >
                          <Icon className="h-3 w-3" />
                          <span className="font-medium text-xs">{tab.label}</span>
                          {isCompleted && <CheckCircle className="h-2 w-2 text-green-600" />}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex-1 overflow-y-auto">
                <Tabs value={abaAtiva} className="h-full">
                  <TabsContent value="essencial" className="h-full p-2 mt-0">
                    <div className="h-full">
                      <ClienteFormEssencial form={form} />
                    </div>
                  </TabsContent>

                  <TabsContent value="endereco" className="h-full p-2 mt-0">
                    <div className="h-full">
                      <ClienteFormEndereco form={form} />
                    </div>
                  </TabsContent>

                  <TabsContent value="config" className="h-full p-2 mt-0">
                    <div className="h-full">
                      <ClienteFormConfig form={form} vendedores={vendedores} />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 pt-1">
                <div className="flex justify-end items-center gap-1">
                  <button 
                    type="button" 
                    onClick={onFechar} 
                    className="px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800" 
                    disabled={isLoading}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={isLoading} 
                    className="px-4 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium border border-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                        Salvando...
                      </div>
                    ) : cliente ? 'Atualizar Cliente' : 'Salvar Cliente'}
                  </button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}