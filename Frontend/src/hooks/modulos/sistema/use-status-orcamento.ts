import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import type { StatusOrcamento, StatusOrcamentoFormData } from '@/types/sistema';
import { apiClient } from '@/services/api-client';

export function useStatusOrcamento() {
  const [statusList, setStatusList] = useState<StatusOrcamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Estado de expansão da tabela
  const toggleRowExpansion = useCallback((id: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  }, [expandedRows]);

  // Função para numeração sequencial
  const getStatusNumero = useCallback((index: number) => {
    return String(index + 1).padStart(3, '0');
  }, []);

  // Validar dados do status
  const validarStatus = useCallback((dados: StatusOrcamentoFormData): string[] => {
    const erros: string[] = [];

    if (!dados.nome || dados.nome.trim().length < 2) {
      erros.push('Nome do status deve ter pelo menos 2 caracteres');
    }

    if (dados.ordem < 0) {
      erros.push('Ordem deve ser maior ou igual a zero');
    }

    if (dados.cor && !dados.cor.match(/^#[0-9A-Fa-f]{6}$/)) {
      erros.push('Cor deve estar no formato hexadecimal (#RRGGBB)');
    }

    return erros;
  }, []);

  // Verificar duplicidade de nome
  const verificarNomeDuplicado = useCallback((nome: string, statusId?: string): boolean => {
    return statusList.some(status => 
      status.nome.toLowerCase() === nome.toLowerCase() && 
      status.id !== statusId
    );
  }, [statusList]);

  // Carregar status do backend
  const carregarStatus = useCallback(async () => {
    setLoading(true);
    
    try {
      const response = await apiClient.listarStatusOrcamento(true);
      
      if (response.success && response.data) {
        setStatusList(response.data.items || []);
      } else {
        toast.error(response.error || 'Erro ao carregar status');
      }
    } catch (error) {
      console.error('Erro ao carregar status:', error);
      toast.error('Erro ao carregar status');
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar novo status
  const criarStatus = useCallback(async (dados: StatusOrcamentoFormData): Promise<boolean> => {
    setLoading(true);
    
    try {
      const erros = validarStatus(dados);
      
      if (verificarNomeDuplicado(dados.nome)) {
        erros.push('Nome do status já cadastrado');
      }

      if (erros.length > 0) {
        erros.forEach(erro => toast.error(erro));
        return false;
      }

      // Sempre criar status como ativo
      const dadosCompletos = { ...dados, ativo: true };
      const response = await apiClient.criarStatusOrcamento(dadosCompletos);
      
      if (response.success && response.data) {
        setStatusList(prev => [...prev, response.data as StatusOrcamento]);
        toast.success('Status criado com sucesso!');
        return true;
      } else {
        toast.error(response.error || 'Erro ao criar status');
        return false;
      }

    } catch (error) {
      console.error('Erro ao criar status:', error);
      toast.error('Erro ao criar status');
      return false;
    } finally {
      setLoading(false);
    }
  }, [validarStatus, verificarNomeDuplicado]);

  // Atualizar status
  const atualizarStatus = useCallback(async (id: string, dados: Partial<StatusOrcamentoFormData>): Promise<boolean> => {
    setLoading(true);
    
    try {
      if (dados.nome) {
        const erros = validarStatus(dados as StatusOrcamentoFormData);
        
        if (verificarNomeDuplicado(dados.nome, id)) {
          erros.push('Nome do status já cadastrado');
        }

        if (erros.length > 0) {
          erros.forEach(erro => toast.error(erro));
          return false;
        }
      }

      const response = await apiClient.atualizarStatusOrcamento(id, dados);
      
      if (response.success && response.data) {
        setStatusList(prev => prev.map(status => 
          status.id === id ? response.data as StatusOrcamento : status
        ));
        toast.success('Status atualizado com sucesso!');
        return true;
      } else {
        toast.error(response.error || 'Erro ao atualizar status');
        return false;
      }

    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
      return false;
    } finally {
      setLoading(false);
    }
  }, [validarStatus, verificarNomeDuplicado]);

  // Excluir status
  const excluirStatus = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      const response = await apiClient.excluirStatusOrcamento(id);
      
      if (response.success) {
        setStatusList(prev => prev.filter(s => s.id !== id));
        toast.success('Status excluído com sucesso!');
        return true;
      } else {
        toast.error(response.error || 'Erro ao excluir status');
        return false;
      }

    } catch (error) {
      console.error('Erro ao excluir status:', error);
      toast.error('Erro ao excluir status');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);


  // Obter status ativos
  const obterStatusAtivos = useCallback((): StatusOrcamento[] => {
    return statusList.filter(status => status.ativo);
  }, [statusList]);

  // Obter status por ID
  const obterStatusPorId = useCallback((id: string): StatusOrcamento | undefined => {
    return statusList.find(status => status.id === id);
  }, [statusList]);

  // Buscar status
  const buscarStatus = useCallback((termo: string): StatusOrcamento[] => {
    if (!termo.trim()) return statusList;
    
    const termoBusca = termo.toLowerCase().trim();
    return statusList.filter(status =>
      status.nome.toLowerCase().includes(termoBusca) ||
      (status.descricao && status.descricao.toLowerCase().includes(termoBusca))
    );
  }, [statusList]);


  // Carregar dados na inicialização
  useEffect(() => {
    carregarStatus();
  }, [carregarStatus]);

  return {
    statusList,
    loading,
    expandedRows,
    toggleRowExpansion,
    getStatusNumero,
    criarStatus,
    atualizarStatus,
    excluirStatus,
    obterStatusAtivos,
    obterStatusPorId,
    buscarStatus,
    carregarStatus
  };
}