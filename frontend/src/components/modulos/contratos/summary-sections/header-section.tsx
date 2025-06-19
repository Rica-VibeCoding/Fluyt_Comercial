import { useRouter } from "next/navigation";
import { Button } from "../../../ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ClienteSelectorUniversal } from "../../../shared/cliente-selector-universal";
import { useSessaoSimples } from "../../../../hooks/globais/use-sessao-simples";
import { ContratoData } from "../../../../types/contrato";

interface HeaderSectionProps {
  onFinalizarContrato: () => void;
  contratoData: ContratoData;
  updateStatus: (status: ContratoData['status']) => void;
}

export function HeaderSection({ onFinalizarContrato, contratoData, updateStatus }: HeaderSectionProps) {
  const router = useRouter();
  const { cliente, ambientes } = useSessaoSimples();
  
  // Função simples para verificar se pode gerar contrato
  const podeGerarContrato = () => {
    return !!(cliente && ambientes.length > 0);
  };
  
  // Debug temporário
  console.log('🔍 HeaderSection Debug:', {
    temCliente: !!cliente,
    cliente: cliente?.nome || 'null',
    ambientes: ambientes.length,
    podeGerar: podeGerarContrato()
  });

  const handleFinalizarClick = () => {
    // Atualizar status para PRONTO antes de navegar
    updateStatus('PRONTO');
    router.push('/painel/contratos/visualizar');
  };

  return (
    <div className="bg-white rounded-lg shadow-md border-0 p-4 min-h-[80px] flex items-center mb-4">
      <div className="flex items-center justify-between w-full">
        {/* Navegação e Cliente - ESQUERDA */}
        <div className="flex items-center gap-4">
          <Button 
            variant="default" 
            size="sm"
            onClick={() => router.push('/painel/orcamento/simulador')}
            className="gap-2 h-12 px-4 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="h-6 w-px bg-gray-300" />
          
          {/* Cliente selecionado ou seletor */}
          <div className="w-80">
            <ClienteSelectorUniversal 
              targetRoute="/painel/contratos"
              placeholder="Selecionar cliente..."
              integraSessao={true}
            />
          </div>
        </div>

        {/* Botões - DIREITA (sem badge de status) */}
        <div className="flex items-center gap-3">
          <Button 
            size="lg" 
            onClick={handleFinalizarClick} 
            className="gap-3 h-12 px-6 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-xl font-semibold text-white"
            title="Finalizar contrato"
          >
            Finalizar
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}