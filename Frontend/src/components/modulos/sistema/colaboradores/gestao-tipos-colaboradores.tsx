"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TipoColaboradorTable } from './tipo-colaborador-table';
import { TipoColaboradorForm } from './tipo-colaborador-form';
import { useTiposColaboradores } from '@/hooks/modulos/sistema/use-tipos-colaboradores';
import { TipoColaborador, TipoColaboradorFormData } from '@/types/colaboradores';

export function GestaoTiposColaboradores() {
  const {
    tipos,
    isLoading,
    error,
    createTipo,
    updateTipo,
    deleteTipo
  } = useTiposColaboradores();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoColaborador | undefined>();

  const handleCreate = () => {
    setEditingTipo(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (tipo: TipoColaborador) => {
    setEditingTipo(tipo);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: TipoColaboradorFormData) => {
    try {
      if (editingTipo) {
        await updateTipo(editingTipo.id, data);
      } else {
        await createTipo(data);
      }
      setIsFormOpen(false);
      setEditingTipo(undefined);
    } catch (error) {
      // Erro já tratado no hook
      console.error('Erro ao salvar tipo:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este tipo de colaborador?')) {
      try {
        await deleteTipo(id);
      } catch (error) {
        console.error('Erro ao excluir tipo:', error);
      }
    }
  };

  return (
    <div className="space-y-3">
      <Card className="shadow-md border-0 bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Tipos de Colaboradores</h3>
              <p className="text-sm text-gray-600 mt-1">
                Configure regras de remuneração para cada tipo de colaborador
              </p>
            </div>
            <Button
              onClick={handleCreate}
              disabled={isLoading}
              className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-xl font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Tipo
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <TipoColaboradorTable
            tipos={tipos}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <TipoColaboradorForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTipo(undefined);
        }}
        onSubmit={handleFormSubmit}
        editingTipo={editingTipo}
        isLoading={isLoading}
      />
    </div>
  );
} 