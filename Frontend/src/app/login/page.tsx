'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, LogIn, WifiOff, RefreshCw } from 'lucide-react';
import { ApiClientStable } from '@/lib/api-client-stable';
import { apiClient } from '@/services/api-client';

// ApiClientStable gerencia retries e fallback automaticamente

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

// ApiClientStable já possui retry e fallback automáticos
// Removendo função fetchWithRetry duplicada

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
      // Usar ApiClientStable com fallback automático
      console.log('🔐 Usando ApiClientStable com fallback automático');
      
      const startTime = Date.now();
      const result = await ApiClientStable.post<LoginResponse>('/auth/login', {
        email: email.trim(),
        password: password
      });
      
      const responseTime = Date.now() - startTime;
      console.log(`⏱️ Tempo de resposta: ${responseTime}ms`);
      console.log(`📡 Fonte da resposta: ${result.source}`);
      
      if (!result.success) {
        // Mapear erros específicos
        let errorMessage = result.error || 'Erro ao fazer login';
        
        // Se tiver dados adicionais do erro
        if (result.data) {
          const errorData = result.data as any;
          if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        }
        
        // Mensagens amigáveis para erros comuns
        if (errorMessage.includes('Invalid credentials') || errorMessage.includes('401')) {
          errorMessage = 'Email ou senha incorretos';
        } else if (errorMessage.includes('422')) {
          errorMessage = 'Dados inválidos. Verifique o email e senha';
        } else if (errorMessage.includes('500')) {
          errorMessage = 'Erro interno do servidor. Tente novamente';
        } else if (errorMessage.includes('conectar ao servidor')) {
          errorMessage = 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
        }
        
        setError(errorMessage);
        return;
      }
      
      // Resposta bem-sucedida
      const data = result.data as LoginResponse;
      
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

          {/* Remover informações de teste e debug */}
        </CardContent>
      </Card>
    </div>
  );
}