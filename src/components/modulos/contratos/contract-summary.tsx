'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useContractDataManager } from "./shared/contract-data-manager";
import { useSessaoSimples } from "@/hooks/globais/use-sessao-simples";

// Seções modulares
import { HeaderSection } from "./summary-sections/header-section";
import { ValidationAlerts } from "./summary-sections/validation-alerts";
import { ClientDataCard } from "./summary-sections/client-data-card";
import { StoreDataCard } from "./summary-sections/store-data-card";
import { FinancialSummary } from "./summary-sections/financial-summary";
import { EnvironmentsList } from "./summary-sections/environments-list";
import { ActionBar } from "./summary-sections/action-bar";
import { DebugPersistenciaCompacto } from "../../shared/debug-persistencia";

const ContractSummary = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cliente, ambientes, carregarClienteDaURL } = useSessaoSimples();
  const { contratoData, updateField, updateStatus, isLoading } = useContractDataManager();

  // ✅ PADRÃO QUE FUNCIONA: Igual ambiente-page.tsx
  useEffect(() => {
    const clienteId = searchParams.get('clienteId');
    const clienteNome = searchParams.get('clienteNome');
    
    console.log('🔍 ContractSummary - Parâmetros URL:', { clienteId, clienteNome, temCliente: !!cliente });
    
    // Carregar dados sempre que necessário (sem condições complexas)
    if (clienteId && clienteNome) {
      console.log('📥 Carregando cliente da URL na sessaoSimples...');
      carregarClienteDaURL(clienteId, decodeURIComponent(clienteNome));
    }
  }, [searchParams, carregarClienteDaURL]);

  // Debug da sessão
  useEffect(() => {
    console.log('🔄 ContractSummary - Estado da sessão:', {
      cliente: cliente?.nome || 'null',
      ambientes: ambientes.length,
      temDadosSuficientes: !!(cliente && ambientes.length > 0)
    });
  }, [cliente, ambientes]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando contrato...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleFinalizarContrato = () => {
    console.log('🎯 Finalizando contrato:', contratoData);
    // TODO: Implementar lógica de finalização
  };

  const handleAvancar = () => {
    console.log('➡️ Avançando para próxima etapa');
    router.push('/painel/contratos/visualizar');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header com navegação e ações principais */}
        <HeaderSection 
          onFinalizarContrato={handleFinalizarContrato} 
          contratoData={contratoData}
          updateStatus={updateStatus}
        />

        {/* Alertas de validação */}
        <ValidationAlerts />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          
          {/* Dados do Cliente */}
          <div className="xl:col-span-1">
            <ClientDataCard 
              contratoData={contratoData} 
              updateField={updateField} 
            />
          </div>

          {/* Dados da Loja */}
          <div className="xl:col-span-1">
            <StoreDataCard 
              contratoData={contratoData} 
              updateField={updateField} 
            />
          </div>

          {/* Resumo Financeiro */}
          <div className="xl:col-span-2">
            <FinancialSummary 
              contratoData={contratoData} 
              updateField={updateField} 
            />
          </div>
        </div>

        {/* Ambientes Section */}
        <EnvironmentsList contratoData={contratoData} />

        {/* Action Bar */}
        <ActionBar 
          contratoData={contratoData} 
          onAvancar={handleAvancar} 
        />
        
        {/* Debug temporário - só para desenvolvimento */}
        <DebugPersistenciaCompacto />
      </div>
    </div>
  );
};

export default ContractSummary;