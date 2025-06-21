/**
 * Hook para inputs de moeda brasileira
 * Formata automaticamente para Real (BRL) e gerencia valor numérico
 */

import { useState, useEffect } from 'react';

export function useCurrencyInput(initialValue: number, onChange: (value: number) => void) {
  const [display, setDisplay] = useState(
    initialValue > 0
      ? initialValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : ''
  );
  const [raw, setRaw] = useState(
    initialValue > 0 ? String(Math.round(initialValue * 100)) : ''
  );

  useEffect(() => {
    if (initialValue > 0) {
      const centavos = Math.round(initialValue * 100);
      setRaw(String(centavos));
      setDisplay((centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    } else {
      setRaw('');
      setDisplay('');
    }
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyNums = e.target.value.replace(/\D/g, '');
    setRaw(onlyNums);
    const valor = onlyNums ? parseInt(onlyNums, 10) : 0;
    const valorFloat = valor / 100;
    setDisplay(
      valorFloat.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    );
    onChange(valorFloat);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!raw) setDisplay('');
  };

  return {
    value: display,
    onChange: handleChange,
    onFocus: handleFocus,
    inputMode: 'numeric' as const,
    maxLength: 17,
  };
}