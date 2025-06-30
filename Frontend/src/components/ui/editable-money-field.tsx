'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Edit3, Check, X, Calculator } from 'lucide-react';
import { formatarMoedaBR, parseMoedaBR } from '@/lib/formatters';

interface EditableMoneyFieldProps {
  value: number;
  onChange: (value: number) => void;
  isCalculating?: boolean;
  disabled?: boolean;
  placeholder?: string;
  tooltip?: string;
  className?: string;
  wasRecentlyChanged?: boolean;
}

export function EditableMoneyField({
  value,
  onChange,
  isCalculating = false,
  disabled = false,
  placeholder = "R$ 0,00",
  tooltip = "Clique para editar",
  className,
  wasRecentlyChanged = false
}: EditableMoneyFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Usar função unificada de formatação
  const formatMoney = (val: number): string => {
    return formatarMoedaBR(val);
  };

  // Converter string para número
  // Usar função unificada de parse
  const parseMoney = (str: string): number => {
    return parseMoedaBR(str);
  };

  // Iniciar edição
  const handleStartEdit = () => {
    if (disabled || isCalculating) return;
    setInputValue(value.toString());
    setIsEditing(true);
  };

  // Salvar edição
  const handleSave = () => {
    const newValue = parseMoney(inputValue);
    onChange(newValue);
    setIsEditing(false);
  };

  // Cancelar edição
  const handleCancel = () => {
    setIsEditing(false);
    setInputValue('');
  };

  // Auto-focus quando entrar em modo edição
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Handlers de teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    } else if (e.key === 'Tab') {
      // Permitir Tab normal para navegação
      handleSave();
    }
  };

  if (isEditing) {
    return (
      <div className={cn("relative inline-flex items-center gap-2", className)}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="px-3 py-2 border-2 border-blue-500 rounded-lg bg-white text-lg font-semibold 
                     focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-600
                     transition-all duration-200 shadow-lg min-w-0 w-full sm:w-auto"
          placeholder={placeholder}
          aria-label="Editar valor monetário"
          aria-describedby="money-field-help"
          autoComplete="off"
          inputMode="decimal"
        />
        <div className="flex gap-1">
          <button
            onClick={handleSave}
            className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors
                       focus:outline-none focus:ring-2 focus:ring-green-300"
            title="Salvar (Enter)"
            aria-label="Salvar alterações"
            tabIndex={0}
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors
                       focus:outline-none focus:ring-2 focus:ring-red-300"
            title="Cancelar (Esc)"
            aria-label="Cancelar edição"
            tabIndex={0}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative inline-flex items-center gap-2 group cursor-pointer transition-all duration-200",
        "focus-within:ring-2 focus-within:ring-blue-300 focus-within:ring-offset-2",
        {
          "opacity-50 cursor-not-allowed": disabled || isCalculating,
          "hover:bg-blue-50 hover:shadow-sm rounded-lg px-2 py-1": !disabled && !isCalculating
        },
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleStartEdit}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleStartEdit();
        }
      }}
      title={disabled ? "Campo não editável" : tooltip}
      role="button"
      tabIndex={disabled || isCalculating ? -1 : 0}
      aria-label={`${tooltip}. Valor atual: ${formatMoney(value)}`}
      aria-disabled={disabled || isCalculating}
    >
      <span className={cn(
        "text-lg font-semibold transition-all duration-200",
        {
          "text-blue-600": !disabled && !isCalculating && !wasRecentlyChanged,
          "text-gray-500": disabled,
          "text-yellow-600": isCalculating,
          "text-green-600 animate-pulse": wasRecentlyChanged && !isCalculating
        }
      )}>
        {formatMoney(value)}
      </span>

      {isCalculating ? (
        <Calculator className="h-4 w-4 text-yellow-600 animate-pulse" />
      ) : (
        <Edit3 className={cn(
          "h-4 w-4 transition-all duration-200",
          {
            "text-blue-400 opacity-0 group-hover:opacity-100": !disabled,
            "text-gray-400 opacity-50": disabled
          }
        )} />
      )}

      {/* Tooltip */}
      {isHovered && !disabled && !isCalculating && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 
                        bg-gray-800 text-white text-xs px-2 py-1 rounded 
                        opacity-0 animate-in fade-in duration-200">
          {tooltip}
        </div>
      )}

      {/* Texto de ajuda para screen readers */}
      <div id="money-field-help" className="sr-only">
        Pressione Enter ou Espaço para editar. Use Enter para salvar ou Escape para cancelar.
      </div>
    </div>
  );
} 