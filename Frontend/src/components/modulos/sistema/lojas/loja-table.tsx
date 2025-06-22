'use client';

import React, { useState } from 'react';
import { Store, Edit, Trash2, ChevronDown, ChevronRight, Mail, Phone, MapPin, Building2, Users } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

import type { Loja } from '@/types/sistema';

interface LojaTableProps {
  lojas: Loja[];
}

export function LojaTable({ lojas }: LojaTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRowExpansion = (lojaId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(lojaId)) {
      newExpandedRows.delete(lojaId);
    } else {
      newExpandedRows.add(lojaId);
    }
    setExpandedRows(newExpandedRows);
  };

  const getLojaNumero = (index: number) => {
    return String(index + 1).padStart(3, '0');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (lojas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border-0 rounded-lg bg-white shadow-md">
        <Store className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma loja cadastrada</h3>
        <p className="text-gray-500 text-center max-w-sm">
          Cadastre lojas para expandir sua rede de pontos de venda.
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
            <TableHead className="font-semibold text-slate-700 h-10">Loja</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Contato</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Status</TableHead>
            <TableHead className="text-right font-semibold text-slate-700 h-10">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lojas.map((loja, index) => (
            <React.Fragment key={loja.id}>
              <TableRow 
                className="h-12 bg-white hover:bg-blue-50/50 cursor-pointer transition-colors"
                onClick={() => toggleRowExpansion(loja.id)}
              >
                {/* Expand Icon */}
                <TableCell className="py-2 w-12">
                  {expandedRows.has(loja.id) ? (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  )}
                </TableCell>

                {/* Código */}
                <TableCell className="py-2">
                  <span className="text-sm font-medium font-mono text-slate-900">#{getLojaNumero(index)}</span>
                </TableCell>

                {/* Loja */}
                <TableCell className="py-2">
                  <div className="text-sm font-medium text-slate-900">{loja.nome}</div>
                </TableCell>

                {/* Contato - APENAS TELEFONE */}
                <TableCell className="py-2">
                  <div className="flex items-center gap-1 text-sm font-normal text-slate-900">
                    <Phone className="h-3 w-3 text-green-600" />
                    {loja.telefone || '--'}
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell className="py-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      loja.ativa ? 'bg-slate-600 text-white' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {loja.ativa ? 'Ativa' : 'Inativa'}
                  </span>
                </TableCell>

                {/* Ações */}
                <TableCell className="text-right py-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-blue-50/50"
                    >
                      <Edit className="h-3 w-3 text-slate-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-red-50/50"
                    >
                      <Trash2 className="h-3 w-3 text-slate-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>

              {/* LINHA EXPANDIDA COM DETALHES */}
              {expandedRows.has(loja.id) && (
                <TableRow key={`${loja.id}-expanded`} className="bg-blue-50/20 hover:bg-blue-50/30">
                  <TableCell colSpan={6} className="py-4">
                    <div className="pl-4">
                      {/* Layout Grid Responsivo - Mais denso */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        
                        {/* COLUNA 1 - DADOS DA LOJA */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Dados da Loja</h4>
                          
                          {/* Código */}
                          <div className="flex items-center gap-2">
                            <Store className="h-3 w-3 text-slate-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[45px]">Código:</span>
                            <span className="text-xs font-mono text-slate-900">{loja.codigo || '--'}</span>
                          </div>

                          {/* Email */}
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-blue-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[45px]">Email:</span>
                            {loja.email ? (
                              <span className="text-xs text-slate-900 break-all">{loja.email}</span>
                            ) : (
                              <span className="text-xs text-gray-400">--</span>
                            )}
                          </div>

                          {/* Telefone */}
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-green-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[45px]">Telefone:</span>
                            {loja.telefone ? (
                              <span className="text-xs text-slate-900">{loja.telefone}</span>
                            ) : (
                              <span className="text-xs text-gray-400">--</span>
                            )}
                          </div>
                        </div>

                        {/* COLUNA 2 - EMPRESA */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Empresa</h4>
                          
                          {/* Empresa */}
                          <div className="flex items-start gap-2">
                            <Building2 className="h-3 w-3 text-slate-500 mt-0.5" />
                            <div>
                              <span className="text-xs font-medium text-slate-600">Empresa:</span>
                              <div className="text-xs text-slate-900 mt-1">
                                {loja.empresa || <span className="text-gray-400">--</span>}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* COLUNA 3 - INFORMAÇÕES OPERACIONAIS */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Operacional</h4>
                          
                          {/* Gerente */}
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3 text-purple-500" />
                            <span className="text-xs font-medium text-slate-600 min-w-[50px]">Gerente:</span>
                            <span className="text-xs text-slate-900">{loja.gerente || '--'}</span>
                          </div>

                          {/* Status Visual */}
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${loja.ativa ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-xs font-medium text-slate-600 min-w-[50px]">Status:</span>
                            <span className={`text-xs ${loja.ativa ? 'text-green-600' : 'text-red-600'}`}>
                              {loja.ativa ? 'Ativa' : 'Inativa'}
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