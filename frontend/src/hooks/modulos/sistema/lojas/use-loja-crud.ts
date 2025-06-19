import { useCallback } from 'react';
import { toast } from 'sonner';
import type { Loja, LojaFormData } from '@/types/sistema';
import { useLojaValidation } from './use-loja-validation';
import { useLojaUtils } from './use-loja-utils';

// Hook especializado para operações CRUD de lojas
export function useLojaCrud(
  lojas: Loja[],
  setLojas: (lojas: Loja[]) => void,
  setLoading: (loading: boolean) => void,
  obterEmpresaPorId: (id: string) => any
) {
  const { validarLoja } = useLojaValidation();
  const { verificarCodigoDuplicado } = useLojaUtils(lojas);

  // Criar loja
  const criarLoja = useCallback(async (dados: LojaFormData): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Validações
      const erros = validarLoja(dados);
      
      if (verificarCodigoDuplicado(dados.codigo)) {
        erros.push('Código da loja já existe');
      }

      if (erros.length > 0) {
        erros.forEach(erro => toast.error(erro));
        return false;
      }

      // Buscar nome da empresa
      const empresa = obterEmpresaPorId(dados.empresaId);
      if (!empresa) {
        toast.error('Empresa não encontrada');
        return false;
      }

      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const novaLoja: Loja = {
        id: Date.now().toString(),
        ...dados,
        codigo: dados.codigo.toUpperCase(),
        empresa: empresa.nome,
        funcionarios: 0,
        vendasMes: 0,
        ativa: true,
        dataAbertura: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        createdAt: new Date().toISOString()
      };

      setLojas([...lojas, novaLoja]);
      toast.success('Loja criada com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao criar loja:', error);
      toast.error('Erro ao criar loja');
      return false;
    } finally {
      setLoading(false);
    }
  }, [lojas, setLojas, setLoading, validarLoja, verificarCodigoDuplicado, obterEmpresaPorId]);

  // Editar loja
  const editarLoja = useCallback(async (id: string, dados: LojaFormData): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Validações
      const erros = validarLoja(dados);
      
      if (verificarCodigoDuplicado(dados.codigo, id)) {
        erros.push('Código da loja já existe');
      }

      if (erros.length > 0) {
        erros.forEach(erro => toast.error(erro));
        return false;
      }

      // Buscar nome da empresa
      const empresa = obterEmpresaPorId(dados.empresaId);
      if (!empresa) {
        toast.error('Empresa não encontrada');
        return false;
      }

      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setLojas(lojas.map(loja => 
        loja.id === id 
          ? { 
              ...loja, 
              ...dados,
              codigo: dados.codigo.toUpperCase(),
              empresa: empresa.nome
            }
          : loja
      ));
      
      toast.success('Loja atualizada com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao editar loja:', error);
      toast.error('Erro ao editar loja');
      return false;
    } finally {
      setLoading(false);
    }
  }, [lojas, setLojas, setLoading, validarLoja, verificarCodigoDuplicado, obterEmpresaPorId]);

  // Excluir loja
  const excluirLoja = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLojas(lojas.filter(loja => loja.id !== id));
      toast.success('Loja excluída com sucesso!');
      return true;
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
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setLojas(lojas.map(loja => 
        loja.id === id ? { ...loja, ativa: !loja.ativa } : loja
      ));
      
      const loja = lojas.find(l => l.id === id);
      const novoStatus = loja ? !loja.ativa : false;
      
      toast.success(`Loja ${novoStatus ? 'ativada' : 'desativada'} com sucesso!`);
      return true;
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status da loja');
      return false;
    }
  }, [lojas, setLojas]);

  // Atualizar vendas da loja
  const atualizarVendas = useCallback(async (id: string, vendas: number): Promise<boolean> => {
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setLojas(lojas.map(loja => 
        loja.id === id ? { ...loja, vendasMes: vendas } : loja
      ));
      
      toast.success('Vendas atualizadas com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar vendas:', error);
      toast.error('Erro ao atualizar vendas');
      return false;
    }
  }, [lojas, setLojas]);

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
    atualizarVendas,
    resetarDados
  };
}