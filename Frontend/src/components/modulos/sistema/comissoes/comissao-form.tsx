import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import type { RegraComissaoFormData } from '@/types/sistema';

interface ComissaoFormProps {
  formData: RegraComissaoFormData;
  onFormDataChange: (data: RegraComissaoFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing: boolean;
  loading?: boolean;
}

export function ComissaoForm({
  formData,
  onFormDataChange,
  onSubmit,
  onCancel,
  isEditing,
  loading = false
}: ComissaoFormProps) {

  const handleChange = (field: keyof RegraComissaoFormData, value: any) => {
    onFormDataChange({
      ...formData,
      [field]: value
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const tiposComissao = [
    { value: 'VENDEDOR', label: 'Vendedor' },
    { value: 'GERENTE', label: 'Gerente' }
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Tipo de Comissão */}
      <div className="space-y-2">
        <Label htmlFor="tipo" className="text-sm font-medium">
          Tipo de Comissão *
        </Label>
        <Select
          value={formData.tipo}
          onValueChange={(value) => handleChange('tipo', value)}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            {tiposComissao.map((tipo) => (
              <SelectItem key={tipo.value} value={tipo.value}>
                {tipo.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Faixa de Valores */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">Faixa de Valores</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="valorMinimo">Valor Mínimo (R$) *</Label>
            <Input
              id="valorMinimo"
              type="number"
              min="0"
              step="0.01"
              value={formData.valorMinimo}
              onChange={(e) => handleChange('valorMinimo', Number(e.target.value))}
              placeholder="0.00"
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              {formData.valorMinimo > 0 && `Equivale a ${formatCurrency(formData.valorMinimo)}`}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="valorMaximo">Valor Máximo (R$)</Label>
            <Input
              id="valorMaximo"
              type="number"
              min="0"
              step="0.01"
              value={formData.valorMaximo || ''}
              onChange={(e) => handleChange('valorMaximo', e.target.value ? Number(e.target.value) : null)}
              placeholder="Deixe vazio para sem limite"
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              {formData.valorMaximo ? `Equivale a ${formatCurrency(formData.valorMaximo)}` : 'Sem limite máximo'}
            </p>
          </div>
        </div>

        {/* Preview da Faixa */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Faixa:</strong> {formatCurrency(formData.valorMinimo)} 
            {formData.valorMaximo ? ` até ${formatCurrency(formData.valorMaximo)}` : ' ou mais'}
          </p>
        </div>
      </div>

      {/* Percentual */}
      <div className="space-y-2">
        <Label htmlFor="percentual" className="text-sm font-medium">
          Percentual de Comissão (%) *
        </Label>
        <Input
          id="percentual"
          type="number"
          min="0.01"
          max="100"
          step="0.01"
          value={formData.percentual}
          onChange={(e) => handleChange('percentual', Number(e.target.value))}
          placeholder="0.00"
          required
          disabled={loading}
        />
        <p className="text-xs text-gray-500">
          Para vendas de {formatCurrency(formData.valorMinimo)}, a comissão será de {formatCurrency((formData.valorMinimo * formData.percentual) / 100)}
        </p>
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="descricao" className="text-sm font-medium">
          Descrição
        </Label>
        <Textarea
          id="descricao"
          value={formData.descricao || ''}
          onChange={(e) => handleChange('descricao', e.target.value)}
          placeholder="Descrição opcional para esta regra..."
          className="w-full min-h-[80px] resize-none"
          disabled={loading}
        />
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
            isEditing ? 'Atualizar Regra' : 'Criar Regra'
          )}
        </Button>
      </div>
    </form>
  );
}