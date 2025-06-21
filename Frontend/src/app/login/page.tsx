'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, LogIn, WifiOff, RefreshCw } from 'lucide-react';
import { apiClient } from '@/services/api-client';

// Configuração local
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 segundo

interface LoginResponse {
  success: boolean;
  message: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    nome: string;
    perfil: string;
    loja_id?: string | null;
    empresa_id?: string | null;
    ativo: boolean;
    funcao: string;
    loja_nome?: string | null;
    empresa_nome?: string | null;
  };
}

// Função para fazer fetch com retry
async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      console.log(`🔄 Tentativa ${i + 1} de ${retries + 1}...`);
      const response = await fetch(url, options);
      return response;
    } catch (error: any) {
      console.error(`❌ Erro na tentativa ${i + 1}:`, error.message);
      
      // Se for o último retry, lança o erro
      if (i === retries) {
        throw error;
      }
      
      // Se for erro de rede, espera antes de tentar novamente
      if (error.message.includes('Failed to fetch') || 
          error.message.includes('NetworkError') || 
          error.message.includes('ERR_NETWORK_CHANGED')) {
        console.log(`⏳ Aguardando ${RETRY_DELAY}ms antes de tentar novamente...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      } else {
        // Para outros erros, não faz retry
        throw error;
      }
    }
  }
  
  throw new Error('Falha após múltiplas tentativas');
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [networkError, setNetworkError] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNetworkError(false);
    setIsLoading(true);

    console.log('🔐 Iniciando processo de login...');
    console.log('📧 Email:', email);

    try {
      // Usar URL relativa para aproveitar o proxy reverso do Next.js
      const loginUrl = '/api/v1/auth/login';
      console.log('🔗 URL de login (proxy reverso):', loginUrl);
      console.log('💡 Usando proxy reverso do Next.js para evitar CORS');

      const startTime = Date.now();
      
      // Usar fetchWithRetry ao invés de fetch direto
      const response = await fetchWithRetry(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.trim(), 
          password: password 
        }),
      });

      const responseTime = Date.now() - startTime;
      console.log(`⏱️ Tempo de resposta: ${responseTime}ms`);

      // Log detalhado da resposta
      console.log('📡 Resposta recebida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        type: response.type,
        url: response.url
      });

      // Tentar ler o corpo da resposta
      let responseData: any;
      const contentType = response.headers.get('content-type');
      
      try {
        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json();
          console.log('📦 Dados da resposta:', responseData);
        } else {
          const textResponse = await response.text();
          console.log('📄 Resposta em texto:', textResponse);
          responseData = { detail: textResponse || 'Resposta vazia do servidor' };
        }
      } catch (parseError) {
        console.error('❌ Erro ao processar resposta:', parseError);
        responseData = { detail: 'Erro ao processar resposta do servidor' };
      }

      // Verificar se a resposta foi bem-sucedida
      if (!response.ok) {
        let errorMessage = 'Erro ao fazer login';
        
        switch (response.status) {
          case 401:
            errorMessage = 'Email ou senha incorretos';
            break;
          case 422:
            errorMessage = responseData.detail || 'Dados inválidos. Verifique o email e senha';
            break;
          case 500:
            errorMessage = 'Erro interno do servidor. Tente novamente mais tarde';
            break;
          default:
            errorMessage = responseData.detail || responseData.message || `Erro ${response.status}`;
        }
        
        setError(errorMessage);
        return;
      }

      // Validar resposta de sucesso
      const data = responseData as LoginResponse;
      
      if (!data.access_token) {
        console.error('❌ Resposta sem token:', data);
        setError('Resposta inválida do servidor: token não recebido');
        return;
      }

      console.log('✅ Login bem-sucedido!');
      console.log('👤 Usuário:', data.user.nome, `(${data.user.email})`);
      console.log('🎭 Perfil:', data.user.perfil);

      // Salvar dados de autenticação
      try {
        localStorage.setItem('fluyt_auth_token', data.access_token);
        localStorage.setItem('fluyt_refresh_token', data.refresh_token);
        localStorage.setItem('fluyt_user', JSON.stringify(data.user));

        // Salvar token em cookie
        document.cookie = `fluyt_auth_token=${data.access_token}; path=/; max-age=${data.expires_in || 3600}`;
        
        // Configurar API client
        apiClient.setAuthToken(data.access_token);
      } catch (storageError) {
        console.error('❌ Erro ao salvar dados:', storageError);
        setError('Erro ao salvar dados de autenticação');
        return;
      }

      // Pequeno delay para garantir que tudo foi salvo
      await new Promise(resolve => setTimeout(resolve, 100));

      // Redirecionar
      const redirectTo = new URLSearchParams(window.location.search).get('from') || '/painel';
      console.log('🚀 Redirecionando para:', redirectTo);
      
      router.push(redirectTo);
      
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      console.error('Stack trace:', error.stack);
      
      // Verificar se é erro de rede
      if (error.message.includes('Failed to fetch') || 
          error.message.includes('NetworkError') || 
          error.message.includes('ERR_NETWORK_CHANGED') ||
          error.message.includes('ERR_INTERNET_DISCONNECTED')) {
        setNetworkError(true);
        setError(
          'Problema de conexão detectado.\n\n' +
          'Possíveis causas:\n' +
          '• Mudança na rede Wi-Fi\n' +
          '• VPN conectou/desconectou\n' +
          '• Conexão instável\n\n' +
          'Tente novamente em alguns segundos.'
        );
      } else {
        setError(error.message || 'Erro inesperado. Por favor, tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Função para tentar novamente
  const handleRetry = () => {
    setError('');
    setNetworkError(false);
    if (email && password) {
      handleLogin(new Event('submit') as any);
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
              <Alert variant={networkError ? "default" : "destructive"}>
                {networkError && <WifiOff className="h-4 w-4" />}
                <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
                {networkError && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={handleRetry}
                    disabled={isLoading}
                  >
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Tentar Novamente
                  </Button>
                )}
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
              disabled={isLoading || !email || !password}
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
                Credenciais de teste:
              </p>
              <div className="text-sm text-gray-600 space-y-1">
                <p>📧 Email: ricardo.nilton@hotmail.com</p>
                <p>🔑 Senha: 123456</p>
              </div>
            </div>
            
            {/* Status de conexão */}
            <div className="text-center text-xs text-gray-500">
              <p>Backend: http://localhost:8000</p>
              {isLoading && <p className="mt-1">🔄 Conectando...</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}