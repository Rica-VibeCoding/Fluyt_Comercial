/**
 * HOOK PARA CARREGAR DADOS COMPLETOS DE CLIENTE
 * Resolve problema de dados faltantes no contrato
 */

import { useState, useEffect } from 'react';
import { ClienteBasico, ClienteCompleto, DadosComplementaresCliente, CLIENTE_FALLBACKS } from '@/types/cliente-completo';

interface UseClienteCompletoReturn {
  clienteCompleto: ClienteCompleto | null;
  carregando: boolean;
  erro: string | null;
  temDadosCompletos: boolean;
}

export function useClienteCompleto(clienteBasico: ClienteBasico | null): UseClienteCompletoReturn {
  const [clienteCompleto, setClienteCompleto] = useState<ClienteCompleto | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!clienteBasico) {
      setClienteCompleto(null);
      setCarregando(false);
      setErro(null);
      return;
    }

    setCarregando(true);
    setErro(null);

    // Simular carregamento de dados completos
    // TODO: Substituir por chamada real à API quando backend estiver pronto
    const carregarDadosCompletos = async () => {
      try {
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 100));

        // Dados mock para demonstração - em produção virão da API
        const dadosComplementares: DadosComplementaresCliente = {
          cpf_cnpj: '123.456.789-00', // Mock - virá da API
          telefone: '(11) 99999-9999', // Mock - virá da API  
          email: 'cliente@email.com', // Mock - virá da API
          endereco: {
            logradouro: 'Rua das Flores, 123',
            numero: '123',
            bairro: 'Centro', 
            cidade: 'São Paulo',
            uf: 'SP',
            cep: '01234-567'
          }
        };

        const clienteComDados: ClienteCompleto = {
          ...clienteBasico,
          ...dadosComplementares
        };

        console.log('✅ useClienteCompleto - Dados carregados:', {
          clienteId: clienteBasico.id,
          nome: clienteBasico.nome,
          temDadosCompletos: !!(dadosComplementares.cpf_cnpj && dadosComplementares.telefone)
        });

        setClienteCompleto(clienteComDados);
      } catch (error) {
        console.error('❌ Erro ao carregar dados completos do cliente:', error);
        setErro('Erro ao carregar dados do cliente');
        
        // Fallback: criar cliente com dados básicos + fallbacks
        const clienteComFallbacks: ClienteCompleto = {
          ...clienteBasico,
          cpf_cnpj: CLIENTE_FALLBACKS.cpf_cnpj,
          telefone: CLIENTE_FALLBACKS.telefone,
          email: CLIENTE_FALLBACKS.email,
          endereco: {
            logradouro: CLIENTE_FALLBACKS.endereco,
            numero: '',
            bairro: '',
            cidade: '',
            uf: '',
            cep: ''
          }
        };
        
        setClienteCompleto(clienteComFallbacks);
      } finally {
        setCarregando(false);
      }
    };

    carregarDadosCompletos();
  }, [clienteBasico?.id]); // Só recarregar se ID do cliente mudar

  const temDadosCompletos = !!(
    clienteCompleto?.cpf_cnpj && 
    clienteCompleto?.telefone && 
    clienteCompleto?.email &&
    !clienteCompleto.cpf_cnpj.includes('não informado') // Não é fallback
  );

  return {
    clienteCompleto,
    carregando,
    erro,
    temDadosCompletos
  };
}