'use client';

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';

function PainelDashboardContent() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/painel/clientes');
  }, [router]);

  return <div>Redirecionando...</div>;
}

export default function PainelDashboard() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <PainelDashboardContent />
    </Suspense>
  );
}