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
import { AmbienteMaterialDetail } from './ambiente-materiais-detail';

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
  const [materiaisCache, setMateriaisCache] = useState<Map<string, any>>(new Map());
  const [loadingMateriais, setLoadingMateriais] = useState<Set<string>>(new Set());
  const [errorMateriais, setErrorMateriais] = useState<Set<string>>(new Set());

  const toggleRowExpansion = async (id: string) => {
    const newExpandedRows = new Set(expandedRows);
    
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
      
      // Verificar se ambiente já tem materiais ou se precisa buscar
      const ambiente = ambientes.find(a => a.id === id);
      const temMateriais = ambiente?.materiais;
      const jaNoCache = materiaisCache.has(id);
      const jaTemErro = errorMateriais.has(id);
      
      // Só buscar se não tem materiais locais, não está no cache e não teve erro
      if (!temMateriais && !jaNoCache && !jaTemErro) {
        setLoadingMateriais(prev => new Set(prev).add(id));
        setErrorMateriais(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        
        try {
          const response = await fetch(`http://localhost:8000/api/v1/ambientes/${id}?incluir_materiais=true`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('fluyt_auth_token')}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const ambienteCompleto = await response.json();
            if (ambienteCompleto.materiais) {
              setMateriaisCache(prev => new Map(prev).set(id, ambienteCompleto.materiais));
            }
          } else {
            setErrorMateriais(prev => new Set(prev).add(id));
          }
        } catch (error) {
          console.error('Erro ao buscar materiais:', error);
          setErrorMateriais(prev => new Set(prev).add(id));
        } finally {
          setLoadingMateriais(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
        }
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
            <TableHead>Ambiente</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead>Data/Hora</TableHead>
            <TableHead>Valor</TableHead>
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
                  <div className="flex items-center gap-2">
                    <Home className="h-3 w-3 text-blue-500" />
                    <span className="text-sm font-medium text-slate-900">
                      {ambiente.nome}
                    </span>
                  </div>
                </TableCell>
                
                <TableCell>
                  {getOrigemBadge(ambiente.origem)}
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-slate-500" />
                    <span className="text-xs text-slate-600">
                      {ambiente.data_importacao ? formatarDataHora(ambiente.data_importacao, ambiente.hora_importacao) : 
                        <span className="text-slate-400 italic">Não informado</span>}
                    </span>
                  </div>
                </TableCell>
                
                <TableCell>
                  <span className="text-sm font-medium text-slate-900 tabular-nums">
                    {ambiente.valor_venda ? formatarMoeda(ambiente.valor_venda) : 
                      <span className="text-slate-400 italic">Valor não definido</span>}
                  </span>
                </TableCell>
                
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(ambiente)}
                        className="h-6 w-6 p-0 hover:bg-blue-100"
                        title="Editar ambiente"
                      >
                        <Edit className="h-3 w-3 text-blue-600" />
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
                  <TableCell colSpan={6} className="py-4">
                    <div className="pl-4">
                      {/* Header com informações consolidadas */}
                      <div className="mb-4 pb-3 border-b border-slate-200">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">Cliente:</span>
                            <span className="text-slate-700">{ambiente.cliente_nome || 'Cliente não informado'}</span>
                          </div>
                          <div className="text-slate-400">-</div>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-purple-500" />
                            <span className="font-medium">Linha:</span>
                            <span className="text-slate-700">
                              {(() => {
                                const materiais = ambiente.materiais || materiaisCache.get(ambiente.id);
                                return materiais?.linha_detectada || 'Não detectada';
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Renderização de Materiais */}
                      {(() => {
                        if (loadingMateriais.has(ambiente.id)) {
                          return (
                            <div className="flex items-center justify-center py-8">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                              <span className="text-sm text-slate-600">Carregando detalhes de materiais...</span>
                            </div>
                          );
                        }
                        
                        if (errorMateriais.has(ambiente.id)) {
                          return (
                            <div className="text-center py-8">
                              <div className="text-amber-600 mb-2">
                                ⚠️ Erro ao carregar materiais
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setErrorMateriais(prev => {
                                    const newSet = new Set(prev);
                                    newSet.delete(ambiente.id);
                                    return newSet;
                                  });
                                  const novoExpandedRows = new Set(expandedRows);
                                  novoExpandedRows.delete(ambiente.id);
                                  setExpandedRows(novoExpandedRows);
                                  setTimeout(() => toggleRowExpansion(ambiente.id), 100);
                                }}
                                className="text-sm text-blue-600 hover:text-blue-800 underline cursor-pointer"
                              >
                                tentar novamente
                              </button>
                            </div>
                          );
                        }
                        
                        const materiais = ambiente.materiais || materiaisCache.get(ambiente.id);
                        
                        if (!materiais || typeof materiais !== 'object') {
                          return (
                            <div className="text-center py-8">
                              <Package className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                              <p className="text-sm text-slate-500">
                                {ambiente.origem === 'xml' ? 'Materiais não processados no XML' : 'Sem dados de materiais'}
                              </p>
                            </div>
                          );
                        }
                        
                        // Renderizar AmbienteMaterialDetail
                        return <AmbienteMaterialDetail materiais={materiais} />;
                      })()}
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