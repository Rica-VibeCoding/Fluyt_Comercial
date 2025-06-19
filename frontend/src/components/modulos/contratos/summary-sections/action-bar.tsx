import { Button } from "../../../ui/button";
import { ArrowRight, FileText } from "lucide-react";
import { ContratoData } from "../../../../types/contrato";
import { formatarMoeda } from "../shared/contract-formatters";
import { useSessao } from "../../../../store/sessao-store";

interface ActionBarProps {
  contratoData: ContratoData;
  onAvancar: () => void;
}

export function ActionBar({ contratoData, onAvancar }: ActionBarProps) {
  const { podeGerarContrato } = useSessao();

  return (
    <div className="sticky bottom-4 bg-white rounded-lg shadow-lg border p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
            <FileText className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-base">Resumo Finalizado</p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{contratoData.ambientes.length} ambientes</span>
              <span>•</span>
              <span className="font-medium text-green-600">{formatarMoeda(contratoData.valor_final)}</span>
            </div>
          </div>
        </div>
        
        <Button 
          size="lg" 
          onClick={onAvancar} 
          disabled={!podeGerarContrato()}
          className="gap-3 h-12 px-6 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
          title={
            !podeGerarContrato() 
              ? "Complete o orçamento com formas de pagamento para finalizar" 
              : "Avançar para contrato final"
          }
        >
          Avançar para Contrato
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}