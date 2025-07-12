import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, X } from 'lucide-react';
import type { Procedencia, ProcedenciaFormData } from '@/types/sistema';

interface ProcedenciaFormProps {
  initialData?: Procedencia | null;
  onSubmit: (data: ProcedenciaFormData) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
}

export function ProcedenciaForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false
}: ProcedenciaFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<ProcedenciaFormData>({
    defaultValues: {
      nome: initialData?.nome || '',
      ativo: initialData?.ativo ?? true
    }
  });

  const ativoValue = watch('ativo');

  const onFormSubmit = async (data: ProcedenciaFormData) => {
    try {
      const sucesso = await onSubmit(data);
      if (!sucesso) {
        // Se houver erro, o toast será mostrado pelo hook
        return;
      }
    } catch (error) {
      console.error('Erro no formulário:', error);
    }
  };

  const isLoading = loading || isSubmitting;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Campo Nome */}
      <div className="space-y-2">
        <Label htmlFor="nome" className="text-sm font-medium text-gray-700">
          Nome da Procedência *
        </Label>
        <Input
          id="nome"
          {...register('nome', {
            required: 'Nome é obrigatório',
            minLength: {
              value: 2,
              message: 'Nome deve ter pelo menos 2 caracteres'
            },
            maxLength: {
              value: 100,
              message: 'Nome deve ter no máximo 100 caracteres'
            },
            validate: value => {
              const trimmed = value.trim();
              if (trimmed !== value) {
                return 'Nome não pode começar ou terminar com espaços';
              }
              if (trimmed.length === 0) {
                return 'Nome não pode estar vazio';
              }
              return true;
            }
          })}
          placeholder="Ex: Facebook, Google, Indicação..."
          className="h-10"
          disabled={isLoading}
        />
        {errors.nome && (
          <p className="text-sm text-red-600">{errors.nome.message}</p>
        )}
      </div>

      {/* Campo Status */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">
          Status
        </Label>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Switch
            checked={ativoValue}
            onCheckedChange={(checked) => setValue('ativo', checked)}
            disabled={isLoading}
            className="h-4 w-7"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {ativoValue ? 'Ativa' : 'Inativa'}
            </p>
            <p className="text-xs text-gray-600">
              {ativoValue 
                ? 'Procedência aparecerá no cadastro de clientes' 
                : 'Procedência não aparecerá no cadastro de clientes'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Cancelar
        </Button>
        
        <Button
          type="submit"
          disabled={isLoading}
          className="gap-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {initialData ? 'Atualizar' : 'Criar'} Procedência
        </Button>
      </div>
    </form>
  );
}