import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save } from 'lucide-react';
import type { ConfiguracaoLojaFormData } from '@/types/sistema';

interface ConfigLojaFormFieldsProps {
  formData: ConfiguracaoLojaFormData;
  stores: Array<{ id: string; name: string }>;
  selectedStore: string;
  exemploNumeracao: string;
  loading: boolean;
  onStoreChange: (storeId: string) => void;
  onFieldChange: (field: keyof ConfiguracaoLojaFormData, value: any) => void;
  onSave: () => Promise<void>;
}

export const ConfigLojaFormFields = memo(function ConfigLojaFormFields({
  formData,
  stores,
  selectedStore,
  exemploNumeracao,
  loading,
  onStoreChange,
  onFieldChange,
  onSave
}: ConfigLojaFormFieldsProps) {
  const handleChange = (field: keyof ConfiguracaoLojaFormData, value: any) => {
    onFieldChange(field, value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Configurações de Loja</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seleção da Loja */}
        <div className="space-y-2">
          <Label htmlFor="store">Loja</Label>
          <Select value={selectedStore} onValueChange={onStoreChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma loja" />
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

        {/* Limites de Desconto */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="discountVendor">Limite Vendedor (%)</Label>
            <Input
              id="discountVendor"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.discountLimitVendor}
              onChange={(e) => handleChange('discountLimitVendor', parseFloat(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discountManager">Limite Gerente (%)</Label>
            <Input
              id="discountManager"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.discountLimitManager}
              onChange={(e) => handleChange('discountLimitManager', parseFloat(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discountAdmin">Limite Admin (%)</Label>
            <Input
              id="discountAdmin"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.discountLimitAdminMaster}
              onChange={(e) => handleChange('discountLimitAdminMaster', parseFloat(e.target.value))}
            />
          </div>
        </div>

        {/* Valores e Percentuais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="measurementValue">Valor Medição (R$)</Label>
            <Input
              id="measurementValue"
              type="number"
              min="0"
              step="0.01"
              value={formData.defaultMeasurementValue}
              onChange={(e) => handleChange('defaultMeasurementValue', parseFloat(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="freight">Frete (%)</Label>
            <Input
              id="freight"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.freightPercentage}
              onChange={(e) => handleChange('freightPercentage', parseFloat(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assembly">Montagem (%)</Label>
            <Input
              id="assembly"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.assemblyPercentage}
              onChange={(e) => handleChange('assemblyPercentage', parseFloat(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Projeto Executivo (%)</Label>
            <Input
              id="project"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.executiveProjectPercentage}
              onChange={(e) => handleChange('executiveProjectPercentage', parseFloat(e.target.value))}
            />
          </div>
        </div>

        {/* Configurações de Numeração */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="initialNumber">Número Inicial</Label>
            <Input
              id="initialNumber"
              type="number"
              min="1"
              value={formData.initialNumber}
              onChange={(e) => handleChange('initialNumber', parseInt(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prefix">Prefixo</Label>
            <Input
              id="prefix"
              type="text"
              value={formData.numberPrefix}
              onChange={(e) => handleChange('numberPrefix', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="format">Formato</Label>
            <Select
              value={formData.numberFormat}
              onValueChange={(value) => handleChange('numberFormat', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="YYYY-NNNNNN">YYYY-NNNNNN</SelectItem>
                <SelectItem value="MM-YYYY-NNNN">MM-YYYY-NNNN</SelectItem>
                <SelectItem value="NNNNNN">NNNNNN</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Exemplo de Numeração */}
        <div className="p-4 bg-muted rounded-lg">
          <Label className="text-sm font-medium">Exemplo de Numeração:</Label>
          <p className="text-lg font-mono font-bold text-primary">{exemploNumeracao}</p>
        </div>

        {/* Footer com botão salvar */}
        <div className="border-t border-border pt-4 flex items-center justify-end">
          <Button onClick={onSave} disabled={loading} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});