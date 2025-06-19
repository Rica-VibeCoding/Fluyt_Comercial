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
import { Edit, Trash2, DollarSign, TrendingUp } from 'lucide-react';
import type { RegraComissao } from '@/types/sistema';

interface ComissaoTableProps {
  regras: RegraComissao[];
  onEdit: (regra: RegraComissao) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  loading?: boolean;
}

export function ComissaoTable({ 
  regras, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  loading = false 
}: ComissaoTableProps) {

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
            <TableHead className="font-semibold text-slate-700 h-10">Regra</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Faixa de Valores</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Comissão</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Status</TableHead>
            <TableHead className="text-right font-semibold text-slate-700 h-10">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {regrasOrdenadas.map((regra) => (
            <TableRow key={regra.id} className="h-12 bg-white hover:bg-blue-50/50">
              <TableCell className="py-2">
                <div>
                  <div className="font-medium">{regra.tipo}</div>
                  <div className="text-sm text-muted-foreground">Ordem: {regra.ordem}</div>
                </div>
              </TableCell>
              <TableCell className="py-2">
                <div className="text-sm">
                  <div>{formatCurrency(regra.valorMinimo)}</div>
                  <div className="text-muted-foreground">
                    {regra.valorMaximo ? `até ${formatCurrency(regra.valorMaximo)}` : 'ou mais'}
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-2">
                <div className="text-sm">
                  <div>{regra.percentual}%</div>
                  <div className="text-muted-foreground">de comissão</div>
                </div>
              </TableCell>
              <TableCell className="py-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={regra.ativo}
                    onCheckedChange={() => onToggleStatus(regra.id)}
                    className="data-[state=checked]:bg-slate-600"
                  />
                  <Badge variant={regra.ativo ? "default" : "secondary"} className={regra.ativo ? "bg-slate-600 hover:bg-slate-700" : ""}>
                    {regra.ativo ? 'Ativa' : 'Inativa'}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-right py-2">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(regra)}
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