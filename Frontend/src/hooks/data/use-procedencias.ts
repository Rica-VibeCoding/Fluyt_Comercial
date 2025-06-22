import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api-client';
import { logConfig } from '@/lib/config';

export interface Procedencia {
  id: string;
  nome: string;
  ativo: boolean;
}

export function useProcedencias() {
  const [procedencias, setProcedencias] = useState<Procedencia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const carregarProcedencias = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await apiClient.buscarProcedencias();
        
        if (response.success && response.data) {
          setProcedencias(response.data);
          logConfig('✅ Procedências carregadas:', response.data.length);
        } else {
          throw new Error(response.error || 'Erro ao carregar procedências');
        }
      } catch (err: any) {
        const errorMsg = err.message || 'Erro ao carregar procedências';
        setError(errorMsg);
        logConfig('❌ Erro ao carregar procedências:', errorMsg);
        
        // Se falhar, usar procedências padrão como fallback
        setProcedencias([
          { id: 'temp-1', nome: 'Indicação Amigo', ativo: true },
          { id: 'temp-2', nome: 'Facebook', ativo: true },
          { id: 'temp-3', nome: 'Google', ativo: true },
          { id: 'temp-4', nome: 'Site', ativo: true },
          { id: 'temp-5', nome: 'WhatsApp', ativo: true },
          { id: 'temp-6', nome: 'Loja Física', ativo: true },
          { id: 'temp-7', nome: 'Outros', ativo: true }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    carregarProcedencias();
  }, []);

  return {
    procedencias,
    isLoading,
    error
  };
} 