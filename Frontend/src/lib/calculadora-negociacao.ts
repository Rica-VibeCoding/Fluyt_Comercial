/**
 * CALCULADORA DE NEGOCIAÇÃO - SISTEMA DE VALOR REAL E DESCONTO REAL
 * 
 * Sistema de cálculo financeiro para orçamentos que gerencia:
 * - Descontos percentuais e reais
 * - Formas de pagamento com deflação
 * - Redistribuição automática respeitando travamentos
 * - Edição bidirecional sem loops
 * 
 * Integração compatível com sistema atual (sessaoSimples)
 */

import { FormaPagamento } from '@/types/orcamento';

// ===============================
// CONFIGURAÇÕES DO SISTEMA
// ===============================

interface Configuracao {
  taxa: number;        // Taxa mensal (decimal: 0.03 = 3%)
  meses: number;       // Prazo para deflação
  prioridade: number;  // Ordem de distribuição (1 = maior prioridade)
}

const CONFIGURACAO_FORMAS: Record<string, Configuracao> = {
  'a-vista': { taxa: 0, meses: 0, prioridade: 1 },
  'boleto': { taxa: 0.01, meses: 1, prioridade: 2 },      // 1% a.m., 30 dias
  'cartao': { taxa: 0.03, meses: 3, prioridade: 4 },     // 3% a.m., 3 meses
  'financeira': { taxa: 0.02, meses: 12, prioridade: 3 }  // 2% a.m., 12 meses
} as const;

const VALIDACOES = {
  descontoMaximo: 50,      // 50% máximo
  valorMinimoForma: 0,     // Permite R$ 0
  obrigatorioUmaForma: true // Pelo menos uma forma > 0
} as const;

// ===============================
// TIPOS DE DADOS
// ===============================

interface EstadoNegociacao {
  valorTotal: number;
  descontoPercentual: number;
  formasPagamento: FormaPagamento[];
}

interface ResultadoCalculado {
  valorNegociado: number;
  valorPresenteTotal: number;
  descontoReal: number;
  diferenca: number;
  formasPagamento: FormaPagamento[];
  erros: string[];
  alteracoesFeitas: string[];
}

interface DistribuicaoOpcoes {
  manterTravadas: boolean;
  algoritmo: 'proporcional' | 'prioridade';
}

// ===============================
// CLASSE PRINCIPAL
// ===============================

export class CalculadoraNegociacao {
  
  /**
   * MÉTODO PRINCIPAL - Calcula todo o estado da negociação
   */
  static calcular(estado: EstadoNegociacao, opcoes: Partial<DistribuicaoOpcoes> = {}): ResultadoCalculado {
    const config: DistribuicaoOpcoes = {
      manterTravadas: true,
      algoritmo: 'proporcional',
      ...opcoes
    };

    // 1. Calcular valor negociado SEMPRE (independente de validações)
    const valorNegociado = estado.valorTotal * (1 - estado.descontoPercentual / 100);

    // 2. Validar entrada (mas não bloquear cálculo básico)
    const erros = this.validarEstado(estado);

    // 3. Redistribuir formas de pagamento (se houver)
    const { formasRedistribuidas, alteracoes } = this.redistribuirFormas(
      valorNegociado, 
      estado.formasPagamento,
      config
    );

    // 4. Calcular valores presentes e desconto real
    const valorPresenteTotal = this.calcularValorPresenteTotal(formasRedistribuidas);
    const descontoReal = this.calcularDescontoReal(estado.valorTotal, valorPresenteTotal);
    const diferenca = valorNegociado - formasRedistribuidas.reduce((sum, f) => sum + f.valor, 0);

    return {
      valorNegociado,
      valorPresenteTotal,
      descontoReal,
      diferenca,
      formasPagamento: formasRedistribuidas,
      erros,
      alteracoesFeitas: alteracoes
    };
  }

  /**
   * REDISTRIBUIÇÃO DE FORMAS DE PAGAMENTO
   */
  private static redistribuirFormas(
    valorAlvo: number,
    formasAtuais: FormaPagamento[],
    opcoes: DistribuicaoOpcoes
  ): { formasRedistribuidas: FormaPagamento[]; alteracoes: string[] } {
    
    if (formasAtuais.length === 0) {
      return { formasRedistribuidas: [], alteracoes: [] };
    }

    // Separar formas travadas e livres
    const formasTravadas = formasAtuais.filter(f => f.travada);
    const formasLivres = formasAtuais.filter(f => !f.travada);
    
    // Calcular valor já comprometido nas travadas
    const valorTravado = formasTravadas.reduce((sum, f) => sum + f.valor, 0);
    const valorRestante = valorAlvo - valorTravado;

    const alteracoes: string[] = [];

    // Se não há formas livres, manter como está
    if (formasLivres.length === 0) {
      return { formasRedistribuidas: [...formasAtuais], alteracoes };
    }

    // Redistribuir valor restante entre formas livres
    let formasRedistribuidas: FormaPagamento[];
    
    if (opcoes.algoritmo === 'proporcional') {
      formasRedistribuidas = this.redistribuirProporcional(valorRestante, formasLivres, formasTravadas);
      alteracoes.push(`Redistribuição proporcional aplicada em ${formasLivres.length} formas`);
    } else {
      formasRedistribuidas = this.redistribuirPorPrioridade(valorRestante, formasLivres, formasTravadas);
      alteracoes.push(`Redistribuição por prioridade aplicada`);
    }

    return { formasRedistribuidas, alteracoes };
  }

