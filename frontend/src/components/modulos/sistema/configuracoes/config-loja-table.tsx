import React from 'react';
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
import { Edit, Trash2, Store } from 'lucide-react';
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
            <TableHead className="font-semibold text-slate-700 h-10">Loja</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Deflator</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Limites de Desconto</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Frete</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Numeração</TableHead>
            <TableHead className="text-right font-semibold text-slate-700 h-10">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {configuracoes.map((config) => (
            <TableRow key={config.storeId} className="h-12 bg-white hover:bg-blue-50/50">
              <TableCell className="py-2">
                <div>
                  <div className="font-medium">{config.storeName}</div>
                  <div className="text-sm text-muted-foreground">
                    Medição: {formatCurrency(config.defaultMeasurementValue)}
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-2">
                <div className="text-sm">
                  <div>{formatPercentage(config.deflatorCost)}</div>
                  <div className="text-muted-foreground">Custo Fábrica</div>
                </div>
              </TableCell>
              <TableCell className="py-2">
                <div className="text-sm">
                  <div>V:{formatPercentage(config.discountLimitVendor)} G:{formatPercentage(config.discountLimitManager)}</div>
                  <div className="text-muted-foreground">Admin: {formatPercentage(config.discountLimitAdminMaster)}</div>
                </div>
              </TableCell>
              <TableCell className="py-2">
                <div className="text-sm">
                  <div>{formatPercentage(config.freightPercentage)}</div>
                  <div className="text-muted-foreground">Percentual</div>
                </div>
              </TableCell>
              <TableCell className="py-2">
                <div className="text-sm">
                  <div>{config.numberPrefix}-{config.numberFormat}</div>
                  <div className="text-muted-foreground">Inicial: {config.initialNumber}</div>
                </div>
              </TableCell>
              <TableCell className="text-right py-2">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(config)}
                    className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
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