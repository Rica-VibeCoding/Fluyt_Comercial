import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { Edit, Trash2, DollarSign, TrendingUp, ChevronDown, ChevronRight, Target, ArrowUpDown, Percent } from 'lucide-react';
import type { RegraComissao } from '@/types/sistema';

interface ComissaoTableProps {
  regras: RegraComissao[];
  onEdit: (regra: RegraComissao) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

export function ComissaoTable({ 
  regras, 
  onEdit, 
  onDelete,
  loading = false 
}: ComissaoTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRowExpansion = (regraId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(regraId)) {
      newExpandedRows.delete(regraId);
    } else {
      newExpandedRows.add(regraId);
    }
    setExpandedRows(newExpandedRows);
  };

  const getRegraNumero = (index: number) => {
    return String(index + 1).padStart(3, '0');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getTipoBadge = (tipo: string) => {
    const variants = {
      'VENDEDOR': 'default',
      'GERENTE': 'secondary'
    } as const;
    return variants[tipo as keyof typeof variants] || 'default';
  };

  const getPercentualColor = (percentual: number) => {
    if (percentual >= 3) return 'text-green-600';
    if (percentual >= 2) return 'text-yellow-600';
    return 'text-gray-600';
  };

  // Agrupar por tipo e ordenar
  const regrasOrdenadas = regras
    .sort((a, b) => {
      if (a.tipo !== b.tipo) {
        return a.tipo.localeCompare(b.tipo);
      }
      return a.ordem - b.ordem;
    });

  if (regras.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border-0 rounded-lg bg-white shadow-md">
        <DollarSign className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma regra de comissão cadastrada</h3>
        <p className="text-gray-500 text-center max-w-sm">
          Configure faixas de comissão para motivar sua equipe de vendas.
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
            <TableHead className="font-semibold text-slate-700 h-10">Faixa de Valores</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Comissão</TableHead>
            <TableHead className="text-right font-semibold text-slate-700 h-10">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {regrasOrdenadas.map((regra, index) => (
            <React.Fragment key={regra.id}>
              <TableRow 
                className="h-12 bg-white hover:bg-blue-50/50 cursor-pointer transition-colors"
                onClick={() => toggleRowExpansion(regra.id)}
              >
                {/* Expand Icon */}
                <TableCell className="py-2 w-12">
                  {expandedRows.has(regra.id) ? (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  )}
                </TableCell>

                {/* Código */}
                <TableCell className="py-2">
                  <span className="text-sm font-medium font-mono text-slate-900">#{getRegraNumero(index)}</span>
                </TableCell>

                {/* Tipo */}
                <TableCell className="py-2">
                  <Badge 
                    variant={getTipoBadge(regra.tipo)}
                    className="text-xs"
                  >
                    {regra.tipo}
                  </Badge>
                </TableCell>

                {/* Faixa de Valores - RESUMIDA */}
                <TableCell className="py-2">
                  <div className="text-sm text-slate-900">
                    {formatCurrency(regra.valorMinimo)}
                    {regra.valorMaximo ? ` - ${formatCurrency(regra.valorMaximo)}` : '+'}
                  </div>
                </TableCell>

                {/* Comissão */}
                <TableCell className="py-2">
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <Percent className="h-3 w-3 text-green-600" />
                    <span className={getPercentualColor(regra.percentual)}>{regra.percentual}%</span>
                  </div>
                </TableCell>

                {/* Ações */}
                <TableCell className="text-right py-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(regra)}
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
                            Tem certeza que deseja excluir esta regra de comissão para <strong>{regra.tipo}</strong>?
                            Esta ação não pode ser desfeita e pode afetar o cálculo de comissões.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => onDelete(regra.id)}
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
              {expandedRows.has(regra.id) && (
                <TableRow key={`${regra.id}-expanded`} className="bg-blue-50/20 hover:bg-blue-50/30">
                  <TableCell colSpan={6} className="py-4">
                    <div className="pl-4">
                      {/* Layout Grid Responsivo - Mais denso */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        
                        {/* COLUNA 1 - DADOS DA REGRA */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Dados da Regra</h4>
                          
                          {/* Tipo */}
                          <div className="flex items-center gap-2">
                            <Target className="h-3 w-3 text-blue-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[45px]">Tipo:</span>
                            <Badge 
                              variant={getTipoBadge(regra.tipo)}
                              className="text-xs"
                            >
                              {regra.tipo}
                            </Badge>
                          </div>

                          {/* Ordem */}
                          <div className="flex items-center gap-2">
                            <ArrowUpDown className="h-3 w-3 text-slate-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[45px]">Ordem:</span>
                            <span className="text-xs text-slate-900">{regra.ordem}</span>
                          </div>
                        </div>

                        {/* COLUNA 2 - FAIXA DE VALORES */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Faixa de Valores</h4>
                          
                          {/* Valor Mínimo */}
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-3 w-3 text-green-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[50px]">Mínimo:</span>
                            <span className="text-xs text-slate-900">{formatCurrency(regra.valorMinimo)}</span>
                          </div>

                          {/* Valor Máximo */}
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-3 w-3 text-red-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[50px]">Máximo:</span>
                            <span className="text-xs text-slate-900">
                              {regra.valorMaximo ? formatCurrency(regra.valorMaximo) : 'Ilimitado'}
                            </span>
                          </div>
                        </div>

                        {/* COLUNA 3 - INFORMAÇÕES OPERACIONAIS */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Comissão</h4>
                          
                          {/* Percentual */}
                          <div className="flex items-center gap-2">
                            <Percent className="h-3 w-3 text-green-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[50px]">Taxa:</span>
                            <span className={`text-xs font-medium ${getPercentualColor(regra.percentual)}`}>
                              {regra.percentual}%
                            </span>
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
            Carregando regras de comissão...
          </div>
        </div>
      )}
    </div>
  );
}