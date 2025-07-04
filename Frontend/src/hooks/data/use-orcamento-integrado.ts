/**
 * Hook integrado para orçamentos
 * Combina store local com API backend
 */

import { useCallback } from 'react';
import { useOrcamento } from './use-orcamento';
import { useOrcamentoApi } from './use-orcamento-api';
import { orcamentoService } from '@/services/orcamento-service';
import type { FormaPagamento } from '@/types/orcamento';
import type { FormaPagamentoCreatePayload } from '@/services/orcamento-service';

export const useOrcamentoIntegrado = () => {
  // Hooks base
  const store = useOrcamento();
  const api = useOrcamentoApi();

  // ========== MÉTODOS DE SALVAMENTO ==========

  const salvarOrcamento = useCallback(async (clienteExterno?: any, ambientesExternos?: any[]) => {
    // Usar dados externos se fornecidos, senão usar do store
    const clienteParaUsar = clienteExterno || store.cliente;
    const ambientesParaUsar = ambientesExternos || store.ambientes;
    
    // Debug: verificar estado dos dados
    console.log('🔍 Estado dos dados no salvarOrcamento:', {
      cliente: clienteParaUsar?.nome || 'null',
      ambientes: ambientesParaUsar?.length || 0,
      valorTotal: store.valorTotal,
      loading: store.loading,
      fonte: clienteExterno ? 'externo' : 'store'
    });

    if (!clienteParaUsar || !ambientesParaUsar?.length) {
      console.error('❌ Validação falhou:', {
        temCliente: !!clienteParaUsar,
        clienteNome: clienteParaUsar?.nome,
        quantidadeAmbientes: ambientesParaUsar?.length || 0
      });
      throw new Error('Cliente e ambientes são obrigatórios');
    }

    // Converter dados para formato do backend
    const valorTotal = ambientesParaUsar.reduce((total: number, ambiente: any) => total + (ambiente.valor || 0), 0);
    
    console.log('📦 Preparando payload para backend:', {
      clienteId: clienteParaUsar.id,
      valorTotal,
      quantidadeAmbientes: ambientesParaUsar.length
    });
    
    // Gerar UUIDs temporários válidos para campos obrigatórios
    const generateUUID = () => '00000000-0000-4000-8000-000000000000';
    
    const payload = orcamentoService.converterFrontendParaBackend({
      clienteId: clienteParaUsar.id,
      lojaId: generateUUID(), // UUID temporário válido
      vendedorId: generateUUID(), // UUID temporário válido  
      valorAmbientes: valorTotal,
      descontoPercentual: store.descontoPercentual || 0,
      valorFinal: valorTotal,
      observacoes: 'Orçamento criado via frontend - loja e vendedor temporários',
    });
    
    console.log('📤 Payload final:', payload);

    // Criar orçamento no backend
    const orcamento = await api.criarOrcamento(payload);
    
    if (!orcamento) {
      throw new Error('Falha ao criar orçamento');
    }

    return orcamento;
  }, [store, api]);

  const salvarFormasPagamento = useCallback(async (orcamentoId: string, formasPagamento: any[] = []) => {
    // Usar formas passadas como parâmetro ou do store como fallback
    const formasParaSalvar = formasPagamento.length > 0 ? formasPagamento : store.formasPagamento.filter(forma => !forma.id.startsWith('temp-'));

    const resultados = [];

    for (const forma of formasParaSalvar) {
      const payload: FormaPagamentoCreatePayload = {
        orcamento_id: orcamentoId,
        tipo: forma.tipo,
        valor: forma.valor,
        valor_presente: forma.valorPresente,
        parcelas: forma.parcelas || 1,
        dados: forma.dados,
        travada: forma.travada || false,
      };

      const resultado = await api.criarFormaPagamento(payload);
      if (resultado) {
        resultados.push(resultado);
      }
    }

    return resultados;
  }, [store.formasPagamento, api]);

  const salvarOrcamentoCompleto = useCallback(async (formasPagamentoExternas?: any[], clienteExterno?: any, ambientesExternos?: any[]) => {
    try {
      store.setLoading(true);

      // 1. Criar orçamento principal (passando dados externos)
      const orcamento = await salvarOrcamento(clienteExterno, ambientesExternos);
      
      // 2. Salvar formas de pagamento (usar externas se fornecidas)
      const formasParaSalvar = formasPagamentoExternas || store.formasPagamento;
      if (formasParaSalvar.length > 0) {
        await salvarFormasPagamento(orcamento.id, formasParaSalvar);
      }

      // 3. Limpar store após salvamento
      // store.limparTudo(); // Descomente se quiser limpar após salvar

      return orcamento;
    } catch (error) {
      console.error('❌ Erro ao salvar orçamento completo:', error);
      throw error;
    } finally {
      store.setLoading(false);
    }
  }, [salvarOrcamento, salvarFormasPagamento, store]);

  // ========== MÉTODOS DE CARREGAMENTO ==========

  const carregarOrcamento = useCallback(async (id: string) => {
    try {
      store.setLoading(true);

      // Buscar orçamento do backend
      const orcamento = await api.buscarOrcamento(id);
      
      if (!orcamento) {
        throw new Error('Orçamento não encontrado');
      }

      // Converter e carregar no store
      const orcamentoFrontend = orcamentoService.converterOrcamentoParaFrontend(orcamento);

      // Definir cliente (simplificado)
      if (orcamento.cliente) {
        store.definirCliente({
          id: orcamento.cliente.id,
          nome: orcamento.cliente.nome,
        });
      }

      // Definir ambientes (se existirem)
      // TODO: implementar quando tiver relacionamento com ambientes

      // Definir desconto
      store.definirDesconto(orcamentoFrontend.descontoPercentual);

      // Carregar formas de pagamento no store
      if (orcamento.formas_pagamento) {
        const formasConvertidas = orcamento.formas_pagamento.map(forma => 
          orcamentoService.converterFormaPagamentoParaFrontend(forma)
        );
        
        // TODO: implementar método para definir formas no store
        // store.definirFormasPagamento(formasConvertidas);
      }

      return orcamentoFrontend;
    } catch (error) {
      console.error('❌ Erro ao carregar orçamento:', error);
      throw error;
    } finally {
      store.setLoading(false);
    }
  }, [api, store, orcamentoService]);

  // ========== MÉTODOS DE STATUS ==========

  const carregarStatus = useCallback(async () => {
    return await api.listarStatus(true);
  }, [api]);

  // ========== VALIDAÇÕES ==========

  const podeSerSalvo = useCallback(() => {
    return store.podeGerarOrcamento() && !api.loading;
  }, [store, api.loading]);

  const temDadosParaContrato = useCallback(() => {
    return store.podeGerarContrato() && store.formasPagamento.length > 0;
  }, [store]);

  return {
    // Estados combinados
    loading: store.loading || api.loading,
    error: store.erro || api.error,
    
    // Dados do store
    cliente: store.cliente,
    ambientes: store.ambientes,
    formasPagamento: store.formasPagamento,
    valorTotal: store.valorTotal,
    valorTotalFormas: store.valorTotalFormas,
    valorPresenteTotal: store.valorPresenteTotal,
    valorRestante: store.valorRestante,
    descontoPercentual: store.descontoPercentual,
    valorNegociado: store.valorNegociado,

    // Ações do store
    definirCliente: store.definirCliente,
    definirAmbientes: store.definirAmbientes,
    definirDesconto: store.definirDesconto,
    limparTudo: store.limparTudo,

    // Métodos de API
    listarOrcamentos: api.listarOrcamentos,
    carregarOrcamento,
    salvarOrcamento,
    salvarFormasPagamento,
    salvarOrcamentoCompleto,
    
    // Métodos de status
    carregarStatus,
    listarStatus: api.listarStatus,

    // Validações combinadas
    podeGerarOrcamento: store.podeGerarOrcamento,
    podeGerarContrato: store.podeGerarContrato,
    podeSerSalvo,
    temDadosParaContrato,

    // Utilitários
    limparError: () => {
      store.setErro(null);
      api.limparError();
    },

    // Debug
    debug: store.debug,
    debugApi: {
      loading: api.loading,
      error: api.error,
    }
  };
};