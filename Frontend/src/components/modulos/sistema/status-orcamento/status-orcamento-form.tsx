import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { StatusOrcamento, StatusOrcamentoFormData } from '@/types/sistema';

const statusOrcamentoSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  descricao: z.string().optional(),
  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato #RRGGBB').optional(),
  ordem: z.number().min(0, 'Ordem deve ser maior ou igual a zero'),
});

interface StatusOrcamentoFormProps {
  initialData?: StatusOrcamento | null;
  onSubmit: (data: StatusOrcamentoFormData) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
}

export function StatusOrcamentoForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false
}: StatusOrcamentoFormProps) {
  const isEditing = !!initialData;

  const form = useForm<StatusOrcamentoFormData>({
    resolver: zodResolver(statusOrcamentoSchema),
    defaultValues: {
      nome: initialData?.nome || '',
      descricao: initialData?.descricao || '',
      cor: initialData?.cor || '#3B82F6',
      ordem: initialData?.ordem || 0,
    }
  });

  const handleSubmit = async (data: StatusOrcamentoFormData) => {
    const success = await onSubmit(data);
    if (success) {
      form.reset();
    }
  };

  const handleCancel = () => {
    form.reset();
    onCancel();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Nome */}
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Status *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ex: Em Análise"
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Descrição */}
        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Descrição opcional do status..."
                  disabled={loading}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Cor e Ordem */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cor</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input
                      {...field}
                      type="color"
                      className="w-12 h-10 p-1 border rounded"
                      disabled={loading}
                    />
                    <Input
                      {...field}
                      placeholder="#3B82F6"
                      disabled={loading}
                      className="flex-1"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ordem"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ordem *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    placeholder="0"
                    disabled={loading}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>


        {/* Botões */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')}
          </Button>
        </div>
      </form>
    </Form>
  );
}