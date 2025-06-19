import { useState } from 'react';
import { Card } from '../../ui/card';
import { ClienteHeader } from './cliente-header';
import { ClienteFiltrosModerno } from './cliente-filtros-moderno';
import { ClienteTabela } from './cliente-tabela';
import { ClienteModal } from './cliente-modal';
import { useClientes } from '../../../hooks/modulos/clientes/use-clientes';
import { Cliente } from '../../../types/cliente';

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
    totalClientes
  } = useClientes();

  const [modalAberto, setModalAberto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);

  const handleNovoCliente = () => {
    setClienteEditando(null);
    setModalAberto(true);
  };

  const handleEditarCliente = (cliente: Cliente) => {
    setClienteEditando(cliente);
    setModalAberto(true);
  };

  const handleSalvarCliente = async (dados: any) => {
    if (clienteEditando) {
      await atualizarCliente(clienteEditando.id, dados);
    } else {
      const vendedor = vendedores.find(v => v.id === dados.vendedor_id);
      await adicionarCliente({
        ...dados,
        vendedor_nome: vendedor?.nome || ''
      });
    }
    setModalAberto(false);
    setClienteEditando(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
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
            onRemoverCliente={removerCliente}
          />
        </Card>

        <ClienteModal
          aberto={modalAberto}
          onFechar={() => {
            setModalAberto(false);
            setClienteEditando(null);
          }}
          cliente={clienteEditando}
          vendedores={vendedores}
          onSalvar={handleSalvarCliente}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}