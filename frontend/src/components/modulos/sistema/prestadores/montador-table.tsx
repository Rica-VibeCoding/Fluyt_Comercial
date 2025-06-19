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
import { Edit, Trash2, Wrench, Phone } from 'lucide-react';
import type { Montador } from '@/types/sistema';

interface MontadorTableProps {
  montadores: Montador[];
  onEdit: (montador: Montador) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  loading?: boolean;
}

export function MontadorTable({ 
  montadores, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  loading = false 
}: MontadorTableProps) {

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getCategoriaBadge = (categoria: string) => {
    const variants = {
      'MARCENEIRO': 'default',
      'ELETRICISTA': 'secondary',
      'ENCANADOR': 'outline',
      'GESSEIRO': 'destructive',
      'PINTOR': 'default',
      'OUTRO': 'secondary'
    } as const;
    return variants[categoria as keyof typeof variants] || 'default';
  };

  const getCategoriaColor = (categoria: string) => {
    const colors = {
      'MARCENEIRO': 'text-blue-600',
      'ELETRICISTA': 'text-yellow-600',
      'ENCANADOR': 'text-cyan-600',
      'GESSEIRO': 'text-gray-600',
      'PINTOR': 'text-green-600',
      'OUTRO': 'text-purple-600'
    };
    return colors[categoria as keyof typeof colors] || 'text-gray-600';
  };

  // Agrupar por categoria e ordenar
  const montadoresOrdenados = montadores
    .sort((a, b) => {
      if (a.categoria !== b.categoria) {
        return a.categoria.localeCompare(b.categoria);
      }
      return a.nome.localeCompare(b.nome);
    });

  if (montadores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border-0 rounded-lg bg-white shadow-md">
        <Wrench className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum montador cadastrado</h3>
        <p className="text-gray-500 text-center max-w-sm">
          Cadastre montadores para realizar os serviços de instalação e montagem.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-0 bg-blue-50/30 shadow-md">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 border-b border-slate-200">
            <TableHead className="font-semibold text-slate-700 h-10">Montador</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Valor Fixo</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Contato</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Status</TableHead>
            <TableHead className="text-right font-semibold text-slate-700 h-10">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {montadoresOrdenados.map((montador) => (
            <TableRow key={montador.id} className="h-12 bg-white hover:bg-blue-50/50">
              <TableCell className="py-2">
                <div>
                  <div className="font-medium">{montador.nome}</div>
                  <div className="text-sm text-muted-foreground">{montador.categoria}</div>
                </div>
              </TableCell>
              <TableCell className="py-2">
                <div className="font-medium">{formatCurrency(montador.valorFixo)}</div>
                <div className="text-sm text-muted-foreground">por serviço</div>
              </TableCell>
              <TableCell className="py-2">
                <div className="text-sm">
                  <div>{montador.telefone}</div>
                  <div className="text-muted-foreground">Montador</div>
                </div>
              </TableCell>
              <TableCell className="py-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={montador.ativo}
                    onCheckedChange={() => onToggleStatus(montador.id)}
                    className="data-[state=checked]:bg-slate-600"
                  />
                  <Badge variant={montador.ativo ? "default" : "secondary"} className={montador.ativo ? "bg-slate-600 hover:bg-slate-700" : ""}>
                    {montador.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-right py-2">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(montador)}
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
                          Tem certeza que deseja excluir o montador <strong>{montador.nome}</strong>?
                          Esta ação não pode ser desfeita e pode afetar serviços já agendados.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onDelete(montador.id)}
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
            Carregando montadores...
          </div>
        </div>
      )}
    </div>
  );
}