'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatarMoeda } from '@/lib/formatters';
import { FormaPagamento } from '@/lib/sessao-simples';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { CelulaEditavel } from './celula-editavel';

// Reutilizando as cores já definidas no sistema
const CORES_FORMAS = {
  'a-vista': {
    text: 'text-green-700 dark:text-green-300',
    nome: 'À Vista'
  },
  'boleto': {
    text: 'text-blue-700 dark:text-blue-300',
    nome: 'Boleto'
  },
  'cartao': {
    text: 'text-purple-700 dark:text-purple-300',
    nome: 'Cartão'
  },
  'financeira': {
    text: 'text-orange-700 dark:text-orange-300',
    nome: 'Financeira'
  }
} as const;

// Interface para item consolidado da tabela
export interface ItemPagamentoConsolidado {
  id: string;                    // Identificador único
  formaId: string;              // ID da forma de pagamento original
  tipo: 'a-vista' | 'boleto' | 'cartao' | 'financeira';
  numeroParcela?: number;       // Número da parcela atual
  totalParcelas?: number;       // Total de parcelas da forma
  data: string;                 // Data ISO (YYYY-MM-DD)
  valor: number;                // Valor da parcela
  editavel: boolean;            // Se pode ser editado (apenas boleto)
}

interface TabelaPagamentosConsolidadaProps {
  formasPagamento: FormaPagamento[];
  valorNegociado: number;
  onParcelaChange?: (formaId: string, numeroParcela: number, campo: 'valor' | 'data', novoValor: number | string) => void;
}

// Função para consolidar todas as formas de pagamento em uma única lista
const consolidarPagamentos = (formas: FormaPagamento[]): ItemPagamentoConsolidado[] => {
  const itensConsolidados: ItemPagamentoConsolidado[] = [];
  
  formas.forEach(forma => {
    if (forma.tipo === 'a-vista') {
      // À vista: um único pagamento
      itensConsolidados.push({
        id: `${forma.id}-1`,
        formaId: forma.id,
        tipo: forma.tipo,
        data: forma.dados?.data || new Date().toISOString().split('T')[0],
        valor: forma.valor,
        editavel: false // À vista não é editável
      });
    } else if (forma.tipo === 'cartao') {
      // CARTÃO: Sempre linha única, independente do número de parcelas
      const numParcelas = forma.parcelas || 1;
      itensConsolidados.push({
        id: `${forma.id}-unico`,
        formaId: forma.id,
        tipo: forma.tipo,
        numeroParcela: numParcelas > 1 ? 1 : undefined, // Para cartão, sempre mostrar como "1/X"
        totalParcelas: numParcelas > 1 ? numParcelas : undefined,
        data: forma.dados?.data || new Date().toISOString().split('T')[0],
        valor: forma.valor, // Valor total, não dividido
        editavel: false // Cartão não é editável
      });
    } else {
      // Outras formas parceladas (boleto, financeira): extrair cada parcela
      const numParcelas = forma.parcelas || 1;
      const valorParcela = forma.valor / numParcelas;
      
      // Se tem dados de parcelas detalhadas, usar; senão gerar baseado no total
      if (forma.dados?.parcelas && Array.isArray(forma.dados.parcelas)) {
        // Usar dados detalhados das parcelas
        forma.dados.parcelas.forEach((parcela: any, index: number) => {
          itensConsolidados.push({
            id: `${forma.id}-${parcela.numero || index + 1}`,
            formaId: forma.id,
            tipo: forma.tipo,
            numeroParcela: parcela.numero || index + 1,
            totalParcelas: numParcelas,
            data: parcela.data,
            valor: parcela.valor,
            editavel: forma.tipo === 'boleto' // Apenas boleto é editável
          });
        });
      } else {
        // Gerar parcelas baseado no total e número de parcelas
        for (let i = 1; i <= numParcelas; i++) {
          itensConsolidados.push({
            id: `${forma.id}-${i}`,
            formaId: forma.id,
            tipo: forma.tipo,
            numeroParcela: i,
            totalParcelas: numParcelas,
            data: new Date().toISOString().split('T')[0], // Data placeholder
            valor: valorParcela,
            editavel: forma.tipo === 'boleto' // Apenas boleto é editável
          });
        }
      }
    }
  });
  
  // Ordenar por data crescente
  return itensConsolidados.sort((a, b) => 
    new Date(a.data).getTime() - new Date(b.data).getTime()
  );
};

