'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useOrcamento } from '@/hooks/data/use-orcamento';
import { useFormasPagamento } from '@/hooks/data/use-formas-pagamento';
import { useSessaoSimples } from '@/hooks/globais/use-sessao-simples';
import { useOrcamentoIntegrado } from '@/hooks/data/use-orcamento-integrado';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, FileText, CheckCircle, Calculator, RefreshCw, Save, Database } from 'lucide-react';
import Link from 'next/link';
import { ModalFormasPagamento } from '@/components/modulos/orcamento/modal-formas-pagamento';
import { ListaFormasPagamento } from '@/components/modulos/orcamento/lista-formas-pagamento';
import { ModalAVista } from '@/components/modulos/orcamento/modal-a-vista';
import { ModalBoleto } from '@/components/modulos/orcamento/modal-boleto';
import { ModalCartao } from '@/components/modulos/orcamento/modal-cartao';
import { ModalFinanceira } from '@/components/modulos/orcamento/modal-financeira';
import { OrcamentoPagamentos } from '@/components/modulos/orcamento/orcamento-pagamentos';
import { FormaPagamento } from '@/types/orcamento';
import { useCalculadoraNegociacao, CalculadoraNegociacao } from '@/lib/calculadora-negociacao';
import { EditableMoneyField, EditablePercentField } from '@/components/ui';
import { useRedistribuicaoAutomatica } from '@/hooks/use-redistribuicao-automatica';
import { CalculationStatus } from '@/components/ui/calculation-status';

function OrcamentoPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // ✅ SISTEMA SIMPLIFICADO: Usar apenas useSessaoSimples (funcionava)
  const { cliente, ambientes, carregarClienteDaURL } = useSessaoSimples();
  
  // 🆕 INTEGRAÇÃO COM API: Hook para salvamento no banco
  const orcamentoApi = useOrcamentoIntegrado();
  
  // ✅ FORMAS DE PAGAMENTO: Sistema local (UI state)
  const {
    formasPagamento, modalFormasAberto, modalAVistaAberto, modalBoletoAberto,
    modalCartaoAberto, modalFinanceiraAberto, formaEditando,
    adicionarFormaPagamento, editarFormaPagamento, removerFormaPagamento,
    abrirModalFormas, fecharModalFormas, abrirModalEdicao, fecharModalEdicao
  } = useFormasPagamento();
  // ✅ ESTADOS LOCAIS SIMPLES
  const [desconto, setDesconto] = useState('');
  const [valorNegociadoManualReal, setValorNegociadoManualReal] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // 🆕 ESTADOS PARA SALVAMENTO
  const [isSaving, setIsSaving] = useState(false);
  const [savedOrcamentoId, setSavedOrcamentoId] = useState<string | null>(null);
  
  // 🆕 ESTADOS PARA EDIÇÃO BIDIRECIONAL
  const [isCalculating, setIsCalculating] = useState(false);
  const [ultimaEdicao, setUltimaEdicao] = useState<'desconto' | 'valorNegociado' | 'descontoReal' | null>(null);
  
  // 🆕 ESTADOS PARA FEEDBACK VISUAL SIMPLES
  const [lastOperation, setLastOperation] = useState<string>('');
  
  // ✅ CÁLCULOS HÍBRIDOS (manual + calculadora para debug)
  const valorTotal = ambientes.reduce((total, ambiente) => total + ambiente.valor, 0);
  const descontoNumero = parseFloat(desconto) || 0;
  
  // 🎯 VALOR NEGOCIADO VERDADEIRAMENTE MANUAL
  // Se usuário editou diretamente E não há formas de pagamento, usar valor manual
  // Senão, calcular baseado no desconto
  const valorNegociadoManual = (() => {
    if (valorNegociadoManualReal !== null && formasPagamento.length === 0) {
      console.log('💰 Usando valor manual editado pelo usuário:', valorNegociadoManualReal);
      return valorNegociadoManualReal;
    }
    const calculado = valorTotal * (1 - descontoNumero / 100);
    console.log('🧮 Usando valor calculado:', calculado, 'baseado em desconto:', descontoNumero);
    return calculado;
  })();
  
  // Usar calculadora para valores avançados (sempre chamar hook)
  const calculoNegociacao = useCalculadoraNegociacao(valorTotal, descontoNumero, formasPagamento);
  
  // 🆕 FASE 1: REDISTRIBUIÇÃO AUTOMÁTICA (MODO SEGURO)
  const redistribuicaoAutomatica = useRedistribuicaoAutomatica({
    valorTotal,
    descontoPercentual: descontoNumero,
    formasPagamento,
    onFormasChange: (novasFormas) => {
      // Atualizar formas através do hook existente (preserva compatibilidade)
      console.log('🔄 Redistribuição automática atualizando formas:', novasFormas.length);
      
      // Aplicar mudanças usando o sistema existente
      novasFormas.forEach(forma => {
        editarFormaPagamento(forma.id, { 
          valor: forma.valor,
          valorPresente: forma.valorPresente 
        });
      });
    },
    enabled: false // Redistribuição manual via botão "Atualizar"
  });
  
  // 🔄 FUNÇÃO ATUALIZAR: Redistribui valores de todas as formas
  const handleAtualizar = () => {
    console.log('🔄 Botão Atualizar clicado - redistribuindo pagamentos');
    
    if (formasPagamento.length === 0) {
      console.log('⚠️ Nenhuma forma de pagamento para redistribuir');
      return;
    }
    
    // Recalcular usando calculadora existente
    try {
      const resultado = CalculadoraNegociacao.calcular({
        valorTotal,
        descontoPercentual: descontoNumero,
        formasPagamento
      });
      
      console.log('✅ Redistribuição completa aplicada:', resultado.formasPagamento.length, 'formas');
      
      // Aplicar resultado usando hook existente
      resultado.formasPagamento.forEach(forma => {
        editarFormaPagamento(forma.id, {
          valor: forma.valor,
          valorPresente: forma.valorPresente
        });
      });
      
    } catch (error) {
      console.error('❌ Erro na redistribuição:', error);
    }
  };
  
  // Valores derivados (usar manual como fallback)
  const valorNegociadoBruto = calculoNegociacao?.valorNegociado || valorNegociadoManual;
  
  // 🎯 ARREDONDAMENTO INTELIGENTE PARA DISPLAY
  // Não arredondar se valor foi editado manualmente
  const valorNegociado = (() => {
    // 🎯 PRIORIDADE MÁXIMA: Se foi editado manualmente, usar EXATAMENTE o valor manual
    if (valorNegociadoManualReal !== null && formasPagamento.length === 0) {
      console.log('🎯 Forçando valor manual na interface:', valorNegociadoManualReal);
      return valorNegociadoManualReal; // Usar valor EXATO que usuário digitou
    }
    
    // Senão, aplicar arredondamento inteligente
    const diferenca = Math.abs(valorNegociadoBruto - Math.round(valorNegociadoBruto));
    if (diferenca < 50 && diferenca > 0) {
      console.log('🎯 Valor display arredondado:', valorNegociadoBruto.toFixed(2), '→', Math.round(valorNegociadoBruto));
      return Math.round(valorNegociadoBruto);
    }
    return valorNegociadoBruto;
  })();
  
  const valorPresenteTotal = calculoNegociacao?.valorPresenteTotal || 0;
  
  // CORREÇÃO: Quando não há formas de pagamento, desconto real = desconto percentual
  const descontoReal = formasPagamento.length === 0 
    ? descontoNumero  // Sem deflação, desconto real = desconto %
    : (calculoNegociacao?.descontoReal || 0);
  const valorTotalFormas = formasPagamento.reduce((total, forma) => total + forma.valor, 0);
  const valorRestante = valorNegociado - valorTotalFormas;
  
  // Debug logs
  console.log('🔍 Debug Orçamento:', {
    valorTotal,
    descontoNumero,
    valorNegociadoManual,
    valorNegociadoCalculadora: calculoNegociacao?.valorNegociado,
    calculoNegociacao
  });

  // ✅ CARREGAMENTO ULTRA ROBUSTO (anti-race conditions para dev/prod)
  useEffect(() => {
    const clienteId = searchParams.get('clienteId');
    const clienteNome = searchParams.get('clienteNome');
    
    console.log('🔍 [PAGE LOAD] Parâmetros da URL:', { clienteId, clienteNome });
    
    // Carregamento assíncrono para evitar race conditions
    const carregarDados = async () => {
      if (clienteId && clienteNome) {
        console.log('📥 [PAGE LOAD] Carregando cliente da URL...');
        
        // 🔒 DESENVOLVIMENTO vs PRODUÇÃO: Timeout diferente
        // Em desenvolvimento, React Strict Mode pode precisar de mais tempo
        const isDev = process.env.NODE_ENV === 'development';
        const timeoutInicializacao = isDev ? 200 : 50; // Mais tempo para dev
        
        console.log(`⏱️ [PAGE LOAD] Modo: ${isDev ? 'DEV' : 'PROD'}, timeout: ${timeoutInicializacao}ms`);
        
        // Aguardar inicialização completa do hook
        await new Promise(resolve => setTimeout(resolve, timeoutInicializacao));
        
        carregarClienteDaURL(clienteId, decodeURIComponent(clienteNome));
        
        // Aguardar sincronização antes de marcar como carregado
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setIsLoaded(true);
      console.log('✅ [PAGE LOAD] Carregamento concluído');
    };
    
    carregarDados();
  }, [searchParams, carregarClienteDaURL]);

  // 🆕 FUNÇÃO SALVAR ORÇAMENTO NO BANCO
  const handleSalvarOrcamento = async () => {
    if (!cliente || ambientes.length === 0) {
      alert('É necessário ter cliente e ambientes para salvar o orçamento.');
      return;
    }
    
    // TESTE: Permitir salvamento sem formas de pagamento temporariamente
    if (formasPagamento.length === 0) {
      console.log('⚠️ Salvando orçamento sem formas de pagamento (modo teste)');
    }

    setIsSaving(true);
    try {
      console.log('💾 Salvando orçamento no banco...', {
        cliente: cliente.nome,
        ambientes: ambientes.length,
        formas: formasPagamento.length,
        valorTotal,
        valorNegociado
      });

      // Passar dados diretamente para evitar problemas de sincronização do store
      console.log('🔄 Passando dados diretamente para a API...');

      // Salvar orçamento completo na API (passar todos os dados diretamente)
      const orcamentoSalvo = await orcamentoApi.salvarOrcamentoCompleto(formasPagamento, cliente, ambientes);
      
      if (orcamentoSalvo) {
        setSavedOrcamentoId(orcamentoSalvo.id);
        alert(`✅ Orçamento #${orcamentoSalvo.numero} salvo com sucesso no banco de dados!`);
        
        console.log('✅ Orçamento salvo:', {
          id: orcamentoSalvo.id,
          numero: orcamentoSalvo.numero,
          clienteId: orcamentoSalvo.cliente_id
        });
      }
    } catch (error) {
      console.error('❌ Erro ao salvar orçamento:', error);
      alert('Erro ao salvar orçamento. Verifique a conexão com o servidor.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // ✅ NAVEGAÇÃO OTIMIZADA (com verificação de estado)
  const navegarParaContratos = async () => {
    // Aguardar sincronização completa
    if (!isLoaded) {
      console.log('⏳ Aguardando carregamento completo...');
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('🚨 DEBUG: Tentativa de navegação para contratos', {
      isLoaded,
      temCliente: !!cliente,
      clienteNome: cliente?.nome,
      clienteId: cliente?.id,
      quantidadeAmbientes: ambientes.length,
      quantidadeFormasPagamento: formasPagamento.length,
      podeNavegar: !!(cliente && ambientes.length > 0 && formasPagamento.length > 0)
    });
    
    if (cliente && ambientes.length > 0 && formasPagamento.length > 0) {
      console.log('✅ Navegando para contratos');
      const url = `/painel/contratos?clienteId=${cliente?.id}&clienteNome=${encodeURIComponent(cliente?.nome || '')}`;
      console.log('🔗 URL de navegação:', url);
      
      // Garantir que a navegação aconteça no próximo tick
      setTimeout(() => {
        router.push(url);
      }, 50);
    } else {
      console.log('❌ Navegação bloqueada - requisitos não atendidos');
    }
  };
  
  // ✅ HANDLERS SIMPLES (como funcionavam)
  const handleFormaPagamentoAdicionada = (forma: { tipo: string; valor?: number; detalhes?: any }) => {
    console.log('📥 Forma de pagamento adicionada:', forma);
    
    // 🎯 RESETAR valor manual quando adiciona primeira forma de pagamento
    if (formasPagamento.length === 0 && valorNegociadoManualReal !== null) {
      console.log('🔄 Resetando valor manual - voltando para cálculo automático');
      setValorNegociadoManualReal(null);
    }
    
    const tipoMapeado = (() => {
      switch (forma.tipo) {
        case 'À Vista': return 'a-vista';
        case 'Boleto': return 'boleto';
        case 'Cartão': return 'cartao';
        case 'Financeira': return 'financeira';
        default: return 'a-vista';
      }
    })() as 'a-vista' | 'boleto' | 'cartao' | 'financeira';
    
    const novaForma = {
      tipo: tipoMapeado,
      valor: forma.valor || 0,
      valorPresente: forma.detalhes?.valorPresente || forma.valor || 0,
      parcelas: forma.detalhes?.vezes || forma.detalhes?.parcelas?.length || 1,
      dados: forma.detalhes
    };
    
    adicionarFormaPagamento(novaForma);
    fecharModalFormas();
  };

  const handleEditarForma = (forma: FormaPagamento) => {
    console.log('✏️ Editando forma:', forma);
    
    // Usar action do store para abrir modal de edição
    abrirModalEdicao(forma);
  };

  // Handler para atualizar forma existente
  const handleAtualizarForma = (dadosNovos: any, tipo: 'a-vista' | 'boleto' | 'cartao' | 'financeira') => {
    if (!formaEditando) return;

    console.log('📝 Atualizando forma:', { id: formaEditando.id, dadosNovos });
    
    // Criar dados atualizados
    const dadosAtualizados = {
      valor: dadosNovos.valor || 0,
      valorPresente: dadosNovos.valorPresente || dadosNovos.valor || 0,
      parcelas: dadosNovos.vezes || dadosNovos.parcelas?.length || 1,
      dados: dadosNovos
    };
    
    // Salvar dados normalmente (redistribuição manual via botão "Atualizar")
    editarFormaPagamento(formaEditando.id, dadosAtualizados);
    
    // Fechar modal de edição
    fecharModalEdicao();
  };

  const handleRemoverForma = (id: string) => {
    console.log('🟡️ Removendo forma:', id);
    
    // Remover usando action do store
    removerFormaPagamento(id);
    
    // 🎯 Se foi a última forma removida, permitir edição manual novamente
    if (formasPagamento.length === 1) { // Vai ficar 0 após remoção
      console.log('🔄 Última forma removida - permitindo edição manual novamente');
      // Não resetar o valorNegociadoManualReal aqui - deixar que usuário edite
    }
  };

  // ✅ HANDLER TRAVAMENTO (novo com calculadora)
  const handleToggleTravamento = (id: string) => {
    console.log('🔒 Togglando travamento da forma:', id);
    
    // Usar calculadora para alterar travamento
    const formasAtualizadas = CalculadoraNegociacao.toggleTravamento(formasPagamento, id);
    
    // Atualizar cada forma individualmente para manter compatibilidade
    const formaAtualizada = formasAtualizadas.find(f => f.id === id);
    if (formaAtualizada) {
      editarFormaPagamento(id, { travada: formaAtualizada.travada });
    }
  };

  // 🆕 HANDLER PARA MUDANÇAS NAS PARCELAS DA TABELA
  const handleParcelaChange = (formaId: string, numeroParcela: number, campo: 'valor' | 'data', novoValor: number | string) => {
    console.log('📝 Mudança na parcela:', { formaId, numeroParcela, campo, novoValor });
    
    const forma = formasPagamento.find(f => f.id === formaId);
    if (!forma) {
      console.error('❌ Forma não encontrada:', formaId);
      return;
    }

    // Apenas boleto é editável, mas vamos validar
    if (forma.tipo !== 'boleto') {
      console.warn('⚠️ Tentativa de editar forma não editável:', forma.tipo);
      return;
    }

    // Clonar dados atuais
    const dadosAtualizados = { ...forma.dados };
    
    // Garantir que existe array de parcelas
    if (!dadosAtualizados.parcelas || !Array.isArray(dadosAtualizados.parcelas)) {
      console.log('🔧 Criando array de parcelas para forma:', formaId);
      // Gerar parcelas baseado no valor atual
      const numParcelas = forma.parcelas || 1;
      const valorParcela = forma.valor / numParcelas;
      dadosAtualizados.parcelas = Array.from({ length: numParcelas }, (_, i) => ({
        numero: i + 1,
        data: new Date().toISOString().split('T')[0],
        valor: valorParcela
      }));
    }

    // Encontrar e atualizar a parcela específica
    const parcelaIndex = dadosAtualizados.parcelas.findIndex((p: any) => p.numero === numeroParcela);
    if (parcelaIndex === -1) {
      console.error('❌ Parcela não encontrada:', numeroParcela);
      return;
    }

    // Atualizar o campo específico com validações
    if (campo === 'valor') {
      let novoValorParcela = Number(novoValor);
      
      // Validar valor mínimo
      if (novoValorParcela < 0) {
        console.warn('⚠️ Valor não pode ser negativo');
        return;
      }
      
      // Garantir máximo 2 casas decimais (dupla validação)
      novoValorParcela = Math.round(novoValorParcela * 100) / 100;
      console.log('💰 Valor final com 2 casas decimais:', novoValorParcela);
      
      dadosAtualizados.parcelas[parcelaIndex].valor = novoValorParcela;
      
      // Recalcular valor total da forma
      const novoValorTotal = dadosAtualizados.parcelas.reduce((sum: number, p: any) => sum + p.valor, 0);
      
      // Validar se não excede valor negociado
      const valorOutrasFormas = formasPagamento
        .filter(f => f.id !== formaId)
        .reduce((sum, f) => sum + f.valor, 0);
      
      if (novoValorTotal + valorOutrasFormas > valorNegociado) {
        console.warn('⚠️ Valor total excederia o valor negociado');
        // Permitir mesmo assim, mas avisar
      }
      
      // Salvar dados normalmente (redistribuição manual via botão "Atualizar")
      editarFormaPagamento(formaId, {
        valor: novoValorTotal,
        valorPresente: novoValorTotal, // Para boleto, valor presente = valor nominal
        dados: dadosAtualizados
      });
      
      console.log('✅ Valor da parcela atualizado. Novo total:', novoValorTotal);
      
    } else if (campo === 'data') {
      const novaData = String(novoValor);
      
      // Validar formato de data (básico)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(novaData)) {
        console.warn('⚠️ Formato de data inválido');
        return;
      }
      
      // Validar se data não é no passado
      const hoje = new Date();
      const dataInformada = new Date(novaData);
      if (dataInformada < hoje) {
        console.warn('⚠️ Data não pode ser no passado');
        // Permitir mesmo assim para flexibilidade
      }
      
      dadosAtualizados.parcelas[parcelaIndex].data = novaData;
      
      // Atualizar apenas os dados (valor total não muda)
      editarFormaPagamento(formaId, {
        dados: dadosAtualizados
      });
      
      console.log('✅ Data da parcela atualizada:', novaData);
    }
  };

  // ✅ VALIDAÇÃO SIMPLES
  const obterValoresValidacao = () => ({
    valorMaximo: valorNegociado,
    valorJaAlocado: formaEditando ? 
      (valorTotalFormas - formaEditando.valor) : 
      valorTotalFormas
  });
  
  // ✅ HANDLER DESCONTO SIMPLES  
  const handleDescontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDesconto(e.target.value);
    setUltimaEdicao('desconto');
    
    // 🎯 RESETAR valor manual quando edita desconto (volta para cálculo automático)
    if (valorNegociadoManualReal !== null) {
      console.log('🔄 Resetando valor manual - usuário editou desconto');
      setValorNegociadoManualReal(null);
    }
  };

  // 🆕 HANDLERS BIDIRECIONAIS
  const handleValorNegociadoChange = (novoValor: number) => {
    if (isCalculating || ultimaEdicao === 'valorNegociado') return;
    
    // 🎯 COMPORTAMENTO SIMPLES SEM FORMAS DE PAGAMENTO
    if (formasPagamento.length === 0) {
      console.log('💰 Valor negociado editado manualmente (sem formas):', novoValor);
      console.log('📊 Estado atual:', {
        valorTotal,
        valorNegociadoManualRealAntes: valorNegociadoManualReal,
        formasPagamentoLength: formasPagamento.length
      });
      
      setValorNegociadoManualReal(novoValor);
      
      // Calcular desconto correspondente (apenas para exibição)
      const novoDescontoPercentual = ((valorTotal - novoValor) / valorTotal) * 100;
      const novoDescontoLimitado = Math.max(0, Math.min(50, novoDescontoPercentual));
      setDesconto(novoDescontoLimitado.toFixed(1));
      
      console.log('✅ Valor manual salvo:', novoValor, 'Desconto calculado:', novoDescontoLimitado);
      return; // Não fazer nenhum cálculo complexo
    }
    
    // 🧮 COMPORTAMENTO COMPLEXO COM FORMAS DE PAGAMENTO
    setIsCalculating(true);
    setUltimaEdicao('valorNegociado');
    setLastOperation('Calculando desconto percentual...');
    
    // Debounce para evitar cálculos excessivos
    setTimeout(() => {
      try {
        // Calcular novo desconto % baseado no valor negociado
        const novoDescontoPercentual = ((valorTotal - novoValor) / valorTotal) * 100;
        const novoDescontoLimitado = Math.max(0, Math.min(50, novoDescontoPercentual));
        
        // Atualizar desconto
        setDesconto(novoDescontoLimitado.toFixed(1));
        setLastOperation('Desconto atualizado automaticamente');
        
        // Campos atualizados via cálculo reverso
        
        console.log('💰 Valor Negociado alterado:', {
          novoValor,
          novoDescontoPercentual: novoDescontoLimitado,
          valorTotal
        });
        
      } catch (error) {
        console.error('❌ Erro ao calcular desconto:', error);
        setLastOperation('Erro no cálculo');
      } finally {
        setIsCalculating(false);
        // Reset após um tempo para permitir nova edição
        setTimeout(() => setUltimaEdicao(null), 500);
      }
    }, 300);
  };

  const handleDescontoRealChange = (novoDescontoReal: number) => {
    if (isCalculating || ultimaEdicao === 'descontoReal') return;
    
    setIsCalculating(true);
    setUltimaEdicao('descontoReal');
    setLastOperation('Calculando valor negociado ideal...');
    
    // Debounce para evitar cálculos excessivos
    setTimeout(() => {
      try {
        // CASO 1: SEM formas de pagamento (início da negociação)
        // Desconto Real = Desconto Percentual (sem deflação)
        if (formasPagamento.length === 0) {
          const novoDescontoPercentual = Math.max(0, Math.min(50, novoDescontoReal));
          
          setDesconto(novoDescontoPercentual.toString());
          // Desconto real aplicado
          
          setLastOperation('Desconto aplicado');
          setIsCalculating(false);
            setTimeout(() => setUltimaEdicao(null), 500);
          return;
        }
        
        // CASO 2: COM formas de pagamento (negociação avançada)
        // Calcular valor presente desejado
        const valorPresenteDesejado = valorTotal * (1 - novoDescontoReal / 100);
        setLastOperation('Otimizando distribuição...');
        
        // Algoritmo iterativo para encontrar valor negociado que resulte no valor presente desejado
        let valorNegociadoCalculado = valorPresenteDesejado;
        let tentativas = 0;
        const maxTentativas = 10;
        
        while (tentativas < maxTentativas) {
          // Simular cálculo completo com valor atual
          const estadoSimulado = {
            valorTotal,
            descontoPercentual: ((valorTotal - valorNegociadoCalculado) / valorTotal) * 100,
            formasPagamento
          };
          
          const resultadoSimulado = CalculadoraNegociacao.calcular(estadoSimulado);
          const valorPresenteSimulado = resultadoSimulado.valorPresenteTotal;
          
          // Se chegou próximo do desejado, parar
          const diferenca = Math.abs(valorPresenteSimulado - valorPresenteDesejado);
          if (diferenca < 10) break; // Tolerância de R$ 10
          
          // Ajustar valor negociado
          const fatorCorrecao = valorPresenteDesejado / (valorPresenteSimulado || 1);
          valorNegociadoCalculado *= fatorCorrecao;
          
          tentativas++;
        }
        
        // 🎯 ARREDONDAMENTO INTELIGENTE PARA VENDAS
        // Se diferença for pequena (< R$ 50), arredondar para valor mais limpo
        const diferencaValorNegociado = Math.abs(valorNegociadoCalculado - Math.round(valorNegociadoCalculado));
        
        let valorFinal = valorNegociadoCalculado;
        if (diferencaValorNegociado < 50) {
          valorFinal = Math.round(valorNegociadoCalculado);
          console.log('🎯 Valor arredondado para vendas:', valorNegociadoCalculado.toFixed(2), '→', valorFinal);
        }
        
        // Calcular desconto % correspondente
        const novoDescontoPercentual = CalculadoraNegociacao.calcularDescontoPercentual(valorTotal, valorFinal);
        const novoDescontoLimitado = Math.max(0, Math.min(50, novoDescontoPercentual));
        
        // Atualizar desconto
        setDesconto(novoDescontoLimitado.toFixed(1));
        setLastOperation(`Convergência alcançada em ${tentativas} iterações`);
        
        // Marcar campos alterados
        // Valores recalculados com base no desconto real
        
        console.log('📊 Desconto Real alterado:', {
          novoDescontoReal,
          valorPresenteDesejado,
          valorNegociadoCalculado,
          valorFinal,
          novoDescontoPercentual: novoDescontoLimitado,
          tentativas,
          arredondado: valorFinal !== valorNegociadoCalculado
        });
        
      } catch (error) {
        console.error('❌ Erro ao calcular valor negociado:', error);
        setLastOperation('Erro na otimização');
      } finally {
        setIsCalculating(false);
        // Reset após um tempo para permitir nova edição
        setTimeout(() => setUltimaEdicao(null), 500);
      }
    }, 300);
  };
  
  // Evitar hidration mismatch - mostrar loading até carregar
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header de Navegação */}
        <div className="bg-white border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/painel">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
              </Link>
              
              <p className="text-lg font-semibold">{cliente ? cliente.nome : 'Sem cliente'}</p>
            </div>
            
            {/* Botões de Ação */}
            <div className="flex items-center gap-3">
              {/* Botão Salvar Orçamento */}
              <Button
                onClick={handleSalvarOrcamento}
                disabled={!(cliente && ambientes.length > 0) || isSaving}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white touch-manipulation
                           focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
                aria-label="Salvar orçamento no banco de dados"
              >
                {isSaving ? (
                  <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : savedOrcamentoId ? (
                  <Database className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Save className="h-4 w-4" aria-hidden="true" />
                )}
                <span className="hidden sm:inline">
                  {isSaving ? 'Salvando...' : savedOrcamentoId ? 'Salvo' : 'Salvar'}
                </span>
                <span className="sm:hidden">
                  {isSaving ? '...' : savedOrcamentoId ? 'OK' : 'Save'}
                </span>
              </Button>

              {/* Botão Gerar Contrato */}
              <Button
                onClick={navegarParaContratos}
                disabled={!(cliente && ambientes.length > 0 && formasPagamento.length > 0)}
                className="gap-2 bg-green-600 hover:bg-green-700 text-white touch-manipulation
                           focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2"
                aria-label={
                  (cliente && ambientes.length > 0 && formasPagamento.length > 0) 
                    ? "Gerar contrato com as informações configuradas"
                    : "Configure cliente, ambientes e formas de pagamento primeiro"
                }
                aria-describedby="gerar-contrato-status"
              >
                {(cliente && ambientes.length > 0 && formasPagamento.length > 0) ? 
                  <CheckCircle className="h-4 w-4" aria-hidden="true" /> : 
                  <FileText className="h-4 w-4" aria-hidden="true" />
                }
                <span className="hidden sm:inline">
                  {(cliente && ambientes.length > 0 && formasPagamento.length > 0) ? 'Gerar Contrato' : 'Configure Pagamento'}
                </span>
                <span className="sm:hidden">
                  {(cliente && ambientes.length > 0 && formasPagamento.length > 0) ? 'Gerar' : 'Config'}
                </span>
              </Button>
            </div>
            
            {/* Status para screen readers */}
            <div id="gerar-contrato-status" className="sr-only">
              {!cliente && "Cliente não selecionado. "}
              {ambientes.length === 0 && "Nenhum ambiente adicionado. "}
              {formasPagamento.length === 0 && "Nenhuma forma de pagamento configurada. "}
              {cliente && ambientes.length > 0 && formasPagamento.length > 0 && "Pronto para gerar contrato."}
            </div>
          </div>
        </div>
        
        {/* Layout: 1/3 esquerda + 2/3 direita - com alinhamento superior */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Coluna esquerda (1/3) - Valor Total + Ambientes */}
          <div className="lg:col-span-1 flex flex-col order-2 lg:order-1">
            
            {/* Card Valor Total - altura dinâmica igual aos cards da direita */}
            <div className="flex-none h-auto lg:h-[88px] mb-6">
              <Card className="h-full">
                <CardContent className="p-4 h-full flex flex-col justify-between">
                  <h3 className="font-semibold text-sm sm:text-base">Valor Total</h3>
                  <p className="text-lg sm:text-2xl font-bold text-green-600 mt-2 lg:mt-0"
                     aria-label={`Valor total do orçamento: ${valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}>
                    R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Card Ambientes */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Ambientes</h3>
                
                <div className="flex justify-between border-b-2 pb-2 mb-2 font-semibold text-sm">
                  <span>Nome</span>
                  <span>Valor</span>
                </div>
                
                <div className="space-y-1">
                  {ambientes.length > 0 ? ambientes.map((ambiente) => (
                    <div key={ambiente.id} className="flex justify-between py-1 border-b">
                      <span className="font-medium">{ambiente.nome}</span>
                      <span className="text-green-600">
                        R$ {ambiente.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )) : (
                    <p className="text-gray-500 text-center py-4">Nenhum ambiente</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
          </div>

          {/* Coluna direita (2/3) - 3 Cards superiores + Plano de Pagamento */}
          <div className="lg:col-span-2 flex flex-col order-1 lg:order-2">
            
            {/* 3 Cards superiores - altura fixa igual ao Valor Total */}
            <div className="flex-none grid grid-cols-1 sm:grid-cols-3 gap-4 h-auto sm:h-[88px] mb-6 relative">
              
              
              {/* Card Desconto Real */}
              <div className="flex">
                <Card className="flex-1">
                  <CardContent className="p-4 h-full flex flex-col justify-between">
                    <h3 className="font-semibold text-sm sm:text-base">Desconto Real</h3>
                    <EditablePercentField
                      value={descontoReal}
                      onChange={handleDescontoRealChange}
                      isCalculating={isCalculating && ultimaEdicao !== 'descontoReal'}
                      tooltip="Clique para editar desconto real desejado"
                      className="justify-start mt-2 sm:mt-0"
                      maxValue={50}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Card Valor Negociado */}
              <div className="flex">
                <Card className="flex-1">
                  <CardContent className="p-4 h-full flex flex-col justify-between">
                    <h3 className="font-semibold text-sm sm:text-base">Valor Negociado</h3>
                    <EditableMoneyField
                      value={valorNegociado}
                      onChange={handleValorNegociadoChange}
                      isCalculating={isCalculating && ultimaEdicao !== 'valorNegociado'}
                      tooltip="Clique para editar valor final da negociação"
                      className="justify-start mt-2 sm:mt-0"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Card Valor Recebido */}
              <div className="flex">
                <Card className="flex-1">
                  <CardContent className="p-4 h-full flex flex-col justify-between">
                    <h3 className="font-semibold text-sm sm:text-base">Valor Recebido</h3>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                      <p className={`text-lg sm:text-2xl font-bold transition-colors duration-200 ${
                        isCalculating ? 'text-yellow-600' : 'text-green-600'
                      }`}
                      aria-label={`Valor que será recebido: ${valorPresenteTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}>
                        R$ {valorPresenteTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      {isCalculating && (
                        <div className="text-yellow-600 animate-pulse" aria-label="Calculando">
                          <Calculator className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
            </div>

            {/* Status de Cálculo - Temporariamente desabilitado */}
            {/* <CalculationStatus
              isCalculating={isCalculating}
              hasErrors={calculoNegociacao?.erros?.length > 0}
              lastOperation={lastOperation}
              className="mb-4"
            /> */}

            {/* 🆕 FASE 1: Status da redistribuição automática */}
            <CalculationStatus
              isCalculating={redistribuicaoAutomatica.isCalculating || isCalculating}
              hasErrors={false}
              lastOperation={
                redistribuicaoAutomatica.isCalculating 
                  ? "Redistribuindo automaticamente..." 
                  : lastOperation
              }
              className="mb-4"
            />

            {/* Componente Unificado de Pagamentos */}
            <OrcamentoPagamentos
              formasPagamento={formasPagamento}
              valorNegociado={valorNegociado}
              valorRestante={valorRestante}
              descontoPercentual={descontoNumero}
              onDescontoChange={handleDescontoChange}
              onAdicionarForma={abrirModalFormas}
              onEditarForma={handleEditarForma}
              onRemoverForma={handleRemoverForma}
              onToggleTravamento={handleToggleTravamento}
              onParcelaChange={handleParcelaChange}
              onAtualizar={handleAtualizar}
            />
            
          </div>
          
        </div>
        
        {/* Modal de Formas de Pagamento */}
        <ModalFormasPagamento
          isOpen={modalFormasAberto}
          onClose={fecharModalFormas}
          onFormaPagamentoAdicionada={handleFormaPagamentoAdicionada}
          {...obterValoresValidacao()}
        />

        {/* Modais específicos para edição */}
        <ModalAVista
          isOpen={modalAVistaAberto}
          onClose={fecharModalEdicao}
          onSalvar={(dados) => {
            console.log('📝 Editando À Vista:', dados);
            handleAtualizarForma(dados, 'a-vista');
          }}
          dadosIniciais={formaEditando?.tipo === 'a-vista' ? {
            valor: formaEditando.valor,
            data: formaEditando.dados?.data
          } : undefined}
          {...obterValoresValidacao()}
        />

        <ModalBoleto
          isOpen={modalBoletoAberto}
          onClose={fecharModalEdicao}
          onSalvar={(dados) => {
            console.log('📝 Editando Boleto:', dados);
            handleAtualizarForma(dados, 'boleto');
          }}
          dadosIniciais={formaEditando?.tipo === 'boleto' ? {
            valor: formaEditando.valor,
            parcelas: formaEditando.dados?.parcelas
          } : undefined}
          {...obterValoresValidacao()}
        />

        <ModalCartao
          isOpen={modalCartaoAberto}
          onClose={fecharModalEdicao}
          onSalvar={(dados) => {
            console.log('📝 Editando Cartão:', dados);
            handleAtualizarForma(dados, 'cartao');
          }}
          dadosIniciais={formaEditando?.tipo === 'cartao' ? {
            valor: formaEditando.valor,
            vezes: formaEditando.parcelas,
            taxa: formaEditando.dados?.taxa
          } : undefined}
          {...obterValoresValidacao()}
        />

        <ModalFinanceira
          isOpen={modalFinanceiraAberto}
          onClose={fecharModalEdicao}
          onSalvar={(dados) => {
            console.log('📝 Editando Financeira:', dados);
            handleAtualizarForma(dados, 'financeira');
          }}
          dadosIniciais={formaEditando?.tipo === 'financeira' ? {
            valor: formaEditando.valor,
            vezes: formaEditando.parcelas,
            percentual: formaEditando.dados?.percentual,
            parcelas: formaEditando.dados?.parcelas
          } : undefined}
          {...obterValoresValidacao()}
        />
        
      </div>
    </div>
  );
}

export default function OrcamentoPage() {
  return (
    <Suspense fallback={<div className="p-6">Carregando orçamento...</div>}>
      <OrcamentoPageContent />
    </Suspense>
  );
}