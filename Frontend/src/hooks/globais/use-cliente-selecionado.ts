'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export const useClienteSelecionado = () => {
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);

  // Garantir que só executamos no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const clienteId = isClient ? searchParams.get('clienteId') : null;
  const clienteNome = isClient ? searchParams.get('clienteNome') : null;

  const temClienteSelecionado = !!(clienteId && clienteNome);

  const clienteSelecionado = temClienteSelecionado ? {
    id: clienteId,
    nome: decodeURIComponent(clienteNome)
  } : null;

  return {
    clienteId,
    clienteNome: clienteNome ? decodeURIComponent(clienteNome) : null,
    clienteSelecionado,
    temClienteSelecionado,
    isClient
  };
}; 