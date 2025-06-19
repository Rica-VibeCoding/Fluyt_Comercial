import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Cliente } from '@/types/cliente';
import { ClienteStore } from '@/lib/store/cliente-store';

export const useClienteSelecionadoRealista = () => {
  const searchParams = useSearchParams();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Obter parâmetros de forma segura
  let clienteId = null;
  let clienteNome = null;
  
  try {
    if (isHydrated) {
      clienteId = searchParams.get('clienteId');
      clienteNome = searchParams.get('clienteNome');
    }
  } catch (error) {
    console.warn('⚠️ SearchParams não disponível durante SSR');
  }

  // Garantir hidratação no cliente
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const carregarCliente = async () => {
      if (!isHydrated) {
        return; // Não fazer nada se não hidratou ainda
      }
      
      // Proteger contra SSR - só processar se searchParams estiver disponível
      let clienteIdAtual = null;
      let clienteNomeAtual = null;
      
      try {
        clienteIdAtual = searchParams.get('clienteId');
        clienteNomeAtual = searchParams.get('clienteNome');
      } catch (error) {
        console.warn('⚠️ SearchParams não disponível durante SSR');
        return;
      }
      
      if (!clienteIdAtual) {
        // MUDANÇA: Só limpar se não temos ID E não temos cliente atual
        // Isso preserva o cliente quando a URL perde os parâmetros
        if (cliente) {
          console.log('🛡️ useClienteSelecionadoRealista: sem clienteId mas mantendo cliente atual:', cliente.nome);
          return; // Manter cliente atual
        } else {
          console.log('🧹 useClienteSelecionadoRealista: sem clienteId e sem cliente, limpando');
          setCliente(null);
          return;
        }
      }

      setIsLoading(true);
      console.log('🔍 useClienteSelecionadoRealista carregando ID:', clienteIdAtual);
      
      try {
        const clienteCarregado = await ClienteStore.buscarPorId(clienteIdAtual);
        
        if (clienteCarregado) {
          console.log('✅ useClienteSelecionadoRealista definindo cliente:', {
            id: clienteCarregado.id,
            nome: clienteCarregado.nome
          });
          setCliente(clienteCarregado);
        } else {
          console.warn('⚠️ Cliente não encontrado no store, ID:', clienteIdAtual);
          
          // Fallback: criar objeto mínimo se temos o nome na URL
          if (clienteNomeAtual) {
            const clienteFallback: Cliente = {
              id: clienteIdAtual,
              nome: decodeURIComponent(clienteNomeAtual),
              cpf_cnpj: '',
              rg_ie: '',
              email: '',
              telefone: '',
              tipo_venda: 'NORMAL',
              procedencia: '',
              vendedor_id: '',
              vendedor_nome: '',
              cep: '',
              logradouro: '',
              numero: '',
              bairro: '',
              cidade: '',
              uf: '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            console.log('🔄 Usando fallback para cliente:', clienteFallback.nome);
            setCliente(clienteFallback);
          } else {
            setCliente(null);
          }
        }
      } catch (error) {
        console.error('❌ Erro ao carregar cliente:', error);
        setCliente(null);
      } finally {
        setIsLoading(false);
      }
    };

    carregarCliente();
  }, [isHydrated]); // Remover dependências de searchParams para evitar SSR issues

  return {
    clienteId,
    clienteNome: clienteNome ? decodeURIComponent(clienteNome) : null,
    cliente,
    clienteSelecionado: cliente, // Compatibilidade com código existente
    temClienteSelecionado: !!cliente && isHydrated,
    isLoading: isLoading || !isHydrated
  };
};