import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import type { TransportadoraFormData } from '@/types/sistema';

interface TransportadoraFormProps {
  formData: TransportadoraFormData;
  onFormDataChange: (data: TransportadoraFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing: boolean;
  loading?: boolean;
}

export function TransportadoraForm({
  formData,
  onFormDataChange,
  onSubmit,
  onCancel,
  isEditing,
  loading = false
}: TransportadoraFormProps) {

  const handleChange = (field: keyof TransportadoraFormData, value: any) => {
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

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Nome da Empresa */}
      <div className="space-y-2">
        <Label htmlFor="nomeEmpresa" className="text-sm font-medium">
          Nome da Empresa *
        </Label>
        <Input
          id="nomeEmpresa"
          type="text"
          value={formData.nomeEmpresa}
          onChange={(e) => handleChange('nomeEmpresa', e.target.value)}
          placeholder="Ex: Transportes Rápido Ltda"
          required
          disabled={loading}
        />
        <p className="text-xs text-gray-500">
          Nome completo da empresa de transporte
        </p>
      </div>

      {/* Valor Fixo e Preview */}
      <div className="space-y-2">
        <Label htmlFor="valorFixo" className="text-sm font-medium">
          Valor Fixo por Entrega (R$) *
        </Label>
        <Input
          id="valorFixo"
          type="number"
          min="0"
          step="0.01"
          value={formData.valorFixo}
          onChange={(e) => handleChange('valorFixo', Number(e.target.value))}
          placeholder="0.00"
          required
          disabled={loading}
        />
        {formData.valorFixo > 0 && (
          <div className="p-2 bg-green-50 border border-green-200 rounded text-sm">
            <span className="text-green-800">
              Valor formatado: <strong>{formatCurrency(formData.valorFixo)}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Contato */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="telefone" className="text-sm font-medium">
            Telefone *
          </Label>
          <Input
            id="telefone"
            type="tel"
            value={formData.telefone}
            onChange={(e) => handleChange('telefone', e.target.value)}
            placeholder="(11) 3000-0000"
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email *
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="contato@empresa.com.br"
            required
            disabled={loading}
          />
        </div>
      </div>

      {/* Preview do Cadastro */}
      {formData.nomeEmpresa && formData.valorFixo > 0 && formData.email && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Preview do Cadastro:</h4>
          <div className="space-y-1 text-sm text-blue-800">
            <div><strong>Empresa:</strong> {formData.nomeEmpresa}</div>
            <div><strong>Valor por Entrega:</strong> {formatCurrency(formData.valorFixo)}</div>
            {formData.telefone && <div><strong>Telefone:</strong> {formData.telefone}</div>}
            <div><strong>Email:</strong> {formData.email}</div>
          </div>
        </div>
      )}

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
              {isEditing ? 'Atualizando...' : 'Cadastrando...'}
            </>
          ) : (
            isEditing ? 'Atualizar Transportadora' : 'Cadastrar Transportadora'
          )}
        </Button>
      </div>
    </form>
  );
}