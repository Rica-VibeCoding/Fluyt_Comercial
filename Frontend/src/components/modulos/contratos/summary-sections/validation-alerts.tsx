import { Alert, AlertDescription } from "../../../ui/alert";
import { Button } from "../../../ui/button";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSessao } from "../../../../store/sessao-store";

export function ValidationAlerts() {
  const router = useRouter();
  const { cliente, ambientes, podeGerarContrato } = useSessao();

  return (
    <div className="space-y-4 mb-4">
      {/* Alerta: Nenhum cliente selecionado */}
      {!cliente && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Nenhum cliente selecionado. Selecione um cliente para continuar.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Alerta: Cliente selecionado mas sem ambientes */}
      {cliente && ambientes.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Cliente {cliente.nome} selecionado, mas nenhum ambiente foi adicionado. 
            <Button 
              variant="link" 
              className="p-0 h-auto ml-1 underline"
              onClick={() => router.push('/painel/ambientes')}
            >
              Clique aqui para adicionar ambientes.
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Alerta: Cliente e ambientes configurados mas orçamento incompleto */}
      {cliente && ambientes.length > 0 && !podeGerarContrato() && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Cliente e ambientes configurados, mas é necessário finalizar o orçamento com formas de pagamento.
            <Button 
              variant="link" 
              className="p-0 h-auto ml-1 underline"
              onClick={() => router.push('/painel/orcamento/simulador')}
            >
              Clique aqui para finalizar o orçamento.
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Alerta de sucesso: Tudo pronto para gerar contrato */}
      {cliente && ambientes.length > 0 && podeGerarContrato() && (
        <Alert className="border-green-200 bg-green-50">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ✅ Tudo pronto! Cliente configurado, ambientes definidos e orçamento finalizado. 
            Você pode gerar o contrato final.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}