"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Edit, Trash2, UserCog, ChevronDown, ChevronRight, DollarSign, Percent, Settings } from 'lucide-react';
import { TipoColaborador } from '@/types/colaboradores';

interface TipoColaboradorTableProps {
  tipos: TipoColaborador[];
  onEdit: (tipo: TipoColaborador) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  loading?: boolean;
}

export function TipoColaboradorTable({ 
  tipos, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  loading = false 
}: TipoColaboradorTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRowExpansion = (tipoId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(tipoId)) {
      newExpandedRows.delete(tipoId);
    } else {
      newExpandedRows.add(tipoId);
    }
    setExpandedRows(newExpandedRows);
  };

  const getTipoNumero = (index: number) => {
    return String(index + 1).padStart(3, '0');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentual = (value: number) => {
    return `${value}%`;
  };

  if (tipos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border-0 rounded-lg bg-white shadow-md">
        <UserCog className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum tipo de colaborador cadastrado</h3>
        <p className="text-gray-500 text-center max-w-sm">
          Comece adicionando tipos para organizar seus colaboradores.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-0 bg-blue-50/30 shadow-md">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 border-b border-slate-200">
            <TableHead className="font-semibold text-slate-700 h-10 w-12"></TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Código</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Tipo</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Categoria</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Remuneração</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Status</TableHead>
            <TableHead className="text-right font-semibold text-slate-700 h-10">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tipos.map((tipo, index) => (
            <React.Fragment key={tipo.id}>
              <TableRow 
                className="h-12 bg-white hover:bg-blue-50/50 cursor-pointer transition-colors"
                onClick={() => toggleRowExpansion(tipo.id)}
              >
                {/* Expand Icon */}
                <TableCell className="py-2 w-12">
                  {expandedRows.has(tipo.id) ? (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  )}
                </TableCell>

                {/* Código */}
                <TableCell className="py-2">
                  <span className="text-sm font-medium font-mono text-slate-900">#{getTipoNumero(index)}</span>
                </TableCell>

                {/* Tipo */}
                <TableCell className="py-2">
                  <div className="text-sm font-medium text-slate-900">{tipo.nome}</div>
                </TableCell>

                {/* Categoria */}
                <TableCell className="py-2">
                  <Badge 
                    variant={tipo.categoria === 'FUNCIONARIO' ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {tipo.categoria}
                  </Badge>
                </TableCell>

                {/* Remuneração */}
                <TableCell className="py-2">
                  <div className="text-sm text-slate-900">
                    {tipo.tipoPercentual && (
                      <span>{formatPercentual(tipo.percentualValor)} sobre {tipo.tipoPercentual.toLowerCase()}</span>
                    )}
                    {tipo.salarioBase > 0 && (
                      <span> + {formatCurrency(tipo.salarioBase)}</span>
                    )}
                    {tipo.valorPorServico > 0 && (
                      <span> + {formatCurrency(tipo.valorPorServico)}/serviço</span>
                    )}
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell className="py-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={tipo.ativo ?? false}
                      onCheckedChange={() => onToggleStatus(tipo.id)}
                      className="data-[state=checked]:bg-slate-600"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Badge variant={tipo.ativo ? "default" : "secondary"} className={tipo.ativo ? "bg-slate-600 hover:bg-slate-700" : ""}>
                      {tipo.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </TableCell>

                {/* Ações */}
                <TableCell className="text-right py-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(tipo)}
                      className="h-8 w-8 p-0 hover:bg-blue-50/50"
                    >
                      <Edit className="h-3 w-3 text-slate-500" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-50/50"
                        >
                          <Trash2 className="h-3 w-3 text-slate-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o tipo de colaborador <strong>{tipo.nome}</strong>?
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => onDelete(tipo.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>

              {/* LINHA EXPANDIDA COM DETALHES */}
              {expandedRows.has(tipo.id) && (
                <TableRow key={`${tipo.id}-expanded`} className="bg-blue-50/20 hover:bg-blue-50/30">
                  <TableCell colSpan={7} className="py-4">
                    <div className="pl-4">
                      {/* Layout Grid Responsivo - Mais denso */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        
                        {/* COLUNA 1 - REMUNERAÇÃO */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Remuneração</h4>
                          
                          {/* Percentual */}
                          {tipo.tipoPercentual && (
                            <div className="flex items-center gap-2">
                              <Percent className="h-3 w-3 text-blue-500" />
                              <span className="text-xs font-medium text-slate-600 min-w-[60px]">Percentual:</span>
                              <span className="text-xs text-slate-900">
                                {formatPercentual(tipo.percentualValor)} sobre {tipo.tipoPercentual.toLowerCase()}
                              </span>
                            </div>
                          )}

                          {/* Salário Base */}
                          {tipo.salarioBase > 0 && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-3 w-3 text-green-500" />
                              <span className="text-xs font-medium text-slate-600 min-w-[60px]">Salário:</span>
                              <span className="text-xs text-slate-900">{formatCurrency(tipo.salarioBase)}</span>
                            </div>
                          )}

                          {/* Valor por Serviço */}
                          {tipo.valorPorServico > 0 && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-3 w-3 text-purple-500" />
                              <span className="text-xs font-medium text-slate-600 min-w-[60px]">Por serviço:</span>
                              <span className="text-xs text-slate-900">{formatCurrency(tipo.valorPorServico)}</span>
                            </div>
                          )}

                          {/* Mínimo Garantido */}
                          {tipo.minimoGarantido > 0 && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-3 w-3 text-orange-500" />
                              <span className="text-xs font-medium text-slate-600 min-w-[60px]">Mínimo:</span>
                              <span className="text-xs text-slate-900">{formatCurrency(tipo.minimoGarantido)}</span>
                            </div>
                          )}
                        </div>

                        {/* COLUNA 2 - CONFIGURAÇÕES */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Configurações</h4>
                          
                          {/* Opcional no Orçamento */}
                          <div className="flex items-center gap-2">
                            <Settings className="h-3 w-3 text-blue-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[50px]">Opcional:</span>
                            <Badge 
                              variant={tipo.opcionalNoOrcamento ? "secondary" : "outline"}
                              className="text-xs"
                            >
                              {tipo.opcionalNoOrcamento ? 'Sim' : 'Não'}
                            </Badge>
                          </div>

                          {/* Categoria */}
                          <div className="flex items-center gap-2">
                            <UserCog className="h-3 w-3 text-purple-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[50px]">Categoria:</span>
                            <Badge 
                              variant={tipo.categoria === 'FUNCIONARIO' ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {tipo.categoria}
                            </Badge>
                          </div>
                        </div>

                        {/* COLUNA 3 - STATUS E DATAS */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Status</h4>
                          
                          {/* Data de Criação */}
                          <div className="flex items-center gap-2">
                            <UserCog className="h-3 w-3 text-slate-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[50px]">Criado:</span>
                            <span className="text-xs text-slate-900">
                              {new Date(tipo.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>

                          {/* Status Visual */}
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${tipo.ativo ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-xs font-medium text-slate-600 min-w-[50px]">Status:</span>
                            <Badge 
                              variant={tipo.ativo ? "default" : "secondary"} 
                              className={`text-xs ${tipo.ativo ? "bg-green-600 hover:bg-green-700" : ""}`}
                            >
                              {tipo.ativo ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                        </div>

                      </div>

                      {/* Descrição */}
                      {tipo.descricao && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Descrição</h4>
                          <p className="text-xs text-slate-700">{tipo.descricao}</p>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            Carregando tipos...
          </div>
        </div>
      )}
    </div>
  );
} 