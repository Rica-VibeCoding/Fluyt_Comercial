import { useCallback } from 'react';
import { toast } from 'sonner';
import type { Loja, LojaFormData } from '@/types/sistema';
import { apiClient } from '@/services/api-client';

// Hook especializado para operações CRUD de lojas
export function useLojaCrud(
  lojas: Loja[],
  setLojas: (lojas: Loja[]) => void,
  setLoading: (loading: boolean) => void,
  obterEmpresaPorId: (id: string) => any
) {
  // Validação simples apenas para nome obrigatório
  const validarLoja = (dados: LojaFormData): boolean => {
    if (!dados.nome || dados.nome.trim().length < 2) {
      toast.error('Nome da loja é obrigatório (mínimo 2 caracteres)');
      return false;
    }
    return true;
  };

  // Criar loja
  const criarLoja = useCallback(async (dados: LojaFormData): Promise<boolean> => {
    setLoading(true);
    
    try {
      if (!validarLoja(dados)) {
        setLoading(false);
        return false;
      }

      // Chamar API real do backend
      const response = await apiClient.criarLoja({
        nome: dados.nome,
        endereco: dados.endereco,
        telefone: dados.telefone,
        email: dados.email,
        empresa_id: dados.empresa_id,
        gerente_id: dados.gerente_id
      });

      if (response.success && response.data) {
        // Converter resposta do backend para formato frontend
        const novaLoja: Loja = {
          id: response.data.id,
          nome: response.data.nome,
          endereco: response.data.endereco,
          telefone: response.data.telefone,
          email: response.data.email,
          empresa_id: response.data.empresa_id,
          gerente_id: response.data.gerente_id,
          ativo: response.data.ativo,
          createdAt: response.data.created_at,
          updatedAt: response.data.updated_at,
          empresa: response.data.empresa,
          gerente: response.data.gerente,
        };

        setLojas([...lojas, novaLoja]);
        toast.success('Loja criada com sucesso!');
        return true;
      } else {
        toast.error(response.error || 'Erro ao criar loja');
        return false;
      }
    } catch (error) {
      console.error('Erro ao criar loja:', error);
      toast.error('Erro ao criar loja');
      return false;
    } finally {
      setLoading(false);
    }
  }, [lojas, setLojas, setLoading]);

  // Editar loja
  const editarLoja = useCallback(async (id: string, dados: LojaFormData): Promise<boolean> => {
    setLoading(true);
    
    try {
      if (!validarLoja(dados)) {
        setLoading(false);
        return false;
      }

      // Chamar API real do backend
      const response = await apiClient.atualizarLoja(id, {
        nome: dados.nome,
        endereco: dados.endereco,
        telefone: dados.telefone,
        email: dados.email,
        empresa_id: dados.empresa_id,
        gerente_id: dados.gerente_id
      });

      if (response.success && response.data) {
        // Atualizar lista local com dados do backend
        setLojas(lojas.map(loja => 
          loja.id === id 
            ? { 
                ...loja, 
                nome: response.data.nome,
                endereco: response.data.endereco,
                telefone: response.data.telefone,
                email: response.data.email,
                empresa_id: response.data.empresa_id,
                gerente_id: response.data.gerente_id,
                ativo: response.data.ativo,
                updated_at: response.data.updated_at,
                empresa: response.data.empresa,
                gerente: response.data.gerente,
              }
            : loja
        ));
        
        toast.success('Loja atualizada com sucesso!');
        return true;
      } else {
        toast.error(response.error || 'Erro ao atualizar loja');
        return false;
      }
    } catch (error) {
      console.error('Erro ao editar loja:', error);
      toast.error('Erro ao editar loja');
      return false;
    } finally {
      setLoading(false);
    }
  }, [lojas, setLojas, setLoading]);

  // Excluir loja
  const excluirLoja = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Chamar API real do backend
      const response = await apiClient.excluirLoja(id);
      
      if (response.success) {
        // Remover da lista local
        setLojas(lojas.filter(loja => loja.id !== id));
        toast.success('Loja excluída com sucesso!');
        return true;
      } else {
        toast.error(response.error || 'Erro ao excluir loja');
        return false;
      }
    } catch (error) {
      console.error('Erro ao excluir loja:', error);
      toast.error('Erro ao excluir loja');
      return false;
    } finally {
      setLoading(false);
    }
  }, [lojas, setLojas, setLoading]);

  // Alternar status da loja
  const alternarStatusLoja = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      const loja = lojas.find(l => l.id === id);
      if (!loja) {
        toast.error('Loja não encontrada');
        setLoading(false);
        return false;
      }

      // Chamar API real para atualizar status
      const response = await apiClient.atualizarLoja(id, {
        ativo: !loja.ativo
      });

      if (response.success && response.data) {
        // Atualizar lista local
        setLojas(lojas.map(l => 
          l.id === id ? { ...l, ativo: response.data.ativo, updated_at: response.data.updated_at } : l
        ));
        
        const novoStatus = response.data.ativo;
        toast.success(`Loja ${novoStatus ? 'ativada' : 'desativada'} com sucesso!`);
        return true;
      } else {
        toast.error(response.error || 'Erro ao alterar status da loja');
        return false;
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status da loja');
      return false;
    } finally {
      setLoading(false);
    }
  }, [lojas, setLojas, setLoading]);

  // Resetar dados (para desenvolvimento)
  const resetarDados = useCallback(() => {
    setLojas([]);
    toast.success('Dados das lojas resetados!');
  }, [setLojas]);

  return {
    criarLoja,
    editarLoja,
    atualizarLoja: editarLoja, // Alias para compatibilidade
    excluirLoja,
    alternarStatusLoja,
    resetarDados
  };
}