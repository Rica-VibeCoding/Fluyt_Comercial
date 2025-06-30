"use client";

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
import { Edit, Trash2, UserCog, ChevronDown, ChevronRight, Mail, Phone, MapPin, Users, Building2 } from 'lucide-react';
import { Colaborador } from '@/types/colaboradores';

interface ColaboradorTableProps {
  colaboradores: Colaborador[];
  onEdit: (colaborador: Colaborador) => void;
  onDelete: (id: string) => void;
}

export function ColaboradorTable({ colaboradores, onEdit, onDelete }: ColaboradorTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRowExpansion = (colaboradorId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(colaboradorId)) {
      newExpandedRows.delete(colaboradorId);
    } else {
      newExpandedRows.add(colaboradorId);
    }
    setExpandedRows(newExpandedRows);
  };

  const getColaboradorNumero = (index: number) => {
    return String(index + 1).padStart(3, '0');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '--';
    return new Intl.DateTimeFormat('pt-BR').format(new Date(dateString));
  };

  const formatCPF = (cpf?: string) => {
    if (!cpf) return '--';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  if (colaboradores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border-0 rounded-lg bg-white shadow-md">
        <UserCog className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum colaborador cadastrado</h3>
        <p className="text-gray-500 text-center max-w-sm">
          Comece adicionando colaboradores para gerenciar sua equipe.
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
            <TableHead className="font-semibold text-slate-700 h-10">Colaborador</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Tipo</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Categoria</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Status</TableHead>
            <TableHead className="text-right font-semibold text-slate-700 h-10">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {colaboradores.map((colaborador, index) => (
            <React.Fragment key={colaborador.id}>
              <TableRow 
                className="h-12 bg-white hover:bg-blue-50/50 cursor-pointer transition-colors"
                onClick={() => toggleRowExpansion(colaborador.id)}
              >
                {/* Expand Icon */}
                <TableCell className="py-2 w-12">
                  {expandedRows.has(colaborador.id) ? (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  )}
                </TableCell>

                {/* Código */}
                <TableCell className="py-2">
                  <span className="text-sm font-medium font-mono text-slate-900">#{getColaboradorNumero(index)}</span>
                </TableCell>

                {/* Colaborador */}
                <TableCell className="py-2">
                  <div className="text-sm font-medium text-slate-900">{colaborador.nome}</div>
                </TableCell>

                {/* Tipo */}
                <TableCell className="py-2">
                  {colaborador.tipoColaborador ? (
                    <Badge variant="secondary" className="text-xs">
                      {colaborador.tipoColaborador.nome}
                    </Badge>
                  ) : (
                    <span className="text-sm text-slate-400">--</span>
                  )}
                </TableCell>

                {/* Categoria */}
                <TableCell className="py-2">
                  {colaborador.tipoColaborador ? (
                    <Badge 
                      variant={colaborador.tipoColaborador.categoria === 'FUNCIONARIO' ? "default" : "outline"}
                      className="text-xs"
                    >
                      {colaborador.tipoColaborador.categoria}
                    </Badge>
                  ) : (
                    <span className="text-sm text-slate-400">--</span>
                  )}
                </TableCell>

                {/* Status */}
                <TableCell className="py-2">
                  <Badge variant={colaborador.ativo ? "default" : "secondary"} className={colaborador.ativo ? "bg-slate-600 hover:bg-slate-700" : ""}>
                    {colaborador.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>

                {/* Ações */}
                <TableCell className="text-right py-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(colaborador)}
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
                            <div className="space-y-2">
                              <p>Tem certeza que deseja excluir o colaborador?</p>
                              <div className="bg-red-50 border border-red-200 rounded p-3 space-y-1">
                                <p className="font-semibold text-red-900">{colaborador.nome}</p>
                                {colaborador.email && <p className="text-sm text-red-700">{colaborador.email}</p>}
                                {colaborador.tipoColaborador && <p className="text-sm text-red-700">Tipo: {colaborador.tipoColaborador.nome}</p>}
                              </div>
                              <p className="text-sm text-gray-600">
                                Esta ação removerá permanentemente o colaborador do sistema.
                              </p>
                            </div>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => onDelete(colaborador.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Confirmar Exclusão
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>

              {/* LINHA EXPANDIDA COM DETALHES */}
              {expandedRows.has(colaborador.id) && (
                <TableRow key={`${colaborador.id}-expanded`} className="bg-blue-50/20 hover:bg-blue-50/30">
                  <TableCell colSpan={7} className="py-4">
                    <div className="pl-4">
                      {/* Layout Grid Responsivo */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        
                        {/* COLUNA 1 - DADOS PESSOAIS */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Dados Pessoais</h4>
                          
                          {/* CPF */}
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3 text-slate-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[35px]">CPF:</span>
                            <span className="text-xs text-slate-900">{formatCPF(colaborador.cpf)}</span>
                          </div>

                          {/* Email */}
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-blue-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[35px]">Email:</span>
                            {colaborador.email ? (
                              <span className="text-xs text-slate-900 break-all">{colaborador.email}</span>
                            ) : (
                              <span className="text-xs text-gray-400">--</span>
                            )}
                          </div>

                          {/* Telefone */}
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-green-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[35px]">Telefone:</span>
                            {colaborador.telefone ? (
                              <span className="text-xs text-slate-900">{colaborador.telefone}</span>
                            ) : (
                              <span className="text-xs text-gray-400">--</span>
                            )}
                          </div>
                        </div>

                        {/* COLUNA 2 - TIPO E CATEGORIA */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Tipo e Categoria</h4>
                          
                          {/* Tipo */}
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3 w-3 text-blue-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[50px]">Tipo:</span>
                            {colaborador.tipoColaborador ? (
                              <Badge variant="secondary" className="text-xs">
                                {colaborador.tipoColaborador.nome}
                              </Badge>
                            ) : (
                              <span className="text-xs text-gray-400">--</span>
                            )}
                          </div>

                          {/* Categoria */}
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3 w-3 text-purple-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[50px]">Categoria:</span>
                            {colaborador.tipoColaborador ? (
                              <Badge 
                                variant={colaborador.tipoColaborador.categoria === 'FUNCIONARIO' ? "default" : "outline"}
                                className="text-xs"
                              >
                                {colaborador.tipoColaborador.categoria}
                              </Badge>
                            ) : (
                              <span className="text-xs text-gray-400">--</span>
                            )}
                          </div>

                          {/* Remuneração */}
                          {colaborador.tipoColaborador && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-slate-600 min-w-[50px]">Comissão:</span>
                              <span className="text-xs text-slate-900">
                                {colaborador.tipoColaborador.percentualValor}% sobre {colaborador.tipoColaborador.tipoPercentual?.toLowerCase()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* COLUNA 3 - STATUS E DATAS */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Status</h4>
                          
                          {/* Admissão */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-600 min-w-[50px]">Admissão:</span>
                            <span className="text-xs text-slate-900">{formatDate(colaborador.dataAdmissao)}</span>
                          </div>

                          {/* Status Visual */}
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${colaborador.ativo ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-xs font-medium text-slate-600 min-w-[50px]">Status:</span>
                            <Badge 
                              variant={colaborador.ativo ? "default" : "secondary"} 
                              className={`text-xs ${colaborador.ativo ? "bg-green-600 hover:bg-green-700" : ""}`}
                            >
                              {colaborador.ativo ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>

                          {/* Endereço */}
                          {colaborador.endereco && (
                            <div className="flex items-start gap-2">
                              <MapPin className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                              <span className="text-xs text-slate-900 break-words">{colaborador.endereco}</span>
                            </div>
                          )}
                        </div>

                      </div>

                      {/* Observações */}
                      {colaborador.observacoes && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Observações</h4>
                          <p className="text-xs text-slate-700">{colaborador.observacoes}</p>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 