// Formatar data para exibição (DD/MM/YYYY)
const formatarDataExibicao = (dataISO: string): string => {
  const data = new Date(dataISO + 'T00:00:00'); // Adiciona horário para evitar fuso horário
  return data.toLocaleDateString('pt-BR');
};

// Componente da linha da tabela
const LinhaTabela = ({ 
  item, 
  onItemChange 
}: { 
  item: ItemPagamentoConsolidado;
  onItemChange: (campo: 'valor' | 'data', novoValor: number | string) => void;
}) => {
  const config = CORES_FORMAS[item.tipo];
  
  return (
    <tr 
      className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 focus-within:bg-blue-50 dark:focus-within:bg-blue-950/20"
      role="row"
      aria-label={`${config.nome} ${item.numeroParcela ? `parcela ${item.numeroParcela} de ${item.totalParcelas}` : ''} - ${formatarDataExibicao(item.data)} - ${formatarMoeda(item.valor)}`}
    >
      {/* Coluna Forma - Limpa, sem números */}
      <td className="px-3 py-2 text-sm" role="gridcell">
        <span className={`font-medium ${config.text}`} aria-label={`Forma de pagamento: ${config.nome}`}>
          {config.nome}
        </span>
      </td>
      
      {/* Coluna Parcela - Nova coluna com formato "1/10" */}
      <td className="px-3 py-2 text-sm text-center" role="gridcell">
        {item.numeroParcela && item.totalParcelas ? (
          <span 
            className="text-slate-600 dark:text-slate-400 font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded"
            aria-label={`Parcela ${item.numeroParcela} de ${item.totalParcelas}`}
          >
            {item.numeroParcela}/{item.totalParcelas}
          </span>
        ) : (
          <span className="text-slate-400" aria-label="Pagamento único">—</span>
        )}
      </td>
      
      {/* Coluna Data - Editável apenas para boleto */}
      <td 
        className={`px-3 py-2 text-sm ${item.editavel ? 'bg-blue-25 dark:bg-blue-950/20' : ''}`}
        role="gridcell"
        aria-label={`Data de vencimento: ${formatarDataExibicao(item.data)}${item.editavel ? ' - Clique para editar' : ''}`}
      >
        <CelulaEditavel
          valor={item.data}
          tipo="data"
          editavel={item.editavel}
          onChange={(novoValor) => onItemChange('data', novoValor)}
          className="text-slate-700 dark:text-slate-300"
        />
      </td>
      
      {/* Coluna Valor - Editável apenas para boleto */}
      <td 
        className={`px-3 py-2 text-sm text-right ${item.editavel ? 'bg-blue-25 dark:bg-blue-950/20' : ''}`}
        role="gridcell"
        aria-label={`Valor: ${formatarMoeda(item.valor)}${item.editavel ? ' - Clique para editar' : ''}`}
      >
        <CelulaEditavel
          valor={item.valor}
          tipo="valor"
          editavel={item.editavel}
          onChange={(novoValor) => onItemChange('valor', novoValor)}
          className="font-semibold text-slate-900 dark:text-slate-100"
        />
      </td>
    </tr>
  );
};

