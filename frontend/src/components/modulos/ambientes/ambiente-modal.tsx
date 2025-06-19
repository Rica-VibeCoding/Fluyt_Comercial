'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Plus, Trash2, Home } from 'lucide-react';
import { AmbienteFormData, Acabamento } from '../../../types/ambiente';

interface AmbienteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AmbienteFormData) => void;
}

export function AmbienteModal({ open, onOpenChange, onSubmit }: AmbienteModalProps) {
  const [nome, setNome] = useState('');
  const [acabamentos, setAcabamentos] = useState<Omit<Acabamento, 'id'>[]>([]);
  const [valorTotal, setValorTotal] = useState(0);

  const adicionarAcabamento = () => {
    setAcabamentos(prev => [...prev, {
      tipo: 'Porta',
      cor: '',
      espessura: '',
      material: '',
      valor: 0
    }]);
  };

  const removerAcabamento = (index: number) => {
    setAcabamentos(prev => prev.filter((_, i) => i !== index));
  };

  const atualizarAcabamento = (index: number, campo: keyof Omit<Acabamento, 'id'>, valor: any) => {
    setAcabamentos(prev => prev.map((acabamento, i) => 
      i === index ? { ...acabamento, [campo]: valor } : acabamento
    ));
  };

  const handleSubmit = () => {
    if (nome && acabamentos.length > 0 && valorTotal > 0) {
      onSubmit({ nome, acabamentos, valorTotal });
      setNome('');
      setAcabamentos([]);
      setValorTotal(0);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setNome('');
    setAcabamentos([]);
    setValorTotal(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[70vh] flex flex-col bg-white dark:bg-slate-900">
        <DialogHeader className="border-b border-slate-200 dark:border-slate-700 p-2 pb-1">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
              <Home className="h-3 w-3 text-slate-500" />
            </div>
            <DialogTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Criar Ambiente
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-1">
                {/* Nome do Ambiente */}
                <div>
                  <Label htmlFor="nome" className="text-xs font-medium text-slate-700">Nome do Ambiente *</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Cozinha, Dormitório, Sala..."
                    className="h-8 text-sm border-slate-300 focus:border-slate-400"
                  />
                </div>

                {/* Seção de Acabamentos */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-slate-700">Acabamentos</Label>
                    <Button 
                      type="button" 
                      onClick={adicionarAcabamento} 
                      className="h-7 px-2 text-xs bg-slate-600 hover:bg-slate-700 text-white"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Inserir
                    </Button>
                  </div>

                  {acabamentos.map((acabamento, index) => (
                    <Card key={index} className="border-slate-200">
                      <CardHeader className="p-2 pb-1">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xs font-medium text-slate-700">
                            Acabamento {index + 1}
                          </CardTitle>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removerAcabamento(index)}
                            className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-2 pt-0">
                        <div className="grid grid-cols-2 gap-1">
                          <div>
                            <Label className="text-xs font-medium text-slate-700">Tipo</Label>
                            <Select
                              value={acabamento.tipo}
                              onValueChange={(value) => atualizarAcabamento(index, 'tipo', value)}
                            >
                              <SelectTrigger className="h-8 text-sm border-slate-300 focus:border-slate-400">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Porta">Porta</SelectItem>
                                <SelectItem value="Caixa">Caixa</SelectItem>
                                <SelectItem value="Painel">Painel</SelectItem>
                                <SelectItem value="Porta de Vidro">Porta de Vidro</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-xs font-medium text-slate-700">Cor</Label>
                            <Input
                              value={acabamento.cor}
                              onChange={(e) => atualizarAcabamento(index, 'cor', e.target.value)}
                              placeholder="Ex: Itapuã, Branco TX..."
                              className="h-8 text-sm border-slate-300 focus:border-slate-400"
                            />
                          </div>

                          <div>
                            <Label className="text-xs font-medium text-slate-700">Espessura</Label>
                            <Input
                              value={acabamento.espessura}
                              onChange={(e) => atualizarAcabamento(index, 'espessura', e.target.value)}
                              placeholder="Ex: 15 mm, 18 mm..."
                              className="h-8 text-sm border-slate-300 focus:border-slate-400"
                            />
                          </div>

                          <div>
                            <Label className="text-xs font-medium text-slate-700">Material</Label>
                            <Input
                              value={acabamento.material}
                              onChange={(e) => atualizarAcabamento(index, 'material', e.target.value)}
                              placeholder="Ex: MDP, MDF..."
                              className="h-8 text-sm border-slate-300 focus:border-slate-400"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {acabamentos.length === 0 && (
                    <div className="text-center py-4 text-slate-500 text-xs bg-slate-50 border border-slate-200 rounded">
                      Nenhum acabamento adicionado. Clique em "Inserir" para começar.
                    </div>
                  )}
                </div>

                {/* Valor Total */}
                <div>
                  <Label htmlFor="valorTotal" className="text-xs font-medium text-slate-700">Valor Total do Ambiente (R$) *</Label>
                  <Input
                    id="valorTotal"
                    type="number"
                    min="0"
                    step="0.01"
                    value={valorTotal}
                    onChange={(e) => setValorTotal(parseFloat(e.target.value) || 0)}
                    placeholder="0,00"
                    className="h-8 text-sm border-slate-300 focus:border-slate-400"
                  />
                </div>

                {valorTotal > 0 && (
                  <div className="text-right">
                    <span className="text-xs font-medium text-slate-700">
                      Valor Total: {valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 pt-1">
              <div className="flex justify-end items-center gap-1">
                <button 
                  type="button" 
                  onClick={handleCancel}
                  className="px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={!nome || acabamentos.length === 0 || valorTotal === 0}
                  className="px-4 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium border border-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Criar Ambiente
                </button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}