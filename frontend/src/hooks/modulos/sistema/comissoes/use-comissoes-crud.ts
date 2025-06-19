import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { RegraComissao, RegraComissaoFormData } from '@/types/sistema';
import { useComissoesValidation } from './use-comissoes-validation';
import { useComissoesUtils } from './use-comissoes-utils';

export function useComissoesCrud(
  regrasComissao: RegraComissao[],
  setRegrasComissao: (regras: RegraComissao[] | ((prev: RegraComissao[]) => RegraComissao[])) => void
) {
  const [loading, setLoading] = useState(false);
  const { validarRegraComissao, verificarSobreposicaoFaixas } = useComissoesValidation(regrasComissao);
  const { gerarProximaOrdem } = useComissoesUtils(regrasComissao);

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
  }, [validarRegraComissao, verificarSobreposicaoFaixas, gerarProximaOrdem, setRegrasComissao]);

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
  }, [validarRegraComissao, verificarSobreposicaoFaixas, setRegrasComissao]);

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
  }, [regrasComissao, setRegrasComissao]);

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
  }, [regrasComissao, setRegrasComissao]);

  return {
    loading,
    criarRegraComissao,
    atualizarRegraComissao,
    alternarStatusRegra,
    excluirRegraComissao
  };
}