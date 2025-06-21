import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { MontadorFormData } from '@/types/sistema';

interface MontadorFormProps {
  formData: MontadorFormData;
  onFormDataChange: (data: MontadorFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing: boolean;
  loading?: boolean;
}

export function MontadorForm({
  formData,
  onFormDataChange,
  onSubmit,
  onCancel,
  isEditing,
  loading = false
}: MontadorFormProps) {

  const handleChange = (field: keyof MontadorFormData, value: any) => {
    onFormDataChange({
      ...formData,
      [field]: value
    });
  };

  const categorias = [
    { value: 'MARCENEIRO', label: 'Marceneiro' },
    { value: 'ELETRICISTA', label: 'Eletricista' },
    { value: 'ENCANADOR', label: 'Encanador' },
    { value: 'GESSEIRO', label: 'Gesseiro' },
    { value: 'PINTOR', label: 'Pintor' },
    { value: 'OUTRO', label: 'Outro' }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Nome */}
      <div className="space-y-2">
        <Label htmlFor="nome" className="text-sm font-medium">
          Nome/Empresa *
        </Label>
        <Input
          id="nome"
          type="text"
          value={formData.nome}
          onChange={(e) => handleChange('nome', e.target.value)}
          placeholder="Ex: João Silva - Marcenaria"
          required
          disabled={loading}
        />
        <p className="text-xs text-gray-500">
          Informe o nome do profissional ou empresa
        </p>
      </div>

      {/* Categoria */}
      <div className="space-y-2">
        <Label htmlFor="categoria" className="text-sm font-medium">
          Categoria *
        </Label>
        <Select
          value={formData.categoria}
          onValueChange={(value) => handleChange('categoria', value)}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a categoria" />
          </SelectTrigger>
          <SelectContent>
            {categorias.map((categoria) => (
              <SelectItem key={categoria.value} value={categoria.value}>
                {categoria.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Valor Fixo e Preview */}
      <div className="space-y-2">
        <Label htmlFor="valorFixo" className="text-sm font-medium">
          Valor Fixo por Serviço (R$) *
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

      {/* Telefone */}
      <div className="space-y-2">
        <Label htmlFor="telefone" className="text-sm font-medium">
          Telefone *
        </Label>
        <Input
          id="telefone"
          type="tel"
          value={formData.telefone}
          onChange={(e) => handleChange('telefone', e.target.value)}
          placeholder="(11) 99999-9999"
          required
          disabled={loading}
        />
        <p className="text-xs text-gray-500">
          Telefone para contato direto com o montador
        </p>
      </div>

      {/* Preview do Cadastro */}
      {formData.nome && formData.categoria && formData.valorFixo > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Preview do Cadastro:</h4>
          <div className="space-y-1 text-sm text-blue-800">
            <div><strong>Nome:</strong> {formData.nome}</div>
            <div><strong>Categoria:</strong> {categorias.find(c => c.value === formData.categoria)?.label}</div>
            <div><strong>Valor:</strong> {formatCurrency(formData.valorFixo)} por serviço</div>
            {formData.telefone && <div><strong>Telefone:</strong> {formData.telefone}</div>}
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
            isEditing ? 'Atualizar Montador' : 'Cadastrar Montador'
          )}
        </Button>
      </div>
    </form>
  );
}