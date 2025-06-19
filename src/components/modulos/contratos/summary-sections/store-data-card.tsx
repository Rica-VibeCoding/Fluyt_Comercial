import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Separator } from "../../../ui/separator";
import { Building, User, MapPin } from "lucide-react";
import { EditableField } from "../editable-field";
import { ContratoData } from "../../../../types/contrato";

interface StoreDataCardProps {
  contratoData: ContratoData;
  updateField: (path: string, value: string | number) => void;
}

export function StoreDataCard({ contratoData, updateField }: StoreDataCardProps) {
  return (
    <Card className="shadow-md border-0 bg-white h-fit">
      <CardHeader className="pb-3 px-4 pt-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <div className="w-5 h-5 bg-green-50 rounded flex items-center justify-center">
            <Building className="h-3 w-3 text-green-600" />
          </div>
          Loja
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0 px-4 pb-4">
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Razão Social</label>
            <EditableField 
              value={contratoData.loja.nome} 
              onSave={value => updateField('loja.nome', value)} 
              className="text-sm p-2 font-medium text-gray-900 border rounded-md" 
            />
          </div>
          
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">CNPJ</label>
            <EditableField 
              value={contratoData.loja.cnpj} 
              onSave={value => updateField('loja.cnpj', value)} 
              className="text-sm p-2 font-mono font-medium text-gray-900 border rounded-md" 
            />
          </div>
        </div>

        <Separator className="my-3" />

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Endereço da Loja
            </label>
            <EditableField 
              value={contratoData.loja.endereco} 
              onSave={value => updateField('loja.endereco', value)} 
              className="text-xs p-2 text-gray-900 border rounded-md" 
              multiline 
            />
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Vendedor</label>
              <EditableField 
                value={contratoData.vendedor} 
                onSave={value => updateField('vendedor', value)} 
                className="text-xs p-2 font-medium text-gray-900 border rounded-md" 
              />
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Gerente</label>
              <EditableField 
                value={contratoData.gerente} 
                onSave={value => updateField('gerente', value)} 
                className="text-xs p-2 font-medium text-gray-900 border rounded-md" 
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}