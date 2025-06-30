'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Home, DollarSign } from 'lucide-react';
import { AmbienteFormData } from '../../../types/ambiente';
import { formatarMoeda } from '@/lib/formatters';
import { useToast } from '../../ui/use-toast';

interface AmbienteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AmbienteFormData) => void;
  clienteId?: string;
}

export function AmbienteModal({ open, onOpenChange, onSubmit, clienteId }: AmbienteModalProps) {
  const { toast } = useToast();
  const [nome, setNome] = useState('');
  const [valorCustoFabrica, setValorCustoFabrica] = useState<number | undefined>();
  const [valorVenda, setValorVenda] = useState<number | undefined>();

  // Validações de entrada para móveis planejados
  const validarDados = () => {
    const erros: string[] = [];
    
    if (!nome.trim()) {
      erros.push('Nome do ambiente é obrigatório');
    }
    
    if (valorCustoFabrica !== undefined && valorCustoFabrica < 0) {
      erros.push('Valor de custo não pode ser negativo');
    }
    
    if (valorVenda !== undefined && valorVenda < 0) {
      erros.push('Valor de venda não pode ser negativo');
    }
    
    if (valorCustoFabrica && valorVenda && valorVenda < valorCustoFabrica) {
      erros.push('Valor de venda deve ser maior que o custo');
    }
    
    return erros;
  };

  const handleSubmit = () => {
    if (!nome || !clienteId) return;
    
    const erros = validarDados();
    if (erros.length > 0) {
      toast({
        title: 'Erro de validação',
        description: erros.join('. '),
        variant: 'destructive'
      });
      return;
    }
    
    const data: AmbienteFormData = {
      nome: nome.trim(),
      clienteId,
      valorCustoFabrica,
      valorVenda,
      origem: 'manual'
    };
    onSubmit(data);
    // Limpar formulário
    setNome('');
    setValorCustoFabrica(undefined);
    setValorVenda(undefined);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setNome('');
    setValorCustoFabrica(undefined);
    setValorVenda(undefined);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white dark:bg-slate-900">
        <DialogHeader className="border-b border-slate-200 dark:border-slate-700 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded">
              <Home className="h-4 w-4 text-slate-600" />
            </div>
            <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Criar Ambiente
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
          {/* Nome do Ambiente */}
          <div>
            <Label htmlFor="nome" className="text-sm font-medium text-slate-700">
              Nome do Ambiente *
            </Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Cozinha, Dormitório, Sala..."
              className="mt-1"
              required
            />
          </div>

          {/* Valor Custo Fábrica */}
          <div>
            <Label htmlFor="valorCusto" className="text-sm font-medium text-slate-700">
              Valor Custo Fábrica (R$)
            </Label>
            <div className="relative mt-1">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="valorCusto"
                type="number"
                min="0"
                step="0.01"
                value={valorCustoFabrica || ''}
                onChange={(e) => setValorCustoFabrica(e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0,00"
                className="pl-10"
              />
            </div>
          </div>

          {/* Valor Venda */}
          <div>
            <Label htmlFor="valorVenda" className="text-sm font-medium text-slate-700">
              Valor Venda (R$)
            </Label>
            <div className="relative mt-1">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="valorVenda"
                type="number"
                min="0"
                step="0.01"
                value={valorVenda || ''}
                onChange={(e) => setValorVenda(e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0,00"
                className="pl-10"
              />
            </div>
          </div>

          {/* Resumo de valores */}
          {(valorCustoFabrica || valorVenda) && (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 space-y-1">
              {valorCustoFabrica && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Custo:</span>
                  <span className="font-medium">
                    {formatarMoeda(valorCustoFabrica)}
                  </span>
                </div>
              )}
              {valorVenda && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Venda:</span>
                  <span className="font-medium text-green-600">
                    {formatarMoeda(valorVenda)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!nome || !clienteId}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Criar Ambiente
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}