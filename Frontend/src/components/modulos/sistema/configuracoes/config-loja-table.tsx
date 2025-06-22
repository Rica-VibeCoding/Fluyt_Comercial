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
import { Edit, Trash2, Store, ChevronDown, ChevronRight, Percent, DollarSign, Hash, Truck, Settings } from 'lucide-react';
import type { ConfiguracaoLoja } from '@/types/sistema';

interface ConfigLojaTableProps {
  configuracoes: ConfiguracaoLoja[];
  onEdit: (config: ConfiguracaoLoja) => void;
  onDelete: (storeId: string) => void;
  loading?: boolean;
}

export function ConfigLojaTable({ 
  configuracoes, 
  onEdit, 
  onDelete,
  loading = false 
}: ConfigLojaTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRowExpansion = (storeId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(storeId)) {
      newExpandedRows.delete(storeId);
    } else {
      newExpandedRows.add(storeId);
    }
    setExpandedRows(newExpandedRows);
  };

  const getConfigNumero = (index: number) => {
    return String(index + 1).padStart(3, '0');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value}%`;
  };

  if (configuracoes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border-0 rounded-lg bg-white shadow-md">
        <Store className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma configuração cadastrada</h3>
        <p className="text-gray-500 text-center max-w-sm">
          Configure os parâmetros das lojas para personalizar cálculos e operações.
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
            <TableHead className="font-semibold text-slate-700 h-10">Loja</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Deflator</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Descontos</TableHead>
            <TableHead className="text-right font-semibold text-slate-700 h-10">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {configuracoes.map((config, index) => (
            <React.Fragment key={config.storeId}>
              <TableRow 
                className="h-12 bg-white hover:bg-blue-50/50 cursor-pointer transition-colors"
                onClick={() => toggleRowExpansion(config.storeId)}
              >
                {/* Expand Icon */}
                <TableCell className="py-2 w-12">
                  {expandedRows.has(config.storeId) ? (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  )}
                </TableCell>

                {/* Código */}
                <TableCell className="py-2">
                  <span className="text-sm font-medium font-mono text-slate-900">#{getConfigNumero(index)}</span>
                </TableCell>

                {/* Loja */}
                <TableCell className="py-2">
                  <div className="text-sm font-medium text-slate-900">{config.storeName}</div>
                </TableCell>

                {/* Deflator */}
                <TableCell className="py-2">
                  <div className="flex items-center gap-1 text-sm font-medium text-blue-600">
                    <Percent className="h-3 w-3" />
                    {formatPercentage(config.deflatorCost)}
                  </div>
                </TableCell>

                {/* Descontos - RESUMIDO */}
                <TableCell className="py-2">
                  <div className="text-xs text-slate-700">
                    V:{config.discountLimitVendor}% | G:{config.discountLimitManager}% | A:{config.discountLimitAdminMaster}%
                  </div>
                </TableCell>

                {/* Ações */}
                <TableCell className="text-right py-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(config)}
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
                            Tem certeza que deseja excluir as configurações da loja <strong>{config.storeName}</strong>?
                            Esta ação não pode ser desfeita e a loja voltará às configurações padrão.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => onDelete(config.storeId)}
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
              {expandedRows.has(config.storeId) && (
                <TableRow key={`${config.storeId}-expanded`} className="bg-blue-50/20 hover:bg-blue-50/30">
                  <TableCell colSpan={6} className="py-4">
                    <div className="pl-4">
                      {/* Layout Grid Responsivo - Mais denso */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        
                        {/* COLUNA 1 - CONFIGURAÇÕES FINANCEIRAS */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Configurações Financeiras</h4>
                          
                          {/* Deflator */}
                          <div className="flex items-center gap-2">
                            <Percent className="h-3 w-3 text-blue-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[60px]">Deflator:</span>
                            <span className="text-xs font-medium text-blue-600">{formatPercentage(config.deflatorCost)}</span>
                          </div>

                          {/* Valor Medição */}
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-3 w-3 text-green-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[60px]">Medição:</span>
                            <span className="text-xs text-slate-900">{formatCurrency(config.defaultMeasurementValue)}</span>
                          </div>

                          {/* Frete */}
                          <div className="flex items-center gap-2">
                            <Truck className="h-3 w-3 text-orange-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[60px]">Frete:</span>
                            <span className="text-xs text-slate-900">{formatPercentage(config.freightPercentage)}</span>
                          </div>
                        </div>

                        {/* COLUNA 2 - LIMITES DE DESCONTO */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Limites de Desconto</h4>
                          
                          {/* Vendedor */}
                          <div className="flex items-center gap-2">
                            <Settings className="h-3 w-3 text-gray-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[60px]">Vendedor:</span>
                            <Badge variant="outline" className="text-xs">
                              {formatPercentage(config.discountLimitVendor)}
                            </Badge>
                          </div>

                          {/* Gerente */}
                          <div className="flex items-center gap-2">
                            <Settings className="h-3 w-3 text-blue-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[60px]">Gerente:</span>
                            <Badge variant="default" className="text-xs">
                              {formatPercentage(config.discountLimitManager)}
                            </Badge>
                          </div>

                          {/* Admin Master */}
                          <div className="flex items-center gap-2">
                            <Settings className="h-3 w-3 text-red-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[60px]">Admin:</span>
                            <Badge variant="destructive" className="text-xs">
                              {formatPercentage(config.discountLimitAdminMaster)}
                            </Badge>
                          </div>
                        </div>

                        {/* COLUNA 3 - NUMERAÇÃO */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Numeração</h4>
                          
                          {/* Prefixo */}
                          <div className="flex items-center gap-2">
                            <Hash className="h-3 w-3 text-purple-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[60px]">Prefixo:</span>
                            <span className="text-xs font-mono text-slate-900">{config.numberPrefix || '--'}</span>
                          </div>

                          {/* Formato */}
                          <div className="flex items-center gap-2">
                            <Hash className="h-3 w-3 text-indigo-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[60px]">Formato:</span>
                            <span className="text-xs font-mono text-slate-900">{config.numberFormat || '--'}</span>
                          </div>

                          {/* Número Inicial */}
                          <div className="flex items-center gap-2">
                            <Hash className="h-3 w-3 text-slate-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[60px]">Inicial:</span>
                            <span className="text-xs font-mono text-slate-900">{config.initialNumber || '1'}</span>
                          </div>
                        </div>

                      </div>
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
            Carregando configurações...
          </div>
        </div>
      )}
    </div>
  );
} 