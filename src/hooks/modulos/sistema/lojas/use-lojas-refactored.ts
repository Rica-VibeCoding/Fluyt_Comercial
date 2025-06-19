import { useState } from 'react';
import { useLocalStorage } from '@/hooks/globais/use-local-storage';
import { useEmpresas } from '../use-empresas';
import { useLojaValidation } from './use-loja-validation';
import { useLojaUtils } from './use-loja-utils';
import { useLojaCrud } from './use-loja-crud';
import { useLojaFilters } from './use-loja-filters';
import { mockLojas } from './mock-data';
import type { Loja } from '@/types/sistema';

// Hook principal refatorado para gestão de lojas
export function useLojas() {
  // Estados
  const [lojas, setLojas] = useLocalStorage<Loja[]>('lojas', mockLojas);
  const [loading, setLoading] = useState(false);

  // Hooks especializados
  const { obterEmpresaPorId } = useEmpresas();
  const validation = useLojaValidation();
  const utils = useLojaUtils(lojas);
  const crud = useLojaCrud(lojas, setLojas, setLoading, obterEmpresaPorId);
  const filters = useLojaFilters(lojas);

  return {
    // Estados
    lojas,
    loading,
    
    // Validação
    ...validation,
    
    // Utilitários
    ...utils,
    
    // CRUD
    ...crud,
    
    // Filtros
    ...filters
  };
}