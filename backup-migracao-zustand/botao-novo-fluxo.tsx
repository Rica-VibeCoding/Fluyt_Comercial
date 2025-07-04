/**
 * Botão Inteligente para Iniciar Novo Fluxo
 * 
 * Resolve problemas de persistência ao navegar entre clientes
 * Oferece opções de:
 * - Continuar sessão existente
 * - Iniciar fluxo limpo
 * - Trocar cliente mantendo progresso
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { 
  RefreshCw, 
  Play, 
  Save, 
  AlertTriangle, 
  Clock, 
  Users,
  ArrowRight
} from 'lucide-react';
import { useSessao } from '../../store/sessao-store';
import { usePersistenciaBasica } from '../../hooks/globais/use-persistencia-sessao';
import { persistenciaInteligente } from '../../lib/persistencia-inteligente';

interface BotaoNovoFluxoProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  texto?: string;
  icon?: boolean;
}

export function BotaoNovoFluxo({ 
  variant = 'default',
  size = 'default',
  className = '',
  texto = 'Novo Fluxo',
  icon = true
}: BotaoNovoFluxoProps) {
  const router = useRouter();
  const [modalAberto, setModalAberto] = useState(false);
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);
  const [sessoesPendentes, setSessoesPendentes] = useState<any[]>([]);
  
  const { cliente, ambientes, orcamentoConfigurado } = useSessao();
  const { salvarAgora, listarSessoes } = usePersistenciaBasica();

  const temProgresso = cliente && (ambientes.length > 0 || orcamentoConfigurado);

  const handleAbrirModal = () => {
    const sessoes = listarSessoes();
    setSessoesPendentes(sessoes);
    setModalAberto(true);
  };

  const handleIniciarFluxoLimpo = () => {
    if (temProgresso) {
      setConfirmacaoAberta(true);
    } else {
      executarFluxoLimpo();
    }
  };

  const executarFluxoLimpo = () => {
    // Salvar progresso atual se houver
    if (cliente) {
      salvarAgora();
    }

    // Limpar sessão atual
    persistenciaInteligente.limparTodasSessoes();
    
    // Navegar para início
    router.push('/painel/clientes');
    
    // Forçar reload para garantir estado limpo
    setTimeout(() => {
      window.location.reload();
    }, 100);

    setModalAberto(false);
    setConfirmacaoAberta(false);
  };

  const handleContinuarSessao = (clienteId: string) => {
    // Navegar para clientes forçando carregamento da sessão
    router.push(`/painel/clientes?cliente=${clienteId}&carregar=true`);
    setModalAberto(false);
  };

  const formatarTempo = (timestamp: number) => {
    const agora = Date.now();
    const diff = agora - timestamp;
    const minutos = Math.floor(diff / (1000 * 60));
    
    if (minutos < 1) return 'agora mesmo';
    if (minutos === 1) return '1 minuto atrás';
    if (minutos < 60) return `${minutos} min atrás`;
    
    const horas = Math.floor(minutos / 60);
    if (horas === 1) return '1h atrás';
    if (horas < 24) return `${horas}h atrás`;
    
    const dias = Math.floor(horas / 24);
    return `${dias}d atrás`;
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleAbrirModal}
        className={className}
      >
        {icon && <RefreshCw className="h-4 w-4 mr-2" />}
        {texto}
      </Button>

      {/* Modal Principal */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Gerenciar Sessões
            </DialogTitle>
            <DialogDescription>
              Escolha como continuar seu trabalho no sistema.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Status Atual */}
            {cliente && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Sessão Atual</span>
                    <Badge variant="default">{cliente.nome}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {ambientes.length} ambientes
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {orcamentoConfigurado ? 'Orçamento OK' : 'Pendente'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sessões Pendentes */}
            {sessoesPendentes.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Sessões Salvas</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {sessoesPendentes.slice(0, 3).map((sessao) => (
                    <Card 
                      key={sessao.clienteId}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleContinuarSessao(sessao.clienteId)}
                    >
                      <CardContent className="p-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium">
                              Cliente {sessao.clienteId.slice(-6)}
                            </span>
                            <p className="text-xs text-muted-foreground">
                              {formatarTempo(sessao.ultimaAtividade)}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {sessoesPendentes.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{sessoesPendentes.length - 3} sessões adicionais
                  </p>
                )}
              </div>
            )}

            {/* Ações */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => router.push('/painel/clientes')}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                Continuar
              </Button>
              
              <Button
                variant="destructive"
                onClick={handleIniciarFluxoLimpo}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Novo Limpo
              </Button>
            </div>

            {temProgresso && (
              <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-xs text-yellow-700">
                  Você tem progresso não salvo. Escolha "Continuar" para manter.
                </span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação */}
      <AlertDialog open={confirmacaoAberta} onOpenChange={setConfirmacaoAberta}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Novo Fluxo</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem progresso ativo com {cliente?.nome}. 
              Iniciar um novo fluxo irá salvar automaticamente seu progresso atual 
              e limpar a tela para um novo cliente.
              
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border">
                <div className="text-sm text-blue-700">
                  <strong>Será salvo:</strong>
                  <ul className="mt-1 space-y-1">
                    <li>• Cliente: {cliente?.nome}</li>
                    <li>• Ambientes: {ambientes.length}</li>
                    <li>• Orçamento: {orcamentoConfigurado ? 'Configurado' : 'Pendente'}</li>
                  </ul>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={executarFluxoLimpo}>
              <Save className="h-4 w-4 mr-2" />
              Salvar e Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/**
 * Versão compacta para headers
 */
export function BotaoNovoFluxoCompacto() {
  return (
    <BotaoNovoFluxo
      variant="outline"
      size="sm"
      texto="Novo"
      icon={true}
    />
  );
}