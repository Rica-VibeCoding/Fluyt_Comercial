import React, { useState, useEffect } from 'react';
import { useConfigLoja } from '@/hooks/modulos/sistema/use-config-loja';
import type { ConfiguracaoLojaFormData } from '@/types/sistema';
import { ConfigLojaFormFields } from './config-loja-form-fields';
import { ConfigLojaStats } from './config-loja-stats';

export function ConfigLojaContainer() {
  const {
    configuracoes,
    loading,
    obterConfiguracao,
    salvarConfiguracao,
    obterLojas,
    gerarExemploNumeracao,
    estatisticas
  } = useConfigLoja();

  const [selectedStore, setSelectedStore] = useState('1');
  const [stores, setStores] = useState<Array<{ id: string; name: string }>>([]);
  const [formData, setFormData] = useState<ConfiguracaoLojaFormData>({
    storeId: '1',
    discountLimitVendor: 10,
    discountLimitManager: 20,
    discountLimitAdminMaster: 50,
    defaultMeasurementValue: 120,
    freightPercentage: 8.5,
    assemblyPercentage: 12.0,
    executiveProjectPercentage: 5.0,
    initialNumber: 1001,
    numberFormat: 'YYYY-NNNNNN',
    numberPrefix: 'ORC'
  });

  // Carregar lojas na inicialização
  useEffect(() => {
    const carregarLojas = async () => {
      const lojasData = await obterLojas();
      setStores(lojasData);
    };
    carregarLojas();
  }, [obterLojas]);

  // Carregar configuração quando a loja mudar
  useEffect(() => {
    const carregarConfig = async () => {
      const config = await obterConfiguracao(selectedStore);
      if (config) {
        setFormData({
          storeId: config.storeId,
          discountLimitVendor: config.discountLimitVendor,
          discountLimitManager: config.discountLimitManager,
          discountLimitAdminMaster: config.discountLimitAdminMaster,
          defaultMeasurementValue: config.defaultMeasurementValue,
          freightPercentage: config.freightPercentage,
          assemblyPercentage: config.assemblyPercentage,
          executiveProjectPercentage: config.executiveProjectPercentage,
          initialNumber: config.initialNumber,
          numberFormat: config.numberFormat,
          numberPrefix: config.numberPrefix
        });
      }
    };
    if (selectedStore) {
      carregarConfig();
    }
  }, [selectedStore, obterConfiguracao]);

  const handleStoreChange = (storeId: string) => {
    setSelectedStore(storeId);
    setFormData(prev => ({ ...prev, storeId }));
  };

  const handleFieldChange = (field: keyof ConfiguracaoLojaFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    const success = await salvarConfiguracao(formData);
    if (success) {
      const config = await obterConfiguracao(selectedStore);
      if (config) {
        setFormData({
          storeId: config.storeId,
          discountLimitVendor: config.discountLimitVendor,
          discountLimitManager: config.discountLimitManager,
          discountLimitAdminMaster: config.discountLimitAdminMaster,
          defaultMeasurementValue: config.defaultMeasurementValue,
          freightPercentage: config.freightPercentage,
          assemblyPercentage: config.assemblyPercentage,
          executiveProjectPercentage: config.executiveProjectPercentage,
          initialNumber: config.initialNumber,
          numberFormat: config.numberFormat,
          numberPrefix: config.numberPrefix
        });
      }
    }
  };

  const exemploNumeracao = gerarExemploNumeracao(
    formData.numberPrefix,
    formData.numberFormat,
    formData.initialNumber
  );

  return (
    <div className="space-y-6">
      <ConfigLojaStats estatisticas={estatisticas} />
      
      <ConfigLojaFormFields
        formData={formData}
        stores={stores}
        selectedStore={selectedStore}
        exemploNumeracao={exemploNumeracao}
        loading={loading}
        onStoreChange={handleStoreChange}
        onFieldChange={handleFieldChange}
        onSave={handleSave}
      />
    </div>
  );
}