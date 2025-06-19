import React from 'react';
import { Input } from '@/components/ui/input';

interface CampoValorProps {
  valor: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  valorMaximo?: number;
  valorJaAlocado?: number;
  erroValidacao?: string;
  disabled?: boolean;
  required?: boolean;
}

/**
 * Campo valor padronizado para modais de pagamento
 * Inclui label, formatação, validação e feedback visual
 */
export function CampoValor({
  valor,
  onChange,
  valorMaximo = 0,
  valorJaAlocado = 0,
  erroValidacao,
  disabled = false,
  required = true
}: CampoValorProps) {
  
  const valorRestante = valorMaximo - valorJaAlocado;
  const mostrarDisponivel = valorMaximo > 0;

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        Valor *
      </label>
      <Input
        type="text"
        value={valor}
        onChange={onChange}
        placeholder="R$ 0,00"
        className="h-9 text-sm border-slate-300 focus:border-slate-400 dark:border-slate-600 dark:focus:border-slate-500"
        disabled={disabled}
        required={required}
        autoComplete="off"
        autoFocus={false}
      />
      
      {/* Informação de valor disponível - mais compacta */}
      {mostrarDisponivel && (
        <div className="mt-1 text-xs text-slate-500">
          Disponível: <span className="font-medium">R$ {valorRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      )}
      
      {/* Erro de validação compacto */}
      {erroValidacao && (
        <div className="mt-1 text-xs text-red-600">
          {erroValidacao}
        </div>
      )}
    </div>
  );
} 