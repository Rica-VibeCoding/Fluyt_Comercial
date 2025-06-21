'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatarMoeda } from '@/lib/formatters';

interface Ambiente {
  id: string;
  nome: string;
  valorTotal: number;
}

interface OrcamentoAmbientesProps {
  valorTotal: number;
  ambientes: Ambiente[];
}

export function OrcamentoAmbientes({ valorTotal, ambientes }: OrcamentoAmbientesProps) {
  return (
    <div className="col-span-1 flex flex-col">
      
      {/* Card Valor Total - altura dinâmica igual aos cards da direita */}
      <div className="flex-none h-[88px] mb-6">
        <Card className="h-full">
          <CardContent className="p-4 h-full flex flex-col justify-between">
            <h3 className="font-semibold">Valor Total</h3>
            <p className="text-2xl font-bold text-green-600">
              {formatarMoeda(valorTotal)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Card Ambientes */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Ambientes</h3>
          
          <div className="flex justify-between border-b-2 pb-2 mb-2 font-semibold text-sm">
            <span>Nome</span>
            <span>Valor</span>
          </div>
          
          <div className="space-y-1">
            {ambientes.length > 0 ? ambientes.map((ambiente) => (
              <div key={ambiente.id} className="flex justify-between py-1 border-b">
                <span className="font-medium">{ambiente.nome}</span>
                <span className="text-green-600">
                  {formatarMoeda(ambiente.valorTotal)}
                </span>
              </div>
            )) : (
              <p className="text-gray-500 text-center py-4">Nenhum ambiente</p>
            )}
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
}