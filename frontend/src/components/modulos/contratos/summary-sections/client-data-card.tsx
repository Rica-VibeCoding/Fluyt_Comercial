import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Separator } from "../../../ui/separator";
import { User, Phone, Mail, MapPin } from "lucide-react";
import { EditableField } from "../editable-field";
import { ContratoData } from "../../../../types/contrato";
import { formatarTelefone } from "../shared/contract-formatters";

interface ClientDataCardProps {
  contratoData: ContratoData;
  updateField: (path: string, value: string | number) => void;
}

export function ClientDataCard({ contratoData, updateField }: ClientDataCardProps) {
  return (
    <Card className="shadow-md border-0 bg-white h-fit">
      <CardHeader className="pb-3 px-4 pt-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <div className="w-5 h-5 bg-blue-50 rounded flex items-center justify-center">
            <User className="h-3 w-3 text-blue-600" />
          </div>
          Cliente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0 px-4 pb-4">
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Nome Completo</label>
            <EditableField 
              value={contratoData.cliente.nome} 
              onSave={value => updateField('cliente.nome', value)} 
              className="text-sm p-2 font-medium text-gray-900 border rounded-md" 
            />
          </div>
          
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">CPF</label>
            <EditableField 
              value={contratoData.cliente.cpf} 
              onSave={value => updateField('cliente.cpf', value)} 
              className="text-sm p-2 font-mono font-medium text-gray-900 border rounded-md" 
            />
          </div>
        </div>

        <Separator className="my-3" />

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Endereço
            </label>
            <EditableField 
              value={contratoData.cliente.endereco} 
              onSave={value => updateField('cliente.endereco', value)} 
              className="text-xs p-2 text-gray-900 border rounded-md" 
              multiline 
            />
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                <Phone className="h-3 w-3" />
                Telefone
              </label>
              <EditableField 
                value={formatarTelefone(contratoData.cliente.telefone)} 
                onSave={value => updateField('cliente.telefone', value)} 
                className="text-xs p-2 font-mono text-gray-900 border rounded-md" 
              />
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                <Mail className="h-3 w-3" />
                E-mail
              </label>
              <EditableField 
                value={contratoData.cliente.email} 
                onSave={value => updateField('cliente.email', value)} 
                className="text-xs p-2 text-gray-900 border rounded-md" 
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}