import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import type { RegraComissao, RegraComissaoFormData } from '@/types/sistema';
import { apiClient } from '@/services/api-client';

export function useComissoes() {
  const [regrasComissao, setRegrasComissao] = useState<RegraComissao[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Carregar regras da API
  const carregarRegras = useCallback(async (filtros?: any) => {
    if (loading) {
      console.log('🔄 Carregamento já em andamento, ignorando nova chamada');
      return;
    }

    setLoading(true);
    setErro(null);

    try {
      const response = await apiClient.listarComissoes(filtros);
      
      if (response.success && response.data) {
        // Mapear dados do backend para formato frontend
        const regras = response.data.items.map(item => ({
          id: item.id,
          tipo: item.tipo_comissao,
          ordem: item.ordem,
          valorMinimo: item.valor_minimo,
          valorMaximo: item.valor_maximo,
          percentual: item.percentual,
          ativo: item.ativo,
          descricao: item.descricao,
          createdAt: item.created_at,
          updatedAt: item.updated_at
        }));
        
        setRegrasComissao(regras);
        setIsInitialized(true);
      } else {
        throw new Error(response.error || 'Erro ao carregar regras de comissão');
      }
    } catch (error: any) {
      const mensagemErro = error.message || 'Erro ao carregar regras de comissão';
      setErro(mensagemErro);
      toast.error(mensagemErro);
      setRegrasComissao([]);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // Carregar regras ao montar componente
  useEffect(() => {
    if (!isInitialized && !loading) {
      carregarRegras();
    }
  }, [carregarRegras, isInitialized, loading]);

  // Validar dados da regra de comissão
  const validarRegraComissao = useCallback((dados: RegraComissaoFormData): string[] => {
    const erros: string[] = [];

    if (!dados.tipo) {
      erros.push('Tipo de comissão é obrigatório');
    }

    if (dados.valorMinimo < 0) {
      erros.push('Valor mínimo deve ser maior ou igual a zero');
    }

    if (dados.valorMaximo !== null && dados.valorMaximo <= dados.valorMinimo) {
      erros.push('Valor máximo deve ser maior que o valor mínimo');
    }

    if (dados.percentual <= 0 || dados.percentual > 100) {
      erros.push('Percentual deve estar entre 0.01% e 100%');
    }

    return erros;
  }, []);

  // Verificar sobreposição de faixas
  const verificarSobreposicaoFaixas = useCallback((dados: RegraComissaoFormData, regraId?: string): boolean => {
    const regrasDoTipo = regrasComissao.filter(regra => 
      regra.tipo === dados.tipo && 
      regra.id !== regraId &&
      regra.ativo
    );

    return regrasDoTipo.some(regra => {
      const novoMin = dados.valorMinimo;
      const novoMax = dados.valorMaximo || Infinity;
      const existenteMin = regra.valorMinimo;
      const existenteMax = regra.valorMaximo || Infinity;

      return !(novoMax < existenteMin || novoMin > existenteMax);
    });
  }, [regrasComissao]);

  // Gerar próxima ordem
  const gerarProximaOrdem = useCallback((tipo: string): number => {
    const regrasDoTipo = regrasComissao.filter(regra => regra.tipo === tipo);
    return regrasDoTipo.length > 0 ? Math.max(...regrasDoTipo.map(r => r.ordem)) + 1 : 1;
  }, [regrasComissao]);

  // Criar regra de comissão
  const criarRegraComissao = useCallback(async (dados: RegraComissaoFormData): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Validações locais
      const erros = validarRegraComissao(dados);
      
      if (verificarSobreposicaoFaixas(dados)) {
        erros.push('Existe sobreposição com outra regra ativa do mesmo tipo');
      }

      if (erros.length > 0) {
        erros.forEach(erro => toast.error(erro));
        return false;
      }

      // Preparar dados para API (mapear para snake_case)
      const dadosAPI = {
        loja_id: '317c3115-e071-40a6-9bc5-7c3227e0d82c', // TODO: obter da sessão
        tipo_comissao: dados.tipo,
        valor_minimo: dados.valorMinimo,
        valor_maximo: dados.valorMaximo,
        percentual: dados.percentual,
        ordem: gerarProximaOrdem(dados.tipo),
        ativo: true,
        descricao: dados.descricao
      };

      const response = await apiClient.criarComissao(dadosAPI);
      
      if (response.success) {
        await carregarRegras();
        toast.success('Regra de comissão criada com sucesso!');
        return true;
      } else {
        throw new Error(response.error || 'Erro ao criar regra');
      }

    } catch (error: any) {
      const mensagemErro = error.message || 'Erro ao criar regra de comissão';
      toast.error(mensagemErro);
      return false;
    } finally {
      setLoading(false);
    }
  }, [validarRegraComissao, verificarSobreposicaoFaixas, gerarProximaOrdem, carregarRegras]);

  // Atualizar regra de comissão
  const atualizarRegraComissao = useCallback(async (id: string, dados: RegraComissaoFormData): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Validações locais
      const erros = validarRegraComissao(dados);
      
      if (verificarSobreposicaoFaixas(dados, id)) {
        erros.push('Existe sobreposição com outra regra ativa do mesmo tipo');
      }

      if (erros.length > 0) {
        erros.forEach(erro => toast.error(erro));
        return false;
      }

      // Preparar dados para API
      const dadosAPI = {
        tipo_comissao: dados.tipo,
        valor_minimo: dados.valorMinimo,
        valor_maximo: dados.valorMaximo,
        percentual: dados.percentual,
        descricao: dados.descricao
      };

      const response = await apiClient.atualizarComissao(id, dadosAPI);
      
      if (response.success) {
        await carregarRegras();
        toast.success('Regra de comissão atualizada com sucesso!');
        return true;
      } else {
        throw new Error(response.error || 'Erro ao atualizar regra');
      }

    } catch (error: any) {
      const mensagemErro = error.message || 'Erro ao atualizar regra de comissão';
      toast.error(mensagemErro);
      return false;
    } finally {
      setLoading(false);
    }
  }, [validarRegraComissao, verificarSobreposicaoFaixas, carregarRegras]);

  // Alternar status da regra
  const alternarStatusRegra = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    
    try {
      const response = await apiClient.alternarStatusComissao(id);
      
      if (response.success) {
        await carregarRegras();
        const regra = regrasComissao.find(r => r.id === id);
        const novoStatus = !regra?.ativo ? 'ativada' : 'desativada';
        toast.success(`Regra ${novoStatus} com sucesso!`);
      } else {
        throw new Error(response.error || 'Erro ao alterar status');
      }

    } catch (error: any) {
      const mensagemErro = error.message || 'Erro ao alterar status da regra';
      toast.error(mensagemErro);
    } finally {
      setLoading(false);
    }
  }, [regrasComissao, carregarRegras]);

  // Excluir regra de comissão
  const excluirRegraComissao = useCallback(async (id: string): Promise<boolean> => {
    const regra = regrasComissao.find(r => r.id === id);
    
    if (!regra) {
      toast.error('Regra não encontrada');
      return false;
    }

    setLoading(true);
    
    try {
      const response = await apiClient.excluirComissao(id);
      
      if (response.success) {
        await carregarRegras();
        toast.success('Regra de comissão excluída com sucesso!');
        return true;
      } else {
        throw new Error(response.error || 'Erro ao excluir regra');
      }

    } catch (error: any) {
      const mensagemErro = error.message || 'Erro ao excluir regra de comissão';
      toast.error(mensagemErro);
      return false;
    } finally {
      setLoading(false);
    }
  }, [regrasComissao, carregarRegras]);

  // Obter regras por tipo
  const obterRegrasPorTipo = useCallback((tipo: string): RegraComissao[] => {
    return regrasComissao
      .filter(regra => regra.tipo === tipo && regra.ativo)
      .sort((a, b) => a.ordem - b.ordem);
  }, [regrasComissao]);

  // Calcular comissão
  const calcularComissao = useCallback(async (valor: number, tipo: string): Promise<{ percentual: number; valor: number; regraId: string } | null> => {
    try {
      const response = await apiClient.calcularComissao(valor, tipo, '317c3115-e071-40a6-9bc5-7c3227e0d82c');
      
      if (response.success && response.data) {
        return {
          percentual: response.data.percentual_aplicado,
          valor: response.data.valor_comissao,
          regraId: response.data.regra_id
        };
      }
    } catch (error) {
      console.error('Erro ao calcular comissão:', error);
    }
    
    return null;
  }, []);

  // Buscar regras
  const buscarRegras = useCallback((termo: string): RegraComissao[] => {
    if (!termo.trim()) return regrasComissao;
    
    const termoBusca = termo.toLowerCase().trim();
    return regrasComissao.filter(regra =>
      regra.tipo.toLowerCase().includes(termoBusca) ||
      (regra.descricao && regra.descricao.toLowerCase().includes(termoBusca)) ||
      regra.percentual.toString().includes(termoBusca)
    );
  }, [regrasComissao]);

  // Estatísticas
  const estatisticas = {
    total: regrasComissao.length,
    ativas: regrasComissao.filter(r => r.ativo).length,
    inativas: regrasComissao.filter(r => !r.ativo).length,
    vendedores: regrasComissao.filter(r => r.tipo === 'VENDEDOR').length,
    gerentes: regrasComissao.filter(r => r.tipo === 'GERENTE').length,
    percentualMedio: regrasComissao.length > 0 
      ? regrasComissao.reduce((acc, regra) => acc + regra.percentual, 0) / regrasComissao.length 
      : 0
  };

  // Resetar dados para recarregar
  const resetarDados = useCallback(() => {
    setRegrasComissao([]);
    setIsInitialized(false);
    setErro(null);
    carregarRegras();
    toast.success('Dados recarregados do servidor!');
  }, [carregarRegras]);

  return {
    regrasComissao,
    loading,
    erro,
    estatisticas,
    criarRegraComissao,
    atualizarRegraComissao,
    alternarStatusRegra,
    excluirRegraComissao,
    obterRegrasPorTipo,
    calcularComissao,
    buscarRegras,
    resetarDados
  };
}