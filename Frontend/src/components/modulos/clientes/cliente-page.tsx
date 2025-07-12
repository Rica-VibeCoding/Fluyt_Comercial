import React, { useState, useMemo } from 'react';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { ClienteHeader } from './cliente-header';
import { ClienteFiltrosModerno } from './cliente-filtros-moderno';
import { ClienteTabela } from './cliente-tabela';
import { ClienteModal } from './cliente-modal';
import { useClientesApi } from '../../../hooks/modulos/clientes/use-clientes-api';
import { useStatusOrcamento } from '../../../hooks/modulos/sistema/use-status-orcamento';
import { Cliente } from '../../../types/cliente';
import { Wifi } from 'lucide-react';

// Valores iniciais para um novo cliente (formulário limpo)
const VALORES_INICIAIS_NOVO_CLIENTE = {
  nome: '',
  cpf_cnpj: '',
  rg_ie: '',
  email: '',
  telefone: '',
  tipo_venda: 'NORMAL' as const,
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: '' as const,
  procedencia_id: '',
  vendedor_id: '',
  observacoes: '',
};

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
    carregarClientes,
    erro
  } = useClientesApi();
  
  const { statusList } = useStatusOrcamento();
  
  const [modalAberto, setModalAberto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleNovoCliente = () => {
    setClienteEditando(null);
    setModalAberto(true);
  };

  const handleEditarCliente = (cliente: Cliente) => {
    setClienteEditando(cliente);
    setModalAberto(true);
  };

  const handleFecharModal = () => {
    setModalAberto(false);
    // Um pequeno delay para a animação do modal terminar antes de limpar o estado
    setTimeout(() => {
      setClienteEditando(null);
    }, 150);
  };

  const handleSalvarCliente = async (dados: any) => {
    setIsSaving(true);
    try {
      if (clienteEditando) {
        await atualizarCliente(clienteEditando.id, dados);
      } else {
        await adicionarCliente(dados, statusList);
      }
      handleFecharModal();
    } catch (error) {
      console.error('Erro ao salvar cliente', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExclusaoSimples = async (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return;

    const confirmacao = window.confirm(`Tem certeza que deseja excluir o cliente "${cliente.nome}"?`);
    
    if (confirmacao) {
      try {
        await removerCliente(clienteId);
      } catch (error) {
        console.error('Erro durante exclusão', error);
      }
    }
  };

  // Prepara os valores para o modal.
  // Isso é recalculado sempre que o cliente para edição muda.
  const valoresIniciaisModal = useMemo(() => {
    if (!clienteEditando) {
      return VALORES_INICIAIS_NOVO_CLIENTE;
    }
    // Mapeia o objeto cliente para os campos do formulário
    return {
      nome: clienteEditando.nome,
      cpf_cnpj: clienteEditando.cpf_cnpj || '',
      rg_ie: clienteEditando.rg_ie || '',
      email: clienteEditando.email || '',
      telefone: clienteEditando.telefone || '',
      tipo_venda: clienteEditando.tipo_venda,
      cep: clienteEditando.cep || '',
      logradouro: clienteEditando.logradouro || '',
      numero: clienteEditando.numero || '',
      complemento: clienteEditando.complemento || '',
      bairro: clienteEditando.bairro || '',
      cidade: clienteEditando.cidade || '',
      uf: clienteEditando.uf || '',
      procedencia_id: clienteEditando.procedencia_id || '',
      vendedor_id: clienteEditando.vendedor_id || '',
      observacoes: clienteEditando.observacoes || '',
    };
  }, [clienteEditando]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {isInitialized && (
          <div className="flex justify-end">
            <Badge variant="default" className="flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              Sistema Carregado
            </Badge>
          </div>
        )}
        
        <ClienteHeader 
          totalClientes={totalClientes}
          onNovoCliente={handleNovoCliente}
        />
        
        <ClienteFiltrosModerno 
          filtros={filtros}
          onFiltrosChange={setFiltros}
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

        {/* 
          O modal só é renderizado se estiver aberto.
          A propriedade "key" é a MUDANÇA CRUCIAL. 
          Quando a key muda (de um ID de cliente para outro, ou para "novo"),
          o React DESTRÓI o componente antigo e CRIA UM NOVO do zero.
          Isso garante que não haja estado "preso" entre aberturas.
        */}
        {modalAberto && (
          <ClienteModal
            key={clienteEditando?.id || 'novo'}
            aberto={modalAberto}
            onFechar={handleFecharModal}
            valoresIniciais={valoresIniciaisModal}
            vendedores={vendedores}
            onSalvar={handleSalvarCliente}
            isLoading={isSaving}
            isEditMode={!!clienteEditando}
          />
        )}
      </div>
    </div>
  );
}