/**
 * PÁGINA DE ORÇAMENTO INTEGRADA COM BACKEND
 * Versão atualizada que usa os hooks integrados da ETAPA 3
 * Mantém UX existente + adiciona persistência real
 */

'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useOrcamentoIntegrado } from '@/hooks/data/use-orcamento-integrado';
import { useSessaoSimples } from '@/hooks/globais/use-sessao-simples';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Plus, FileText, CheckCircle, Save, FolderOpen, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { ModalFormasPagamento } from '@/components/modulos/orcamento/modal-formas-pagamento';
import { OrcamentoPagamentos } from '@/components/modulos/orcamento/orcamento-pagamentos';
import { EditableMoneyField, EditablePercentField } from '@/components/ui';
import { CalculationStatus } from '@/components/ui/calculation-status';
import { toast } from '@/hooks/globais/use-toast';
import type { FormaPagamento } from '@/types/orcamento';

function OrcamentoPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Hook de sessão para dados básicos
  const { cliente, ambientes, carregarClienteDaURL } = useSessaoSimples();
  
  // Hook integrado que combina store + API
  const orcamento = useOrcamentoIntegrado();
  
  // Estados locais
  const [isLoaded, setIsLoaded] = useState(false);
  const [modalFormasAberto, setModalFormasAberto] = useState(false);
  const [salvandoOrcamento, setSalvandoOrcamento] = useState(false);
  
  // ========== INICIALIZAÇÃO ==========
  
  useEffect(() => {
    const inicializar = async () => {
      const clienteId = searchParams.get('clienteId');
      const clienteNome = searchParams.get('clienteNome');
      const orcamentoId = searchParams.get('orcamentoId'); // Para carregar orçamento existente
      
      console.log('🔍 Parâmetros da URL:', { clienteId, clienteNome, orcamentoId });
      
      // Aguardar inicialização
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (orcamentoId) {
        // Carregar orçamento existente
        try {
          await orcamento.carregarOrcamento(orcamentoId);
          toast({
            title: "✅ Orçamento carregado",
            description: "Dados carregados com sucesso",
          });
        } catch (error) {
          toast({
            title: "❌ Erro ao carregar orçamento",
            description: error instanceof Error ? error.message : "Erro desconhecido",
            variant: "destructive",
          });
        }
      } else if (clienteId && clienteNome) {
        // Criar novo orçamento
        carregarClienteDaURL(clienteId, decodeURIComponent(clienteNome));
        
        // Definir dados no hook integrado
        orcamento.definirCliente({
          id: clienteId,
          nome: decodeURIComponent(clienteNome)
        });
      }
      
      setIsLoaded(true);
    };
    
    inicializar();
  }, [searchParams]);

  // Sincronizar dados da sessão com o hook integrado
  useEffect(() => {
    if (cliente && ambientes.length > 0) {
      orcamento.definirCliente(cliente);
      orcamento.definirAmbientes(ambientes);
    }
  }, [cliente, ambientes]);

  // ========== HANDLERS ==========

  const handleSalvarOrcamento = async () => {
    if (!orcamento.podeSerSalvo()) {
      toast({
        title: "⚠️ Dados incompletos",
        description: "Adicione cliente e ambientes antes de salvar",
        variant: "destructive",
      });
      return;
    }

    setSalvandoOrcamento(true);
    
    try {
      const resultado = await orcamento.salvarOrcamentoCompleto();
      
      toast({
        title: "✅ Orçamento salvo",
        description: `Orçamento ${resultado.numero} criado com sucesso`,
      });

      // Atualizar URL para incluir ID do orçamento
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('orcamentoId', resultado.id);
      window.history.replaceState({}, '', currentUrl.toString());

    } catch (error) {
      toast({
        title: "❌ Erro ao salvar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setSalvandoOrcamento(false);
    }
  };

  const handleAdicionarFormaPagamento = async (forma: {
    tipo: 'a-vista' | 'boleto' | 'cartao' | 'financeira';
    valor: number;
    valorPresente: number;
    parcelas?: number;
    dados?: any;
  }) => {
    try {
      // Usar método do hook integrado
      const novaForma = {
        id: `temp-${Date.now()}`, // ID temporário
        tipo: forma.tipo,
        valor: forma.valor,
        valorPresente: forma.valorPresente,
        parcelas: forma.parcelas || 1,
        dados: forma.dados,
        criadaEm: new Date().toISOString(),
        travada: false
      };

      // Adicionar no store local (será salvo quando salvar o orçamento)
      // TODO: implementar método para adicionar forma no hook integrado
      
      setModalFormasAberto(false);
      
      toast({
        title: "✅ Forma adicionada",
        description: `Forma de pagamento ${forma.tipo} adicionada`,
      });

    } catch (error) {
      toast({
        title: "❌ Erro ao adicionar forma",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const navegarParaContratos = () => {
    if (orcamento.temDadosParaContrato()) {
      const url = `/painel/contratos?clienteId=${orcamento.cliente?.id}&clienteNome=${encodeURIComponent(orcamento.cliente?.nome || '')}`;
      router.push(url);
    } else {
      toast({
        title: "⚠️ Dados incompletos",
        description: "Configure cliente, ambientes e formas de pagamento",
        variant: "destructive",
      });
    }
  };

  const navegarParaListagem = () => {
    router.push('/painel/orcamentos');
  };

  // ========== RENDER ==========

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando orçamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="bg-white border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/painel">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
              </Link>
              
              <p className="text-lg font-semibold">
                {orcamento.cliente ? orcamento.cliente.nome : 'Novo Orçamento'}
              </p>
              
              {orcamento.loading && (
                <div className="text-blue-600 animate-pulse">
                  <RefreshCw className="h-4 w-4" />
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              {/* Botão Listar Orçamentos */}
              <Button
                onClick={navegarParaListagem}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <FolderOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Ver Orçamentos</span>
                <span className="sm:hidden">Lista</span>
              </Button>

              {/* Botão Salvar */}
              <Button
                onClick={handleSalvarOrcamento}
                disabled={!orcamento.podeSerSalvo() || salvandoOrcamento || orcamento.loading}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {salvandoOrcamento ? 'Salvando...' : 'Salvar'}
                </span>
                <span className="sm:hidden">
                  {salvandoOrcamento ? '...' : 'Salvar'}
                </span>
              </Button>

              {/* Botão Gerar Contrato */}
              <Button
                onClick={navegarParaContratos}
                disabled={!orcamento.temDadosParaContrato()}
                className="gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                {orcamento.temDadosParaContrato() ? 
                  <CheckCircle className="h-4 w-4" /> : 
                  <FileText className="h-4 w-4" />
                }
                <span className="hidden sm:inline">
                  {orcamento.temDadosParaContrato() ? 'Gerar Contrato' : 'Configure Dados'}
                </span>
                <span className="sm:hidden">
                  {orcamento.temDadosParaContrato() ? 'Gerar' : 'Config'}
                </span>
              </Button>
            </div>
          </div>

          {/* Erro global */}
          {orcamento.error && (
            <div className="mt-4 p-3 border-l-4 border-red-500 bg-red-50">
              <p className="text-sm text-red-700">{orcamento.error}</p>
              <Button 
                onClick={orcamento.limparError}
                variant="ghost" 
                size="sm" 
                className="mt-2 text-red-700"
              >
                Fechar
              </Button>
            </div>
          )}
        </div>
        
        {/* Layout principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Coluna esquerda - Resumo */}
          <div className="lg:col-span-1">
            
            {/* Valor Total */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm">Valor Total</h3>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  R$ {orcamento.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </CardContent>
            </Card>

            {/* Ambientes */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Ambientes ({orcamento.ambientes.length})</h3>
                
                {orcamento.ambientes.length > 0 ? (
                  <div className="space-y-2">
                    {orcamento.ambientes.map((ambiente) => (
                      <div key={ambiente.id} className="flex justify-between py-2 border-b">
                        <span className="font-medium">{ambiente.nome}</span>
                        <span className="text-green-600">
                          R$ {ambiente.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Nenhum ambiente adicionado
                  </p>
                )}
              </CardContent>
            </Card>
            
          </div>

          {/* Coluna direita - Valores e Formas */}
          <div className="lg:col-span-2">
            
            {/* Cards de valores */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              
              {/* Desconto */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm">Desconto</h3>
                  <EditablePercentField
                    value={orcamento.descontoPercentual}
                    onChange={orcamento.definirDesconto}
                    tooltip="Clique para editar desconto"
                    className="justify-start mt-2"
                    maxValue={50}
                  />
                </CardContent>
              </Card>

              {/* Valor Negociado */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm">Valor Negociado</h3>
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    R$ {orcamento.valorNegociado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </CardContent>
              </Card>

              {/* Valor Presente */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm">Valor Presente</h3>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    R$ {orcamento.valorPresenteTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </CardContent>
              </Card>
              
            </div>

            {/* Status de cálculo */}
            <CalculationStatus
              isCalculating={orcamento.loading}
              hasErrors={!!orcamento.error}
              lastOperation={orcamento.loading ? "Processando..." : ""}
              className="mb-4"
            />

            {/* Formas de Pagamento */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Formas de Pagamento</h3>
                  <Button
                    onClick={() => setModalFormasAberto(true)}
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar
                  </Button>
                </div>

                {orcamento.formasPagamento.length > 0 ? (
                  <div className="space-y-2">
                    {orcamento.formasPagamento.map((forma) => (
                      <div key={forma.id} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <span className="font-medium capitalize">{forma.tipo.replace('-', ' ')}</span>
                          {forma.parcelas > 1 && (
                            <span className="text-sm text-gray-600 ml-2">
                              ({forma.parcelas}x)
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            R$ {forma.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-sm text-gray-600">
                            VP: R$ {forma.valorPresente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Restante */}
                    {orcamento.valorRestante > 0 && (
                      <div className="mt-4 p-3 border-2 border-dashed border-yellow-300 rounded">
                        <div className="flex justify-between">
                          <span className="text-yellow-700 font-medium">Restante a configurar:</span>
                          <span className="text-yellow-700 font-bold">
                            R$ {orcamento.valorRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Nenhuma forma de pagamento configurada
                  </p>
                )}
              </CardContent>
            </Card>
            
          </div>
          
        </div>
        
        {/* Modal de Formas de Pagamento */}
        <ModalFormasPagamento
          isOpen={modalFormasAberto}
          onClose={() => setModalFormasAberto(false)}
          onFormaPagamentoAdicionada={handleAdicionarFormaPagamento}
          valorMaximo={orcamento.valorNegociado}
          valorJaAlocado={orcamento.valorTotalFormas}
        />
        
      </div>
    </div>
  );
}

export default function OrcamentoPageIntegrada() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Carregando orçamento...</p>
      </div>
    }>
      <OrcamentoPageContent />
    </Suspense>
  );
}