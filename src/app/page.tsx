'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BotaoTesteBackend } from '@/components/debug/botao-teste-backend';

export default function HomePage() {
  const router = useRouter();
  const [showTest, setShowTest] = useState(false);

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
          <Button 
            onClick={() => setShowTest(!showTest)} 
            variant="outline" 
            size="lg"
          >
            {showTest ? 'Ocultar' : 'Mostrar'} Teste Backend
          </Button>
        </div>
        
        {/* TESTE TEMPORÁRIO - REMOVER DEPOIS */}
        {showTest && (
          <div className="mt-8 p-6 border-2 border-red-500 border-dashed rounded-lg bg-red-50">
            <h2 className="text-xl font-bold mb-4 text-red-700">🔧 TESTE DE DESENVOLVIMENTO</h2>
            <p className="text-sm text-red-600 mb-4">
              Esta seção é apenas para teste da integração frontend-backend
            </p>
            <BotaoTesteBackend />
          </div>
        )}
      </div>
    </div>
  );
} 