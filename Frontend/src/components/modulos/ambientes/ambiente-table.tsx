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
                    {/* Indicador de materiais */}
                    {(() => {
                      const temMateriais = ambiente.materiais || materiaisCache.get(ambiente.id);
                      if (temMateriais && typeof temMateriais === 'object') {
                        const secoes = Object.keys(temMateriais).filter(k => 
                          temMateriais[k] && k !== 'metadata' && k !== 'nome_ambiente'
                        ).length;
                        if (secoes > 0) {
                          return (
                            <div className="ml-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                              {secoes}
                            </div>
                          );
                        }
                      }
                      if (ambiente.origem === 'xml') {
                        return (
                          <div className="ml-1 w-2 h-2 bg-slate-300 rounded-full" title="XML sem materiais processados" />
                        );
                      }
                      return null;
                    })()}
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
                          
                          <div className="flex items-start gap-2">
                            <Package className="h-3 w-3 text-amber-500 mt-0.5" />
                            <div className="flex-1">
                              <span className="text-xs font-medium text-slate-600">Materiais:</span>
                              <div className="mt-1">
                                {(() => {
                                  // Estados de loading e erro
                                  if (loadingMateriais.has(ambiente.id)) {
                                    return (
                                      <div className="flex items-center gap-2 text-xs text-blue-600">
                                        <div className="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent" />
                                        <span>Carregando detalhes...</span>
                                      </div>
                                    );
                                  }
                                  
                                  if (errorMateriais.has(ambiente.id)) {
                                    return (
                                      <div className="text-xs text-amber-600">
                                        ⚠️ Erro ao carregar materiais
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            // Limpar erro e retentar busca
                                            setErrorMateriais(prev => {
                                              const newSet = new Set(prev);
                                              newSet.delete(ambiente.id);
                                              return newSet;
                                            });
                                            // Forçar nova busca
                                            const novoExpandedRows = new Set(expandedRows);
                                            novoExpandedRows.delete(ambiente.id);
                                            setExpandedRows(novoExpandedRows);
                                            // Reabrir após limpeza
                                            setTimeout(() => toggleRowExpansion(ambiente.id), 100);
                                          }}
                                          className="ml-2 text-blue-600 hover:text-blue-800 underline cursor-pointer"
                                        >
                                          tentar novamente
                                        </button>
                                      </div>
                                    );
                                  }
                                  
                                  // Buscar materiais (prioridade: local > cache)
                                  const materiais = ambiente.materiais || materiaisCache.get(ambiente.id);
                                  
                                  if (materiais && typeof materiais === 'object' && materiais !== null) {
                                    return <AmbienteMaterialDetail materiais={materiais} />;
                                  }
                                  
                                  // Fallbacks informativos
                                  if (ambiente.origem === 'xml') {
                                    return (
                                      <span className="text-xs text-slate-500">
                                        Materiais não processados no XML
                                      </span>
                                    );
                                  }
                                  
                                  return (
                                    <span className="text-xs text-slate-500">
                                      Ambiente criado manualmente
                                    </span>
                                  );
                                })()}
                              </div>
                            </div>
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