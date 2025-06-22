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
import { Edit, Trash2, Building2, ChevronDown, ChevronRight, Mail, Phone, MapPin, Users } from 'lucide-react';
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
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRowExpansion = (empresaId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(empresaId)) {
      newExpandedRows.delete(empresaId);
    } else {
      newExpandedRows.add(empresaId);
    }
    setExpandedRows(newExpandedRows);
  };

  const getEmpresaNumero = (index: number) => {
    return String(index + 1).padStart(3, '0');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

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
            <TableHead className="font-semibold text-slate-700 h-10 w-12"></TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Código</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Empresa</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Contato</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Status</TableHead>
            <TableHead className="text-right font-semibold text-slate-700 h-10">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {empresas.map((empresa, index) => (
            <React.Fragment key={empresa.id}>
              <TableRow 
                className="h-12 bg-white hover:bg-blue-50/50 cursor-pointer transition-colors"
                onClick={() => toggleRowExpansion(empresa.id)}
              >
                {/* Expand Icon */}
                <TableCell className="py-2 w-12">
                  {expandedRows.has(empresa.id) ? (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  )}
                </TableCell>

                {/* Código */}
                <TableCell className="py-2">
                  <span className="text-sm font-medium font-mono text-slate-900">#{getEmpresaNumero(index)}</span>
                </TableCell>

                {/* Empresa */}
                <TableCell className="py-2">
                  <div className="text-sm font-medium text-slate-900">{empresa.nome}</div>
                </TableCell>

                {/* Contato - APENAS TELEFONE */}
                <TableCell className="py-2">
                  <div className="flex items-center gap-1 text-sm font-normal text-slate-900">
                    <Phone className="h-3 w-3 text-green-600" />
                    {empresa.telefone || 'Não informado'}
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell className="py-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={empresa.ativo ?? false}
                      onCheckedChange={() => onToggleStatus(empresa.id)}
                      className="data-[state=checked]:bg-slate-600"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Badge variant={empresa.ativo ? "default" : "secondary"} className={empresa.ativo ? "bg-slate-600 hover:bg-slate-700" : ""}>
                      {empresa.ativo ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </div>
                </TableCell>

                {/* Ações */}
                <TableCell className="text-right py-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(empresa)}
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
                            Tem certeza que deseja excluir a empresa <strong>{empresa.nome}</strong>?
                            Esta ação não pode ser desfeita.
                            {empresa.total_lojas && empresa.total_lojas > 0 && (
                              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                                <strong>Atenção:</strong> Esta empresa possui {empresa.total_lojas} loja(s) vinculada(s).
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

              {/* LINHA EXPANDIDA COM DETALHES */}
              {expandedRows.has(empresa.id) && (
                <TableRow key={`${empresa.id}-expanded`} className="bg-blue-50/20 hover:bg-blue-50/30">
                  <TableCell colSpan={6} className="py-4">
                    <div className="pl-4">
                      {/* Layout Grid Responsivo - Mais denso */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        
                        {/* COLUNA 1 - DADOS EMPRESARIAIS */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Dados Empresariais</h4>
                          
                          {/* CNPJ */}
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3 w-3 text-slate-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[45px]">CNPJ:</span>
                            {empresa.cnpj ? (
                              <span className="text-xs font-mono text-slate-900">{empresa.cnpj}</span>
                            ) : (
                              <span className="text-xs text-gray-400">--</span>
                            )}
                          </div>

                          {/* Email */}
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-blue-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[45px]">Email:</span>
                            {empresa.email ? (
                              <span className="text-xs text-slate-900 break-all">{empresa.email}</span>
                            ) : (
                              <span className="text-xs text-gray-400">--</span>
                            )}
                          </div>

                          {/* Telefone */}
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-green-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[45px]">Telefone:</span>
                            {empresa.telefone ? (
                              <span className="text-xs text-slate-900">{empresa.telefone}</span>
                            ) : (
                              <span className="text-xs text-gray-400">--</span>
                            )}
                          </div>
                        </div>

                        {/* COLUNA 2 - LOCALIZAÇÃO */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Localização</h4>
                          
                          {/* Endereço */}
                          <div className="flex items-start gap-2">
                            <MapPin className="h-3 w-3 text-red-500 mt-0.5" />
                            <div>
                              <span className="text-xs font-medium text-slate-600">Endereço:</span>
                              <div className="text-xs text-slate-900 mt-1">
                                {empresa.endereco || <span className="text-gray-400">--</span>}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* COLUNA 3 - INFORMAÇÕES OPERACIONAIS */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Operacional</h4>
                          
                          {/* Total de Lojas */}
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3 text-purple-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[50px]">Lojas:</span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                empresa.total_lojas && empresa.total_lojas > 0 
                                  ? 'border-purple-300 text-purple-600 bg-purple-50' 
                                  : 'border-slate-300 text-slate-500 bg-slate-50'
                              }`}
                            >
                              {empresa.total_lojas || 0} ({empresa.lojas_ativas || 0} ativas)
                            </Badge>
                          </div>

                          {/* Data de Criação */}
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3 w-3 text-slate-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[50px]">Criada:</span>
                            <span className="text-xs text-slate-900">{formatDate(empresa.createdAt)}</span>
                          </div>

                          {/* Status Visual */}
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${(empresa.ativo ?? false) ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-xs font-medium text-slate-600 min-w-[50px]">Status:</span>
                            <Badge 
                              variant={(empresa.ativo ?? false) ? "default" : "secondary"} 
                              className={`text-xs ${(empresa.ativo ?? false) ? "bg-green-600 hover:bg-green-700" : ""}`}
                            >
                              {(empresa.ativo ?? false) ? 'Ativa' : 'Inativa'}
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
            Carregando empresas...
          </div>
        </div>
      )}
    </div>
  );
}