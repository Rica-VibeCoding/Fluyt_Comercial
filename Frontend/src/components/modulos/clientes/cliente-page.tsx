import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { ClienteHeader } from './cliente-header';
import { ClienteFiltrosModerno } from './cliente-filtros-moderno';
import { ClienteTabela } from './cliente-tabela';
import { ClienteModal } from './cliente-modal';
// import { ClienteDeleteModal } from './cliente-delete-modal'; // REMOVIDO - usando hard delete simples
import { useClientesApi } from '../../../hooks/modulos/clientes/use-clientes-api';
import { useStatusOrcamento } from '../../../hooks/modulos/sistema/use-status-orcamento';
import { Cliente } from '../../../types/cliente';
import { Wifi, WifiOff } from 'lucide-react';

export function ClientePage() {
  const {
    clientes,
    vendedores,
    filtros,
    setFiltros,
    isLoading,
    adicionarCliente,
    atualizarCliente,
    removerCliente,
    totalClientes,
    isInitialized,
    carregarClientes, // Adicionado carregarClientes do hook
    erro
  } = useClientesApi();
  
  const { statusList } = useStatusOrcamento();
  
  const [modalAberto, setModalAberto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [isSaving, setIsSaving] = useState(false); // Estado de salvamento local


  // ============= SISTEMA DE DEBUG MELHORADO =============
  const debugLog = (acao: string, dados?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`🏠 [ClientePage] ${timestamp} - ${acao}`, dados ? dados : '');
  };

  // Log de mudanças de estado críticas
  React.useEffect(() => {
    debugLog('Estado atualizado', {
      isLoading,
      isInitialized,
      totalClientes: clientes.length,
      hasCarregarClientes: !!carregarClientes
    });
  }, [isLoading, clientes.length, isInitialized, carregarClientes]);

  // Debug inicial
  React.useEffect(() => {
    debugLog('ClientePage montado', {
      hookFunctions: {
        adicionarCliente: !!adicionarCliente,
        atualizarCliente: !!atualizarCliente,
        removerCliente: !!removerCliente,
        carregarClientes: !!carregarClientes
      }
    });
  }, []);

  // ============= REMOVIDO LISTENER GLOBAL PROBLEMÁTICO =============
  // O listener global de cliques estava causando duplicação de eventos
  // e travamento do frontend. Debug suficiente pelos componentes individuais.

  const handleNovoCliente = () => {
    debugLog('➕ handleNovoCliente chamado');
    setClienteEditando(null);
    setModalAberto(true);
    debugLog('➕ Modal de novo cliente aberto');
  };

  const handleEditarCliente = (cliente: Cliente) => {
    debugLog('✏️ handleEditarCliente chamado', { clienteId: cliente.id });
    setClienteEditando(cliente);
    setModalAberto(true);
    debugLog('✏️ Modal de edição aberto');
  };

  const handleSalvarCliente = async (dados: any) => {
    debugLog('💾 handleSalvarCliente chamado', { editando: !!clienteEditando });
    setIsSaving(true); // Ativa o estado de salvamento
    try {
      if (clienteEditando) {
        await atualizarCliente(clienteEditando.id, dados);
        debugLog('✅ Cliente atualizado com sucesso');
      } else {
        const vendedor = vendedores.find(v => v.id === dados.vendedor_id);
        await adicionarCliente({
          ...dados,
          vendedor_nome: vendedor?.nome || ''
        }, statusList);
        debugLog('✅ Cliente adicionado com sucesso');
      }
      setModalAberto(false);
      setClienteEditando(null);
    } catch (error) {
      debugLog('❌ Erro ao salvar cliente', error);
    } finally {
      setIsSaving(false); // Garante que o estado de salvamento seja desativado
    }
  };

  // ============= EXCLUSÃO SIMPLES SEM MODAL =============
  const handleExclusaoSimples = async (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) {
      debugLog('❌ Cliente não encontrado para exclusão', { clienteId });
      return;
    }

    // Confirmação simples do navegador
    const confirmacao = window.confirm(`Tem certeza que deseja excluir o cliente "${cliente.nome}"?\n\nEsta ação não pode ser desfeita.`);
    
    if (confirmacao) {
      debugLog('🔥 Excluindo cliente diretamente', { clienteId, nome: cliente.nome });
      try {
        const sucesso = await removerCliente(clienteId);
        
        if (sucesso) {
          debugLog('✅ Cliente excluído com sucesso, recarregando lista');
          // Recarregar lista para atualizar interface se função existir
          if (carregarClientes) {
            await carregarClientes();
          }
        } else {
          debugLog('❌ Falha na exclusão do cliente');
        }
      } catch (error) {
        debugLog('❌ Erro durante exclusão', error);
      }
    }
  };

  // Debug de renderização
  debugLog('Renderizando ClientePage', {
    clientesCount: clientes.length,
    isLoading,
    isInitialized,
    modalAberto
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Indicador de Conectividade */}
        {isInitialized && (
          <div className="flex justify-end">
            <Badge 
              variant="default"
              className="flex items-center gap-1"
            >
              <Wifi className="h-3 w-3" />
              Sistema Carregado
            </Badge>
          </div>
        )}
        
        <ClienteHeader 
          totalClientes={totalClientes}
          onNovoCliente={() => {
            debugLog('🎯 Botão Novo Cliente clicado no header');
            handleNovoCliente();
          }}
        />
        
        <ClienteFiltrosModerno 
          filtros={filtros}
          onFiltrosChange={(novosFiltros) => {
            debugLog('🔍 Filtros alterados', novosFiltros);
            setFiltros(novosFiltros);
          }}
          vendedores={vendedores}
        />
        
        <Card className="shadow-md border-0 bg-white dark:bg-slate-800">
          <ClienteTabela 
            clientes={clientes}
            isLoading={isLoading}
            onEditarCliente={handleEditarCliente}
            onRemoverCliente={handleExclusaoSimples}
          />
        </Card>

        <ClienteModal
          aberto={modalAberto}
          onFechar={() => {
            debugLog('❌ Modal fechado');
            setModalAberto(false);
            setClienteEditando(null);
            setIsSaving(false); // Garante que o estado de salvamento seja resetado ao fechar
          }}
          cliente={clienteEditando}
          vendedores={vendedores}
          onSalvar={handleSalvarCliente}
          isLoading={isSaving} // Usa o estado de salvamento local
        />

        {/* Modal de exclusão removido - usando hard delete simples */}
      </div>
    </div>
  );
}