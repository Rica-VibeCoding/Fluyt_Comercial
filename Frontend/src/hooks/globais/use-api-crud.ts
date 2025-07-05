/**
 * Hook CRUD genérico para APIs
 * Baseado no padrão usado em colaboradores
 */

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface CrudApiClient<T, CreateData, UpdateData> {
  list: (filters?: any) => Promise<ApiResponse<ListResponse<T>>>;
  getById: (id: string) => Promise<ApiResponse<T>>;
  create: (data: CreateData) => Promise<ApiResponse<T>>;
  update: (id: string, data: UpdateData) => Promise<ApiResponse<T>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
}

interface UseCrudOptions {
  loadOnMount?: boolean;
  successMessages?: {
    create?: string;
    update?: string;
    delete?: string;
  };
  errorMessages?: {
    load?: string;
    create?: string;
    update?: string;
    delete?: string;
  };
}

export function useApiCrud<T, CreateData, UpdateData>(
  apiClient: CrudApiClient<T, CreateData, UpdateData>,
  options: UseCrudOptions = {}
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    loadOnMount = true,
    successMessages = {
      create: 'Criado com sucesso!',
      update: 'Atualizado com sucesso!',
      delete: 'Excluído com sucesso!'
    },
    errorMessages = {
      load: 'Erro de conexão com banco de dados',
      create: 'Erro de conexão com banco de dados',
      update: 'Erro de conexão com banco de dados',
      delete: 'Erro de conexão com banco de dados'
    }
  } = options;

  // Carregar itens
  const loadItems = useCallback(async (filters?: any): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.list(filters);
      
      if (response.success && response.data) {
        setItems(response.data.items || []);
      } else {
        setError(response.error || errorMessages.load);
        toast.error(errorMessages.load);
        setItems([]);
      }
    } catch (err) {
      const errorMsg = errorMessages.load;
      setError(errorMsg);
      toast.error(errorMsg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [apiClient, errorMessages.load]);

  // Obter por ID
  const getById = useCallback(async (id: string): Promise<T | null> => {
    try {
      const response = await apiClient.getById(id);
      
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (err) {
      console.error('Erro ao obter item:', err);
      return null;
    }
  }, [apiClient]);

  // Criar item
  const createItem = useCallback(async (data: CreateData): Promise<boolean> => {
    setLoading(true);
    
    try {
      const response = await apiClient.create(data);
      
      if (response.success) {
        toast.success(successMessages.create);
        // Atualização otimizada: adicionar item na lista ao invés de recarregar tudo
        if (response.data) {
          setItems(prev => [...prev, response.data]);
        } else {
          await loadItems(); // Fallback para recarregar
        }
        return true;
      } else {
        toast.error(errorMessages.create);
        return false;
      }
    } catch (err) {
      toast.error(errorMessages.create);
      return false;
    } finally {
      setLoading(false);
    }
  }, [apiClient, successMessages.create, errorMessages.create, loadItems]);

  // Atualizar item
  const updateItem = useCallback(async (id: string, data: UpdateData): Promise<boolean> => {
    setLoading(true);
    
    try {
      const response = await apiClient.update(id, data);
      
      if (response.success) {
        toast.success(successMessages.update);
        // Atualização otimizada: atualizar item específico na lista
        if (response.data) {
          setItems(prev => prev.map(item => 
            (item as any).id === id ? response.data : item
          ));
        } else {
          await loadItems(); // Fallback para recarregar
        }
        return true;
      } else {
        toast.error(errorMessages.update);
        return false;
      }
    } catch (err) {
      toast.error(errorMessages.update);
      return false;
    } finally {
      setLoading(false);
    }
  }, [apiClient, successMessages.update, errorMessages.update, loadItems]);

  // Excluir item
  const deleteItem = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      const response = await apiClient.delete(id);
      
      if (response.success) {
        toast.success(successMessages.delete);
        // Atualização otimizada: remover item da lista sem recarregar
        setItems(prev => prev.filter(item => (item as any).id !== id));
        return true;
      } else {
        toast.error(errorMessages.delete);
        return false;
      }
    } catch (err) {
      toast.error(errorMessages.delete);
      return false;
    } finally {
      setLoading(false);
    }
  }, [apiClient, successMessages.delete, errorMessages.delete]);

  // Carregar dados automaticamente na inicialização se loadOnMount for true
  useEffect(() => {
    if (loadOnMount) {
      loadItems();
    }
  }, [loadOnMount, loadItems]);

  return {
    // Estado
    items,
    loading,
    error,
    
    // Operações
    loadItems,
    getById,
    createItem,
    updateItem,
    deleteItem,
    
    // Controle manual
    setItems,
    setLoading,
    setError
  };
}