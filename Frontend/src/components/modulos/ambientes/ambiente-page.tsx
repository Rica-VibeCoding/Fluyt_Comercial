'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useClienteSelecionado } from '../../../hooks/globais/use-cliente-selecionado';
import { useSessao } from '../../../store/sessao-store';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Download, Plus, Upload, User, Home, ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';
import { useAmbientes } from '../../../hooks/modulos/ambientes/use-ambientes';
import { useClientesApi } from '../../../hooks/modulos/clientes/use-clientes-api';
import { useSessaoSimples } from '../../../hooks/globais/use-sessao-simples';
import { AmbienteModal } from './ambiente-modal';
import { AmbienteCard } from './ambiente-card';
import { ClienteSelectorUniversal } from '../../shared/cliente-selector-universal';

export function AmbientePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clienteId, clienteNome } = useClienteSelecionado();
  const clienteCarregado = clienteId && clienteNome ? { nome: clienteNome } : null;
  const clienteLoading = false; // Simplificado - useClienteSelecionado não tem isLoading
  
  // Verificar se deve forçar troca de cliente
  const forcarTroca = searchParams.get('forcar') === 'true';
  
  // Debug: monitorar mudanças de clienteId
  useEffect(() => {
    console.log('🔍 AmbientePage: clienteId mudou para:', clienteId, { forcarTroca });
  }, [clienteId, forcarTroca]);
  const { clientes } = useClientesApi();
  const {
    cliente,
    ambientes: ambientesSessao,
    definirCliente,
    definirAmbientes,
    adicionarAmbiente: adicionarAmbienteSessao,
    removerAmbiente: removerAmbienteSessao,
    podeGerarOrcamento,
    limparSessaoCompleta
  } = useSessao();
  
  const { definirAmbientes: definirAmbientesSimples } = useSessaoSimples();
  
  const {
    ambientes,
    adicionarAmbiente,
    removerAmbiente,
    importarXML,
    isLoading,
    valorTotalGeral
  } = useAmbientes(clienteId || undefined);
  const [modalAberto, setModalAberto] = useState(false);

  // Sincronizar ambientes locais com AMBAS as sessões
  useEffect(() => {
    if (clienteId && ambientes.length > 0) {
      // Sessão antiga (manter compatibilidade)
      definirAmbientes(ambientes);
      
      // Sessão SIMPLES (nova)
      const ambientesSimples = ambientes.map(amb => ({
        id: amb.id,
        nome: amb.nome,
        valor: amb.valorTotal || 0
      }));
      definirAmbientesSimples(ambientesSimples);
      
      console.log('🔄 Ambientes sincronizados:', ambientesSimples);
    }
  }, [ambientes, clienteId]); // Removido funções das dependências para evitar loops

  const handleAdicionarAmbiente = (data: any) => {
    adicionarAmbiente(data);
    setModalAberto(false);
  };

  const handleRemoverAmbiente = (id: string) => {
    removerAmbiente(id);
    removerAmbienteSessao(id);
  };

  const handleAvancarParaOrcamento = () => {
    if (!podeGerarOrcamento) return;
    
    const clienteNome = clienteCarregado?.nome || cliente?.nome || 'Cliente';
    const url = `/painel/orcamento?clienteId=${clienteId}&clienteNome=${encodeURIComponent(clienteNome)}`;
    
    console.log('🚀 Indo para orçamento:', url);
    router.push(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header Section */}
        <Card>
          <CardContent className="p-4 min-h-[80px] flex items-center">
            <div className="flex items-center justify-between w-full">
              {/* Navegação e Cliente - ESQUERDA */}
              <div className="flex items-center gap-4">
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => router.push('/painel/clientes')}
                  className="gap-2 h-12 px-4 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg font-semibold text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                
                <div className="h-6 w-px bg-gray-300" />
                
                <div className="w-80">
                  <ClienteSelectorUniversal 
                    targetRoute="/painel/ambientes"
                    placeholder="Selecionar cliente..."
                    integraSessao={true}
                  />
                </div>
              </div>

              {/* Botões - DIREITA */}
              <div className="flex items-center gap-3">
                <Button 
                  onClick={importarXML} 
                  disabled={isLoading || !clienteId} 
                  variant="default" 
                  size="sm"
                  className="gap-2 h-12 px-4 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg font-semibold text-white"
                >
                  <Upload className="h-4 w-4" />
                  {isLoading ? 'Importando...' : 'Importar XML'}
                </Button>
                
                <Button 
                  onClick={() => setModalAberto(true)} 
                  size="sm" 
                  disabled={!clienteId}
                  variant="default"
                  className="gap-2 h-12 px-4 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg font-semibold text-white"
                >
                  <Plus className="h-4 w-4" />
                  Novo Ambiente
                </Button>

                <Button 
                  onClick={handleAvancarParaOrcamento}
                  size="sm" 
                  disabled={!podeGerarOrcamento}
                  variant="default"
                  className="gap-2 h-12 px-4 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  title={!podeGerarOrcamento ? "Adicione pelo menos um ambiente para continuar" : "Avançar para orçamento"}
                >
                  Orçamento
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo compacto */}
        {/* Header com informações consolidadas */}
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Total:</span>
                <span className="font-semibold">{ambientes.length} ambientes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Valor:</span>
                <span className="font-bold text-primary tabular-nums">
                  {valorTotalGeral.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Ambientes */}
        {clienteId && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Ambientes Cadastrados</h2>
            </div>
            
            {ambientes.length === 0 ? (
              <div className="bg-white border rounded-lg p-8 text-center">
                <Home className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Nenhum ambiente cadastrado</p>
                <p className="text-sm text-muted-foreground">Comece importando um XML ou criando um ambiente manualmente</p>
              </div>
            ) : (
              <div className="bg-background border border-border/40 rounded-lg overflow-hidden shadow-sm">
                {ambientes.map((ambiente) => (
                  <AmbienteCard 
                    key={ambiente.id} 
                    ambiente={ambiente} 
                    onRemover={handleRemoverAmbiente} 
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        <AmbienteModal 
          open={modalAberto} 
          onOpenChange={setModalAberto} 
          onSubmit={handleAdicionarAmbiente} 
        />
      </div>
    </div>
  );
}