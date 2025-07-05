import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Save, RefreshCw, Store } from 'lucide-react';
import { useConfigLoja } from '@/hooks/modulos/sistema/use-config-loja';
import type { ConfiguracaoLojaFormData } from '@/types/sistema';

export function ConfigLoja() {
  const {
    loading,
    estatisticas,
    obterConfiguracao,
    salvarConfiguracao,
    gerarExemploNumeracao,
    obterLojas,
    resetarDados
  } = useConfigLoja();

  const [selectedStore, setSelectedStore] = useState('1');
  const [formData, setFormData] = useState<ConfiguracaoLojaFormData>({
    storeId: '1',
    discountLimitVendor: 10,
    discountLimitManager: 20,
    discountLimitAdminMaster: 50,
    defaultMeasurementValue: 120,
    freightPercentage: 8.5,
    initialNumber: 1001,
    numberFormat: 'YYYY-NNNNNN',
    numberPrefix: 'ORC'
  });

  const stores = obterLojas();

  // Carregar configuração quando a loja mudar
  useEffect(() => {
    const config = obterConfiguracao(selectedStore);
    if (config) {
      setFormData({
        storeId: config.storeId,
        discountLimitVendor: config.discountLimitVendor,
        discountLimitManager: config.discountLimitManager,
        discountLimitAdminMaster: config.discountLimitAdminMaster,
        defaultMeasurementValue: config.defaultMeasurementValue,
        freightPercentage: config.freightPercentage,
        initialNumber: config.initialNumber,
        numberFormat: config.numberFormat,
        numberPrefix: config.numberPrefix
      });
    }
  }, [selectedStore, obterConfiguracao]);

  const handleStoreChange = (storeId: string) => {
    setSelectedStore(storeId);
    setFormData(prev => ({ ...prev, storeId }));
  };

  const handleChange = (field: keyof ConfiguracaoLojaFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    const success = await salvarConfiguracao(formData);
    if (success) {
      // Atualizar dados após salvar
      const config = obterConfiguracao(selectedStore);
      if (config) {
        setFormData({
          storeId: config.storeId,
          discountLimitVendor: config.discountLimitVendor,
          discountLimitManager: config.discountLimitManager,
          discountLimitAdminMaster: config.discountLimitAdminMaster,
          defaultMeasurementValue: config.defaultMeasurementValue,
          freightPercentage: config.freightPercentage,
          initialNumber: config.initialNumber,
          numberFormat: config.numberFormat,
          numberPrefix: config.numberPrefix
        });
      }
    }
  };

  const exemploNumeracao = gerarExemploNumeracao(formData.numberPrefix, formData.numberFormat, formData.initialNumber);
  const config = obterConfiguracao(selectedStore);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Store className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Configurações da Loja</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Gerencie configurações críticas que impactam cálculos e operações da loja
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetarDados}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardHeader>
      </Card>


      <div className="space-y-4">
        {/* Alerta */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Configuração Crítica:</strong> Estas configurações impactam diretamente o cálculo de margens, 
            numeração de orçamentos e limites de desconto. Alterações geram snapshots históricos.
          </AlertDescription>
        </Alert>

        {/* Seleção de loja */}
        <div className="bg-muted/30 border border-border rounded-md p-4">
          <Label htmlFor="store" className="text-sm font-medium mb-2 block">Loja</Label>
          <Select value={selectedStore} onValueChange={handleStoreChange}>
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Configurações */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Configurações Financeiras */}
          <div className="border border-border rounded-md p-4 bg-background">
            <h3 className="font-semibold text-foreground mb-4 border-b border-border pb-2">
              Configurações Financeiras
            </h3>
            <div className="space-y-4">


              <div>
                <Label htmlFor="freightPercentage" className="text-sm font-medium">
                  Percentual de Frete (%)
                </Label>
                <Input
                  id="freightPercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.freightPercentage}
                  onChange={(e) => handleChange('freightPercentage', Number(e.target.value))}
                  className="mt-1"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="defaultMeasurementValue" className="text-sm font-medium">
                  Valor Padrão Medição (R$)
                </Label>
                <Input
                  id="defaultMeasurementValue"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.defaultMeasurementValue}
                  onChange={(e) => handleChange('defaultMeasurementValue', Number(e.target.value))}
                  className="mt-1"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Limites de Desconto */}
          <div className="border border-border rounded-md p-4 bg-background">
            <h3 className="font-semibold text-foreground mb-4 border-b border-border pb-2">
              Limites de Desconto por Perfil
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="discountLimitVendor" className="text-sm font-medium">
                  Limite Vendedor (%)
                </Label>
                <Input
                  id="discountLimitVendor"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.discountLimitVendor}
                  onChange={(e) => handleChange('discountLimitVendor', Number(e.target.value))}
                  className="mt-1"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="discountLimitManager" className="text-sm font-medium">
                  Limite Gerente (%)
                </Label>
                <Input
                  id="discountLimitManager"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.discountLimitManager}
                  onChange={(e) => handleChange('discountLimitManager', Number(e.target.value))}
                  className="mt-1"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="discountLimitAdminMaster" className="text-sm font-medium">
                  Limite Admin Master (%)
                </Label>
                <Input
                  id="discountLimitAdminMaster"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.discountLimitAdminMaster}
                  onChange={(e) => handleChange('discountLimitAdminMaster', Number(e.target.value))}
                  className="mt-1"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Configuração de Numeração */}
          <div className="lg:col-span-2 border border-border rounded-md p-4 bg-background">
            <h3 className="font-semibold text-foreground mb-4 border-b border-border pb-2">
              Configuração de Numeração
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="numberPrefix" className="text-sm font-medium">Prefixo</Label>
                <Input
                  id="numberPrefix"
                  value={formData.numberPrefix}
                  onChange={(e) => handleChange('numberPrefix', e.target.value.toUpperCase())}
                  placeholder="ORC"
                  className="mt-1"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="numberFormat" className="text-sm font-medium">Formato</Label>
                <Select
                  value={formData.numberFormat}
                  onValueChange={(value) => handleChange('numberFormat', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YYYY-NNNNNN">YYYY-NNNNNN</SelectItem>
                    <SelectItem value="NNNNNN">NNNNNN</SelectItem>
                    <SelectItem value="MM-YYYY-NNNN">MM-YYYY-NNNN</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="initialNumber" className="text-sm font-medium">Número Inicial</Label>
                <Input
                  id="initialNumber"
                  type="number"
                  min="1"
                  value={formData.initialNumber}
                  onChange={(e) => handleChange('initialNumber', Number(e.target.value))}
                  className="mt-1"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="mt-4 p-3 bg-muted/50 rounded border border-border">
              <div className="text-sm font-medium text-foreground">Exemplo de numeração:</div>
              <div className="text-lg font-mono text-foreground">{exemploNumeracao}</div>
            </div>
          </div>
        </div>

        {/* Footer com ações */}
        <div className="border-t border-border pt-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Última atualização: {config ? new Date(config.updatedAt).toLocaleDateString('pt-BR') : 'Nunca'}
          </div>
          <Button onClick={handleSave} disabled={loading} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </div>
    </div>
  );
}