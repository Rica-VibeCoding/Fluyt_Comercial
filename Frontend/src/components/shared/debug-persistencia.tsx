/**
 * Componente de Debug para Persistência Inteligente
 * 
 * Útil para desenvolvimento e testes
 * Mostra status das sessões, cache e permite operações manuais
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  Database, 
  Trash2, 
  RefreshCw, 
  Save, 
  Clock,
  Users,
  HardDrive,
  Eye,
  EyeOff,
  Download,
  Play,
  Pause
} from 'lucide-react';
import { usePersistenciaDebug } from '../../hooks/globais/use-persistencia-sessao';
import { useSessao } from '../../store/sessao-store';

interface DebugPersistenciaProps {
  mostrarSempre?: boolean;
  posicao?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
}

export function DebugPersistencia({ 
  mostrarSempre = false,
  posicao = 'bottom-right' 
}: DebugPersistenciaProps) {
  const [isVisible, setIsVisible] = useState(mostrarSempre);
  const [stats, setStats] = useState<any>(null);
  const [sessoes, setSessoes] = useState<any[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(false); // Controle de auto-refresh
  
  const { 
    salvarAgora, 
    obterEstatisticas, 
    listarSessoes, 
    limparCacheAntigo,
    iniciarFluxoLimpo
  } = usePersistenciaDebug();
  
  const { cliente, ambientes, orcamentoConfigurado } = useSessao();

  // Função memoizada para atualizar estatísticas
  const atualizarStats = useCallback(() => {
    setStats(obterEstatisticas());
    setSessoes(listarSessoes());
  }, [obterEstatisticas, listarSessoes]);

  // Atualizar estatísticas com controle de auto-refresh
  useEffect(() => {
    atualizarStats(); // Sempre atualizar uma vez ao montar
    
    if (!autoRefresh) return; // Se auto-refresh estiver desabilitado, não criar interval
    
    const interval = setInterval(atualizarStats, 10000); // Atualizar a cada 10s (menos intrusivo)

    return () => clearInterval(interval);
  }, [atualizarStats, autoRefresh]);

  const formatarTempo = (timestamp: number) => {
    const agora = Date.now();
    const diff = agora - timestamp;
    const minutos = Math.floor(diff / (1000 * 60));
    
    if (minutos < 1) return 'agora mesmo';
    if (minutos === 1) return '1 minuto atrás';
    if (minutos < 60) return `${minutos} minutos atrás`;
    
    const horas = Math.floor(minutos / 60);
    if (horas === 1) return '1 hora atrás';
    return `${horas} horas atrás`;
  };

  const formatarTamanho = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const exportarDados = () => {
    const dadosExport = {
      timestamp: new Date().toISOString(),
      stats,
      sessoes,
      clienteAtivo: cliente ? {
        id: cliente.id,
        nome: cliente.nome
      } : null,
      estadoAtual: {
        ambientes: ambientes.length,
        orcamento: orcamentoConfigurado
      }
    };

    const blob = new Blob([JSON.stringify(dadosExport, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-persistencia-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getPositionClasses = () => {
    const base = 'fixed z-50';
    switch (posicao) {
      case 'top-right': return `${base} top-4 right-4`;
      case 'bottom-left': return `${base} bottom-4 left-4`;
      case 'top-left': return `${base} top-4 left-4`;
      default: return `${base} bottom-4 right-4`;
    }
  };

  if (!isVisible && !mostrarSempre) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsVisible(true)}
        className={`${getPositionClasses()} opacity-70 hover:opacity-100`}
      >
        <Database className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Card className={`${getPositionClasses()} w-80 max-h-96 overflow-y-auto shadow-lg border-2`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Database className="h-4 w-4" />
            Debug Persistência
          </CardTitle>
          {!mostrarSempre && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0"
            >
              <EyeOff className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 text-xs">
        {/* Status Geral */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Cliente Ativo:</span>
            <Badge variant={cliente ? "default" : "secondary"}>
              {cliente?.nome || 'Nenhum'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Ambientes:</span>
            <Badge variant="outline">{ambientes.length}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Orçamento:</span>
            <Badge variant={orcamentoConfigurado ? "default" : "secondary"}>
              {orcamentoConfigurado ? 'OK' : 'Pendente'}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Estatísticas do Cache */}
        {stats && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              Cache Status
            </h4>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Sessões:</span>
                <div className="font-mono">{stats.sessoesAtivas}/{stats.limiteCache}</div>
              </div>
              
              <div>
                <span className="text-muted-foreground">Tamanho:</span>
                <div className="font-mono">{formatarTamanho(stats.tamanhoCache)}</div>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Lista de Sessões */}
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-1">
            <Users className="h-3 w-3" />
            Sessões Ativas ({sessoes.length})
          </h4>
          
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {sessoes.length === 0 ? (
              <p className="text-muted-foreground text-center py-2">
                Nenhuma sessão ativa
              </p>
            ) : (
              sessoes.map((sessao, index) => (
                <div 
                  key={sessao.clienteId}
                  className={`p-2 rounded border text-xs ${
                    cliente?.id === sessao.clienteId 
                      ? 'bg-primary/10 border-primary/20' 
                      : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">
                      Cliente {sessao.clienteId.slice(-6)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-2 w-2 mr-1" />
                      {formatarTempo(sessao.ultimaAtividade)}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <Separator />

        {/* Controles de Auto-Refresh */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              Auto-Refresh
            </h4>
            <Badge variant={autoRefresh ? "default" : "secondary"} className="text-xs">
              {autoRefresh ? "Ativo" : "Pausado"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={autoRefresh ? "default" : "outline"}
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="h-7 text-xs flex-1"
            >
              {autoRefresh ? (
                <>
                  <Pause className="h-3 w-3 mr-1" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 mr-1" />
                  Iniciar
                </>
              )}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={atualizarStats}
              className="h-7 text-xs"
              disabled={autoRefresh}
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
          
          {autoRefresh && (
            <p className="text-xs text-muted-foreground text-center">
              Atualizando a cada 10 segundos
            </p>
          )}
        </div>

        <Separator />

        {/* Ações */}
        <div className="space-y-2">
          <h4 className="font-medium">Ações</h4>
          
          <div className="grid grid-cols-2 gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={salvarAgora}
              className="h-7 text-xs"
              disabled={!cliente}
            >
              <Save className="h-3 w-3 mr-1" />
              Salvar
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.location.reload()}
              className="h-7 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Reload
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={iniciarFluxoLimpo}
              className="h-7 text-xs"
              disabled={!cliente}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Reset
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={exportarDados}
              className="h-7 text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
          </div>
          
          <Button
            size="sm"
            variant="destructive"
            onClick={limparCacheAntigo}
            className="w-full h-7 text-xs"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Limpar Cache
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Versão compacta para uso em produção
 */
export function DebugPersistenciaCompacto() {
  return (
    <DebugPersistencia 
      mostrarSempre={false}
      posicao="bottom-right"
    />
  );
}