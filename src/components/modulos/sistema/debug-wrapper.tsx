import React, { ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class DebugWrapper extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('🚨 [DEBUG] DebugWrapper: Erro capturado:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 [DEBUG] DebugWrapper: componentDidCatch:', {
      error,
      errorInfo,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
    
    this.setState({ 
      hasError: true, 
      error, 
      errorInfo 
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="space-y-6">
          <Card className="border-2 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <AlertTriangle className="h-5 w-5" />
                Erro Detectado - Debug Ativo
              </CardTitle>
              <CardDescription className="text-red-700">
                {this.props.fallbackTitle || 'Um erro foi detectado neste componente'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Informações do Erro */}
              <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                <div className="space-y-2">
                  <h4 className="font-medium text-red-900 flex items-center gap-2">
                    <Bug className="h-4 w-4" />
                    Detalhes do Erro
                  </h4>
                  <div className="text-sm text-red-800 space-y-1">
                    <p><strong>Mensagem:</strong> {this.state.error?.message || 'Erro desconhecido'}</p>
                    <p><strong>Tipo:</strong> {this.state.error?.name || 'Error'}</p>
                  </div>
                </div>
              </div>

              {/* Stack Trace */}
              {this.state.error?.stack && (
                <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Stack Trace</h4>
                  <pre className="text-xs text-gray-700 overflow-auto max-h-40 whitespace-pre-wrap">
                    {this.state.error.stack}
                  </pre>
                </div>
              )}

              {/* Component Stack */}
              {this.state.errorInfo?.componentStack && (
                <div className="p-4 bg-blue-100 border border-blue-300 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Component Stack</h4>
                  <pre className="text-xs text-blue-700 overflow-auto max-h-40 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}

              {/* Debug Environment */}
              <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">Informações do Ambiente</h4>
                <div className="text-sm text-yellow-800 space-y-1">
                  <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</p>
                  <p><strong>typeof window:</strong> {typeof window}</p>
                  <p><strong>User Agent:</strong> {typeof window !== 'undefined' ? window.navigator?.userAgent?.substring(0, 50) + '...' : 'N/A'}</p>
                  <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2">
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Recarregar Página
                </button>
                <button 
                  onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                  Tentar Novamente
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
} 