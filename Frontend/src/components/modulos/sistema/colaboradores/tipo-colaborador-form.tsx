"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { TipoColaborador, TipoColaboradorFormData, CategoriaColaborador, TipoPercentual } from '@/types/colaboradores';

interface TipoColaboradorFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TipoColaboradorFormData) => void;
  editingTipo?: TipoColaborador;
  isLoading?: boolean;
}

export function TipoColaboradorForm({ isOpen, onClose, onSubmit, editingTipo, isLoading }: TipoColaboradorFormProps) {
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<TipoColaboradorFormData>({
    defaultValues: {
      nome: editingTipo?.nome || '',
      categoria: editingTipo?.categoria || 'FUNCIONARIO',
      tipoPercentual: editingTipo?.tipoPercentual || 'VENDA',
      percentualValor: editingTipo?.percentualValor || 0,
      minimoGarantido: editingTipo?.minimoGarantido || 0,
      salarioBase: editingTipo?.salarioBase || 0,
      valorPorServico: editingTipo?.valorPorServico || 0,
      opcionalNoOrcamento: editingTipo?.opcionalNoOrcamento || false,
      ordemExibicao: editingTipo?.ordemExibicao || 1,
      descricao: editingTipo?.descricao || ''
    }
  });

  const categoria = watch('categoria');

  React.useEffect(() => {
    if (editingTipo) {
      reset({
        nome: editingTipo.nome,
        categoria: editingTipo.categoria,
        tipoPercentual: editingTipo.tipoPercentual,
        percentualValor: editingTipo.percentualValor,
        minimoGarantido: editingTipo.minimoGarantido,
        salarioBase: editingTipo.salarioBase,
        valorPorServico: editingTipo.valorPorServico,
        opcionalNoOrcamento: editingTipo.opcionalNoOrcamento,
        ordemExibicao: editingTipo.ordemExibicao,
        descricao: editingTipo.descricao || ''
      });
    } else {
      reset({
        nome: '',
        categoria: 'FUNCIONARIO',
        tipoPercentual: 'VENDA',
        percentualValor: 0,
        minimoGarantido: 0,
        salarioBase: 0,
        valorPorServico: 0,
        opcionalNoOrcamento: false,
        ordemExibicao: 1,
        descricao: ''
      });
    }
  }, [editingTipo, reset]);

  const handleFormSubmit = (data: TipoColaboradorFormData) => {
    onSubmit(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {editingTipo ? 'Editar Tipo de Colaborador' : 'Novo Tipo de Colaborador'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto px-1 space-y-4">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 border-b pb-2">Informações Básicas</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    {...register('nome', { required: 'Nome é obrigatório' })}
                    placeholder="Ex: Vendedor, Montador, Arquiteto"
                  />
                  {errors.nome && (
                    <p className="text-sm text-red-600">{errors.nome.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select
                    value={categoria}
                    onValueChange={(value: CategoriaColaborador) => setValue('categoria', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FUNCIONARIO">Funcionário</SelectItem>
                      <SelectItem value="PARCEIRO">Parceiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  {...register('descricao')}
                  placeholder="Descrição opcional do tipo de colaborador"
                  rows={2}
                />
              </div>
            </div>

            {/* Configuração de Remuneração */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 border-b pb-2">Remuneração</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipoPercentual">Tipo de Percentual</Label>
                  <Select
                    value={watch('tipoPercentual')}
                    onValueChange={(value: TipoPercentual) => setValue('tipoPercentual', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VENDA">Sobre Venda</SelectItem>
                      <SelectItem value="CUSTO">Sobre Custo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="percentualValor">Percentual (%)</Label>
                  <Input
                    id="percentualValor"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    {...register('percentualValor', { 
                      valueAsNumber: true,
                      min: { value: 0, message: 'Percentual deve ser positivo' },
                      max: { value: 100, message: 'Percentual não pode exceder 100%' }
                    })}
                    placeholder="0.00"
                  />
                  {errors.percentualValor && (
                    <p className="text-sm text-red-600">{errors.percentualValor.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salarioBase">Salário Base (R$)</Label>
                  <Input
                    id="salarioBase"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('salarioBase', { 
                      valueAsNumber: true,
                      min: { value: 0, message: 'Salário deve ser positivo' }
                    })}
                    placeholder="0.00"
                  />
                  {errors.salarioBase && (
                    <p className="text-sm text-red-600">{errors.salarioBase.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valorPorServico">Valor por Serviço (R$)</Label>
                  <Input
                    id="valorPorServico"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('valorPorServico', { 
                      valueAsNumber: true,
                      min: { value: 0, message: 'Valor deve ser positivo' }
                    })}
                    placeholder="0.00"
                  />
                  {errors.valorPorServico && (
                    <p className="text-sm text-red-600">{errors.valorPorServico.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimoGarantido">Mínimo Garantido (R$)</Label>
                <Input
                  id="minimoGarantido"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('minimoGarantido', { 
                    valueAsNumber: true,
                    min: { value: 0, message: 'Valor deve ser positivo' }
                  })}
                  placeholder="0.00"
                />
                {errors.minimoGarantido && (
                  <p className="text-sm text-red-600">{errors.minimoGarantido.message}</p>
                )}
              </div>
            </div>

            {/* Configurações Operacionais */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 border-b pb-2">Configurações</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ordemExibicao">Ordem de Exibição</Label>
                  <Input
                    id="ordemExibicao"
                    type="number"
                    min="1"
                    {...register('ordemExibicao', { 
                      valueAsNumber: true,
                      min: { value: 1, message: 'Ordem deve ser maior que 0' }
                    })}
                    placeholder="1"
                  />
                  {errors.ordemExibicao && (
                    <p className="text-sm text-red-600">{errors.ordemExibicao.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="opcionalNoOrcamento"
                      checked={watch('opcionalNoOrcamento')}
                      onCheckedChange={(checked) => setValue('opcionalNoOrcamento', checked)}
                    />
                    <Label htmlFor="opcionalNoOrcamento">Opcional no Orçamento</Label>
                  </div>
                  <p className="text-xs text-gray-500">
                    Se marcado, este colaborador será opcional na criação de orçamentos
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800"
            >
              {isLoading ? 'Salvando...' : editingTipo ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 