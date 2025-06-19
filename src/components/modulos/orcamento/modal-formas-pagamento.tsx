'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreditCard, DollarSign, FileText, Building } from 'lucide-react';
import { ModalAVista } from './modal-a-vista';
import { ModalBoleto } from './modal-boleto';
import { ModalCartao } from './modal-cartao';
import { ModalFinanceira } from './modal-financeira';

interface ModalFormasPagamentoProps {
  isOpen: boolean;
  onClose: () => void;
  onFormaPagamentoAdicionada?: (forma: { tipo: string; valor?: number; detalhes?: any }) => void;
  valorMaximo?: number;
  valorJaAlocado?: number;
}

export function ModalFormasPagamento({ isOpen, onClose, onFormaPagamentoAdicionada, valorMaximo, valorJaAlocado }: ModalFormasPagamentoProps) {
  const [modalAVistaAberto, setModalAVistaAberto] = useState(false);
  const [modalBoletoAberto, setModalBoletoAberto] = useState(false);
  const [modalCartaoAberto, setModalCartaoAberto] = useState(false);
  const [modalFinanceiraAberto, setModalFinanceiraAberto] = useState(false);
  const formasPagamento = [
    {
      id: 'a-vista',
      nome: 'À Vista',
      icone: DollarSign,
      cor: 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700'
    },
    {
      id: 'boleto',
      nome: 'Boleto',
      icone: FileText,
      cor: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700'
    },
    {
      id: 'cartao',
      nome: 'Cartão',
      icone: CreditCard,
      cor: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700'
    },
    {
      id: 'financeira',
      nome: 'Financeira',
      icone: Building,
      cor: 'bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700'
    }
  ];

  const handleFormaPagamento = (forma: string) => {
    console.log('Forma de pagamento selecionada:', forma);
    
    if (forma === 'a-vista') {
      setModalAVistaAberto(true);
      return;
    }
    
    if (forma === 'boleto') {
      setModalBoletoAberto(true);
      return;
    }
    
    if (forma === 'cartao') {
      setModalCartaoAberto(true);
      return;
    }
    
    if (forma === 'financeira') {
      setModalFinanceiraAberto(true);
      return;
    }
    
    console.log('Modal para', forma, 'não encontrado');
    onClose();
  };

  const handleSalvarAVista = (dados: { valor: number; data: string }) => {
    console.log('Dados À Vista salvos:', dados);
    
    // Notificar o componente pai
    onFormaPagamentoAdicionada?.({
      tipo: 'À Vista',
      valor: dados.valor,
      detalhes: dados
    });
    
    setModalAVistaAberto(false);
    onClose();
  };

  const handleSalvarBoleto = (dados: { valor: number; parcelas: any[] }) => {
    console.log('Dados Boleto salvos:', dados);
    
    // Notificar o componente pai
    onFormaPagamentoAdicionada?.({
      tipo: 'Boleto',
      valor: dados.valor,
      detalhes: dados
    });
    
    setModalBoletoAberto(false);
    onClose();
  };

  const handleSalvarCartao = (dados: { valor: number; vezes: number; taxa: number; valorPresente: number; desconto: number }) => {
    console.log('Dados Cartão salvos:', dados);
    
    // Notificar o componente pai
    onFormaPagamentoAdicionada?.({
      tipo: 'Cartão',
      valor: dados.valor,
      detalhes: dados
    });
    
    setModalCartaoAberto(false);
    onClose();
  };

  const handleSalvarFinanceira = (dados: { valor: number; vezes: number; percentual: number; parcelas: any[]; valorPresente: number }) => {
    console.log('Dados Financeira salvos:', dados);
    
    // Notificar o componente pai
    onFormaPagamentoAdicionada?.({
      tipo: 'Financeira',
      valor: dados.valor,
      detalhes: dados
    });
    
    setModalFinanceiraAberto(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col bg-white dark:bg-slate-900">
        <DialogHeader className="border-b border-slate-200 dark:border-slate-700 p-2 pb-1">
          <DialogTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Escolha a Forma de Pagamento
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <div className="p-2">
            <div className="grid grid-cols-2 gap-1">
              {formasPagamento.map((forma) => {
                const IconeComponent = forma.icone;
                return (
                  <button
                    key={forma.id}
                    onClick={() => handleFormaPagamento(forma.id)}
                    className="h-16 flex flex-col items-center justify-center gap-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    <IconeComponent className="h-5 w-5" />
                    <span className="text-xs font-medium">{forma.nome}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
      
      {/* Modal À Vista */}
      <ModalAVista
        isOpen={modalAVistaAberto}
        onClose={() => setModalAVistaAberto(false)}
        onSalvar={handleSalvarAVista}
        valorMaximo={valorMaximo}
        valorJaAlocado={valorJaAlocado}
      />

      {/* Modal Boleto */}
      <ModalBoleto
        isOpen={modalBoletoAberto}
        onClose={() => setModalBoletoAberto(false)}
        onSalvar={handleSalvarBoleto}
        valorMaximo={valorMaximo}
        valorJaAlocado={valorJaAlocado}
      />

      {/* Modal Cartão */}
      <ModalCartao
        isOpen={modalCartaoAberto}
        onClose={() => setModalCartaoAberto(false)}
        onSalvar={handleSalvarCartao}
        valorMaximo={valorMaximo}
        valorJaAlocado={valorJaAlocado}
      />

      {/* Modal Financeira */}
      <ModalFinanceira
        isOpen={modalFinanceiraAberto}
        onClose={() => setModalFinanceiraAberto(false)}
        onSalvar={handleSalvarFinanceira}
        valorMaximo={valorMaximo}
        valorJaAlocado={valorJaAlocado}
      />
    </Dialog>
  );
}