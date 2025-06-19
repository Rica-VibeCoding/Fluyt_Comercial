import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { EmpresaFormData } from '@/types/sistema';

interface EmpresaFormProps {
  formData: EmpresaFormData;
  onFormDataChange: (data: EmpresaFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing: boolean;
  loading?: boolean;
}

export function EmpresaForm({ 
  formData, 
  onFormDataChange, 
  onSubmit, 
  onCancel, 
  isEditing,
  loading = false
}: EmpresaFormProps) {
  
  const handleInputChange = (field: keyof EmpresaFormData, value: string) => {
    onFormDataChange({
      ...formData,
      [field]: value
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="nome">Razão Social *</Label>
        <Input
          id="nome"
          value={formData.nome}
          onChange={(e) => handleInputChange('nome', e.target.value)}
          placeholder="Nome da empresa"
          required
        />
      </div>
      <div>
        <Label htmlFor="cnpj">CNPJ *</Label>
        <Input
          id="cnpj"
          value={formData.cnpj}
          onChange={(e) => handleInputChange('cnpj', e.target.value)}
          placeholder="00.000.000/0000-00"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="email@empresa.com.br"
            required
          />
        </div>
        <div>
          <Label htmlFor="telefone">Telefone *</Label>
          <Input
            id="telefone"
            value={formData.telefone}
            onChange={(e) => handleInputChange('telefone', e.target.value)}
            placeholder="(00) 00000-0000"
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="endereco">Endereço *</Label>
        <Input
          id="endereco"
          value={formData.endereco}
          onChange={(e) => handleInputChange('endereco', e.target.value)}
          placeholder="Endereço completo"
          required
        />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {isEditing ? 'Salvando...' : 'Criando...'}
            </div>
          ) : (
            isEditing ? 'Atualizar' : 'Cadastrar'
          )}
        </Button>
      </div>
    </form>
  );
}