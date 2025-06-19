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
import { Edit, Trash2, Layers } from 'lucide-react';
import type { Setor } from '@/types/sistema';

interface SetorTableProps {
  setores: Setor[];
  onEdit: (setor: Setor) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  loading?: boolean;
}

export function SetorTable({ 
  setores, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  loading = false 
}: SetorTableProps) {

  if (setores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border-0 rounded-lg bg-white shadow-md">
        <Layers className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum setor cadastrado</h3>
        <p className="text-gray-500 text-center max-w-sm">
          Organize sua equipe criando setores especializados para melhor gestão.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-0 bg-blue-50/30 shadow-md">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 border-b border-slate-200">
            <TableHead className="font-semibold text-slate-700 h-10">Setor</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Funcionários</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Status</TableHead>
            <TableHead className="text-right font-semibold text-slate-700 h-10">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {setores.map((setor) => (
            <TableRow key={setor.id} className="h-12 bg-white hover:bg-blue-50/50">
              <TableCell className="py-2">
                <div>
                  <div className="font-medium">{setor.nome}</div>
                  <div className="text-sm text-muted-foreground">{setor.descricao}</div>
                </div>
              </TableCell>
              <TableCell className="py-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{setor.funcionarios}</span>
                  <span className="text-xs text-muted-foreground">pessoas</span>
                </div>
              </TableCell>
              <TableCell className="py-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={setor.ativo}
                    onCheckedChange={() => onToggleStatus(setor.id)}
                    className="data-[state=checked]:bg-slate-600"
                  />
                  <Badge variant={setor.ativo ? "default" : "secondary"} className={setor.ativo ? "bg-slate-600 hover:bg-slate-700" : ""}>
                    {setor.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-right py-2">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(setor)}
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
                          Tem certeza que deseja excluir o setor <strong>{setor.nome}</strong>?
                          Esta ação não pode ser desfeita.
                          {setor.funcionarios > 0 && (
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                              <strong>Atenção:</strong> Este setor possui {setor.funcionarios} funcionário(s) vinculado(s).
                            </div>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => {
                            if (setor.funcionarios === 0) {
                              onDelete(setor.id)
                            }
                          }}
                          disabled={setor.funcionarios > 0}
                          className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
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
            Carregando setores...
          </div>
        </div>
      )}
    </div>
  );
}