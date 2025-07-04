'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useClienteSelecionado } from '../../../hooks/globais/use-cliente-selecionado';
import { useAmbientesSessao } from '../../../hooks/modulos/ambientes/use-ambientes-sessao';
import { Button } from '../../ui/button';
import { PrimaryButton } from '../../comum/primary-button';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Plus, Upload, ArrowLeft, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { useAmbientes } from '../../../hooks/modulos/ambientes/use-ambientes';
import { AmbienteModal } from './ambiente-modal';
import { AmbienteEditModal } from './ambiente-edit-modal';
import { AmbienteTable } from './ambiente-table';
import { ClienteSelectorUniversal } from '../../shared/cliente-selector-universal';
import { Alert, AlertDescription } from '../../ui/alert';
import { ambientesService } from '@/services/ambientes-service';
import { useToast } from '../../ui/use-toast';
import { formatarMoeda } from '@/lib/formatters';
import { useSessaoSimples } from '@/hooks/globais/use-sessao-simples';
import type { Ambiente } from '@/types/ambiente';

export function AmbientePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { clienteId, clienteNome } = useClienteSelecionado();
  const clienteCarregado = clienteId && clienteNome ? { nome: clienteNome } : null;
  const { carregarClienteDaURL } = useSessaoSimples();
  
  const {
    cliente,
    adicionarAmbiente: adicionarAmbienteSessao,
    removerAmbiente: removerAmbienteSessao,
    definirAmbientes: definirAmbientesSessao,
    podeGerarOrcamento,
    ambientesSimples
  } = useAmbientesSessao();
  
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
  const [modalEditAberto, setModalEditAberto] = useState(false);
  const [ambienteEditando, setAmbienteEditando] = useState<Ambiente | null>(null);

  // Carregar cliente da URL na sessão quando page carrega
  useEffect(() => {
    if (clienteId && clienteNome) {
      console.log('🔄 [CLIENTE URL] Carregando cliente da URL na sessão:', { clienteId, clienteNome });
      carregarClienteDaURL(clienteId, clienteNome);
    }
  }, [clienteId, clienteNome, carregarClienteDaURL]);

  // ETAPA 6: Sincronização crítica entre backend e sessão
  useEffect(() => {
    if (ambientes && ambientes.length > 0) {
      // Converter dados do backend para formato da sessão
      const ambientesSessao = ambientes.map(amb => ({
        id: amb.id,
        nome: amb.nome,
        valor: amb.valor_venda || amb.valor_custo_fabrica || 0
      }));
      
      console.log('🔄 [SYNC] Sincronizando ambientes backend → sessão:', {
        backend: ambientes.length,
        valorTotal: valorTotalGeral,
        sessao: ambientesSessao.length
      });
      
      // Atualizar sessão com dados reais do backend
      definirAmbientesSessao(ambientesSessao);
    }
  }, [ambientes, valorTotalGeral, definirAmbientesSessao]);

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

  const handleEditarAmbiente = (ambiente: Ambiente) => {
    setAmbienteEditando(ambiente);
    setModalEditAberto(true);
  };

  const handleAtualizarAmbiente = async (id: string, data: Partial<Ambiente>) => {
    const sucesso = await atualizarAmbiente(id, data);
    if (sucesso) {
      setModalEditAberto(false);
      setAmbienteEditando(null);
      toast({
        title: 'Ambiente atualizado',
        description: 'As alterações foram salvas com sucesso.',
        variant: 'default'
      });
    }
  };

  const handleAvancarParaOrcamento = () => {
    if (!podeGerarOrcamento) return;
    
    const clienteNome = clienteCarregado?.nome || cliente?.nome || 'Cliente';
    const url = `/painel/orcamento?clienteId=${clienteId}&clienteNome=${encodeURIComponent(clienteNome)}`;
    
    // Navega para página de orçamento com dados do cliente
    router.push(url);
  };

  const handleImportarXML = async () => {
    if (!clienteId) {
      toast({
        title: 'Cliente necessário',
        description: 'É necessário selecionar um cliente para associar o ambiente importado',
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
      
      // Validações de segurança para upload de XML do Promob
      const validationErrors = [];
      
      // Verificar extensão
      if (!file.name.toLowerCase().endsWith('.xml')) {
        validationErrors.push('Apenas arquivos .xml são aceitos');
      }
      
      // Verificar tamanho (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        validationErrors.push('Arquivo muito grande (máx 10MB)');
      }
      
      // Verificar tamanho mínimo (evita arquivos vazios)
      if (file.size < 100) {
        validationErrors.push('Arquivo muito pequeno ou vazio');
      }
      
      // Verificar tipo MIME
      if (file.type && !['text/xml', 'application/xml'].includes(file.type)) {
        validationErrors.push('Tipo de arquivo inválido');
      }
      
      if (validationErrors.length > 0) {
        toast({
          title: 'Arquivo inválido',
          description: validationErrors.join('. '),
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
        
        // Arquivo XML processado com sucesso
        
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
                <PrimaryButton 
                  onClick={() => router.push('/painel/clientes')}
                  icon={ArrowLeft}
                  variant="primary"
                  size="sm"
                >
                  Voltar
                </PrimaryButton>
                
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
                <PrimaryButton 
                  onClick={handleImportarXML} 
                  disabled={isLoading || !clienteId} 
                  icon={Upload}
                  isLoading={isLoading}
                  variant="primary"
                  size="sm"
                >
                  {isLoading ? 'Importando...' : 'Importar XML'}
                </PrimaryButton>
                
                <PrimaryButton 
                  onClick={() => setModalAberto(true)} 
                  disabled={!clienteId}
                  icon={Plus}
                  variant="primary"
                  size="sm"
                >
                  Novo Ambiente
                </PrimaryButton>

                <PrimaryButton 
                  onClick={handleAvancarParaOrcamento}
                  disabled={!podeGerarOrcamento}
                  icon={ArrowRight}
                  iconPosition="right"
                  variant="primary"
                  size="sm"
                  title={!podeGerarOrcamento ? "Adicione pelo menos um ambiente para continuar" : "Avançar para orçamento"}
                >
                  Orçamento
                </PrimaryButton>
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
                <span>Backend indisponível. Verifique se o servidor está em execução e tente novamente.</span>
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
              onEdit={handleEditarAmbiente}
              onDelete={handleRemoverAmbiente}
              loading={isLoading}
            />
          </div>
        )}

        {/* Modal de Criação */}
        <AmbienteModal 
          open={modalAberto} 
          onOpenChange={setModalAberto} 
          onSubmit={handleAdicionarAmbiente}
          clienteId={clienteId || undefined}
        />

        {/* Modal de Edição */}
        <AmbienteEditModal
          open={modalEditAberto}
          onOpenChange={setModalEditAberto}
          onSubmit={handleAtualizarAmbiente}
          ambiente={ambienteEditando}
        />
      </div>
    </div>
  );
}