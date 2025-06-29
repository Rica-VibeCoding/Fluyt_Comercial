"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { TipoColaborador } from '@/types/colaboradores';

interface TipoColaboradorTableProps {
  tipos: TipoColaborador[];
  onEdit: (tipo: TipoColaborador) => void;
  onDelete: (id: string) => void;
}

export function TipoColaboradorTable({ tipos, onEdit, onDelete }: TipoColaboradorTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentual = (value: number) => {
    return `${value}%`;
  };

  if (tipos.length === 0) {
    return (
      <Card className="shadow-md border-0 bg-blue-50/30">
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium">Nenhum tipo de colaborador cadastrado</p>
            <p className="text-sm mt-2">Clique em "Novo Tipo" para começar</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md border-0 bg-blue-50/30">
      <CardContent className="p-0">
        <div className="overflow-hidden">
          {tipos.map((tipo, index) => (
            <div key={tipo.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} border-b border-gray-100 last:border-b-0`}>
              {/* Linha principal */}
              <div className="p-4 hover:bg-blue-50/50 transition-colors cursor-pointer" onClick={() => toggleRow(tipo.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRow(tipo.id);
                      }}
                    >
                      {expandedRows.has(tipo.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-gray-900">{tipo.nome}</h4>
                        <Badge variant={tipo.categoria === 'FUNCIONARIO' ? "default" : "secondary"}>
                          {tipo.categoria}
                        </Badge>
                        {!tipo.ativo && (
                          <Badge variant="destructive">Inativo</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        {tipo.tipoPercentual && (
                          <span>
                            {formatPercentual(tipo.percentualValor)} sobre {tipo.tipoPercentual.toLowerCase()}
                          </span>
                        )}
                        {tipo.salarioBase > 0 && (
                          <span>Salário: {formatCurrency(tipo.salarioBase)}</span>
                        )}
                        {tipo.valorPorServico > 0 && (
                          <span>Por serviço: {formatCurrency(tipo.valorPorServico)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(tipo);
                      }}
                      className="h-8 w-8 p-0 hover:bg-blue-100"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(tipo.id);
                      }}
                      className="h-8 w-8 p-0 hover:bg-red-100 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Linha expandida com detalhes */}
              {expandedRows.has(tipo.id) && (
                <div className="px-4 pb-4 bg-gray-50/30 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Remuneração</label>
                      <div className="mt-1 space-y-1">
                        {tipo.tipoPercentual && (
                          <p className="text-sm">
                            <span className="font-medium">{formatPercentual(tipo.percentualValor)}</span> sobre {tipo.tipoPercentual.toLowerCase()}
                          </p>
                        )}
                        {tipo.salarioBase > 0 && (
                          <p className="text-sm">
                            <span className="font-medium">Salário:</span> {formatCurrency(tipo.salarioBase)}
                          </p>
                        )}
                        {tipo.valorPorServico > 0 && (
                          <p className="text-sm">
                            <span className="font-medium">Por serviço:</span> {formatCurrency(tipo.valorPorServico)}
                          </p>
                        )}
                        {tipo.minimoGarantido > 0 && (
                          <p className="text-sm">
                            <span className="font-medium">Mínimo:</span> {formatCurrency(tipo.minimoGarantido)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Configurações</label>
                      <div className="mt-1 space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">Ordem:</span> {tipo.ordemExibicao}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Opcional no orçamento:</span> {tipo.opcionalNoOrcamento ? 'Sim' : 'Não'}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Status:</span> {tipo.ativo ? 'Ativo' : 'Inativo'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Categoria</label>
                      <div className="mt-1">
                        <Badge variant={tipo.categoria === 'FUNCIONARIO' ? "default" : "secondary"} className="text-sm">
                          {tipo.categoria}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 