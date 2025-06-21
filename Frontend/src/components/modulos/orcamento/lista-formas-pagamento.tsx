'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, DollarSign, FileText, CreditCard, Building, Lock, Unlock } from 'lucide-react';
import { FormaPagamento } from '@/lib/sessao-simples';

interface ListaFormasPagamentoProps {
  formas: FormaPagamento[];
  onEditar: (forma: FormaPagamento) => void;
  onRemover: (id: string) => void;
  onToggleTravamento?: (id: string) => void;
}

// Configuração de cores profissionais por tipo
const CORES_FORMAS = {
  'a-vista': {
    bg: 'bg-green-50 dark:bg-green-900/10',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-700 dark:text-green-300',
    icon: DollarSign,
    nome: 'À Vista'
  },
  'boleto': {
    bg: 'bg-blue-50 dark:bg-blue-900/10',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-300',
    icon: FileText,
    nome: 'Boleto'
  },
  'cartao': {
    bg: 'bg-purple-50 dark:bg-purple-900/10',
    border: 'border-purple-200 dark:border-purple-800',
    text: 'text-purple-700 dark:text-purple-300',
    icon: CreditCard,
    nome: 'Cartão'
  },
  'financeira': {
    bg: 'bg-orange-50 dark:bg-orange-900/10',
    border: 'border-orange-200 dark:border-orange-800',
    text: 'text-orange-700 dark:text-orange-300',
    icon: Building,
    nome: 'Financeira'
  }
} as const;

// Função para formatar valor em reais
const formatarValor = (valor: number): string => {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

// Função para obter dados formatados resumidos (para 2 linhas)
const obterDadosResumidos = (forma: FormaPagamento) => {
  const dados = {
    modalidade: CORES_FORMAS[forma.tipo].nome,
    valor: formatarValor(forma.valor),
    detalhes: ''  // Detalhes específicos
  };
  
  // Detalhes específicos por tipo
  switch (forma.tipo) {
    case 'a-vista': {
      if (forma.dados?.data) {
        const data = new Date(forma.dados.data).toLocaleDateString('pt-BR');
        dados.detalhes = `Recebimento em ${data}`;
      } else {
        dados.detalhes = 'Pagamento à vista';
      }
      break;
    }
      
    case 'boleto':
    case 'cartao':
    case 'financeira': {
      const parcelas = forma.parcelas || 1;
      const valorParcela = forma.valor / parcelas;
      dados.detalhes = `${parcelas}x de ${formatarValor(valorParcela)}`;
      
      // Adicionar valor deflacionado se diferente
      if (forma.valorPresente !== forma.valor) {
        dados.detalhes += ` • VP: ${formatarValor(forma.valorPresente)}`;
      }
      break;
    }
  }
  
  return dados;
};

export function ListaFormasPagamento({ 
  formas, 
  onEditar, 
  onRemover, 
  onToggleTravamento 
}: ListaFormasPagamentoProps) {
  
  if (formas.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {formas.map((forma) => {
        const config = CORES_FORMAS[forma.tipo];
        const IconeComponent = config.icon;
        const dadosResumidos = obterDadosResumidos(forma);
        
        return (
          <Card 
            key={forma.id}
            className={`${config.bg} ${config.border} border transition-all duration-200 hover:shadow-sm ${
              forma.travada 
                ? 'ring-2 ring-orange-200 dark:ring-orange-800 bg-orange-50/50 dark:bg-orange-950/10' 
                : ''
            }`}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between gap-3">
                
                {/* Seção esquerda: Ícone + Dados (2 linhas) */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`p-1.5 rounded ${config.bg} ${config.border} border flex-shrink-0`}>
                    <IconeComponent className={`h-3.5 w-3.5 ${config.text}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {/* Linha 1: Modalidade + Valor */}
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`text-sm font-medium ${config.text}`}>
                        {dadosResumidos.modalidade}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {dadosResumidos.valor}
                      </span>
                      
                      {/* Badge TRAVADO */}
                      {forma.travada && (
                        <span className="px-1.5 py-0.5 text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded border border-orange-200 dark:border-orange-800">
                          TRAVADO
                        </span>
                      )}
                    </div>
                    {/* Linha 2: Detalhes específicos */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate leading-relaxed">
                      {dadosResumidos.detalhes}
                    </p>
                  </div>
                </div>

                {/* Seção direita: Cadeado + Ações */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  
                  {/* Ícone de Cadeado/Travamento - CORRIGIDO */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleTravamento?.(forma.id)}
                    className={`h-7 w-7 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                      forma.travada 
                        ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20' 
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                    title={forma.travada ? 'TRAVADO - Valor fixo (clique para destravar)' : 'LIVRE - Valor ajustável (clique para travar)'}
                  >
                    {forma.travada ? (
                      <Lock className="h-3 w-3" />
                    ) : (
                      <Unlock className="h-3 w-3" />
                    )}
                  </Button>

                  {/* Botão Editar */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditar(forma)}
                    className={`h-7 w-7 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 ${config.text}`}
                    title="Editar forma de pagamento"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>

                  {/* Botão Remover */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemover(forma.id)}
                    className="h-7 w-7 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                    title="Remover forma de pagamento"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 