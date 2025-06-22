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
import { Edit, Trash2, UserCog, Store, Star, ChevronDown, ChevronRight, Mail, Phone, Building2, Users, TrendingUp, Shield } from 'lucide-react';
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
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRowExpansion = (funcionarioId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(funcionarioId)) {
      newExpandedRows.delete(funcionarioId);
    } else {
      newExpandedRows.add(funcionarioId);
    }
    setExpandedRows(newExpandedRows);
  };

  const getFuncionarioNumero = (index: number) => {
    return String(index + 1).padStart(3, '0');
  };

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

  const getPerformanceColor = (performance: number) => {
    if (performance >= 80) return 'bg-green-500';
    if (performance >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
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
            <TableHead className="font-semibold text-slate-700 h-10 w-12"></TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Código</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Funcionário</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Cargo</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Performance</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Status</TableHead>
            <TableHead className="text-right font-semibold text-slate-700 h-10">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {funcionarios.map((funcionario, index) => (
            <React.Fragment key={funcionario.id}>
              <TableRow 
                className="h-12 bg-white hover:bg-blue-50/50 cursor-pointer transition-colors"
                onClick={() => toggleRowExpansion(funcionario.id)}
              >
                {/* Expand Icon */}
                <TableCell className="py-2 w-12">
                  {expandedRows.has(funcionario.id) ? (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  )}
                </TableCell>

                {/* Código */}
                <TableCell className="py-2">
                  <span className="text-sm font-medium font-mono text-slate-900">#{getFuncionarioNumero(index)}</span>
                </TableCell>

                {/* Funcionário */}
                <TableCell className="py-2">
                  <div className="text-sm font-medium text-slate-900">{funcionario.nome}</div>
                </TableCell>

                {/* Cargo */}
                <TableCell className="py-2">
                  <Badge 
                    variant={getTipoFuncionarioBadge(funcionario.tipoFuncionario)}
                    className="text-xs"
                  >
                    {funcionario.tipoFuncionario}
                  </Badge>
                </TableCell>

                {/* Performance - COMPACTA */}
                <TableCell className="py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-12 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getPerformanceColor(funcionario.performance)}`}
                        style={{ width: `${funcionario.performance}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium">{funcionario.performance}%</span>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell className="py-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={funcionario.ativo}
                      onCheckedChange={() => onToggleStatus(funcionario.id)}
                      className="data-[state=checked]:bg-slate-600"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Badge variant={funcionario.ativo ? "default" : "secondary"} className={funcionario.ativo ? "bg-slate-600 hover:bg-slate-700" : ""}>
                      {funcionario.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </TableCell>

                {/* Ações */}
                <TableCell className="text-right py-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(funcionario)}
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

              {/* LINHA EXPANDIDA COM DETALHES */}
              {expandedRows.has(funcionario.id) && (
                <TableRow key={`${funcionario.id}-expanded`} className="bg-blue-50/20 hover:bg-blue-50/30">
                  <TableCell colSpan={7} className="py-4">
                    <div className="pl-4">
                      {/* Layout Grid Responsivo - Mais denso */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        
                        {/* COLUNA 1 - DADOS PESSOAIS */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Dados Pessoais</h4>
                          
                          {/* Nome */}
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3 text-slate-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[45px]">Nome:</span>
                            <span className="text-xs text-slate-900">{funcionario.nome}</span>
                          </div>

                          {/* Email */}
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-blue-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[45px]">Email:</span>
                            {funcionario.email ? (
                              <span className="text-xs text-slate-900 break-all">{funcionario.email}</span>
                            ) : (
                              <span className="text-xs text-gray-400">--</span>
                            )}
                          </div>

                          {/* Telefone */}
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-green-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[45px]">Telefone:</span>
                            {funcionario.telefone ? (
                              <span className="text-xs text-slate-900">{funcionario.telefone}</span>
                            ) : (
                              <span className="text-xs text-gray-400">--</span>
                            )}
                          </div>
                        </div>

                        {/* COLUNA 2 - CARGO E ACESSO */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Cargo e Acesso</h4>
                          
                          {/* Tipo Funcionário */}
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3 w-3 text-blue-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[50px]">Cargo:</span>
                            <Badge 
                              variant={getTipoFuncionarioBadge(funcionario.tipoFuncionario)}
                              className="text-xs"
                            >
                              {funcionario.tipoFuncionario}
                            </Badge>
                          </div>

                          {/* Setor */}
                          <div className="flex items-center gap-2">
                            <Store className="h-3 w-3 text-purple-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[50px]">Setor:</span>
                            <span className="text-xs text-slate-900">{funcionario.setor || '--'}</span>
                          </div>

                          {/* Loja */}
                          <div className="flex items-center gap-2">
                            <Store className="h-3 w-3 text-orange-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[50px]">Loja:</span>
                            <span className="text-xs text-slate-900">{funcionario.loja || '--'}</span>
                          </div>
                        </div>

                        {/* COLUNA 3 - PERFORMANCE E STATUS */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Performance</h4>
                          
                          {/* Performance Detalhada */}
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[50px]">Índice:</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${getPerformanceColor(funcionario.performance)}`}
                                  style={{ width: `${funcionario.performance}%` }}
                                ></div>
                              </div>
                              <span className={`text-xs font-medium ${
                                funcionario.performance >= 80 ? 'text-green-600' :
                                funcionario.performance >= 60 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {funcionario.performance}%
                              </span>
                            </div>
                          </div>

                          {/* Status Visual */}
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${funcionario.ativo ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-xs font-medium text-slate-600 min-w-[50px]">Status:</span>
                            <Badge 
                              variant={funcionario.ativo ? "default" : "secondary"} 
                              className={`text-xs ${funcionario.ativo ? "bg-green-600 hover:bg-green-700" : ""}`}
                            >
                              {funcionario.ativo ? 'Ativo' : 'Inativo'}
                            </Badge>
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
            Carregando funcionários...
          </div>
        </div>
      )}
    </div>
  );
}