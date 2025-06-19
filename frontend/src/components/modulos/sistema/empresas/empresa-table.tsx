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
import { Edit, Trash2, Building2 } from 'lucide-react';
import type { Empresa } from '@/types/sistema';

interface EmpresaTableProps {
  empresas: Empresa[];
  onEdit: (empresa: Empresa) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  loading?: boolean;
}

export function EmpresaTable({ 
  empresas, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  loading = false 
}: EmpresaTableProps) {

  if (empresas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border-0 rounded-lg bg-white shadow-md">
        <Building2 className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma empresa cadastrada</h3>
        <p className="text-gray-500 text-center max-w-sm">
          Comece criando sua primeira empresa para gerenciar o sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-0 bg-blue-50/30 shadow-md">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 border-b border-slate-200">
            <TableHead className="font-semibold text-slate-700 h-10">Empresa</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">CNPJ</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Contato</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Status</TableHead>
            <TableHead className="text-right font-semibold text-slate-700 h-10">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {empresas.map((empresa) => (
            <TableRow key={empresa.id} className="h-12 bg-white hover:bg-blue-50/50">
              <TableCell className="py-2">
                <div>
                  <div className="font-medium">{empresa.nome}</div>
                  <div className="text-sm text-muted-foreground">{empresa.endereco || 'Endereço não informado'}</div>
                </div>
              </TableCell>
              <TableCell className="py-2">{empresa.cnpj || 'Não informado'}</TableCell>
              <TableCell className="py-2">
                <div className="text-sm">
                  <div>{empresa.email || 'Email não informado'}</div>
                  <div className="text-muted-foreground">{empresa.telefone || 'Telefone não informado'}</div>
                </div>
              </TableCell>
              <TableCell className="py-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={empresa.ativo}
                    onCheckedChange={() => onToggleStatus(empresa.id)}
                    className="data-[state=checked]:bg-slate-600"
                  />
                  <Badge variant={empresa.ativo ? "default" : "secondary"} className={empresa.ativo ? "bg-slate-600 hover:bg-slate-700" : ""}>
                    {empresa.ativo ? 'Ativa' : 'Inativa'}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-right py-2">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(empresa)}
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
                          Tem certeza que deseja excluir a empresa <strong>{empresa.nome}</strong>?
                          Esta ação não pode ser desfeita.
                          {empresa.funcionarios && empresa.funcionarios > 0 && (
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                              <strong>Atenção:</strong> Esta empresa possui {empresa.funcionarios} funcionário(s) vinculado(s).
                            </div>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onDelete(empresa.id)}
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
            Carregando empresas...
          </div>
        </div>
      )}
    </div>
  );
}