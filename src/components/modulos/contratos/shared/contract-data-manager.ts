import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSessaoSimples } from '../../../../hooks/globais/use-sessao-simples';
import { contratoMock, ContratoData } from '../../../../types/contrato';
// ✅ CORREÇÃO FASE 1: Importar tipos e hook para cliente completo
import { useClienteCompleto } from '../../../../hooks/use-cliente-completo';
import { formatarEnderecoCliente, CLIENTE_FALLBACKS } from '../../../../types/cliente-completo';

// Hook para gerenciamento de dados do contrato
export function useContractDataManager() {
  const searchParams = useSearchParams();
  const { 
    cliente, 
    ambientes, 
    valorTotal,
    carregarClienteDaURL 
  } = useSessaoSimples();
  
  // ✅ CORREÇÃO FASE 1: Usar hook para dados completos do cliente
  const { clienteCompleto, carregando: carregandoCliente, temDadosCompletos } = useClienteCompleto(cliente);
  
  const [contratoData, setContratoData] = useState<ContratoData>(contratoMock);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ PADRÃO QUE FUNCIONA: Carregar dados da URL (igual ambiente-page.tsx)
  useEffect(() => {
    const clienteId = searchParams.get('clienteId');
    const clienteNome = searchParams.get('clienteNome');
    
    console.log('🔍 ContractDataManager - Verificando URL:', { clienteId, clienteNome, temCliente: !!cliente });
    
    if (clienteId && clienteNome && !cliente) {
      console.log('📥 Carregando cliente da URL...');
      setIsLoading(true);
      carregarClienteDaURL(clienteId, decodeURIComponent(clienteNome));
    }
  }, [searchParams, cliente, carregarClienteDaURL]);

  // ✅ CONTROLE DE LOADING BASEADO EM DADOS REAIS
  useEffect(() => {
    if (cliente) {
      setIsLoading(false);
    }
  }, [cliente]);

  // ✅ SINCRONIZAÇÃO DIRETA SEM DELAY (igual padrão que funciona)
  useEffect(() => {
    console.log('🔍 ContractDataManager - Sincronizando dados da sessão:', {
      temCliente: !!cliente,
      clienteNome: cliente?.nome || 'null',
      quantidadeAmbientes: ambientes.length,
      valorTotal,
      clienteCompleto: !!clienteCompleto
    });

    // ✅ CORREÇÃO FASE 1: Usar clienteCompleto ao invés de cliente básico
    if (clienteCompleto && ambientes.length > 0) {
      // Usar desconto padrão do mock (10%) por enquanto
      const descontoParaUsar = contratoMock.desconto;
      
      console.log('💰 ContractDataManager - Atualizando contrato:', {
        descontoUsado: descontoParaUsar,
        origem: 'MOCK (10%)',
        percentualFinal: (descontoParaUsar * 100).toFixed(1) + '%',
        clienteCompleto: !!clienteCompleto,
        temDadosCompletos
      });
      
      setContratoData(prev => ({
        ...prev,
        cliente: {
          nome: clienteCompleto.nome,
          cpf: clienteCompleto.cpf_cnpj || CLIENTE_FALLBACKS.cpf_cnpj,
          endereco: formatarEnderecoCliente(clienteCompleto),
          telefone: clienteCompleto.telefone || CLIENTE_FALLBACKS.telefone,
          email: clienteCompleto.email || CLIENTE_FALLBACKS.email
        },
        valor_total: valorTotal,
        desconto: descontoParaUsar,
        valor_final: valorTotal * (1 - descontoParaUsar),
        // ✅ CORREÇÃO FASE 1: Corrigir mapeamento de ambientes (valorTotal → valor)
        ambientes: ambientes.map(ambiente => ({
          nome: ambiente.nome,
          categoria: 'Ambiente',
          descricao: `Ambiente personalizado`, // Removido acesso a .acabamentos inexistente
          valor: ambiente.valorTotal || ambiente.valor || 0 // Fallback para ambas as propriedades
        }))
      }));
    } else {
      // Log quando não há dados suficientes
      console.log('⚠️ ContractDataManager - Dados insuficientes:', {
        temCliente: !!cliente,
        quantidadeAmbientes: ambientes.length,
        valorTotal,
        clienteIdURL: searchParams.get('clienteId')
      });
    }
  }, [clienteCompleto, ambientes, valorTotal]);

  // Função para atualizar campos do contrato
  const updateField = useCallback((path: string, value: string | number) => {
    setContratoData(prev => {
      const keys = path.split('.');
      const newData = { ...prev };
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  }, []);

  // Função para atualizar status do contrato
  const updateStatus = useCallback((newStatus: ContratoData['status']) => {
    console.log('📝 ContractDataManager - Atualizando status:', newStatus);
    setContratoData(prev => ({
      ...prev,
      status: newStatus
    }));
  }, []);

  return {
    contratoData,
    setContratoData,
    updateField,
    updateStatus,
    isLoading
  };
}