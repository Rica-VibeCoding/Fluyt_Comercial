'use client';

import React from 'react';
import { Store, Edit, Trash2 } from 'lucide-react';
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
            <TableHead className="font-semibold text-slate-700 h-10">Loja</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Empresa</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Contato</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Status</TableHead>
            <TableHead className="text-right font-semibold text-slate-700 h-10">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lojas.map((loja) => (
            <TableRow key={loja.id} className="h-12 bg-white hover:bg-blue-50/50">
              <TableCell className="py-2">
                <div>
                  <div className="font-medium">{loja.nome}</div>
                  <div className="text-sm text-muted-foreground">Código: {loja.codigo} • Gerente: {loja.gerente}</div>
                </div>
              </TableCell>
              <TableCell className="py-2">
                <span className="font-medium">{loja.empresa || 'N/A'}</span>
              </TableCell>
              <TableCell className="py-2">
                <div className="text-sm">
                  <div>{loja.email}</div>
                  <div className="text-muted-foreground">{loja.telefone}</div>
                </div>
              </TableCell>
              <TableCell className="py-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    loja.ativa ? 'bg-slate-600 text-white' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {loja.ativa ? 'Ativa' : 'Inativa'}
                </span>
              </TableCell>
              <TableCell className="text-right py-2">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 