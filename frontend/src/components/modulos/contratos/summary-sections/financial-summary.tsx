import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Separator } from "../../../ui/separator";
import { Calculator, Clock, CreditCard, Home } from "lucide-react";
import { EditableField } from "../editable-field";
import { ContratoData } from "../../../../types/contrato";
import { formatarMoeda } from "../shared/contract-formatters";
import { useSessaoSimples } from "../../../../hooks/globais/use-sessao-simples";
import { CalculadoraNegociacao } from "../../../../lib/calculadora-negociacao";
import { useMemo } from "react";

interface FinancialSummaryProps {
  contratoData: ContratoData;
  updateField: (path: string, value: string | number) => void;
}

export function FinancialSummary({ contratoData, updateField }: FinancialSummaryProps) {
  // ✅ DADOS REAIS: Buscar da sessão simples
  const { ambientes, valorTotal, formasPagamento } = useSessaoSimples();
  
  // ✅ CÁLCULOS REAIS: Usando CalculadoraNegociação para valores reais
  const dadosNegociacao = useMemo(() => {
    // ✅ PROTEÇÃO: Garantir que arrays existem (evitar erro no F5)
    const ambientesSeguros = ambientes || [];
    const formasPagamentoSeguras = formasPagamento || [];
    
    // Valor bruto dos ambientes
    const valorBruto = valorTotal || 0;
    
    // Total de ambientes
    const totalAmbientes = ambientesSeguros.length;
    
    // Modalidades de pagamento (quantas formas diferentes)
    const modalidadesPagamento = formasPagamentoSeguras.length;
    
    // Tipos de modalidades únicas
    const tiposModalidades = formasPagamentoSeguras.length > 0 
      ? [...new Set(formasPagamentoSeguras.map(f => f.tipo))]
      : [];
    
    // ✅ CALCULAR VALORES REAIS com CalculadoraNegociação
    if (formasPagamentoSeguras.length > 0 && valorBruto > 0) {
      try {
        // ✅ VALOR NEGOCIADO = Soma de todas as formas de pagamento
        const valorNegociadoReal = formasPagamentoSeguras.reduce((sum, f) => sum + (f.valor || 0), 0);
        
        // ✅ DESCONTO APLICADO = Diferença entre bruto e negociado (para contrato)
        const descontoAplicado = valorBruto - valorNegociadoReal;
        const descontoAplicadoPercentual = valorBruto > 0 ? (descontoAplicado / valorBruto) * 100 : 0;
        
        // Para informação adicional: cálculo do desconto real (bruto vs recebido)
        const resultado = CalculadoraNegociacao.calcular({
          valorTotal: valorBruto,
          descontoPercentual: descontoAplicadoPercentual,
          formasPagamento: formasPagamentoSeguras
        });
        
        return {
          valorBruto,
          descontoPercentual: descontoAplicadoPercentual,
          valorDesconto: descontoAplicado,
          valorNegociado: valorNegociadoReal,
          descontoReal: resultado.descontoReal, // Para referência interna
          valorPresenteTotal: resultado.valorPresenteTotal,
          totalAmbientes,
          modalidadesPagamento,
          tiposModalidades,
          temFormas: true
        };
      } catch (error) {
        console.warn('⚠️ Erro no cálculo da negociação:', error);
        // Fallback em caso de erro
        const descontoMock = (contratoData?.desconto || 0.1) * 100;
        return {
          valorBruto,
          descontoPercentual: descontoMock,
          valorDesconto: valorBruto * (contratoData?.desconto || 0.1),
          valorNegociado: contratoData?.valor_final || valorBruto,
          descontoReal: descontoMock,
          valorPresenteTotal: contratoData?.valor_final || valorBruto,
          totalAmbientes,
          modalidadesPagamento,
          tiposModalidades,
          temFormas: false
        };
      }
    } else {
      // Fallback quando não há formas de pagamento ou dados
      const descontoMock = (contratoData?.desconto || 0.1) * 100;
      return {
        valorBruto,
        descontoPercentual: descontoMock,
        valorDesconto: valorBruto * (contratoData?.desconto || 0.1),
        valorNegociado: contratoData?.valor_final || valorBruto,
        descontoReal: descontoMock,
        valorPresenteTotal: contratoData?.valor_final || valorBruto,
        totalAmbientes,
        modalidadesPagamento,
        tiposModalidades,
        temFormas: false
      };
    }
  }, [valorTotal, ambientes?.length, formasPagamento?.length, contratoData?.desconto, contratoData?.valor_final]);
  
  // ✅ PROTEÇÃO: Só fazer log se há dados (evitar erro no F5)
  if (dadosNegociacao && typeof dadosNegociacao.descontoPercentual === 'number') {
    console.log('📊 FinancialSummary - Dados CORRIGIDOS da negociação:', {
      valorBruto: dadosNegociacao.valorBruto,
      descontoAplicado: dadosNegociacao.descontoPercentual.toFixed(2) + '%',
      valorDesconto: dadosNegociacao.valorDesconto,
      valorNegociado: dadosNegociacao.valorNegociado,
      descontoReal: dadosNegociacao.descontoReal?.toFixed(2) + '% (interno)',
      temFormas: dadosNegociacao.temFormas,
      modalidades: dadosNegociacao.tiposModalidades
    });
  }
  
  return (
    <Card className="shadow-md border-0 bg-white h-fit">
      <CardHeader className="pb-3 px-4 pt-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <div className="w-5 h-5 bg-purple-50 rounded flex items-center justify-center">
            <Calculator className="h-3 w-3 text-purple-600" />
          </div>
          Resumo Financeiro
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-4 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* ✅ LADO ESQUERDO: Valores financeiros reais */}
          <div className="bg-gray-100 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Valor Bruto:</span>
              <span className="font-semibold text-gray-900 text-lg">{formatarMoeda(dadosNegociacao.valorBruto)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Desconto Aplicado ({dadosNegociacao.descontoPercentual.toFixed(1)}%):
              </span>
              <span className="font-semibold text-red-600 text-lg">
                -{formatarMoeda(dadosNegociacao.valorDesconto)}
              </span>
            </div>
            
            <Separator className="my-3" />
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Valor Negociado:</span>
              <span className="font-semibold text-gray-900 text-lg">{formatarMoeda(dadosNegociacao.valorNegociado)}</span>
            </div>
          </div>

          {/* ✅ LADO DIREITO: Informações complementares reais */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Prazo de Entrega
              </label>
              <EditableField 
                value={contratoData.prazo_entrega} 
                onSave={value => updateField('prazo_entrega', value)} 
                className="text-sm p-2 font-medium border rounded-md text-gray-900" 
              />
            </div>

            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Modalidades de Pagamento</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Total de modalidades:</span>
                <span className="text-sm font-semibold text-blue-600">{dadosNegociacao.modalidadesPagamento}</span>
              </div>
              {dadosNegociacao?.tiposModalidades?.length > 0 && (
                <p className="text-xs text-gray-600 mt-1">
                  {dadosNegociacao.tiposModalidades.map(tipo => {
                    const nomes = { 'a-vista': 'À Vista', 'boleto': 'Boleto', 'cartao': 'Cartão', 'financeira': 'Financeira' };
                    return nomes[tipo as keyof typeof nomes] || tipo;
                  }).join(', ')}
                </p>
              )}
            </div>

            <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <Home className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-600">Total de Ambientes:</span>
                <span className="text-lg font-bold text-orange-600">{dadosNegociacao.totalAmbientes}</span>
              </div>
              {/* ✅ REMOVIDO: Valor médio por ambiente (informação anti-comercial) */}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}