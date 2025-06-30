/**
 * TABELA DE AMBIENTES - PADRÃO UX/UI ESTABELECIDO
 * Segue estrutura: Expand + Código + Campos + Status + Ações
 * Layout expandido: 3 colunas organizadas com ícones contextuais
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChevronRight,
  ChevronDown,
  Edit,
  Trash2,
  Home,
  DollarSign,
  Calendar,
  Clock,
  User,
  FileText,
  Package,
  Building2,
  Hash,
} from 'lucide-react';
import type { Ambiente } from '@/types/ambiente';
import { formatarMoeda, formatarDataHora } from '@/lib/formatters';

interface AmbienteTableProps {
  ambientes: Ambiente[];
  onEdit?: (ambiente: Ambiente) => void;
  onDelete?: (id: string) => void;
  loading?: boolean;
}

export function AmbienteTable({ 
  ambientes, 
  onEdit, 
  onDelete, 
  loading = false 
}: AmbienteTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [ambientesCompletos, setAmbientesCompletos] = useState<Map<string, Ambiente>>(new Map());
  const [loadingMateriais, setLoadingMateriais] = useState<Set<string>>(new Set());

  const toggleRowExpansion = async (id: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
      
      // Se não temos dados completos deste ambiente, buscar
      if (!ambientesCompletos.has(id)) {
        setLoadingMateriais(prev => new Set(prev).add(id));
        
        try {
          const response = await fetch(`http://localhost:8000/api/v1/ambientes/${id}?incluir_materiais=true`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('fluyt_auth_token')}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const ambienteCompleto = await response.json();
            setAmbientesCompletos(prev => new Map(prev).set(id, ambienteCompleto));
          }
        } catch (error) {
          console.error('Erro ao buscar dados completos:', error);
        }
        
        setLoadingMateriais(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    }
    setExpandedRows(newExpandedRows);
  };

  const getAmbienteNumero = (index: number) => {
    return String(index + 1).padStart(3, '0');
  };


  const getOrigemBadge = (origem: 'manual' | 'xml') => {
    return origem === 'xml' ? (
      <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 bg-blue-50 border-blue-200 text-blue-700">
        XML
      </Badge>
    ) : (
      <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 bg-green-50 border-green-200 text-green-700">
        Manual
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="rounded-lg border-0 bg-blue-50/30 shadow-md">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-slate-600 mt-2">Carregando ambientes...</p>
        </div>
      </div>
    );
  }

  if (ambientes.length === 0) {
    return (
      <div className="rounded-lg border-0 bg-blue-50/30 shadow-md">
        <div className="p-8 text-center">
          <Home className="h-12 w-12 mx-auto mb-4 text-slate-400" />
          <p className="text-slate-600 mb-2">Nenhum ambiente encontrado</p>
          <p className="text-sm text-slate-500">Comece criando um novo ambiente ou importando um XML</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-0 bg-blue-50/30 shadow-md">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 border-b border-slate-200">
            <TableHead className="w-12"></TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Valor Total</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ambientes.map((ambiente, index) => (
            <React.Fragment key={ambiente.id}>
              {/* Linha Principal */}
              <TableRow 
                className="h-12 bg-white hover:bg-blue-50/50 cursor-pointer transition-colors"
                onClick={() => toggleRowExpansion(ambiente.id)}
              >
                <TableCell className="w-12">
                  {expandedRows.has(ambiente.id) ? (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  )}
                </TableCell>
                
                <TableCell>
                  <span className="font-mono text-sm text-slate-600">
                    #{getAmbienteNumero(index)}
                  </span>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Home className="h-3 w-3 text-blue-500" />
                    <span className="text-sm font-medium text-slate-900">
                      {ambiente.nome}
                    </span>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-slate-500" />
                    <span className="text-sm text-slate-700">
                      {ambiente.clienteNome || '--'}
                    </span>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-3 w-3 text-green-500" />
                    <span className="text-sm font-medium text-slate-900 tabular-nums">
                      {formatarMoeda(ambiente.valorVenda || ambiente.valorCustoFabrica || 0)}
                    </span>
                  </div>
                </TableCell>
                
                <TableCell>
                  {getOrigemBadge(ambiente.origem)}
                </TableCell>
                
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(ambiente)}
                        className="h-6 w-6 p-0 hover:bg-blue-100"
                      >
                        <Edit className="h-3 w-3 text-slate-500" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(ambiente.id)}
                        className="h-6 w-6 p-0 hover:bg-red-100"
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>

              {/* Linha Expandida */}
              {expandedRows.has(ambiente.id) && (
                <TableRow className="bg-blue-50/20 hover:bg-blue-50/30">
                  <TableCell colSpan={7} className="py-4">
                    <div className="pl-4">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        
                        {/* Coluna 1: Informações Básicas */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                            Informações Básicas
                          </h4>
                          
                          <div className="flex items-center gap-2">
                            <Hash className="h-3 w-3 text-slate-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[45px]">ID:</span>
                            <span className="text-xs text-slate-900 font-mono">
                              {ambiente.id.slice(0, 8)}...
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-blue-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[45px]">Cliente:</span>
                            <span className="text-xs text-slate-900">
                              {ambiente.clienteNome || '--'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <FileText className="h-3 w-3 text-purple-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[45px]">Origem:</span>
                            <span className="text-xs text-slate-900">
                              {ambiente.origem === 'xml' ? 'Importado via XML' : 'Criado manualmente'}
                            </span>
                          </div>
                        </div>

                        {/* Coluna 2: Valores e Datas */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                            Valores e Datas
                          </h4>
                          
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-3 w-3 text-green-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[45px]">Venda:</span>
                            <span className="text-xs text-slate-900 tabular-nums">
                              {formatarMoeda(ambiente.valorVenda || 0)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-3 w-3 text-orange-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[45px]">Custo:</span>
                            <span className="text-xs text-slate-900 tabular-nums">
                              {formatarMoeda(ambiente.valorCustoFabrica || 0)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-blue-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[45px]">Criado:</span>
                            <span className="text-xs text-slate-900">
                              {formatarDataHora(ambiente.createdAt)}
                            </span>
                          </div>
                          
                          {ambiente.dataImportacao && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3 text-purple-500" />
                              <span className="text-xs font-medium text-slate-600 min-w-[45px]">Import:</span>
                              <span className="text-xs text-slate-900">
                                {ambiente.dataImportacao} {ambiente.horaImportacao || ''}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Coluna 3: Materiais e Extras */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                            Materiais e Extras
                          </h4>
                          
                          <div className="flex items-center gap-2">
                            <Package className="h-3 w-3 text-amber-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[45px]">Materiais:</span>
                            <span className="text-xs text-slate-900">
                              {(() => {
                                if (loadingMateriais.has(ambiente.id)) {
                                  return 'Carregando...';
                                }
                                
                                const ambienteCompleto = ambientesCompletos.get(ambiente.id);
                                if (ambienteCompleto?.materiais) {
                                  const materiais = ambienteCompleto.materiais;
                                  if (typeof materiais === 'object' && materiais !== null) {
                                    const linhas = Object.keys(materiais).length;
                                    return `${linhas} seções detectadas`;
                                  }
                                  return 'Dados disponíveis';
                                }
                                
                                return ambiente.materiais ? 'Disponível' : '--';
                              })()}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-slate-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[45px]">Atualizado:</span>
                            <span className="text-xs text-slate-900">
                              {formatarDataHora(ambiente.updatedAt)}
                            </span>
                          </div>
                          
                          {/* Espaço para futuras extensões */}
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3 w-3 text-slate-400" />
                            <span className="text-xs font-medium text-slate-600 min-w-[45px]">Status:</span>
                            <Badge variant="outline" className="text-xs px-1.5 py-0 h-4">
                              Ativo
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
    </div>
  );
} 