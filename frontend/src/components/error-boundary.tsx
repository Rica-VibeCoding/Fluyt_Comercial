'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
    
    // Detectar erro de chunk/syntax
    if (error.message.includes('Loading chunk') || 
        error.message.includes('SyntaxError') ||
        error.message.includes('Unexpected token')) {
      
      console.log('🔄 Erro de chunk detectado, recarregando automaticamente...');
      
      // Auto-reload após 2 segundos para chunks corrompidos
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
    
    this.setState({
      error,
      errorInfo
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  public render() {
    if (this.state.hasError) {
      // UI de fallback customizada
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isChunkError = this.state.error?.message.includes('Loading chunk') ||
                          this.state.error?.message.includes('SyntaxError') ||
                          this.state.error?.message.includes('Unexpected token');

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-xl">
                {isChunkError ? 'Atualizando Sistema...' : 'Ops! Algo deu errado'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isChunkError ? (
                <div className="text-center">
                  <div className="animate-spin mx-auto w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mb-3"></div>
                  <p className="text-gray-600 text-sm">
                    Sistema sendo atualizado automaticamente...
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Isso acontece quando há atualizações de código
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 text-sm text-center">
                    Ocorreu um erro inesperado. Você pode tentar recarregar a página ou voltar ao início.
                  </p>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={this.handleReload} 
                      className="flex-1 gap-2"
                      variant="default"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Recarregar
                    </Button>
                    <Button 
                      onClick={this.handleReset} 
                      variant="outline"
                      className="flex-1"
                    >
                      Tentar Novamente
                    </Button>
                  </div>
                  
                  {process.env.NODE_ENV === 'development' && this.state.error && (
                    <details className="mt-4">
                      <summary className="text-xs text-gray-500 cursor-pointer">
                        Detalhes do erro (dev)
                      </summary>
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                        {this.state.error.toString()}
                        {this.state.errorInfo?.componentStack}
                      </pre>
                    </details>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;