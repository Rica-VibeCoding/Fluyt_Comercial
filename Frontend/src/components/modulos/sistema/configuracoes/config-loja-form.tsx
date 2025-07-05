import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save } from 'lucide-react';
import { useConfigLoja } from '@/hooks/modulos/sistema/use-config-loja';
import type { ConfiguracaoLojaFormData } from '@/types/sistema';

interface ConfigLojaFormProps {
  formData: ConfiguracaoLojaFormData;
  onFormDataChange: (data: ConfiguracaoLojaFormData) => void;
  onSubmit: (data: ConfiguracaoLojaFormData) => void;
  onCancel: () => void;
  isEditing: boolean;
  loading?: boolean;
}

const ConfigLojaFormComponent = ({
  formData,
  onFormDataChange,
  onSubmit,
  onCancel,
  isEditing,
  loading = false
}: ConfigLojaFormProps) => {
  const { obterLojas, gerarExemploNumeracao } = useConfigLoja();
  const [stores, setStores] = useState<Array<{ id: string; name: string }>>([]);

  // Carregar lojas na inicialização
  useEffect(() => {
    const carregarLojas = async () => {
      const lojasData = await obterLojas();
      setStores(lojasData);
    };
    carregarLojas();
  }, []); // Remover dependência para evitar recarregamentos

  const handleChange = (field: keyof ConfiguracaoLojaFormData, value: any) => {
    onFormDataChange({
      ...formData,
      [field]: value
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const exemploNumeracao = gerarExemploNumeracao(formData.numberPrefix, formData.numberFormat, formData.initialNumber);

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* Seleção de loja */}
      <div className="space-y-2">
        <Label htmlFor="store" className="text-sm font-medium">Loja *</Label>
        <Select 
          value={formData.storeId} 
          onValueChange={(value) => handleChange('storeId', value)}
          disabled={loading || isEditing}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a loja" />
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

      {/* Configurações Financeiras */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">Configurações Financeiras</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="freightPercentage">Percentual de Frete (%)</Label>
            <Input
              id="freightPercentage"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.freightPercentage}
              onChange={(e) => handleChange('freightPercentage', Number(e.target.value))}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assemblyPercentage">Percentual de Montagem (%)</Label>
            <Input
              id="assemblyPercentage"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.assemblyPercentage}
              onChange={(e) => handleChange('assemblyPercentage', Number(e.target.value))}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="executiveProjectPercentage">Percentual de Projeto Executivo (%)</Label>
            <Input
              id="executiveProjectPercentage"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.executiveProjectPercentage}
              onChange={(e) => handleChange('executiveProjectPercentage', Number(e.target.value))}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultMeasurementValue">Valor Padrão Medição (R$)</Label>
            <Input
              id="defaultMeasurementValue"
              type="number"
              min="0"
              step="0.01"
              value={formData.defaultMeasurementValue}
              onChange={(e) => handleChange('defaultMeasurementValue', Number(e.target.value))}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Limites de Desconto */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">Limites de Desconto por Perfil</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="discountLimitVendor">Limite Vendedor (%)</Label>
            <Input
              id="discountLimitVendor"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.discountLimitVendor}
              onChange={(e) => handleChange('discountLimitVendor', Number(e.target.value))}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discountLimitManager">Limite Gerente (%)</Label>
            <Input
              id="discountLimitManager"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.discountLimitManager}
              onChange={(e) => handleChange('discountLimitManager', Number(e.target.value))}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discountLimitAdminMaster">Limite Admin Master (%)</Label>
            <Input
              id="discountLimitAdminMaster"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.discountLimitAdminMaster}
              onChange={(e) => handleChange('discountLimitAdminMaster', Number(e.target.value))}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Configuração de Numeração */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">Configuração de Numeração</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="numberPrefix">Prefixo</Label>
            <Input
              id="numberPrefix"
              value={formData.numberPrefix}
              onChange={(e) => handleChange('numberPrefix', e.target.value.toUpperCase())}
              placeholder="ORC"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="numberFormat">Formato</Label>
            <Select
              value={formData.numberFormat}
              onValueChange={(value) => handleChange('numberFormat', value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="YYYY-NNNNNN">YYYY-NNNNNN</SelectItem>
                <SelectItem value="NNNNNN">NNNNNN</SelectItem>
                <SelectItem value="MM-YYYY-NNNN">MM-YYYY-NNNN</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="initialNumber">Número Inicial</Label>
            <Input
              id="initialNumber"
              type="number"
              min="1"
              value={formData.initialNumber}
              onChange={(e) => handleChange('initialNumber', Number(e.target.value))}
              disabled={loading}
            />
          </div>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm font-medium text-blue-800">Exemplo de numeração:</div>
          <div className="text-lg font-mono text-blue-900">{exemploNumeracao}</div>
        </div>
      </div>

      {/* Botões */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isEditing ? 'Atualizando...' : 'Criando...'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Atualizar Configuração' : 'Salvar Configuração'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export const ConfigLojaForm = React.memo(ConfigLojaFormComponent);