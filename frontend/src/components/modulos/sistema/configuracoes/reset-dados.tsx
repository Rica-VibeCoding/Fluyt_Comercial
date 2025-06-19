import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { RefreshCw, Database, AlertTriangle, Building2, Store, Loader2 } from 'lucide-react';
import { useEmpresasReal } from '@/hooks/data/use-empresas-real';
import { useLojas } from '@/hooks/modulos/sistema/use-lojas';

export function ResetDados() {
  const [isClient, setIsClient] = useState(false);
  
  // Evitar hidratação SSR
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { recarregarDados: recarregarEmpresas } = useEmpresasReal();
  const { resetarDados: resetarLojas } = useLojas();
  
  // Loading durante hidratação
  if (!isClient) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Gerenciamento de Dados
            </CardTitle>
            <CardDescription>
              Ferramentas para gerenciar os dados de desenvolvimento e teste
            </CardDescription>
          </CardHeader>
          <CardContent className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-2">Carregando configurações...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleResetCompleto = () => {
    resetarEmpresas();
    resetarLojas();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Gerenciamento de Dados
          </CardTitle>
          <CardDescription>
            Ferramentas para gerenciar os dados de desenvolvimento e teste
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Reset Empresas */}
            <Card className="border-dashed">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Recarregar Empresas</h3>
                    <p className="text-xs text-muted-foreground">
                      Recarrega dados reais do Supabase
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Reset
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Recarregar Dados de Empresas</AlertDialogTitle>
                        <AlertDialogDescription>
                          Isso irá recarregar os dados das empresas diretamente do Supabase, atualizando as informações exibidas.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={recarregarEmpresas} className="bg-blue-600 hover:bg-blue-700">
                          Recarregar Dados
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>

            {/* Reset Lojas */}
            <Card className="border-dashed">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Store className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Reset Lojas</h3>
                    <p className="text-xs text-muted-foreground">
                      Restaura lojas iniciais
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Reset
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reset Dados de Lojas</AlertDialogTitle>
                        <AlertDialogDescription>
                          Isso irá remover todas as lojas criadas e restaurar apenas os dados iniciais. Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={resetarLojas} className="bg-purple-600 hover:bg-purple-700">
                          Confirmar Reset
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>

            {/* Reset Completo */}
            <Card className="border-dashed border-red-200">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Reset Completo</h3>
                    <p className="text-xs text-muted-foreground">
                      Reset todos os dados
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full border-red-200 text-red-600 hover:bg-red-50">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Reset Tudo
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-600">
                          ⚠️ Reset Completo dos Dados
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          <div className="space-y-2">
                            <p>Esta ação irá resetar TODOS os dados do sistema:</p>
                            <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                              <li>Todas as empresas criadas</li>
                              <li>Todas as lojas criadas</li>
                              <li>Configurações personalizadas</li>
                            </ul>
                            <p className="font-medium text-red-600 mt-3">
                              Esta ação não pode ser desfeita!
                            </p>
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleResetCompleto} 
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Confirmar Reset Completo
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Informações sobre localStorage */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Database className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-medium text-blue-900">Persistência de Dados</h4>
                <p className="text-sm text-blue-700">
                  Os dados são salvos automaticamente no localStorage do navegador. Isso significa que:
                </p>
                <ul className="text-sm text-blue-700 list-disc list-inside ml-4 space-y-1">
                  <li>Os dados persistem entre sessões e abas</li>
                  <li>Cada navegador mantém seus próprios dados</li>
                  <li>Limpar dados do navegador removerá todas as informações</li>
                  <li>Use as opções de reset para voltar aos dados iniciais</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}