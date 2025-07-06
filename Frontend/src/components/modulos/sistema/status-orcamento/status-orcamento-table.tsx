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
import { Edit, Trash2, Target, ChevronDown, ChevronRight, Hash, Palette } from 'lucide-react';
import { useStatusOrcamento } from '@/hooks/modulos/sistema/use-status-orcamento';
import type { StatusOrcamento } from '@/types/sistema';

interface StatusOrcamentoTableProps {
  statusList: StatusOrcamento[];
  onEdit: (status: StatusOrcamento) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

export function StatusOrcamentoTable({ 
  statusList, 
  onEdit, 
  onDelete,
  loading = false 
}: StatusOrcamentoTableProps) {
  const { expandedRows, toggleRowExpansion, getStatusNumero } = useStatusOrcamento();

  const formatDate = (dateString?: string) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (statusList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border-0 rounded-lg bg-white shadow-md">
        <Target className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum status cadastrado</h3>
        <p className="text-gray-500 text-center max-w-sm">
          Crie status personalizados para organizar o fluxo de orçamentos.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-0 bg-blue-50/30 shadow-md">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 border-b border-slate-200">
            <TableHead className="w-12"></TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Cor</TableHead>
            <TableHead>Ordem</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {statusList.map((status, index) => (
            <React.Fragment key={status.id}>
              <TableRow 
                className="h-12 bg-white hover:bg-blue-50/50 cursor-pointer transition-colors"
                onClick={() => toggleRowExpansion(status.id)}
              >
                {/* Expand Icon */}
                <TableCell className="py-2 w-12">
                  {expandedRows.has(status.id) ? (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  )}
                </TableCell>

                {/* Código */}
                <TableCell className="py-2">
                  <span className="text-sm font-medium font-mono text-slate-900">#{getStatusNumero(index)}</span>
                </TableCell>

                {/* Nome */}
                <TableCell className="py-2">
                  <span className="text-sm font-medium text-slate-900">{status.nome}</span>
                </TableCell>

                {/* Descrição */}
                <TableCell className="py-2">
                  <span className="text-sm text-slate-700">
                    {status.descricao ? status.descricao.substring(0, 50) + (status.descricao.length > 50 ? '...' : '') : '--'}
                  </span>
                </TableCell>

                {/* Cor */}
                <TableCell className="py-2">
                  {status.cor ? (
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded border border-gray-300"
                        style={{ backgroundColor: status.cor }}
                      />
                      <span className="text-xs font-mono text-slate-600">{status.cor}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">--</span>
                  )}
                </TableCell>

                {/* Ordem */}
                <TableCell className="py-2">
                  <span className="text-sm text-slate-700">{status.ordem}</span>
                </TableCell>

                {/* Ações */}
                <TableCell className="text-right py-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(status)}
                      className="h-8 w-8 p-0 hover:bg-blue-100"
                    >
                      <Edit className="h-3 w-3 text-slate-500" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-100"
                        >
                          <Trash2 className="h-3 w-3 text-slate-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o status "{status.nome}"? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(status.id)}
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

              {/* Linha Expandida */}
              {expandedRows.has(status.id) && (
                <TableRow className="bg-blue-50/20 hover:bg-blue-50/30">
                  <TableCell colSpan={7} className="py-4">
                    <div className="pl-4">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        {/* Coluna 1: Informações básicas */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                            Informações Básicas
                          </h4>
                          <div className="flex items-center gap-2">
                            <Target className="h-3 w-3 text-blue-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[45px]">Nome:</span>
                            <span className="text-xs text-slate-900">{status.nome}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Hash className="h-3 w-3 text-green-500 mt-0.5" />
                            <span className="text-xs font-medium text-slate-600 min-w-[45px]">Desc:</span>
                            <span className="text-xs text-slate-900">
                              {status.descricao || <span className="text-xs text-gray-400">--</span>}
                            </span>
                          </div>
                        </div>

                        {/* Coluna 2: Configurações */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                            Configurações
                          </h4>
                          <div className="flex items-center gap-2">
                            <Hash className="h-3 w-3 text-purple-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[45px]">Ordem:</span>
                            <span className="text-xs text-slate-900">{status.ordem}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Palette className="h-3 w-3 text-orange-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[45px]">Cor:</span>
                            {status.cor ? (
                              <div className="flex items-center gap-1">
                                <div 
                                  className="w-3 h-3 rounded border border-gray-300"
                                  style={{ backgroundColor: status.cor }}
                                />
                                <span className="text-xs font-mono text-slate-900">{status.cor}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">--</span>
                            )}
                          </div>
                        </div>

                        {/* Coluna 3: Metadados */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                            Metadados
                          </h4>
                          <div className="flex items-center gap-2">
                            <Hash className="h-3 w-3 text-gray-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[45px]">Criado:</span>
                            <span className="text-xs text-slate-900">{formatDate(status.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Hash className="h-3 w-3 text-gray-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[45px]">Atualizado:</span>
                            <span className="text-xs text-slate-900">{formatDate(status.updatedAt)}</span>
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
    </div>
  );
}