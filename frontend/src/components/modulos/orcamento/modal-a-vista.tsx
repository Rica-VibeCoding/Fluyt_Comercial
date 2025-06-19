'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { formatarValorInput } from '@/lib/formatters';
import { useModalPagamento } from '@/hooks/modulos/orcamento';
import { ModalPagamentoBase } from './ModalPagamentoBase';
import { CampoValor } from './CampoValor';
import { obterDataAtualInput } from '@/lib/formatters';

interface ModalAVistaProps {
  isOpen: boolean;
  onClose: () => void;
  onSalvar: (dados: { valor: number; data: string }) => void;
  dadosIniciais?: {
    valor?: number;
    data?: string;
  };
  valorMaximo?: number;
  valorJaAlocado?: number;
}

export function ModalAVista({ isOpen, onClose, onSalvar, dadosIniciais, valorMaximo = 0, valorJaAlocado = 0 }: ModalAVistaProps) {
  const {
    valor,
    setValor,
    data,
    setData,
    isLoading,
    setIsLoading,
    erroValidacao,
    validarFormulario,
    getValorNumerico,
    limparCampos,
    isFormValido
  } = useModalPagamento({
    isOpen,
    tipo: 'a-vista',
    valorMaximo,
    valorJaAlocado,
    dadosIniciais
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Usar validação centralizada do hook
    if (!validarFormulario()) {
      return;
    }
    
    setIsLoading(true);

    try {
      onSalvar({
        valor: getValorNumerico(),
        data: data
      });

      // Reset form usando função do hook
      limparCampos();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDataMinima = () => {
    return obterDataAtualInput();
  };

  return (
    <ModalPagamentoBase
      isOpen={isOpen}
      onClose={onClose}
      titulo="À Vista"
      isLoading={isLoading}
      erroValidacao={erroValidacao}
      onSubmit={handleSubmit}
      isFormValido={Boolean(valor && data && !erroValidacao)}
    >
      
      {/* Campo Valor usando componente reutilizável */}
      <CampoValor
        valor={valor}
        onChange={(e) => setValor(formatarValorInput(e.target.value))}
        valorMaximo={valorMaximo}
        valorJaAlocado={valorJaAlocado}
        erroValidacao={erroValidacao}
        disabled={isLoading}
      />

      {/* Campo Data */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Data de Recebimento *
        </label>
        <Input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          min={getDataMinima()}
          className="h-9 text-sm border-slate-300 focus:border-slate-400 dark:border-slate-600 dark:focus:border-slate-500 w-full min-w-[120px]"
          required
          autoComplete="off"
          autoFocus={false}
        />
      </div>
      
    </ModalPagamentoBase>
  );
}