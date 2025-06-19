import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Settings, Search } from 'lucide-react';
import { useConfigLoja } from '@/hooks/modulos/sistema/use-config-loja';
import { ConfigLojaTable } from './config-loja-table';
import { ConfigLojaForm } from './config-loja-form';
import type { ConfiguracaoLojaFormData } from '@/types/sistema';

export function GestaoConfigLoja() {
  const {
    configuracoes,
    loading,
    salvarConfiguracao,
    obterConfiguracao,
    resetarDados
  } = useConfigLoja();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<any>(null);
  const [termoBusca, setTermoBusca] = useState('');
  const [formData, setFormData] = useState<ConfiguracaoLojaFormData>({
    storeId: '',
    deflatorCost: 15.5,
    discountLimitVendor: 10,
    discountLimitManager: 20,
    discountLimitAdminMaster: 50,
    defaultMeasurementValue: 120,
    freightPercentage: 8.5,
    initialNumber: 1001,
    numberFormat: 'YYYY-NNNNNN',
    numberPrefix: 'ORC'
  });

  // Filtrar configurações baseado na busca
  const configsFiltradas = termoBusca 
    ? configuracoes.filter(config => 
        config.storeName.toLowerCase().includes(termoBusca.toLowerCase()) ||
        config.numberPrefix.toLowerCase().includes(termoBusca.toLowerCase())
      )
    : configuracoes;

  const handleSubmit = async (data: ConfiguracaoLojaFormData) => {
    const sucesso = await salvarConfiguracao(data);
    if (sucesso) {
      handleCloseDialog();
    }
  };

  const handleEdit = (config: any) => {
    setEditingConfig(config);
    setFormData({
      storeId: config.storeId,
      deflatorCost: config.deflatorCost,
      discountLimitVendor: config.discountLimitVendor,
      discountLimitManager: config.discountLimitManager,
      discountLimitAdminMaster: config.discountLimitAdminMaster,
      defaultMeasurementValue: config.defaultMeasurementValue,
      freightPercentage: config.freightPercentage,
      initialNumber: config.initialNumber,
      numberFormat: config.numberFormat,
      numberPrefix: config.numberPrefix
    });
    setIsDialogOpen(true);
  };

  const handleNewConfig = () => {
    setEditingConfig(null);
    setFormData({
      storeId: '',
      deflatorCost: 15.5,
      discountLimitVendor: 10,
      discountLimitManager: 20,
      discountLimitAdminMaster: 50,
      defaultMeasurementValue: 120,
      freightPercentage: 8.5,
      initialNumber: 1001,
      numberFormat: 'YYYY-NNNNNN',
      numberPrefix: 'ORC'
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingConfig(null);
  };

  const handleDelete = async (storeId: string) => {
    // Implementar lógica de exclusão se necessário
    console.log('Excluir configuração:', storeId);
  };

  return (
    <div className="space-y-3">
      {/* Header de Ações - Buscador + Nova Configuração na mesma linha */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        {/* Buscador */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar configurações por nome da loja ou prefixo..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="pl-10 h-10 border-gray-200 focus:border-slate-400 focus:ring-slate-400 bg-white shadow-sm"
          />
        </div>

        {/* Botão Nova Configuração */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleNewConfig} 
              className="gap-1.5 h-8 px-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg font-medium text-white text-xs"
            >
              <Settings className="h-3.5 w-3.5" />
              Nova Configuração
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingConfig ? 'Editar Configuração da Loja' : 'Nova Configuração da Loja'}
              </DialogTitle>
            </DialogHeader>
            <ConfigLojaForm
              formData={formData}
              onFormDataChange={setFormData}
              onSubmit={handleSubmit}
              onCancel={handleCloseDialog}
              isEditing={!!editingConfig}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela de Configurações */}
      <ConfigLojaTable
        configuracoes={configsFiltradas}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />
    </div>
  );
} 