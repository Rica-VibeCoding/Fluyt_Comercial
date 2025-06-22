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
import { Edit, Trash2, Layers, ChevronDown, ChevronRight, Users, Building2 } from 'lucide-react';
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
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRowExpansion = (setorId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(setorId)) {
      newExpandedRows.delete(setorId);
    } else {
      newExpandedRows.add(setorId);
    }
    setExpandedRows(newExpandedRows);
  };

  const getSetorNumero = (index: number) => {
    return String(index + 1).padStart(3, '0');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

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
            <TableHead className="font-semibold text-slate-700 h-10 w-12"></TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Código</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Setor</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Funcionários</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Status</TableHead>
            <TableHead className="text-right font-semibold text-slate-700 h-10">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {setores.map((setor, index) => (
            <React.Fragment key={setor.id}>
              <TableRow 
                className="h-12 bg-white hover:bg-blue-50/50 cursor-pointer transition-colors"
                onClick={() => toggleRowExpansion(setor.id)}
              >
                {/* Expand Icon */}
                <TableCell className="py-2 w-12">
                  {expandedRows.has(setor.id) ? (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  )}
                </TableCell>

                {/* Código */}
                <TableCell className="py-2">
                  <span className="text-sm font-medium font-mono text-slate-900">#{getSetorNumero(index)}</span>
                </TableCell>

                {/* Setor */}
                <TableCell className="py-2">
                  <div className="text-sm font-medium text-slate-900">{setor.nome}</div>
                </TableCell>

                {/* Funcionários */}
                <TableCell className="py-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3 text-purple-600" />
                    <span className="text-sm font-medium">{setor.funcionarios}</span>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell className="py-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={setor.ativo}
                      onCheckedChange={() => onToggleStatus(setor.id)}
                      className="data-[state=checked]:bg-slate-600"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Badge variant={setor.ativo ? "default" : "secondary"} className={setor.ativo ? "bg-slate-600 hover:bg-slate-700" : ""}>
                      {setor.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </TableCell>

                {/* Ações */}
                <TableCell className="text-right py-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(setor)}
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

              {/* LINHA EXPANDIDA COM DETALHES */}
              {expandedRows.has(setor.id) && (
                <TableRow key={`${setor.id}-expanded`} className="bg-blue-50/20 hover:bg-blue-50/30">
                  <TableCell colSpan={6} className="py-4">
                    <div className="pl-4">
                      {/* Layout Grid Responsivo - Mais denso */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        
                        {/* COLUNA 1 - DADOS DO SETOR */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Dados do Setor</h4>
                          
                          {/* Nome */}
                          <div className="flex items-center gap-2">
                            <Layers className="h-3 w-3 text-slate-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[45px]">Nome:</span>
                            <span className="text-xs text-slate-900">{setor.nome}</span>
                          </div>

                          {/* Descrição */}
                          <div className="flex items-start gap-2">
                            <Building2 className="h-3 w-3 text-slate-500 mt-0.5" />
                            <div>
                              <span className="text-xs font-medium text-slate-600">Descrição:</span>
                              <div className="text-xs text-slate-900 mt-1">
                                {setor.descricao || <span className="text-gray-400">--</span>}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* COLUNA 2 - EQUIPE */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Equipe</h4>
                          
                          {/* Funcionários */}
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3 text-purple-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[50px]">Total:</span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                setor.funcionarios > 0 
                                  ? 'border-purple-300 text-purple-600 bg-purple-50' 
                                  : 'border-slate-300 text-slate-500 bg-slate-50'
                              }`}
                            >
                              {setor.funcionarios} pessoa{setor.funcionarios !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                        </div>

                        {/* COLUNA 3 - INFORMAÇÕES OPERACIONAIS */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Operacional</h4>
                          
                          {/* Status Visual */}
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${setor.ativo ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-xs font-medium text-slate-600 min-w-[50px]">Status:</span>
                            <Badge 
                              variant={setor.ativo ? "default" : "secondary"} 
                              className={`text-xs ${setor.ativo ? "bg-green-600 hover:bg-green-700" : ""}`}
                            >
                              {setor.ativo ? 'Ativo' : 'Inativo'}
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
            Carregando setores...
          </div>
        </div>
      )}
    </div>
  );
}