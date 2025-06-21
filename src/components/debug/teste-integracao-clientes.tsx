/**
 * COMPONENTE DE DEBUG PARA TESTE DA INTEGRAÇÃO
 * Permite testar conectividade, forçar mocks e visualizar logs
 * Só aparece em desenvolvimento
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  TestTube, 
  Wifi, 
  WifiOff, 
  Database, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle 
} from 'lucide-react';
import { clienteService } from '@/services/cliente-service';
import { testBackendConnection, testClientesPublico } from '@/lib/health-check';
import { FRONTEND_CONFIG } from '@/lib/config';

interface StatusConectividade {
  conectado: boolean;
  forcarMock: boolean;
  ultimoTeste: string;
  cacheValido: boolean;
}

export function TesteIntegracaoClientes() {
  const [status, setStatus] = useState<StatusConectividade | null>(null);
  const [testando, setTestando] = useState(false);
  const [ultimoTeste, setUltimoTeste] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  // Carregar status inicial
  useEffect(() => {
    carregarStatus();
  }, []);

  // Só mostrar em desenvolvimento
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const carregarStatus = async () => {
    try {
      const statusAtual = await clienteService.obterStatusConectividade();
      setStatus(statusAtual);
    } catch (error) {
      console.error('Erro ao carregar status:', error);
    }
  };

  const testarConectividade = async () => {
    setTestando(true);
    setLogs(['🔍 Iniciando teste de conectividade...']);
    
    try {
      // Teste direto do backend
      const resultado = await testBackendConnection();
      setUltimoTeste(resultado);
      
      if (resultado.success) {
        setLogs(prev => [...prev, '✅ Backend respondeu com sucesso']);
        setLogs(prev => [...prev, `📊 Dados: ${JSON.stringify(resultado.data, null, 2)}`]);
      } else {
        setLogs(prev => [...prev, '❌ Backend não está respondendo']);
        setLogs(prev => [...prev, `🚫 Erro: ${resultado.error}`]);
      }
      
      // Atualizar status
      await carregarStatus();
      
    } catch (error) {
      setLogs(prev => [...prev, `💥 Erro no teste: ${error}`]);
    } finally {
      setTestando(false);
    }
  };

  const testarClienteService = async () => {
    setTestando(true);
    setLogs(['🧪 Testando ClienteService...']);
    
    try {
      // Teste de listagem
      const resultado = await clienteService.listarClientes();
      
      if (resultado.success) {
        setLogs(prev => [...prev, `✅ Listagem funcionou via ${resultado.source}`]);
        setLogs(prev => [...prev, `📊 Total: ${resultado.data?.total || 0} clientes`]);
      } else {
        setLogs(prev => [...prev, `❌ Erro na listagem: ${resultado.error}`]);
      }
      
      await carregarStatus();
    } catch (error) {
      setLogs(prev => [...prev, `💥 Erro no service: ${error}`]);
    } finally {
      setTestando(false);
    }
  };

  const testarEndpointPublico = async () => {
    setTestando(true);
    setLogs(['🌐 Testando endpoint público de clientes...']);
    
    try {
      // Teste direto do endpoint público (sem autenticação)
      const resultado = await testClientesPublico();
      setUltimoTeste(resultado);
      
      if (resultado.success) {
        setLogs(prev => [...prev, '✅ Endpoint público funcionando']);
        setLogs(prev => [...prev, `📊 Total clientes no banco: ${resultado.data?.total_clientes || 0}`]);
        setLogs(prev => [...prev, `🏷️ Ambiente: ${resultado.data?.ambiente || 'N/A'}`]);
      } else {
        setLogs(prev => [...prev, '❌ Endpoint público com erro']);
        setLogs(prev => [...prev, `🚫 Erro: ${resultado.error}`]);
      }
      
    } catch (error) {
      setLogs(prev => [...prev, `💥 Erro no teste público: ${error}`]);
    } finally {
      setTestando(false);
    }
  };

  const forcarMock = async (forcar: boolean) => {
    setLogs([`🔧 ${forcar ? 'Forçando' : 'Desabilitando'} uso de mock...`]);
    
    try {
      clienteService.forcarUsoDeMock(forcar);
      await carregarStatus();
      setLogs(prev => [...prev, `✅ Configuração alterada: forcarMock = ${forcar}`]);
    } catch (error) {
      setLogs(prev => [...prev, `❌ Erro ao alterar configuração: ${error}`]);
    }
  };

  const limparCache = async () => {
    setLogs(['🧹 Limpando cache de conectividade...']);
    clienteService.limparCacheConectividade();
    await carregarStatus();
    setLogs(prev => [...prev, '✅ Cache limpo']);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Settings className="h-5 w-5" />
          Debug: Integração Frontend ↔ Backend
        </CardTitle>
        <CardDescription className="text-orange-600">
          Ferramentas de desenvolvimento para testar a conectividade com a API
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="testes">Testes</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>
          
          {/* Status Tab */}
          <TabsContent value="status" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Configurações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs">USE_REAL_API:</span>
                    <Badge variant={FRONTEND_CONFIG.FEATURES.USE_REAL_API ? 'default' : 'secondary'}>
                      {FRONTEND_CONFIG.FEATURES.USE_REAL_API ? 'Habilitado' : 'Desabilitado'}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs">Mock Fallback:</span>
                    <Badge variant={FRONTEND_CONFIG.FEATURES.MOCK_FALLBACK ? 'default' : 'secondary'}>
                      {FRONTEND_CONFIG.FEATURES.MOCK_FALLBACK ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs">Backend URL:</span>
                    <span className="text-xs font-mono bg-muted px-1 rounded">
                      {process.env.NEXT_PUBLIC_API_URL || 'localhost:8000'}
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Status Atual</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {status ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-xs">Conectividade:</span>
                        <Badge variant={status.conectado ? 'default' : 'destructive'}>
                          {status.conectado ? 'Online' : 'Offline'}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs">Forçar Mock:</span>
                        <Badge variant={status.forcarMock ? 'secondary' : 'default'}>
                          {status.forcarMock ? 'Sim' : 'Não'}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs">Último Teste:</span>
                        <span className="text-xs">
                          {new Date(status.ultimoTeste).toLocaleTimeString()}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      Carregando status...
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Testes Tab */}
          <TabsContent value="testes" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Testes de Conectividade</h4>
                <Button 
                  onClick={testarConectividade}
                  disabled={testando}
                  variant="outline"
                  className="w-full justify-start"
                >
                  {testando ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4 mr-2" />
                  )}
                  Testar Backend Direto
                </Button>
                
                <Button 
                  onClick={testarClienteService}
                  disabled={testando}
                  variant="outline"
                  className="w-full justify-start"
                >
                  {testando ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Database className="h-4 w-4 mr-2" />
                  )}
                  Testar Cliente Service
                </Button>
                
                <Button 
                  onClick={testarEndpointPublico}
                  disabled={testando}
                  variant="outline"
                  className="w-full justify-start"
                >
                  {testando ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Testar API Público
                </Button>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Controles</h4>
                <Button 
                  onClick={() => forcarMock(true)}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <WifiOff className="h-4 w-4 mr-2" />
                  Forçar Mock
                </Button>
                
                <Button 
                  onClick={() => forcarMock(false)}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Wifi className="h-4 w-4 mr-2" />
                  Permitir API
                </Button>
                
                <Button 
                  onClick={limparCache}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Limpar Cache
                </Button>
              </div>
            </div>
            
            {ultimoTeste && (
              <Card className="mt-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {ultimoTeste.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    Último Resultado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                    {JSON.stringify(ultimoTeste, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium">Logs de Execução</h4>
              <Button 
                onClick={() => setLogs([])}
                variant="outline"
                size="sm"
              >
                Limpar
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-4">
                <div className="font-mono text-xs space-y-1 max-h-60 overflow-y-auto">
                  {logs.length > 0 ? (
                    logs.map((log, index) => (
                      <div key={index} className="text-muted-foreground">
                        [{new Date().toLocaleTimeString()}] {log}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-4">
                      Nenhum log ainda. Execute um teste para ver os logs.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}