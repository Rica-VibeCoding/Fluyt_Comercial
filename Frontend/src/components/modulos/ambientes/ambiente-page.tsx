'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useClienteSelecionado } from '../../../hooks/globais/use-cliente-selecionado';
import { useSessao } from '../../../store/sessao-store';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Plus, Upload, ArrowLeft, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { useAmbientes } from '../../../hooks/modulos/ambientes/use-ambientes';
import { useSessaoSimples } from '../../../hooks/globais/use-sessao-simples';
import { AmbienteModal } from './ambiente-modal';
import { AmbienteTable } from './ambiente-table';
import { ClienteSelectorUniversal } from '../../shared/cliente-selector-universal';
import { Alert, AlertDescription } from '../../ui/alert';
import { ambientesService } from '@/services/ambientes-service';
import { useToast } from '../../ui/use-toast';
import { formatarMoeda } from '@/lib/formatters';

export function AmbientePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { clienteId, clienteNome } = useClienteSelecionado();
  const clienteCarregado = clienteId && clienteNome ? { nome: clienteNome } : null;
  
  const {
    cliente,
    adicionarAmbiente: adicionarAmbienteSessao,
    removerAmbiente: removerAmbienteSessao,
    podeGerarOrcamento
  } = useSessao();
  
  const { definirAmbientes: definirAmbientesSimples } = useSessaoSimples();
  
  const {
    // Dados
    ambientes,
    totalAmbientes,
    ambientesManual,
    ambientesXML,
    valorTotalGeral,
    
    // Estado
    isLoading,
    error,
    isConnected,
    
    // Ações
    carregarAmbientes,
    adicionarAmbiente,
    atualizarAmbiente,
    removerAmbiente,
    buscarAmbientePorId,
    verificarConectividade,
    limparError,
    recarregar,
  } = useAmbientes(clienteId || undefined);

  const [modalAberto, setModalAberto] = useState(false);

  // Debug: monitorar mudanças de clienteId
  useEffect(() => {
    console.log('🔍 AmbientePage: clienteId mudou para:', clienteId);
  }, [clienteId]);

  // Sincronizar ambientes com sessão simples
  useEffect(() => {
    if (clienteId && ambientes.length > 0) {
      // Sessão SIMPLES (nova estrutura)
      const ambientesSimples = ambientes.map(amb => ({
        id: amb.id,
        nome: amb.nome,
        valor: amb.valorVenda || amb.valorCustoFabrica || 0
      }));
      definirAmbientesSimples(ambientesSimples);
      
      console.log('🔄 Ambientes sincronizados:', ambientesSimples);
    }
  }, [ambientes, clienteId, definirAmbientesSimples]);

  const handleAdicionarAmbiente = async (data: any) => {
    const sucesso = await adicionarAmbiente(data);
    if (sucesso) {
      setModalAberto(false);
    }
  };

  const handleRemoverAmbiente = async (id: string) => {
    const sucesso = await removerAmbiente(id);
    if (sucesso) {
      removerAmbienteSessao(id);
    }
  };

  const handleAvancarParaOrcamento = () => {
    if (!podeGerarOrcamento) return;
    
    const clienteNome = clienteCarregado?.nome || cliente?.nome || 'Cliente';
    const url = `/painel/orcamento?clienteId=${clienteId}&clienteNome=${encodeURIComponent(clienteNome)}`;
    
    console.log('🚀 Indo para orçamento:', url);
    router.push(url);
  };

  const handleImportarXML = async () => {
    if (!clienteId) {
      toast({
        title: 'Atenção',
        description: 'Selecione um cliente antes de importar XML',
        variant: 'destructive'
      });
      return;
    }

    // Criar input file invisível
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xml';
    
    // Quando usuário selecionar arquivo
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      // Verificar se é XML
      if (!file.name.toLowerCase().endsWith('.xml')) {
        toast({
          title: 'Arquivo inválido',
          description: 'Por favor, selecione um arquivo XML',
          variant: 'destructive'
        });
        return;
      }
      
      try {
        // Mostrar que está processando
        toast({
          title: 'Importando XML',
          description: 'Enviando arquivo para processamento...'
        });
        
        // Enviar para backend
        const response = await ambientesService.importarXML(clienteId, file);
        
        console.log('✅ Resposta do backend:', response.data);
        
        // Sucesso
        toast({
          title: 'XML recebido!',
          description: `Arquivo "${file.name}" processado com sucesso`,
          variant: 'default'
        });
        
        // Recarregar lista de ambientes
        recarregar();
        
      } catch (error: any) {
        console.error('Erro ao importar XML:', error);
        toast({
          title: 'Erro ao importar',
          description: error.response?.data?.detail || 'Erro ao processar arquivo XML',
          variant: 'destructive'
        });
      }
    };
    
    // Abrir janela de seleção
    input.click();
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
                  onClick={handleImportarXML} 
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

        {/* Status de Conectividade */}
        {!isConnected && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <div className="flex items-center justify-between">
                <span>Não foi possível conectar ao servidor. Verifique se o backend está rodando.</span>
                <Button 
                  onClick={verificarConectividade}
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Tentar novamente
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Erro */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="flex items-center justify-between">
                <span>{error}</span>
                <Button 
                  onClick={limparError}
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 border-red-300 text-red-700 hover:bg-red-100"
                >
                  Fechar
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Resumo compacto */}
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Total:</span>
                <span className="font-semibold">{totalAmbientes} ambientes</span>
                <div className="flex gap-1">
                  <Badge variant="outline" className="text-xs h-5">
                    {ambientesManual} manual
                  </Badge>
                  <Badge variant="outline" className="text-xs h-5">
                    {ambientesXML} XML
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Valor:</span>
                <span className="font-bold text-primary tabular-nums">
                  {formatarMoeda(valorTotalGeral)}
                </span>
              </div>
            </div>
            
            {clienteId && (
              <Button 
                onClick={recarregar}
                variant="outline"
                size="sm"
                disabled={isLoading}
                className="h-8 px-3"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            )}
          </div>
        </div>

        {/* Tabela de Ambientes */}
        {clienteId && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Ambientes Cadastrados</h2>
            </div>
            
            <AmbienteTable 
              ambientes={ambientes}
              onDelete={handleRemoverAmbiente}
              loading={isLoading}
            />
          </div>
        )}

        {/* Modal */}
        <AmbienteModal 
          open={modalAberto} 
          onOpenChange={setModalAberto} 
          onSubmit={handleAdicionarAmbiente}
          clienteId={clienteId || undefined}
        />
      </div>
    </div>
  );
}