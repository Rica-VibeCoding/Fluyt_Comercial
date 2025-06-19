import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreditCard } from 'lucide-react';

interface ModalPagamentoBaseProps {
  isOpen: boolean;
  onClose: () => void;
  titulo: string;
  isLoading?: boolean;
  salvando?: boolean;
  erroValidacao?: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  isFormValido?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Componente base para todos os modais de pagamento
 * Centraliza layout, estrutura e comportamentos comuns
 */
export function ModalPagamentoBase({
  isOpen,
  onClose,
  titulo,
  isLoading = false,
  salvando = false,
  erroValidacao,
  children,
  onSubmit,
  isFormValido = true,
  maxWidth = 'md'
}: ModalPagamentoBaseProps) {

  const getMaxWidth = () => {
    switch (maxWidth) {
      case 'sm': return 'max-w-sm';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      default: return 'max-w-md';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${getMaxWidth()} max-h-[80vh] overflow-y-auto`}>
        {/* Header compacto */}
        <DialogHeader className="pb-3">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5 text-slate-600" />
            {titulo}
          </DialogTitle>
        </DialogHeader>

        {/* Conteúdo do formulário */}
        <form onSubmit={onSubmit} className="space-y-3">
          {/* Erro de validação compacto */}
          {erroValidacao && (
            <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {erroValidacao}
            </div>
          )}

          {/* Campos do formulário */}
          <div className="space-y-3">
            {children}
          </div>

          {/* Botões de ação compactos */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={salvando}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isFormValido || salvando || isLoading}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 