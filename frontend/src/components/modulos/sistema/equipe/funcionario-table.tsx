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
import { Edit, Trash2, UserCog, Store, Star } from 'lucide-react';
import type { Funcionario } from '@/types/sistema';

interface FuncionarioTableProps {
  funcionarios: Funcionario[];
  onEdit: (funcionario: Funcionario) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  loading?: boolean;
}

export function FuncionarioTable({ 
  funcionarios, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  loading = false 
}: FuncionarioTableProps) {

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getTipoFuncionarioBadge = (tipo: string) => {
    const variants = {
      'ADMIN_MASTER': 'destructive',
      'GERENTE': 'default',
      'VENDEDOR': 'secondary',
      'MEDIDOR': 'outline'
    } as const;
    return variants[tipo as keyof typeof variants] || 'secondary';
  };

  const getNivelAcessoBadge = (nivel: string) => {
    const variants = {
      'ADMIN': 'destructive',
      'GERENTE': 'default',
      'SUPERVISOR': 'secondary',
      'USUARIO': 'outline'
    } as const;
    return variants[nivel as keyof typeof variants] || 'outline';
  };

  if (funcionarios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border-0 rounded-lg bg-white shadow-md">
        <UserCog className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum funcionário cadastrado</h3>
        <p className="text-gray-500 text-center max-w-sm">
          Comece adicionando funcionários para gerenciar sua equipe.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-0 bg-blue-50/30 shadow-md">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 border-b border-slate-200">
            <TableHead className="font-semibold text-slate-700 h-10">Funcionário</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Contato</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Cargo</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Configurações</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Status</TableHead>
            <TableHead className="text-right font-semibold text-slate-700 h-10">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {funcionarios.map((funcionario) => (
            <TableRow key={funcionario.id} className="h-12 bg-white hover:bg-blue-50/50">
              <TableCell className="py-2">
                <div>
                  <div className="font-medium">{funcionario.nome}</div>
                  <div className="text-sm text-muted-foreground">{funcionario.loja || 'Loja não informada'}</div>
                </div>
              </TableCell>
              <TableCell className="py-2">
                <div className="text-sm">
                  <div>{funcionario.email || 'Email não informado'}</div>
                  <div className="text-muted-foreground">{funcionario.telefone || 'Telefone não informado'}</div>
                </div>
              </TableCell>
              <TableCell className="py-2">
                <div className="text-sm">
                  <div>
                    <Badge variant={getTipoFuncionarioBadge(funcionario.perfil || 'VENDEDOR')}>
                      {funcionario.perfil || 'VENDEDOR'}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground mt-1">{funcionario.setor || 'Setor não informado'}</div>
                </div>
              </TableCell>
              <TableCell className="py-2">
                <div className="text-xs space-y-1">
                  {funcionario.perfil === 'VENDEDOR' && (
                    <div>Desconto: {((funcionario.limite_desconto || 0) * 100).toFixed(0)}%</div>
                  )}
                  {funcionario.perfil === 'GERENTE' && funcionario.tem_minimo_garantido && (
                    <div>Mín. garantido: {formatCurrency(funcionario.valor_minimo_garantido || 0)}</div>
                  )}
                  {funcionario.perfil === 'MEDIDOR' && (
                    <div>Valor medição: {formatCurrency(funcionario.valor_medicao || 0)}</div>
                  )}
                  {funcionario.salario && (
                    <div className="text-muted-foreground">Salário: {formatCurrency(funcionario.salario)}</div>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={funcionario.ativo}
                    onCheckedChange={() => onToggleStatus(funcionario.id)}
                    className="data-[state=checked]:bg-slate-600"
                  />
                  <Badge variant={funcionario.ativo ? "default" : "secondary"} className={funcionario.ativo ? "bg-slate-600 hover:bg-slate-700" : ""}>
                    {funcionario.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-right py-2">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(funcionario)}
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
                          Tem certeza que deseja excluir o funcionário <strong>{funcionario.nome}</strong>?
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onDelete(funcionario.id)}
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
            Carregando funcionários...
          </div>
        </div>
      )}
    </div>
  );
}