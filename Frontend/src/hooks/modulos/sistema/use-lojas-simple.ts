import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import type { Loja, LojaFormData } from '@/types/sistema';
import { apiClient } from '@/services/api-client';

// Interface para filtros de busca
interface FiltrosLoja {
  busca?: string;
  empresa_id?: string;
  data_inicio?: string;
  data_fim?: string;
  page?: number;
  limit?: number;
}

export function useLojas() {
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false); // 🔧 Flag para evitar múltiplas inicializações

  // Carregar lojas da API
  const carregarLojas = useCallback(async (filtros?: FiltrosLoja) => {
    // 🔧 CORREÇÃO: Evitar múltiplas chamadas simultâneas
    if (loading) {
      console.log('🔄 Carregamento já em andamento, ignorando nova chamada');
      return;
    }

    setLoading(true);
    setErro(null);

    try {
      const response = await apiClient.listarLojas(filtros);
      
      if (response.success && response.data) {
        setLojas(response.data.items || []);
        setIsInitialized(true);
      } else {
        throw new Error(response.error || 'Erro ao carregar lojas');
      }
    } catch (error: any) {
      const mensagemErro = error.message || 'Erro ao carregar lojas';
      setErro(mensagemErro);
      toast.error(mensagemErro);
      setLojas([]);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // Carregar lojas ao montar o componente (apenas uma vez)
  useEffect(() => {
    if (!isInitialized && !loading) {
      carregarLojas();
    }
  }, [carregarLojas, isInitialized, loading]); // 🔧 CORREÇÃO: Usar flag de inicialização

  // Validar dados da loja - apenas nome obrigatório
  const validarLoja = useCallback((dados: LojaFormData): string[] => {
    const erros: string[] = [];

    // ✅ Único campo obrigatório
    if (!dados.nome || dados.nome.trim().length < 2) {
      erros.push('Nome da loja deve ter pelo menos 2 caracteres');
    }

    // ✅ Validações condicionais - apenas se preenchidos
    if (dados.email && !dados.email.includes('@')) {
      erros.push('Email inválido');
    }

    if (dados.telefone && dados.telefone.replace(/[^\d]/g, '').length < 10) {
      erros.push('Telefone deve ter pelo menos 10 dígitos');
    }

    return erros;
  }, []);

  // Criar loja
  const criarLoja = useCallback(async (dados: LojaFormData): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Validações locais
      const erros = validarLoja(dados);
      if (erros.length > 0) {
        erros.forEach(erro => toast.error(erro));
        return false;
      }

      // Chamar API
      const response = await apiClient.criarLoja(dados);
      
      if (response.success && response.data) {
        // Recarregar lista de lojas
        await carregarLojas();
        toast.success('Loja criada com sucesso!');
        return true;
      } else {
        throw new Error(response.error || 'Erro ao criar loja');
      }

    } catch (error: any) {
      const mensagemErro = error.message || 'Erro ao criar loja';
      toast.error(mensagemErro);
      return false;
    } finally {
      setLoading(false);
    }
  }, [validarLoja, carregarLojas]);

  // Atualizar loja
  const atualizarLoja = useCallback(async (id: string, dados: LojaFormData): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Validações locais
      const erros = validarLoja(dados);
      if (erros.length > 0) {
        erros.forEach(erro => toast.error(erro));
        return false;
      }

      // Chamar API
      const response = await apiClient.atualizarLoja(id, dados);
      
      if (response.success && response.data) {
        // Recarregar lista de lojas
        await carregarLojas();
        toast.success('Loja atualizada com sucesso!');
        return true;
      } else {
        throw new Error(response.error || 'Erro ao atualizar loja');
      }

    } catch (error: any) {
      const mensagemErro = error.message || 'Erro ao atualizar loja';
      toast.error(mensagemErro);
      return false;
    } finally {
      setLoading(false);
    }
  }, [validarLoja, carregarLojas]);

  // Alternar status da loja
  const alternarStatusLoja = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      const loja = lojas.find(l => l.id === id);
      if (!loja) {
        throw new Error('Loja não encontrada');
      }

      // Atualizar apenas o status
      const response = await apiClient.atualizarLoja(id, {
        nome: loja.nome, // campo obrigatório
        ativo: !loja.ativo
      });

      if (response.success) {
        // Recarregar lista de lojas
        await carregarLojas();
        const novoStatus = !loja.ativo ? 'ativada' : 'desativada';
        toast.success(`Loja ${novoStatus} com sucesso!`);
        return true;
      } else {
        throw new Error(response.error || 'Erro ao alterar status');
      }

    } catch (error: any) {
      const mensagemErro = error.message || 'Erro ao alterar status da loja';
      toast.error(mensagemErro);
      return false;
    } finally {
      setLoading(false);
    }
  }, [lojas, carregarLojas]);

  // Excluir loja (soft delete)
  const excluirLoja = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      const response = await apiClient.excluirLoja(id);
      
      if (response.success) {
        // Recarregar lista de lojas
        await carregarLojas();
        toast.success('Loja excluída com sucesso!');
        return true;
      } else {
        throw new Error(response.error || 'Erro ao excluir loja');
      }

    } catch (error: any) {
      const mensagemErro = error.message || 'Erro ao excluir loja';
      toast.error(mensagemErro);
      return false;
    } finally {
      setLoading(false);
    }
  }, [carregarLojas]);

  // Obter lojas ativas
  const obterLojasAtivas = useCallback((): Loja[] => {
    return lojas.filter(loja => loja.ativo);
  }, [lojas]);

  // Obter loja por ID
  const obterLojaPorId = useCallback((id: string): Loja | undefined => {
    return lojas.find(loja => loja.id === id);
  }, [lojas]);

  // Buscar lojas localmente (filtro rápido)
  const buscarLojas = useCallback((termo: string): Loja[] => {
    if (!termo.trim()) return lojas;
    
    const termoBusca = termo.toLowerCase().trim();
    return lojas.filter(loja =>
      loja.nome.toLowerCase().includes(termoBusca) ||
      (loja.endereco && loja.endereco.toLowerCase().includes(termoBusca)) ||
      (loja.email && loja.email.toLowerCase().includes(termoBusca))
    );
  }, [lojas]);

  // Gerar próximo código (não usado mais, mas mantido para compatibilidade)
  const gerarProximoCodigo = useCallback((): string => {
    const proximoId = lojas.length + 1;
    return proximoId.toString().padStart(3, '0');
  }, [lojas.length]);

  // Resetar dados (limpar cache local)
  const resetarDados = useCallback(() => {
    setLojas([]);
    setErro(null);
    setLoading(false);
    toast.success('Dados de lojas resetados!');
  }, []);

  // Estatísticas
  const estatisticas = {
    total: lojas.length,
    ativas: lojas.filter(l => l.ativo).length,
    inativas: lojas.filter(l => !l.ativo).length
  };

  return {
    // Estados
    lojas,
    loading,
    erro,
    estatisticas,
    
    // Operações CRUD
    carregarLojas,
    criarLoja,
    atualizarLoja,
    alternarStatusLoja,
    excluirLoja,
    
    // Utilitários
    obterLojasAtivas,
    obterLojaPorId,
    buscarLojas,
    gerarProximoCodigo,
    resetarDados
  };
}