  /**
   * REDISTRIBUIÇÃO PROPORCIONAL (padrão)
   * Mantém as proporções existentes entre formas não travadas
   */
  private static redistribuirProporcional(
    valorRestante: number,
    formasLivres: FormaPagamento[],
    formasTravadas: FormaPagamento[]
  ): FormaPagamento[] {
    
    const totalAtualLivres = formasLivres.reduce((sum, f) => sum + f.valor, 0);
    
    // Se não há valor atual, distribuir igualmente
    if (totalAtualLivres === 0) {
      const valorPorForma = valorRestante / formasLivres.length;
      const formasAtualizadas = formasLivres.map(forma => ({
        ...forma,
        valor: valorPorForma,
        // Manter VP proporcional se existir, senão calcular
        valorPresente: forma.valorPresente > 0 
          ? (forma.valorPresente / forma.valor) * valorPorForma
          : this.calcularValorPresente(valorPorForma, forma.tipo)
      }));
      return [...formasTravadas, ...formasAtualizadas];
    }

    // Redistribuir proporcionalmente
    const formasAtualizadas = formasLivres.map(forma => {
      const proporcao = forma.valor / totalAtualLivres;
      const novoValor = valorRestante * proporcao;
      
      // Calcular novo VP proporcional baseado no VP original
      let novoVP;
      if (forma.valorPresente > 0 && forma.valor > 0) {
        // Manter a mesma proporção VP/Valor da forma original
        const proporcaoVP = forma.valorPresente / forma.valor;
        novoVP = novoValor * proporcaoVP;
      } else {
        // Calcular VP genérico se não houver VP original
        novoVP = this.calcularValorPresente(novoValor, forma.tipo);
      }
      
      return {
        ...forma,
        valor: novoValor,
        valorPresente: novoVP
      };
    });

    return [...formasTravadas, ...formasAtualizadas];
  }

  /**
   * REDISTRIBUIÇÃO POR PRIORIDADE
   * Distribui seguindo ordem: À Vista → Boleto → Financeira → Cartão
   */
  private static redistribuirPorPrioridade(
    valorRestante: number,
    formasLivres: FormaPagamento[],
    formasTravadas: FormaPagamento[]
  ): FormaPagamento[] {
    
    // Ordenar por prioridade
    const formasOrdenadas = [...formasLivres].sort((a, b) => {
      const prioridadeA = CONFIGURACAO_FORMAS[a.tipo]?.prioridade || 999;
      const prioridadeB = CONFIGURACAO_FORMAS[b.tipo]?.prioridade || 999;
      return prioridadeA - prioridadeB;
    });

    let valorDistribuir = valorRestante;
    const formasAtualizadas: FormaPagamento[] = [];

    for (const forma of formasOrdenadas) {
      if (valorDistribuir <= 0) {
        // Sem valor restante, zerar forma
        formasAtualizadas.push({
          ...forma,
          valor: 0,
          valorPresente: 0
        });
      } else {
        // Atribuir valor disponível (pode ser total ou parcial)
        const valorAtribuido = Math.min(valorDistribuir, valorRestante);
        
        // Calcular VP proporcional
        let vpAtribuido;
        if (forma.valorPresente > 0 && forma.valor > 0) {
          const proporcaoVP = forma.valorPresente / forma.valor;
          vpAtribuido = valorAtribuido * proporcaoVP;
        } else {
          vpAtribuido = this.calcularValorPresente(valorAtribuido, forma.tipo);
        }
        
        formasAtualizadas.push({
          ...forma,
          valor: valorAtribuido,
          valorPresente: vpAtribuido
        });
        valorDistribuir -= valorAtribuido;
      }
    }

    return [...formasTravadas, ...formasAtualizadas];
  }

  /**
   * CÁLCULO DE VALOR PRESENTE
   * Usa fórmula: PV = FV / (1 + r)^(meses/12)
   */
  private static calcularValorPresente(valor: number, tipo: string): number {
    const config = CONFIGURACAO_FORMAS[tipo];
    if (!config || config.taxa === 0 || config.meses === 0) {
      return valor; // À vista ou configuração inválida
    }

    const anos = config.meses / 12;
    return valor / Math.pow(1 + config.taxa, anos);
  }

