'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, FileText } from 'lucide-react';

interface OrcamentoHeaderProps {
  clienteNome: string | null;
  podeGerarContrato: boolean;
  onGerarContrato: () => void;
}

export function OrcamentoHeader({ 
  clienteNome, 
  podeGerarContrato, 
  onGerarContrato 
}: OrcamentoHeaderProps) {
  return (
    <div className="bg-white border rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/painel">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
          
          <p className="text-lg font-semibold">
            {clienteNome || 'Sem cliente'}
          </p>
        </div>
        
        {/* Botão Gerar Contrato */}
        <Button
          onClick={onGerarContrato}
          disabled={!podeGerarContrato}
          className="gap-2 bg-green-600 hover:bg-green-700 text-white"
        >
          {podeGerarContrato ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          {podeGerarContrato ? 'Gerar Contrato' : 'Configure Pagamento'}
        </Button>
      </div>
    </div>
  );
}