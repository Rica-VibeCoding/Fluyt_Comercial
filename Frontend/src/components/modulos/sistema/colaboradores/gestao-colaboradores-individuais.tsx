"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, AlertCircle, Search, UserPlus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ColaboradorTable } from './colaborador-table';
import { ColaboradorForm } from './colaborador-form';
import { useTiposColaboradores } from '@/hooks/modulos/sistema/use-tipos-colaboradores';
import { useColaboradores } from '@/hooks/modulos/sistema/use-colaboradores';
import { Colaborador, ColaboradorFormData } from '@/types/colaboradores';

export function GestaoColaboradoresIndividuais() {
  const { tipos: tiposColaboradores } = useTiposColaboradores();
  const {
    colaboradores,
    isLoading,
    error,
    createColaborador,
    updateColaborador,
    deleteColaborador
  } = useColaboradores(tiposColaboradores);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingColaborador, setEditingColaborador] = useState<Colaborador | undefined>();
  const [termoBusca, setTermoBusca] = useState('');

  // Filtrar colaboradores baseado na busca
  const colaboradoresFiltrados = termoBusca 
    ? colaboradores.filter(colaborador => 
        colaborador.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
        colaborador.email?.toLowerCase().includes(termoBusca.toLowerCase()) ||
        colaborador.tipoColaborador?.nome.toLowerCase().includes(termoBusca.toLowerCase())
      )
    : colaboradores;

  const handleCreate = () => {
    setEditingColaborador(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (colaborador: Colaborador) => {
    setEditingColaborador(colaborador);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: ColaboradorFormData) => {
    try {
      if (editingColaborador) {
        await updateColaborador(editingColaborador.id, data);
      } else {
        await createColaborador(data);
      }
      setIsFormOpen(false);
      setEditingColaborador(undefined);
    } catch (error) {
      // Erro já tratado no hook
      console.error('Erro ao salvar colaborador:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este colaborador?')) {
      try {
        await deleteColaborador(id);
      } catch (error) {
        console.error('Erro ao excluir colaborador:', error);
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Header de Ações - Padrão da seção Pessoas */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        {/* Buscador */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar colaboradores por nome, email ou tipo..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="pl-10 h-10 border-gray-200 focus:border-slate-400 focus:ring-slate-400 bg-white shadow-sm"
          />
        </div>

        {/* Botão Novo Colaborador */}
        <Button
          onClick={handleCreate}
          disabled={isLoading || tiposColaboradores.length === 0}
          className="gap-1.5 h-8 px-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg font-medium text-white text-xs"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Novo Colaborador
        </Button>
      </div>

      {/* Alertas */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {tiposColaboradores.length === 0 && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            É necessário cadastrar pelo menos um tipo de colaborador antes de adicionar colaboradores individuais.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabela */}
      <ColaboradorTable
        colaboradores={colaboradoresFiltrados}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal do Formulário */}
      <ColaboradorForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingColaborador(undefined);
        }}
        onSubmit={handleFormSubmit}
        editingColaborador={editingColaborador}
        tiposColaboradores={tiposColaboradores}
        isLoading={isLoading}
      />
    </div>
  );
} 