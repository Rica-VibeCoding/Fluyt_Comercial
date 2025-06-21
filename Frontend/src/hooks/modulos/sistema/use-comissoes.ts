import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { RegraComissao, RegraComissaoFormData } from '@/types/sistema';
import { useLocalStorage } from '@/hooks/globais/use-local-storage';

// Mock data para desenvolvimento
const mockRegrasComissao: RegraComissao[] = [
  {
    id: '1',
    tipo: 'VENDEDOR',
    ordem: 1,
    valorMinimo: 0,
    valorMaximo: 50000,
    percentual: 2.5,
    ativo: true,
    descricao: 'Comissão básica para vendas até R$ 50.000',
    createdAt: '2024-01-10T10:00:00Z'
  },
  {
    id: '2',
    tipo: 'VENDEDOR',
    ordem: 2,
    valorMinimo: 50001,
    valorMaximo: 100000,
    percentual: 3.0,
    ativo: true,
    descricao: 'Comissão intermediária para vendas de R$ 50.001 a R$ 100.000',
    createdAt: '2024-01-10T10:00:00Z'
  },
  {
    id: '3',
    tipo: 'VENDEDOR',
    ordem: 3,
    valorMinimo: 100001,
    valorMaximo: null,
    percentual: 3.5,
    ativo: true,
    descricao: 'Comissão premium para vendas acima de R$ 100.000',
    createdAt: '2024-01-10T10:00:00Z'
  },
  {
    id: '4',
    tipo: 'GERENTE',
    ordem: 1,
    valorMinimo: 0,
    valorMaximo: 200000,
    percentual: 1.5,
    ativo: true,
    descricao: 'Comissão de gerência para vendas da equipe até R$ 200.000',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '5',
    tipo: 'GERENTE',
    ordem: 2,
    valorMinimo: 200001,
    valorMaximo: null,
    percentual: 2.0,
    ativo: true,
    descricao: 'Comissão de gerência para vendas da equipe acima de R$ 200.000',
    createdAt: '2024-01-15T10:00:00Z'
  }
];

export function useComissoes() {
  const [regrasComissao, setRegrasComissao, clearRegrasComissao] = useLocalStorage<RegraComissao[]>('fluyt_regras_comissao', mockRegrasComissao);
  const [loading, setLoading] = useState(false);

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

      // Verificar se há sobreposição
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
      // Validações
      const erros = validarRegraComissao(dados);
      
      if (verificarSobreposicaoFaixas(dados)) {
        erros.push('Existe sobreposição com outra regra ativa do mesmo tipo');
      }

      if (erros.length > 0) {
        erros.forEach(erro => toast.error(erro));
        return false;
      }

      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const novaRegra: RegraComissao = {
        id: Date.now().toString(),
        ...dados,
        ordem: gerarProximaOrdem(dados.tipo),
        ativo: true,
        createdAt: new Date().toISOString()
      };

      setRegrasComissao(prev => [...prev, novaRegra]);
      toast.success('Regra de comissão criada com sucesso!');
      return true;

    } catch (error) {
      toast.error('Erro ao criar regra de comissão');
      return false;
    } finally {
      setLoading(false);
    }
  }, [validarRegraComissao, verificarSobreposicaoFaixas, gerarProximaOrdem]);

  // Atualizar regra de comissão
  const atualizarRegraComissao = useCallback(async (id: string, dados: RegraComissaoFormData): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Validações
      const erros = validarRegraComissao(dados);
      
      if (verificarSobreposicaoFaixas(dados, id)) {
        erros.push('Existe sobreposição com outra regra ativa do mesmo tipo');
      }

      if (erros.length > 0) {
        erros.forEach(erro => toast.error(erro));
        return false;
      }

      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setRegrasComissao(prev => prev.map(regra => 
        regra.id === id 
          ? { ...regra, ...dados, updatedAt: new Date().toISOString() }
          : regra
      ));

      toast.success('Regra de comissão atualizada com sucesso!');
      return true;

    } catch (error) {
      toast.error('Erro ao atualizar regra de comissão');
      return false;
    } finally {
      setLoading(false);
    }
  }, [validarRegraComissao, verificarSobreposicaoFaixas]);

  // Alternar status da regra
  const alternarStatusRegra = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setRegrasComissao(prev => prev.map(regra => 
        regra.id === id 
          ? { ...regra, ativo: !regra.ativo, updatedAt: new Date().toISOString() }
          : regra
      ));

      const regra = regrasComissao.find(r => r.id === id);
      const novoStatus = !regra?.ativo ? 'ativada' : 'desativada';
      toast.success(`Regra ${novoStatus} com sucesso!`);

    } catch (error) {
      toast.error('Erro ao alterar status da regra');
    } finally {
      setLoading(false);
    }
  }, [regrasComissao]);

  // Excluir regra de comissão
  const excluirRegraComissao = useCallback(async (id: string): Promise<boolean> => {
    const regra = regrasComissao.find(r => r.id === id);
    
    if (!regra) {
      toast.error('Regra não encontrada');
      return false;
    }

    setLoading(true);
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setRegrasComissao(prev => prev.filter(r => r.id !== id));
      toast.success('Regra de comissão excluída com sucesso!');
      return true;

    } catch (error) {
      toast.error('Erro ao excluir regra de comissão');
      return false;
    } finally {
      setLoading(false);
    }
  }, [regrasComissao]);

  // Obter regras por tipo
  const obterRegrasPorTipo = useCallback((tipo: string): RegraComissao[] => {
    return regrasComissao
      .filter(regra => regra.tipo === tipo && regra.ativo)
      .sort((a, b) => a.ordem - b.ordem);
  }, [regrasComissao]);

  // Calcular comissão
  const calcularComissao = useCallback((valor: number, tipo: string): { percentual: number; valor: number; regraId: string } | null => {
    const regrasAplicaveis = obterRegrasPorTipo(tipo);
    
    for (const regra of regrasAplicaveis) {
      const valorMax = regra.valorMaximo || Infinity;
      if (valor >= regra.valorMinimo && valor <= valorMax) {
        return {
          percentual: regra.percentual,
          valor: (valor * regra.percentual) / 100,
          regraId: regra.id
        };
      }
    }
    
    return null;
  }, [obterRegrasPorTipo]);

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

  // Estadísticas
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

  // Resetar dados para mock inicial
  const resetarDados = useCallback(() => {
    clearRegrasComissao();
    toast.success('Dados resetados para configuração inicial!');
  }, [clearRegrasComissao]);

  return {
    regrasComissao,
    loading,
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