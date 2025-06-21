'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, LogIn } from 'lucide-react';
import { apiClient } from '@/services/api-client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    console.log('🔐 Iniciando login...', { email });

    try {
      // Adicionar timeout de 10 segundos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      }).catch(err => {
        if (err.name === 'AbortError') {
          throw new Error('Tempo limite excedido. Verifique se o backend está rodando.');
        }
        throw err;
      });

      clearTimeout(timeoutId);

      console.log('📡 Resposta recebida:', response.status);

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Erro no login:', data);
        throw new Error(data.detail || 'Erro ao fazer login');
      }

      // Salvar token no localStorage
      localStorage.setItem('fluyt_auth_token', data.access_token);
      localStorage.setItem('fluyt_refresh_token', data.refresh_token);
      localStorage.setItem('fluyt_user', JSON.stringify(data.user));

      // Salvar token em cookies para o middleware
      document.cookie = `fluyt_auth_token=${data.access_token}; path=/; max-age=${60 * 60}`; // 1 hora

      // Configurar API client
      apiClient.setAuthToken(data.access_token);

      console.log('✅ Login bem-sucedido!');

      // Redirecionar para dashboard ou página anterior
      const from = new URLSearchParams(window.location.search).get('from');
      router.push(from || '/painel');
    } catch (error: any) {
      console.error('❌ Erro completo:', error);
      
      // Verificar se é erro de conexão
      if (error.message.includes('Failed to fetch')) {
        setError('Não foi possível conectar ao servidor. Verifique se o backend está rodando em http://localhost:8000');
      } else {
        setError(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Fluyt Comercial
          </CardTitle>
          <CardDescription className="text-center">
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Entrar
                </>
              )}
            </Button>
          </form>

          {/* Informações importantes */}
          <div className="mt-6 space-y-3">
            <Alert className="bg-amber-50 border-amber-200">
              <AlertDescription className="text-sm">
                <strong>⚠️ Backend necessário:</strong><br />
                Certifique-se de que o backend está rodando em http://localhost:8000<br />
                <code className="text-xs bg-gray-100 px-1 rounded">cd backend && python main.py</code>
              </AlertDescription>
            </Alert>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 font-medium mb-2">
                Para criar um usuário de teste:
              </p>
              <ol className="text-sm text-gray-600 space-y-1">
                <li>1. Acesse o Supabase Dashboard</li>
                <li>2. Vá em Authentication → Users</li>
                <li>3. Clique em "Invite user"</li>
                <li>4. Após criar, adicione o usuário na tabela "funcionarios"</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}