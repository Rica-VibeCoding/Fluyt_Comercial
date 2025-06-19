'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { testBackendConnection, testMultipleEndpoints } from '@/lib/health-check';

export function BotaoTesteBackend() {
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [ultimoTeste, setUltimoTeste] = useState<string>('');

  const testarConexaoSimples = async () => {
    setLoading(true);
    setUltimoTeste('Teste simples');

    const result = await testBackendConnection();
    setResultado(result);
    setLoading(false);
  };

  const testarMultiplosEndpoints = async () => {
    setLoading(true);
    setUltimoTeste('Múltiplos endpoints');

    const result = await testMultipleEndpoints();
    setResultado(result);
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>🔗 Teste de Conectividade Backend</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={testarConexaoSimples}
            disabled={loading}
            variant="outline"
          >
            {loading && ultimoTeste === 'Teste simples' ? 'Testando...' : 'Testar Health Check'}
          </Button>

          <Button
            onClick={testarMultiplosEndpoints}
            disabled={loading}
            variant="outline"
          >
            {loading && ultimoTeste === 'Múltiplos endpoints' ? 'Testando...' : 'Testar Múltiplos'}
          </Button>
        </div>

        {resultado && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Resultado do Teste:</h4>
            <pre className="text-sm overflow-auto max-h-64">
              {JSON.stringify(resultado, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 