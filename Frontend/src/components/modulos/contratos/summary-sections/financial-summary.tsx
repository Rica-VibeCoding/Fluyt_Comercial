import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Separator } from "../../../ui/separator";
import { Calculator, Clock, CreditCard } from "lucide-react";
import { EditableField } from "../editable-field";
import { ContratoData } from "../../../../types/contrato";
import { formatarMoeda } from "../shared/contract-formatters";

interface FinancialSummaryProps {
  contratoData: ContratoData;
  updateField: (path: string, value: string | number) => void;
}

export function FinancialSummary({ contratoData, updateField }: FinancialSummaryProps) {
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
          <div className="bg-gray-100 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Valor dos Ambientes:</span>
              <span className="font-semibold text-gray-900 text-lg">{formatarMoeda(contratoData.valor_total)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Desconto ({(contratoData.desconto * 100).toFixed(0)}%):</span>
              <span className="font-semibold text-red-600 text-lg">
                -{formatarMoeda(contratoData.valor_total * contratoData.desconto)}
              </span>
            </div>
            
            <Separator className="my-3" />
            
            <div className="flex justify-between items-center pt-2 bg-white rounded-md p-3 border border-green-200 shadow-sm">
              <span className="text-base font-semibold text-gray-900">Valor Final:</span>
              <span className="text-2xl font-bold text-green-600">
                {formatarMoeda(contratoData.valor_final)}
              </span>
            </div>
          </div>

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
                <span className="text-sm font-medium text-blue-600">Pagamento</span>
              </div>
              <p className="text-xs text-gray-600">
                Condições detalhadas no contrato final
              </p>
            </div>

            <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-orange-600">Total de Ambientes:</span>
                <span className="text-lg font-bold text-orange-600">{contratoData.ambientes.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Valor médio por ambiente:</span>
                <span className="text-sm font-medium text-orange-600">
                  {formatarMoeda(contratoData.valor_total / contratoData.ambientes.length)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}