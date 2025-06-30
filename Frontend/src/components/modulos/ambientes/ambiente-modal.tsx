/**
 * MODAL DE AMBIENTE - COMPATÍVEL COM BACKEND
 * Usa apenas os campos necessários: nome, valores, origem
 * Remove acabamentos (estrutura legada)
 */

'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Home, DollarSign, Calendar } from 'lucide-react';
import { AmbienteFormData } from '../../../types/ambiente';

interface AmbienteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AmbienteFormData) => void;
  clienteId?: string;
}

export function AmbienteModal({ open, onOpenChange, onSubmit, clienteId }: AmbienteModalProps) {
  const [nome, setNome] = useState('');
  const [valorVenda, setValorVenda] = useState<number | undefined>(undefined);
  const [valorCustoFabrica, setValorCustoFabrica] = useState<number | undefined>(undefined);
  const [origem, setOrigem] = useState<'manual' | 'xml'>('manual');
  const [dataImportacao, setDataImportacao] = useState('');
  const [horaImportacao, setHoraImportacao] = useState('');

  const resetForm = () => {
    setNome('');
    setValorVenda(undefined);
    setValorCustoFabrica(undefined);
    setOrigem('manual');
    setDataImportacao('');
    setHoraImportacao('');
  };

  const handleSubmit = () => {
    if (!nome.trim()) return;
    if (!clienteId) return;

    const formData: AmbienteFormData = {
      nome: nome.trim(),
      clienteId,
      origem,
    };

    // Adicionar valores se informados
    if (valorVenda && valorVenda > 0) {
      formData.valorVenda = valorVenda;
    }
    if (valorCustoFabrica && valorCustoFabrica > 0) {
      formData.valorCustoFabrica = valorCustoFabrica;
    }

    // Adicionar data/hora se origem for XML
    if (origem === 'xml') {
      if (dataImportacao) {
        formData.dataImportacao = dataImportacao;
      }
      if (horaImportacao) {
        formData.horaImportacao = horaImportacao;
      }
    }

    onSubmit(formData);
    resetForm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  const isFormValid = nome.trim() && clienteId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white dark:bg-slate-900">
        <DialogHeader className="border-b border-slate-200 dark:border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 rounded-lg border border-blue-200">
              <Home className="h-4 w-4 text-blue-600" />
            </div>
            <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Novo Ambiente
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
          {/* Nome do Ambiente */}
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-sm font-medium text-slate-700">
              Nome do Ambiente *
            </Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Cozinha, Dormitório, Sala de Estar..."
              className="h-10 border-slate-300 focus:border-blue-500"
              autoFocus
            />
          </div>

          {/* Origem */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              Origem
            </Label>
            <Select value={origem} onValueChange={(value: 'manual' | 'xml') => setOrigem(value)}>
              <SelectTrigger className="h-10 border-slate-300 focus:border-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="xml">Importado (XML)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Valores */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="valorVenda" className="text-sm font-medium text-slate-700">
                Valor de Venda
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="valorVenda"
                  type="number"
                  min="0"
                  step="0.01"
                  value={valorVenda || ''}
                  onChange={(e) => setValorVenda(e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="0,00"
                  className="h-10 pl-10 border-slate-300 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valorCusto" className="text-sm font-medium text-slate-700">
                Valor de Custo
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="valorCusto"
                  type="number"
                  min="0"
                  step="0.01"
                  value={valorCustoFabrica || ''}
                  onChange={(e) => setValorCustoFabrica(e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="0,00"
                  className="h-10 pl-10 border-slate-300 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Campos de Importação (apenas se origem for XML) */}
          {origem === 'xml' && (
            <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Dados de Importação</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="dataImportacao" className="text-sm font-medium text-slate-700">
                    Data
                  </Label>
                  <Input
                    id="dataImportacao"
                    type="date"
                    value={dataImportacao}
                    onChange={(e) => setDataImportacao(e.target.value)}
                    className="h-10 border-slate-300 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="horaImportacao" className="text-sm font-medium text-slate-700">
                    Hora
                  </Label>
                  <Input
                    id="horaImportacao"
                    type="time"
                    value={horaImportacao}
                    onChange={(e) => setHoraImportacao(e.target.value)}
                    className="h-10 border-slate-300 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Resumo de Valores */}
          {(valorVenda || valorCustoFabrica) && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-sm font-medium text-slate-700 mb-2">Resumo</div>
              <div className="space-y-1 text-sm">
                {valorVenda && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Valor de Venda:</span>
                    <span className="font-medium text-green-600 tabular-nums">
                      {valorVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                )}
                {valorCustoFabrica && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Valor de Custo:</span>
                    <span className="font-medium text-orange-600 tabular-nums">
                      {valorCustoFabrica.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                )}
                {valorVenda && valorCustoFabrica && (
                  <div className="flex justify-between pt-1 border-t border-slate-300">
                    <span className="text-slate-600">Margem:</span>
                    <span className="font-medium text-blue-600 tabular-nums">
                      {((valorVenda - valorCustoFabrica) / valorVenda * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button 
              type="button" 
              variant="outline"
              onClick={handleCancel}
              className="px-4 py-2"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={!isFormValid}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Criar Ambiente
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}