'use client';

import React from 'react';
import { ModalFormasPagamento } from './modal-formas-pagamento';
import { ModalAVista } from './modal-a-vista';
import { ModalBoleto } from './modal-boleto';
import { ModalCartao } from './modal-cartao';
import { ModalFinanceira } from './modal-financeira';
import { FormaPagamento } from '@/lib/sessao-simples';

interface OrcamentoModalsProps {
  // Estados dos modais
  modalFormasAberto: boolean;
  modalAVistaAberto: boolean;
  modalBoletoAberto: boolean;
  modalCartaoAberto: boolean;
  modalFinanceiraAberto: boolean;
  
  // Forma sendo editada
  formaEditando: FormaPagamento | null;
  
  // Valores de validação
  valorMaximo: number;
  valorJaAlocado: number;
  
  // Handlers
  onCloseModalFormas: () => void;
  onCloseModalEdicao: () => void;
  onFormaPagamentoAdicionada: (forma: { tipo: string; valor?: number; detalhes?: any }) => void;
  onAtualizarForma: (dados: any, tipo: 'a-vista' | 'boleto' | 'cartao' | 'financeira') => void;
}

export function OrcamentoModals({
  modalFormasAberto,
  modalAVistaAberto,
  modalBoletoAberto,
  modalCartaoAberto,
  modalFinanceiraAberto,
  formaEditando,
  valorMaximo,
  valorJaAlocado,
  onCloseModalFormas,
  onCloseModalEdicao,
  onFormaPagamentoAdicionada,
  onAtualizarForma
}: OrcamentoModalsProps) {
  return (
    <>
      {/* Modal de Formas de Pagamento */}
      <ModalFormasPagamento
        isOpen={modalFormasAberto}
        onClose={onCloseModalFormas}
        onFormaPagamentoAdicionada={onFormaPagamentoAdicionada}
        valorMaximo={valorMaximo}
        valorJaAlocado={valorJaAlocado}
      />

      {/* Modais específicos para edição */}
      <ModalAVista
        isOpen={modalAVistaAberto}
        onClose={onCloseModalEdicao}
        onSalvar={(dados) => {
          console.log('📝 Editando À Vista:', dados);
          onAtualizarForma(dados, 'a-vista');
        }}
        dadosIniciais={formaEditando?.tipo === 'a-vista' ? {
          valor: formaEditando.valor,
          data: formaEditando.dados?.data
        } : undefined}
        valorMaximo={valorMaximo}
        valorJaAlocado={valorJaAlocado}
      />

      <ModalBoleto
        isOpen={modalBoletoAberto}
        onClose={onCloseModalEdicao}
        onSalvar={(dados) => {
          console.log('📝 Editando Boleto:', dados);
          onAtualizarForma(dados, 'boleto');
        }}
        dadosIniciais={formaEditando?.tipo === 'boleto' ? {
          valor: formaEditando.valor,
          parcelas: formaEditando.dados?.parcelas
        } : undefined}
        valorMaximo={valorMaximo}
        valorJaAlocado={valorJaAlocado}
      />

      <ModalCartao
        isOpen={modalCartaoAberto}
        onClose={onCloseModalEdicao}
        onSalvar={(dados) => {
          console.log('📝 Editando Cartão:', dados);
          onAtualizarForma(dados, 'cartao');
        }}
        dadosIniciais={formaEditando?.tipo === 'cartao' ? {
          valor: formaEditando.valor,
          vezes: formaEditando.parcelas,
          taxa: formaEditando.dados?.taxa
        } : undefined}
        valorMaximo={valorMaximo}
        valorJaAlocado={valorJaAlocado}
      />

      <ModalFinanceira
        isOpen={modalFinanceiraAberto}
        onClose={onCloseModalEdicao}
        onSalvar={(dados) => {
          console.log('📝 Editando Financeira:', dados);
          onAtualizarForma(dados, 'financeira');
        }}
        dadosIniciais={formaEditando?.tipo === 'financeira' ? {
          valor: formaEditando.valor,
          vezes: formaEditando.parcelas,
          percentual: formaEditando.dados?.percentual,
          parcelas: formaEditando.dados?.parcelas
        } : undefined}
        valorMaximo={valorMaximo}
        valorJaAlocado={valorJaAlocado}
      />
    </>
  );
}