  /**
   * CALCULAR VALOR PRESENTE TOTAL
   */
  private static calcularValorPresenteTotal(formas: FormaPagamento[]): number {
    const total = formas.reduce((acc, forma) => {
      // Usar VP já calculado da forma, ou calcular se não existir
      const valorPresente = forma.valorPresente || this.calcularValorPresente(forma.valor, forma.tipo);
      
      console.log(`💰 VP ${forma.tipo}: R$ ${forma.valor.toFixed(2)} → VP: R$ ${valorPresente.toFixed(2)}`);
      
      return acc + valorPresente;
    }, 0);
    
    console.log(`📊 VP Total Calculado: R$ ${total.toFixed(2)}`);
    return total;
  }

  /**
   * CALCULAR DESCONTO REAL
   * Baseado na diferença entre valor total e valor presente
   */
  private static calcularDescontoReal(valorTotal: number, valorPresenteTotal: number): number {
    if (valorTotal === 0) return 0;
    return ((valorTotal - valorPresenteTotal) / valorTotal) * 100;
  }

  /**
   * VALIDAÇÕES DO ESTADO
   */
  private static validarEstado(estado: EstadoNegociacao): string[] {
    const erros: string[] = [];

    // Validar desconto máximo
    if (estado.descontoPercentual > VALIDACOES.descontoMaximo) {
      erros.push(`Desconto máximo permitido: ${VALIDACOES.descontoMaximo}%`);
    }

    // Validar valores negativos
    if (estado.descontoPercentual < 0) {
      erros.push('Desconto não pode ser negativo');
    }

    if (estado.valorTotal <= 0) {
      erros.push('Valor total deve ser maior que zero');
    }

    // Validar formas de pagamento (apenas se houver formas configuradas)
    if (VALIDACOES.obrigatorioUmaForma && estado.formasPagamento.length > 0) {
      const temFormaComValor = estado.formasPagamento.some(f => f.valor > 0);
      if (!temFormaComValor) {
        erros.push('Pelo menos uma forma de pagamento deve ter valor maior que zero');
      }
    }

    return erros;
  }


  // ===============================
  // MÉTODOS UTILITÁRIOS PÚBLICOS
  // ===============================

  /**
   * Aplicar travamento em uma forma específica
   */
  static toggleTravamento(formas: FormaPagamento[], id: string): FormaPagamento[] {
    return formas.map(forma => 
      forma.id === id 
        ? { ...forma, travada: !forma.travada }
        : forma
    );
  }

  /**
   * Atualizar valor de uma forma específica
   */
  static atualizarValorForma(
    formas: FormaPagamento[], 
    id: string, 
    novoValor: number
  ): FormaPagamento[] {
    return formas.map(forma => {
      if (forma.id !== id) return forma;
      
      // Calcular novo VP baseado na proporção existente ou recalcular
      let novoVP;
      if (forma.valorPresente > 0 && forma.valor > 0) {
        const proporcaoVP = forma.valorPresente / forma.valor;
        novoVP = novoValor * proporcaoVP;
      } else {
        novoVP = this.calcularValorPresente(novoValor, forma.tipo);
      }
      
      return { 
        ...forma, 
        valor: novoValor,
        valorPresente: novoVP
      };
    });
  }

  /**
   * Obter configuração de uma forma de pagamento
   */
  static obterConfiguracao(tipo: string): Configuracao | null {
    return CONFIGURACAO_FORMAS[tipo] || null;
  }

  /**
   * Calcular desconto percentual baseado em valores
   */
  static calcularDescontoPercentual(valorOriginal: number, valorNegociado: number): number {
    if (valorOriginal === 0) return 0;
    return ((valorOriginal - valorNegociado) / valorOriginal) * 100;
  }
}

// ===============================
// HOOK REACT PARA FACILITAR USO
// ===============================

import { useMemo } from 'react';

export function useCalculadoraNegociacao(
  valorTotal: number,
  descontoPercentual: number,
  formasPagamento: FormaPagamento[]
): ResultadoCalculado {
  
  return useMemo(() => {
    // Debug: log dos valores de entrada
    console.log('🧮 Calculadora - Inputs:', { valorTotal, descontoPercentual, formasLength: formasPagamento.length });
    
    const resultado = CalculadoraNegociacao.calcular({
      valorTotal,
      descontoPercentual,
      formasPagamento
    });
    
    // Debug: log do resultado
    console.log('🧮 Calculadora - Resultado:', resultado);
    
    return resultado;
  }, [valorTotal, descontoPercentual, formasPagamento]);
}

// ===============================
// EXPORTS
// ===============================

export default CalculadoraNegociacao;
export type { EstadoNegociacao, ResultadoCalculado, DistribuicaoOpcoes };