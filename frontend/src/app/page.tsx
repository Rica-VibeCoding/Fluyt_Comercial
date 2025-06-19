'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const router = useRouter();

  const goToClientes = () => {
    router.push('/painel/clientes');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-4xl mx-auto p-8">
        <div className="text-3xl font-bold mb-4 text-gray-800">🏢 Sistema Fluyt Comercial</div>
        <div className="text-gray-600 mb-8">Sistema de gestão comercial para móveis planejados</div>
        
        <div className="flex gap-4 justify-center mb-8">
          <Button onClick={goToClientes} size="lg">
            Acessar Sistema
          </Button>
        </div>
      </div>
    </div>
  );
} 