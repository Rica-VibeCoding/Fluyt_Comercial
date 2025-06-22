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
import { Edit, Trash2, Truck, Phone, Mail, ChevronDown, ChevronRight, Building2, DollarSign } from 'lucide-react';
import type { Transportadora } from '@/types/sistema';

interface TransportadoraTableProps {
  transportadoras: Transportadora[];
  onEdit: (transportadora: Transportadora) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  loading?: boolean;
}

export function TransportadoraTable({ 
  transportadoras, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  loading = false 
}: TransportadoraTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRowExpansion = (transportadoraId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(transportadoraId)) {
      newExpandedRows.delete(transportadoraId);
    } else {
      newExpandedRows.add(transportadoraId);
    }
    setExpandedRows(newExpandedRows);
  };

  const getTransportadoraNumero = (index: number) => {
    return String(index + 1).padStart(3, '0');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Ordenar por nome da empresa
  const transportadorasOrdenadas = transportadoras
    .sort((a, b) => a.nomeEmpresa.localeCompare(b.nomeEmpresa));

  if (transportadoras.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border-0 rounded-lg bg-white shadow-md">
        <Truck className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma transportadora cadastrada</h3>
        <p className="text-gray-500 text-center max-w-sm">
          Cadastre transportadoras para realizar os serviços de entrega e logística.
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
            <TableHead className="font-semibold text-slate-700 h-10">Transportadora</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Valor Fixo</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Status</TableHead>
            <TableHead className="text-right font-semibold text-slate-700 h-10">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transportadorasOrdenadas.map((transportadora, index) => (
            <React.Fragment key={transportadora.id}>
              <TableRow 
                className="h-12 bg-white hover:bg-blue-50/50 cursor-pointer transition-colors"
                onClick={() => toggleRowExpansion(transportadora.id)}
              >
                {/* Expand Icon */}
                <TableCell className="py-2 w-12">
                  {expandedRows.has(transportadora.id) ? (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  )}
                </TableCell>

                {/* Código */}
                <TableCell className="py-2">
                  <span className="text-sm font-medium font-mono text-slate-900">#{getTransportadoraNumero(index)}</span>
                </TableCell>

                {/* Transportadora */}
                <TableCell className="py-2">
                  <div className="text-sm font-medium text-slate-900">{transportadora.nomeEmpresa}</div>
                </TableCell>

                {/* Valor Fixo */}
                <TableCell className="py-2">
                  <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                    <DollarSign className="h-3 w-3" />
                    {formatCurrency(transportadora.valorFixo)}
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell className="py-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={transportadora.ativo}
                      onCheckedChange={() => onToggleStatus(transportadora.id)}
                      className="data-[state=checked]:bg-slate-600"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Badge variant={transportadora.ativo ? "default" : "secondary"} className={transportadora.ativo ? "bg-slate-600 hover:bg-slate-700" : ""}>
                      {transportadora.ativo ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </div>
                </TableCell>

                {/* Ações */}
                <TableCell className="text-right py-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(transportadora)}
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
                            Tem certeza que deseja excluir a transportadora <strong>{transportadora.nomeEmpresa}</strong>?
                            Esta ação não pode ser desfeita e pode afetar entregas já agendadas.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => onDelete(transportadora.id)}
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
              {expandedRows.has(transportadora.id) && (
                <TableRow key={`${transportadora.id}-expanded`} className="bg-blue-50/20 hover:bg-blue-50/30">
                  <TableCell colSpan={6} className="py-4">
                    <div className="pl-4">
                      {/* Layout Grid Responsivo - Mais denso */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        
                        {/* COLUNA 1 - DADOS DA EMPRESA */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Dados da Empresa</h4>
                          
                          {/* Nome */}
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3 w-3 text-slate-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[45px]">Nome:</span>
                            <span className="text-xs text-slate-900">{transportadora.nomeEmpresa}</span>
                          </div>

                          {/* Email */}
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-blue-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[45px]">Email:</span>
                            {transportadora.email ? (
                              <span className="text-xs text-slate-900 break-all">{transportadora.email}</span>
                            ) : (
                              <span className="text-xs text-gray-400">--</span>
                            )}
                          </div>

                          {/* Telefone */}
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-green-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[45px]">Telefone:</span>
                            {transportadora.telefone ? (
                              <span className="text-xs text-slate-900">{transportadora.telefone}</span>
                            ) : (
                              <span className="text-xs text-gray-400">--</span>
                            )}
                          </div>
                        </div>

                        {/* COLUNA 2 - SERVIÇOS */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Serviços</h4>
                          
                          {/* Valor por Entrega */}
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-3 w-3 text-green-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[50px]">Entrega:</span>
                            <span className="text-xs font-medium text-green-600">{formatCurrency(transportadora.valorFixo)}</span>
                          </div>

                          {/* Tipo de Serviço */}
                          <div className="flex items-center gap-2">
                            <Truck className="h-3 w-3 text-blue-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[50px]">Tipo:</span>
                            <span className="text-xs text-slate-900">Transportadora</span>
                          </div>
                        </div>

                        {/* COLUNA 3 - INFORMAÇÕES OPERACIONAIS */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Operacional</h4>
                          
                          {/* Status Visual */}
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${transportadora.ativo ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-xs font-medium text-slate-600 min-w-[50px]">Status:</span>
                            <Badge 
                              variant={transportadora.ativo ? "default" : "secondary"} 
                              className={`text-xs ${transportadora.ativo ? "bg-green-600 hover:bg-green-700" : ""}`}
                            >
                              {transportadora.ativo ? 'Ativa' : 'Inativa'}
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
            Carregando transportadoras...
          </div>
        </div>
      )}
    </div>
  );
}