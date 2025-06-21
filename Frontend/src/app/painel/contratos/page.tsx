import { Suspense } from "react";
import { ContractSummary } from "@/components/modulos/contratos";

function ContractSummaryWithSuspense() {
  return (
    <Suspense fallback={<div>Carregando contratos...</div>}>
      <ContractSummary />
    </Suspense>
  );
}

export default function ContratosPage() {
  return <ContractSummaryWithSuspense />;
}