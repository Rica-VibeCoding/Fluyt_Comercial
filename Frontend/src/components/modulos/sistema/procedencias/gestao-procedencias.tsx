import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { useProcedencias } from '@/hooks/data/use-procedencias';
import { ProcedenciaTable } from './procedencia-table';
import { ProcedenciaForm } from './procedencia-form';
import type { Procedencia, ProcedenciaFormData } from '@/types/sistema';

export function GestaoProcedencias() {
  const {
    procedencias,
    loading,
    criarProcedencia,
    atualizarProcedencia,
    excluirProcedencia,
    buscarProcedencias
  } = useProcedencias();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProcedencia, setEditingProcedencia] = useState<Procedencia | null>(null);
  const [termoBusca, setTermoBusca] = useState('');

  // Filtrar procedências baseado na busca
  const procedenciasFiltradas = termoBusca ? buscarProcedencias(termoBusca) : procedencias;

  const handleCreate = () => {
    setEditingProcedencia(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (procedencia: Procedencia) => {
    setEditingProcedencia(procedencia);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await excluirProcedencia(id);
  };

  const handleSubmit = async (data: ProcedenciaFormData): Promise<boolean> => {
    let sucesso = false;
    
    if (editingProcedencia) {
      sucesso = await atualizarProcedencia(editingProcedencia.id, data);
    } else {
      sucesso = await criarProcedencia(data);
    }

    if (sucesso) {
      setIsDialogOpen(false);
      setEditingProcedencia(null);
    }

    return sucesso;
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProcedencia(null);
  };

  return (
    <div className="space-y-3">
      {/* Header de Ações - Buscador + Nova Procedência na mesma linha */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        {/* Buscador */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar procedência por nome..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="pl-10 h-10 border-gray-200 focus:border-slate-400 focus:ring-slate-400 bg-white shadow-sm"
          />
        </div>

        {/* Botão Nova Procedência */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleCreate} 
              className="gap-2 h-10 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              Nova Procedência
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingProcedencia ? 'Editar Procedência' : 'Nova Procedência'}
              </DialogTitle>
            </DialogHeader>
            <ProcedenciaForm
              initialData={editingProcedencia}
              onSubmit={handleSubmit}
              onCancel={handleCloseDialog}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela */}
      <ProcedenciaTable
        procedencias={procedenciasFiltradas}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />
    </div>
  );
}