import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api-client';
import { useEmpresas } from '../use-empresas';
import { useLojaValidation } from './use-loja-validation';
import { useLojaUtils } from './use-loja-utils';
import { useLojaCrud } from './use-loja-crud';
import { useLojaFilters } from './use-loja-filters';
import type { Loja } from '@/types/sistema';

// Hook principal refatorado para gestão de lojas - USANDO API REAL
export function useLojas() {
  // Estados - SEM MOCK, APENAS API REAL
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loading, setLoading] = useState(false);

  // Hooks especializados
  const { obterEmpresaPorId } = useEmpresas();
  const validation = useLojaValidation();
  const utils = useLojaUtils(lojas);
  const crud = useLojaCrud(lojas, setLojas, setLoading, obterEmpresaPorId);
  const filters = useLojaFilters(lojas);

  // Carregar dados da API real na inicialização
  useEffect(() => {
    const carregarLojas = async () => {
      setLoading(true);
      try {
        const response = await apiClient.listarLojas();
        if (response.success && response.data) {
          setLojas(response.data.items || []);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar lojas da API:', error);
        // NÃO usar mock como fallback - deixar vazio para mostrar erro
        setLojas([]);
      } finally {
        setLoading(false);
      }
    };
    
    carregarLojas();
  }, []);

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