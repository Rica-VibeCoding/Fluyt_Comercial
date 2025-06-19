'use client';

import React, { useState, useEffect, useRef } from 'react';
import { formatarMoeda } from '@/lib/formatters';

interface CelulaEditavelProps {
  valor: number | string;
  tipo: 'valor' | 'data';
  editavel: boolean;
  onChange: (novoValor: number | string) => void;
  className?: string;
}

export function CelulaEditavel({ 
  valor, 
  tipo, 
  editavel, 
  onChange, 
  className = '' 
}: CelulaEditavelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [valorLocal, setValorLocal] = useState(valor);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sincronizar valor local quando valor externo muda
  useEffect(() => {
    if (tipo === 'valor') {
      // Para valores, sempre limitar a 2 casas decimais
      const valorNumerico = Number(valor);
      const valorLimitado = Math.round(valorNumerico * 100) / 100;
      setValorLocal(valorLimitado);
    } else {
      setValorLocal(valor);
    }
  }, [valor, tipo]);

  // Focar input quando entra em modo de edição
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (tipo === 'valor') {
        inputRef.current.select(); // Seleciona todo texto para valores
      }
    }
  }, [isEditing, tipo]);

  // Formatação para exibição
  const formatarParaExibicao = (val: number | string): string => {
    if (tipo === 'valor') {
      return formatarMoeda(Number(val));
    } else {
      // Data: converter de ISO (YYYY-MM-DD) para exibição (DD/MM/YYYY)
      const data = new Date(String(val) + 'T00:00:00');
      return data.toLocaleDateString('pt-BR');
    }
  };

  // Formatação para edição
  const formatarParaEdicao = (val: number | string): string => {
    if (tipo === 'valor') {
      // Limitar a 2 casas decimais também na exibição do input
      const valorNumerico = Number(val);
      const valorLimitado = Math.round(valorNumerico * 100) / 100;
      return valorLimitado.toFixed(2); // Sempre mostrar 2 casas decimais
    } else {
      return String(val); // Data em formato ISO para input type="date"
    }
  };

  // Handler para salvar alterações
  const handleSave = () => {
    let valorParsed: number | string;
    
    if (tipo === 'valor') {
      // Parse do valor numérico, permitindo zero
      const valorNumerico = Math.max(0, Number(valorLocal) || 0);
      
      // Limitar a 2 casas decimais usando Math.round
      valorParsed = Math.round(valorNumerico * 100) / 100;
      
      console.log('💰 Valor limitado a 2 casas decimais:', { original: valorNumerico, limitado: valorParsed });
      
    } else {
      // Data: validar formato básico
      valorParsed = String(valorLocal);
      
      // Validação básica de data
      if (!/^\d{4}-\d{2}-\d{2}$/.test(valorParsed)) {
        // Se formato inválido, manter valor original
        setValorLocal(valor);
        setIsEditing(false);
        return;
      }
    }
    
    onChange(valorParsed);
    setIsEditing(false);
  };

  // Handler para cancelar edição
  const handleCancel = () => {
    setValorLocal(valor); // Restaura valor original
    setIsEditing(false);
  };

  // Handlers de eventos
  const handleClick = () => {
    if (editavel) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    if (isEditing) {
      handleSave();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let novoValor = e.target.value;
    
    // Para valores monetários, limitar casas decimais durante a digitação
    if (tipo === 'valor') {
      // Permitir apenas números, ponto decimal e máximo 2 casas decimais
      if (novoValor.includes('.')) {
        const partes = novoValor.split('.');
        if (partes[1] && partes[1].length > 2) {
          // Limitar a 2 casas decimais
          novoValor = partes[0] + '.' + partes[1].substring(0, 2);
          console.log('✂️ Limitando casas decimais durante digitação:', novoValor);
        }
      }
      
      // Validar se é um número válido
      if (novoValor !== '' && isNaN(Number(novoValor))) {
        console.warn('⚠️ Valor inválido ignorado:', novoValor);
        return; // Não atualizar se não for número válido
      }
    }
    
    setValorLocal(novoValor);
  };

  // Renderização
  if (!editavel) {
    // Célula não editável - apenas exibição
    return (
      <span className={`${className}`}>
        {formatarParaExibicao(valor)}
      </span>
    );
  }

  if (isEditing) {
    // Modo de edição - input
    return (
      <input
        ref={inputRef}
        type={tipo === 'valor' ? 'number' : 'date'}
        value={formatarParaEdicao(valorLocal)}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`
          bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-600 
          rounded px-2 py-1 text-sm w-full min-w-0
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${tipo === 'valor' ? 'text-right' : 'text-left'}
          ${className}
        `}
        step={tipo === 'valor' ? '0.01' : undefined}
        min={tipo === 'valor' ? '0' : undefined}
        lang="pt-BR"
      />
    );
  }

  // Modo de visualização - texto clicável
  return (
    <span 
      onClick={handleClick}
      onKeyDown={(e) => {
        if (editavel && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          setIsEditing(true);
        }
      }}
      className={`
        ${editavel ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:bg-blue-50 dark:focus:bg-blue-900/20' : 'cursor-default'}
        rounded px-1 py-0.5 transition-colors duration-150
        border border-transparent hover:border-blue-200 dark:hover:border-blue-700
        ${editavel ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1' : ''}
        ${className}
      `}
      title={editavel ? 'Clique para editar ou pressione Enter' : ''}
      tabIndex={editavel ? 0 : -1}
      role={editavel ? 'button' : 'text'}
      aria-label={editavel ? `Editar ${tipo === 'valor' ? 'valor' : 'data'}: ${formatarParaExibicao(valor)}` : undefined}
    >
      {formatarParaExibicao(valor)}
    </span>
  );
} 