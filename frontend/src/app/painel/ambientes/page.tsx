'use client';

import { Suspense } from 'react';
import { AmbientePage } from '@/components/modulos/ambientes';

export default function AmbientesPage() {
  return (
    <Suspense fallback={<div className="p-6">Carregando ambientes...</div>}>
      <AmbientePage />
    </Suspense>
  );
}