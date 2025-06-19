'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatarMoeda } from '@/lib/formatters';

interface OrcamentoValoresProps {
  valorTotal: number;
  valorNegociado: number;
  descontoReal: number;
  valorRecebido: number;
}

export function OrcamentoValores({
  valorTotal,
  valorNegociado, 
  descontoReal,
  valorRecebido
}: OrcamentoValoresProps) {
  return (
    <div className="flex-none grid grid-cols-3 gap-4 h-[88px] mb-6">
      
      {/* Card Desconto Real */}
      <div className="flex">
        <Card className="flex-1">
          <CardContent className="p-4 h-full flex flex-col justify-between">
            <h3 className="font-semibold">Desconto Real</h3>
            <p className="text-2xl font-bold text-orange-600">
              {descontoReal > 0 ? `${descontoReal.toFixed(1)}%` : 'Pendente'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Card Valor Negociado */}
      <div className="flex">
        <Card className="flex-1">
          <CardContent className="p-4 h-full flex flex-col justify-between">
            <h3 className="font-semibold">Valor Negociado</h3>
            <p className="text-2xl font-bold text-blue-600">
              {formatarMoeda(valorNegociado)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Card Valor Recebido */}
      <div className="flex">
        <Card className="flex-1">
          <CardContent className="p-4 h-full flex flex-col justify-between">
            <h3 className="font-semibold">Valor Recebido</h3>
            <p className="text-2xl font-bold text-purple-600">
              {formatarMoeda(valorRecebido)}
            </p>
          </CardContent>
        </Card>
      </div>
      
    </div>
  );
}