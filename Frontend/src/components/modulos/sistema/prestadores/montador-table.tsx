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
import { Edit, Trash2, Wrench, Phone, ChevronDown, ChevronRight, DollarSign, Tag, Building2 } from 'lucide-react';
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
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRowExpansion = (montadorId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(montadorId)) {
      newExpandedRows.delete(montadorId);
    } else {
      newExpandedRows.add(montadorId);
    }
    setExpandedRows(newExpandedRows);
  };

  const getMontadorNumero = (index: number) => {
    return String(index + 1).padStart(3, '0');
  };

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
            <TableHead className="font-semibold text-slate-700 h-10 w-12"></TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Código</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Montador</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Categoria</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Valor Fixo</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Status</TableHead>
            <TableHead className="text-right font-semibold text-slate-700 h-10">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {montadoresOrdenados.map((montador, index) => (
            <React.Fragment key={montador.id}>
              <TableRow 
                className="h-12 bg-white hover:bg-blue-50/50 cursor-pointer transition-colors"
                onClick={() => toggleRowExpansion(montador.id)}
              >
                {/* Expand Icon */}
                <TableCell className="py-2 w-12">
                  {expandedRows.has(montador.id) ? (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  )}
                </TableCell>

                {/* Código */}
                <TableCell className="py-2">
                  <span className="text-sm font-medium font-mono text-slate-900">#{getMontadorNumero(index)}</span>
                </TableCell>

                {/* Montador */}
                <TableCell className="py-2">
                  <div className="text-sm font-medium text-slate-900">{montador.nome}</div>
                </TableCell>

                {/* Categoria */}
                <TableCell className="py-2">
                  <Badge 
                    variant={getCategoriaBadge(montador.categoria)}
                    className={`text-xs ${getCategoriaColor(montador.categoria)}`}
                  >
                    {montador.categoria}
                  </Badge>
                </TableCell>

                {/* Valor Fixo */}
                <TableCell className="py-2">
                  <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                    <DollarSign className="h-3 w-3" />
                    {formatCurrency(montador.valorFixo)}
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell className="py-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={montador.ativo}
                      onCheckedChange={() => onToggleStatus(montador.id)}
                      className="data-[state=checked]:bg-slate-600"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Badge variant={montador.ativo ? "default" : "secondary"} className={montador.ativo ? "bg-slate-600 hover:bg-slate-700" : ""}>
                      {montador.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </TableCell>

                {/* Ações */}
                <TableCell className="text-right py-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(montador)}
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

              {/* LINHA EXPANDIDA COM DETALHES */}
              {expandedRows.has(montador.id) && (
                <TableRow key={`${montador.id}-expanded`} className="bg-blue-50/20 hover:bg-blue-50/30">
                  <TableCell colSpan={7} className="py-4">
                    <div className="pl-4">
                      {/* Layout Grid Responsivo - Mais denso */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        
                        {/* COLUNA 1 - DADOS PESSOAIS */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Dados Pessoais</h4>
                          
                          {/* Nome */}
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3 w-3 text-slate-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[45px]">Nome:</span>
                            <span className="text-xs text-slate-900">{montador.nome}</span>
                          </div>

                          {/* Telefone */}
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-green-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[45px]">Telefone:</span>
                            {montador.telefone ? (
                              <span className="text-xs text-slate-900">{montador.telefone}</span>
                            ) : (
                              <span className="text-xs text-gray-400">--</span>
                            )}
                          </div>
                        </div>

                        {/* COLUNA 2 - ESPECIALIZAÇÃO */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Especialização</h4>
                          
                          {/* Categoria */}
                          <div className="flex items-center gap-2">
                            <Tag className="h-3 w-3 text-blue-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[50px]">Categoria:</span>
                            <Badge 
                              variant={getCategoriaBadge(montador.categoria)}
                              className={`text-xs ${getCategoriaColor(montador.categoria)}`}
                            >
                              {montador.categoria}
                            </Badge>
                          </div>

                          {/* Tipo de Serviço */}
                          <div className="flex items-center gap-2">
                            <Wrench className="h-3 w-3 text-orange-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[50px]">Tipo:</span>
                            <span className="text-xs text-slate-900">Montagem/Instalação</span>
                          </div>
                        </div>

                        {/* COLUNA 3 - INFORMAÇÕES OPERACIONAIS */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Operacional</h4>
                          
                          {/* Valor por Serviço */}
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-3 w-3 text-green-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[50px]">Serviço:</span>
                            <span className="text-xs font-medium text-green-600">{formatCurrency(montador.valorFixo)}</span>
                          </div>

                          {/* Status Visual */}
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${montador.ativo ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-xs font-medium text-slate-600 min-w-[50px]">Status:</span>
                            <Badge 
                              variant={montador.ativo ? "default" : "secondary"} 
                              className={`text-xs ${montador.ativo ? "bg-green-600 hover:bg-green-700" : ""}`}
                            >
                              {montador.ativo ? 'Ativo' : 'Inativo'}
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
            Carregando montadores...
          </div>
        </div>
      )}
    </div>
  );
}