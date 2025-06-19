import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import type { SetorFormData } from '@/types/sistema';

interface SetorFormProps {
  formData: SetorFormData;
  onFormDataChange: (data: SetorFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing: boolean;
  loading?: boolean;
}

export function SetorForm({
  formData,
  onFormDataChange,
  onSubmit,
  onCancel,
  isEditing,
  loading = false
}: SetorFormProps) {

  const handleChange = (field: keyof SetorFormData, value: string) => {
    onFormDataChange({
      ...formData,
      [field]: value
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Nome */}
      <div className="space-y-2">
        <Label htmlFor="nome" className="text-sm font-medium">
          Nome do Setor *
        </Label>
        <Input
          id="nome"
          type="text"
          value={formData.nome}
          onChange={(e) => handleChange('nome', e.target.value)}
          placeholder="Ex: Vendas, Medição, Montagem..."
          className="w-full"
          required
          disabled={loading}
        />
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="descricao" className="text-sm font-medium">
          Descrição
        </Label>
        <Textarea
          id="descricao"
          value={formData.descricao}
          onChange={(e) => handleChange('descricao', e.target.value)}
          placeholder="Descreva as responsabilidades e atividades deste setor..."
          className="w-full min-h-[100px] resize-none"
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
            isEditing ? 'Atualizar Setor' : 'Criar Setor'
          )}
        </Button>
      </div>
    </form>
  );
}