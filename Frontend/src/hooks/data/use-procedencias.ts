import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/services/api-client';
import { useToast } from '@/hooks/globais/use-toast';
import type { Procedencia, ProcedenciaFormData } from '@/types/sistema';

/**
 * Hook consolidado para gerenciar procedências
 * 
 * Funcionalidades:
 * - Carregar procedências (com fallback)
 * - CRUD completo (criar, atualizar, excluir)
 * - Busca por termo e por ID
 * - Estados de loading e erro
 * - Estatísticas básicas
 */
export function useProcedencias() {
  const [procedencias, setProcedencias] = useState<Procedencia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  // Carregar procedências (principal)
  const carregarProcedencias = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Usa endpoint público que está funcionando
      const response = await apiClient.buscarProcedencias();
      
      if (response.success && response.data) {
        // O endpoint público retorna array direto
        const procedenciasData = Array.isArray(response.data) ? response.data : response.data.data || [];
        setProcedencias(procedenciasData);
        console.log('✅ Procedências carregadas:', procedenciasData.length);
      } else {
        throw new Error(response.error || 'Erro ao carregar procedências');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Erro ao carregar procedências';
      setError(errorMsg);
      console.error('❌ Erro ao carregar procedências:', errorMsg);
      
      // Fallback com procedências padrão
      setProcedencias([
        { id: 'temp-1', nome: 'Indicação', ativo: true, descricao: 'Cliente veio por indicação', created_at: new Date().toISOString(), updated_at: null },
        { id: 'temp-2', nome: 'Google', ativo: true, descricao: 'Cliente encontrou via Google', created_at: new Date().toISOString(), updated_at: null },
        { id: 'temp-3', nome: 'WhatsApp', ativo: true, descricao: 'Cliente veio via WhatsApp', created_at: new Date().toISOString(), updated_at: null },
        { id: 'temp-4', nome: 'Instagram', ativo: true, descricao: 'Cliente veio via Instagram', created_at: new Date().toISOString(), updated_at: null },
        { id: 'temp-5', nome: 'Porta', ativo: true, descricao: 'Cliente veio direto na loja', created_at: new Date().toISOString(), updated_at: null },
        { id: 'temp-6', nome: 'Outros', ativo: true, descricao: 'Outras formas de contato', created_at: new Date().toISOString(), updated_at: null }
      ]);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, []);

  // Carregar na inicialização
  useEffect(() => {
    carregarProcedencias();
  }, [carregarProcedencias]);

  // Criar procedência
  const criarProcedencia = useCallback(async (dados: ProcedenciaFormData): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiClient.criarProcedencia(dados);
      
      if (response.success && response.data) {
        await carregarProcedencias(); // Recarregar lista
        
        toast({
          title: "Procedência criada",
          description: `${dados.nome} foi adicionada com sucesso.`
        });
        
        return true;
      } else {
        throw new Error(response.error || 'Erro ao criar procedência');
      }
    } catch (error) {
      console.error('Erro ao criar procedência:', error);
      toast({
        title: "Erro ao criar procedência",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [carregarProcedencias, toast]);

  // Atualizar procedência
  const atualizarProcedencia = useCallback(async (id: string, dados: Partial<ProcedenciaFormData>): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiClient.atualizarProcedencia(id, dados);
      
      if (response.success && response.data) {
        await carregarProcedencias(); // Recarregar lista
        
        toast({
          title: "Procedência atualizada",
          description: "Alterações salvas com sucesso."
        });
        
        return true;
      } else {
        throw new Error(response.error || 'Erro ao atualizar procedência');
      }
    } catch (error) {
      console.error('Erro ao atualizar procedência:', error);
      toast({
        title: "Erro ao atualizar procedência",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [carregarProcedencias, toast]);

  // Excluir procedência (soft delete)
  const excluirProcedencia = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiClient.excluirProcedencia(id);
      
      if (response.success) {
        await carregarProcedencias(); // Recarregar lista
        
        toast({
          title: "Procedência removida",
          description: "Procedência foi removida com sucesso."
        });
        
        return true;
      } else {
        throw new Error(response.error || 'Erro ao remover procedência');
      }
    } catch (error) {
      console.error('Erro ao excluir procedência:', error);
      toast({
        title: "Erro ao remover procedência",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [carregarProcedencias, toast]);

  // Buscar procedências por termo
  const buscarProcedencias = useCallback((termo: string): Procedencia[] => {
    if (!termo.trim()) return procedencias;
    
    const termoLower = termo.toLowerCase().trim();
    return procedencias.filter(procedencia =>
      procedencia.nome.toLowerCase().includes(termoLower)
    );
  }, [procedencias]);

  // Buscar procedência por ID
  const buscarProcedenciaPorId = useCallback(async (id: string): Promise<Procedencia | null> => {
    try {
      const response = await apiClient.buscarProcedenciaPorId(id);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Procedência não encontrada');
      }
    } catch (error) {
      console.error('Erro ao buscar procedência:', error);
      toast({
        title: "Erro ao buscar procedência",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  // Estatísticas
  const estatisticas = {
    total: procedencias.length,
    ativas: procedencias.filter(p => p.ativo).length,
    inativas: procedencias.filter(p => !p.ativo).length
  };

  return {
    // Estados
    procedencias,
    isLoading,
    error,
    isInitialized,
    estatisticas,

    // Ações CRUD
    carregarProcedencias,
    criarProcedencia,
    atualizarProcedencia,
    excluirProcedencia,

    // Busca
    buscarProcedencias,
    buscarProcedenciaPorId,

    // Compatibilidade com hook antigo
    procedenciasAtivas: procedencias.filter(p => p.ativo)
  };
} 