export function TabelaPagamentosConsolidada({ 
  formasPagamento, 
  valorNegociado,
  onParcelaChange
}: TabelaPagamentosConsolidadaProps) {
  
  // Estado local para gerenciar as parcelas editáveis
  const [parcelasEditadas, setParcelasEditadas] = useState<Record<string, Partial<ItemPagamentoConsolidado>>>({});
  
  // Estado para ordenação
  const [ordenacao, setOrdenacao] = useState<{
    campo: 'data' | 'valor' | 'forma' | null;
    direcao: 'asc' | 'desc';
  }>({ campo: 'data', direcao: 'asc' });
  
  // Consolidar dados com mudanças locais aplicadas
  const parcelasConsolidadas = useMemo(() => {
    const parcelasBase = consolidarPagamentos(formasPagamento);
    
    // Aplicar mudanças locais
    const parcelasComEdicoes = parcelasBase.map(parcela => ({
      ...parcela,
      ...parcelasEditadas[parcela.id]
    }));
    
    // Aplicar ordenação
    if (ordenacao.campo) {
      parcelasComEdicoes.sort((a, b) => {
        let valorA: any, valorB: any;
        
        switch (ordenacao.campo) {
          case 'data':
            valorA = new Date(a.data).getTime();
            valorB = new Date(b.data).getTime();
            break;
          case 'valor':
            valorA = a.valor;
            valorB = b.valor;
            break;
          case 'forma':
            valorA = a.tipo;
            valorB = b.tipo;
            break;
          default:
            return 0;
        }
        
        if (valorA < valorB) return ordenacao.direcao === 'asc' ? -1 : 1;
        if (valorA > valorB) return ordenacao.direcao === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return parcelasComEdicoes;
  }, [formasPagamento, parcelasEditadas, ordenacao]);
  
  // Calcular total da tabela
  const totalTabela = useMemo(() => 
    parcelasConsolidadas.reduce((sum, item) => sum + item.valor, 0),
    [parcelasConsolidadas]
  );
  
  // Handler para mudanças em células individuais
  const handleItemChange = (itemId: string, formaId: string, numeroParcela: number | undefined) => 
    (campo: 'valor' | 'data', novoValor: number | string) => {
      console.log('🔄 Mudança local na célula:', { itemId, campo, novoValor });
      
      // Atualizar estado local imediatamente para feedback visual
      setParcelasEditadas(prev => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          [campo]: novoValor
        }
      }));
      
      // Notificar componente pai para persistência
      if (onParcelaChange && numeroParcela) {
        console.log('📤 Enviando mudança para componente pai');
        onParcelaChange(formaId, numeroParcela, campo, novoValor);
        
        // Limpar estado local após um delay (indicando que foi salvo)
        setTimeout(() => {
          console.log('✅ Limpando estado local - mudança persistida');
          setParcelasEditadas(prev => {
            const updated = { ...prev };
            if (updated[itemId]) {
              delete updated[itemId][campo];
              if (Object.keys(updated[itemId]).length === 0) {
                delete updated[itemId];
              }
            }
            return updated;
          });
        }, 1500); // 1.5 segundos para mostrar que foi salvo
      }
    };
  
  // Verificar se total diverge do valor negociado
  const totalDiverge = Math.abs(totalTabela - valorNegociado) > 0.01;
  
  // Verificar se há mudanças pendentes
  const temMudancasPendentes = Object.keys(parcelasEditadas).length > 0;
  
  // Handler para mudança de ordenação
  const handleOrdenacao = (campo: 'data' | 'valor' | 'forma') => {
    setOrdenacao(prev => ({
      campo,
      direcao: prev.campo === campo && prev.direcao === 'asc' ? 'desc' : 'asc'
    }));
    console.log('🔄 Ordenação alterada:', { campo, direcao: ordenacao.direcao === 'asc' ? 'desc' : 'asc' });
  };
  
  // Não renderizar se não há formas de pagamento
  if (formasPagamento.length === 0) {
    return null;
  }
  
  return (
    <Card className="mt-6">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Cabeçalho com título e total */}
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Cronograma de Pagamentos
              {temMudancasPendentes && (
                <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded animate-pulse">
                  Salvando...
                </span>
              )}
            </h4>
            <div className="text-sm">
              <span className="text-slate-600">Total: </span>
              <span className={`font-bold ${
                totalDiverge ? 'text-red-600' : 'text-green-600'
              }`}>
                {formatarMoeda(totalTabela)}
              </span>
              {totalDiverge && (
                <span className="text-red-500 ml-2">
                  (Diferença: {formatarMoeda(totalTabela - valorNegociado)})
                </span>
              )}
            </div>
          </div>
          
          {/* Tabela propriamente dita */}
          <div className="overflow-x-auto" role="region" aria-label="Tabela de cronograma de pagamentos">
            <table 
              className="w-full" 
              role="table"
              aria-label="Cronograma consolidado de pagamentos"
              aria-describedby="tabela-descricao"
            >
              <caption id="tabela-descricao" className="sr-only">
                Tabela consolidada mostrando todas as parcelas de pagamento organizadas por data. 
                Valores de boleto podem ser editados clicando nas células.
              </caption>
              <thead>
                <tr className="border-b-2 border-slate-300 dark:border-slate-600">
                  <th 
                    className="px-3 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    scope="col"
                    aria-sort={ordenacao.campo === 'forma' ? ordenacao.direcao === 'asc' ? 'ascending' : 'descending' : 'none'}
                    onClick={() => handleOrdenacao('forma')}
                    onKeyDown={(e) => e.key === 'Enter' && handleOrdenacao('forma')}
                    tabIndex={0}
                    role="button"
                    aria-label="Ordenar por forma de pagamento"
                  >
                    <div className="flex items-center gap-1">
                      Forma de Pagamento
                      {ordenacao.campo === 'forma' ? (
                        ordenacao.direcao === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronsUpDown className="h-3 w-3 opacity-50" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-3 py-3 text-center text-sm font-semibold text-slate-700 dark:text-slate-300"
                    scope="col"
                    aria-sort="none"
                  >
                    Parcela
                  </th>
                  <th 
                    className="px-3 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    scope="col"
                    aria-sort={ordenacao.campo === 'data' ? ordenacao.direcao === 'asc' ? 'ascending' : 'descending' : 'none'}
                    onClick={() => handleOrdenacao('data')}
                    onKeyDown={(e) => e.key === 'Enter' && handleOrdenacao('data')}
                    tabIndex={0}
                    role="button"
                    aria-label="Ordenar por data de vencimento"
                  >
                    <div className="flex items-center gap-1">
                      Data
                      {ordenacao.campo === 'data' ? (
                        ordenacao.direcao === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronsUpDown className="h-3 w-3 opacity-50" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-3 py-3 text-right text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    scope="col"
                    aria-sort={ordenacao.campo === 'valor' ? ordenacao.direcao === 'asc' ? 'ascending' : 'descending' : 'none'}
                    onClick={() => handleOrdenacao('valor')}
                    onKeyDown={(e) => e.key === 'Enter' && handleOrdenacao('valor')}
                    tabIndex={0}
                    role="button"
                    aria-label="Ordenar por valor"
                  >
                    <div className="flex items-center gap-1 justify-end">
                      Valor
                      {ordenacao.campo === 'valor' ? (
                        ordenacao.direcao === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronsUpDown className="h-3 w-3 opacity-50" />
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {parcelasConsolidadas.map(item => (
                  <LinhaTabela 
                    key={item.id} 
                    item={item} 
                    onItemChange={handleItemChange(item.id, item.formaId, item.numeroParcela)}
                  />
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Rodapé com resumo */}
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">
                {parcelasConsolidadas.length} parcela(s)
              </span>
              <span className={`font-semibold ${
                totalDiverge ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'
              }`}>
                Total: {formatarMoeda(totalTabela)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 