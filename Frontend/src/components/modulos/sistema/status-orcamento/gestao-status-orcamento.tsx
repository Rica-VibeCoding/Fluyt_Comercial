import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Target, Search } from 'lucide-react';
import { useStatusOrcamento } from '@/hooks/modulos/sistema/use-status-orcamento';
import { StatusOrcamentoTable } from './status-orcamento-table';
import { StatusOrcamentoForm } from './status-orcamento-form';
import type { StatusOrcamento, StatusOrcamentoFormData } from '@/types/sistema';

export function GestaoStatusOrcamento() {
  const {
    statusList,
    loading,
    criarStatus,
    atualizarStatus,
    excluirStatus,
    buscarStatus
  } = useStatusOrcamento();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<StatusOrcamento | null>(null);
  const [termoBusca, setTermoBusca] = useState('');

  // Filtrar status baseado na busca
  const statusFiltrados = termoBusca ? buscarStatus(termoBusca) : statusList;

  const handleCreate = () => {
    setEditingStatus(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (status: StatusOrcamento) => {
    setEditingStatus(status);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await excluirStatus(id);
  };

  const handleSubmit = async (data: StatusOrcamentoFormData): Promise<boolean> => {
    let sucesso = false;
    
    if (editingStatus) {
      sucesso = await atualizarStatus(editingStatus.id, data);
    } else {
      sucesso = await criarStatus(data);
    }

    if (sucesso) {
      setIsDialogOpen(false);
      setEditingStatus(null);
    }

    return sucesso;
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingStatus(null);
  };

  return (
    <div className="space-y-3">
      {/* Header de Ações - Buscador + Novo Status na mesma linha */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        {/* Buscador */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar status por nome ou descrição..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="pl-10 h-10 border-gray-200 focus:border-slate-400 focus:ring-slate-400 bg-white shadow-sm"
          />
        </div>

        {/* Botão Novo Status */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleCreate} 
              className="gap-2 h-10 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              Novo Status
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingStatus ? 'Editar Status' : 'Novo Status'}
              </DialogTitle>
            </DialogHeader>
            <StatusOrcamentoForm
              initialData={editingStatus}
              onSubmit={handleSubmit}
              onCancel={handleCloseDialog}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela */}
      <StatusOrcamentoTable
        statusList={statusFiltrados}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />
    </div>
  );
}