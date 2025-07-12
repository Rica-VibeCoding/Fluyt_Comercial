import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, ChevronDown, ChevronRight, Hash, Calendar, Shield } from 'lucide-react';
import { SkeletonTable } from '@/components/ui/skeleton-table';
import type { Procedencia } from '@/types/sistema';

interface ProcedenciaTableProps {
  procedencias: Procedencia[];
  onEdit: (procedencia: Procedencia) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

export function ProcedenciaTable({ 
  procedencias, 
  onEdit, 
  onDelete, 
  loading = false 
}: ProcedenciaTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRowExpansion = (procedenciaId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(procedenciaId)) {
      newExpandedRows.delete(procedenciaId);
    } else {
      newExpandedRows.add(procedenciaId);
    }
    setExpandedRows(newExpandedRows);
  };

  const getProcedenciaNumero = (index: number) => {
    return String(index + 1).padStart(3, '0');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Função de toggle status removida - não usamos mais status na tabela

  const handleDelete = async (procedenciaId: string) => {
    const procedencia = procedencias.find(p => p.id === procedenciaId);
    if (!procedencia) return;

    const confirmacao = window.confirm(`Tem certeza que deseja excluir a procedência "${procedencia.nome}"?\n\nEsta ação não pode ser desfeita.`);
    
    if (confirmacao) {
      onDelete(procedenciaId);
    }
  };

  // Loading state com skeleton
  if (loading) {
    return (
      <SkeletonTable 
        columns={['', 'Código', 'Nome', 'Criado em', 'Ações']}
        rows={6}
      />
    );
  }

  // Empty State
  if (procedencias.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border-0 rounded-lg bg-white shadow-md">
        <Shield className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma procedência cadastrada</h3>
        <p className="text-gray-500 text-center max-w-sm">
          Comece criando sua primeira procedência para organizar a origem dos seus clientes.
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
            <TableHead className="font-semibold text-slate-700 h-10">Nome</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Criado em</TableHead>
            <TableHead className="text-right font-semibold text-slate-700 h-10">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {procedencias.map((procedencia, index) => (
            <React.Fragment key={`procedencia-${procedencia.id}-${index}`}>
              <TableRow 
                className="h-12 bg-white hover:bg-blue-50/50 cursor-pointer transition-colors"
                onClick={() => toggleRowExpansion(procedencia.id)}
              >
                {/* Expand Icon */}
                <TableCell className="py-2 w-12">
                  {expandedRows.has(procedencia.id) ? (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  )}
                </TableCell>

                {/* Código */}
                <TableCell className="py-2">
                  <span className="text-sm font-medium font-mono text-slate-900">#{getProcedenciaNumero(index)}</span>
                </TableCell>

                {/* Nome */}
                <TableCell className="py-2">
                  <div className="text-sm font-medium text-slate-900">{procedencia.nome}</div>
                </TableCell>

                {/* Data de Criação */}
                <TableCell className="py-2">
                  <span className="text-sm font-normal text-slate-600">
                    {formatDate(procedencia.created_at)}
                  </span>
                </TableCell>

                {/* Ações */}
                <TableCell className="text-right py-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(procedencia)}
                      className="h-8 w-8 p-0 hover:bg-blue-50/50"
                    >
                      <Edit className="h-3 w-3 text-slate-500" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(procedencia.id)}
                      className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-3 w-3 text-slate-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>

              {/* LINHA EXPANDIDA COM DETALHES */}
              {expandedRows.has(procedencia.id) && (
                <TableRow key={`expanded-${procedencia.id}-${index}`} className="bg-blue-50/20 hover:bg-blue-50/30">
                  <TableCell colSpan={5} className="py-4">
                    <div className="pl-4">
                      {/* Layout Grid 3 colunas */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        
                        {/* COLUNA 1 - IDENTIFICAÇÃO */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Identificação</h4>
                          
                          {/* ID */}
                          <div className="flex items-center gap-2">
                            <Hash className="h-3 w-3 text-slate-600" />
                            <span className="text-xs font-medium text-slate-600 min-w-[45px]">ID:</span>
                            <span className="text-xs font-mono text-slate-900">{procedencia.id.slice(0, 8)}...</span>
                          </div>

                          {/* Nome completo */}
                          <div className="flex items-center gap-2">
                            <Shield className="h-3 w-3 text-blue-600" />
                            <span className="text-xs font-medium text-slate-600 min-w-[45px]">Nome:</span>
                            <span className="text-xs text-slate-900">{procedencia.nome}</span>
                          </div>
                        </div>

                        {/* COLUNA 2 - DATAS */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Datas</h4>
                          
                          {/* Criado em */}
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-green-600" />
                            <span className="text-xs font-medium text-slate-600 min-w-[45px]">Criado:</span>
                            <span className="text-xs text-slate-900">
                              {procedencia.created_at ? formatDate(procedencia.created_at) : '--'}
                            </span>
                          </div>

                          {/* Atualizado em */}
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-orange-600" />
                            <span className="text-xs font-medium text-slate-600 min-w-[45px]">Atualizado:</span>
                            <span className="text-xs text-slate-900">
                              {procedencia.updated_at ? formatDate(procedencia.updated_at) : '--'}
                            </span>
                          </div>
                        </div>

                        {/* COLUNA 3 - STATUS E CONFIGURAÇÕES */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Configurações</h4>
                          
                          {/* Status detalhado */}
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${procedencia.ativo ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            <span className="text-xs font-medium text-slate-600 min-w-[45px]">Status:</span>
                            <Badge 
                              variant={procedencia.ativo ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {procedencia.ativo ? 'Ativa e visível para clientes' : 'Inativa - não aparece para clientes'}
                            </Badge>
                          </div>

                          {/* Uso em clientes */}
                          <div className="flex items-center gap-2">
                            <Shield className="h-3 w-3 text-purple-600" />
                            <span className="text-xs font-medium text-slate-600 min-w-[45px]">Uso:</span>
                            <span className="text-xs text-slate-900">
                              {procedencia.ativo ? 'Disponível no cadastro de clientes' : 'Não disponível'}
                            </span>
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
    </div>
  );
}