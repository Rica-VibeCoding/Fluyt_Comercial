/**
 * Hook simplificado para empresas usando Zustand store
 */

import { useCallback } from 'react';
import { useSistemaStore } from '@/store/sistema-store';
import { Empresa } from '@/types/sistema';
import { toast } from 'sonner';

// Mock de dados para desenvolvimento (alinhado com backend)
const mockEmpresas: Empresa[] = [
  {
    id: '1',
    nome: 'Fluyt Móveis Planejados',
    cnpj: '12.345.678/0001-90',
    email: 'contato@fluyt.com.br',
    telefone: '(11) 3456-7890',
    endereco: 'Rua das Indústrias, 123, Vila Industrial, São Paulo-SP',
    ativo: true,
    total_lojas: 3,      // ✅ alinhado com backend
    lojas_ativas: 3,     // ✅ alinhado com backend
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    nome: 'Fluyt Filial Norte',
    cnpj: '98.765.432/0001-10',
    email: 'norte@fluyt.com.br',
    telefone: '(11) 9876-5432',
    endereco: 'Av. Norte, 456, Centro, Guarulhos-SP',
    ativo: true,
    total_lojas: 1,      // ✅ alinhado com backend
    lojas_ativas: 1,     // ✅ alinhado com backend
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export function useEmpresasStore() {
  const {
    empresas,
    loadingEmpresas,
    erroEmpresas,
    setEmpresas,
    adicionarEmpresa,
    atualizarEmpresa,
    removerEmpresa,
    setLoadingEmpresas,
    setErroEmpresas
  } = useSistemaStore();

  const carregarEmpresas = useCallback(async () => {
    setLoadingEmpresas(true);
    setErroEmpresas(null);
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));
      setEmpresas(mockEmpresas);
      toast.success('Empresas carregadas com sucesso');
    } catch (error) {
      const mensagem = 'Erro ao carregar empresas';
      setErroEmpresas(mensagem);
      toast.error(mensagem);
    } finally {
      setLoadingEmpresas(false);
    }
  }, [setEmpresas, setLoadingEmpresas, setErroEmpresas]);

  const criarEmpresa = useCallback(async (dadosEmpresa: Omit<Empresa, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoadingEmpresas(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const novaEmpresa: Empresa = {
        ...dadosEmpresa,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      adicionarEmpresa(novaEmpresa);
      toast.success('Empresa criada com sucesso');
      return novaEmpresa;
    } catch (error) {
      const mensagem = 'Erro ao criar empresa';
      setErroEmpresas(mensagem);
      toast.error(mensagem);
      throw error;
    } finally {
      setLoadingEmpresas(false);
    }
  }, [adicionarEmpresa, setLoadingEmpresas, setErroEmpresas]);

  const editarEmpresa = useCallback(async (id: string, dadosAtualizados: Partial<Empresa>) => {
    setLoadingEmpresas(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      atualizarEmpresa(id, {
        ...dadosAtualizados,
        updatedAt: new Date().toISOString()
      });
      
      toast.success('Empresa atualizada com sucesso');
    } catch (error) {
      const mensagem = 'Erro ao atualizar empresa';
      setErroEmpresas(mensagem);
      toast.error(mensagem);
      throw error;
    } finally {
      setLoadingEmpresas(false);
    }
  }, [atualizarEmpresa, setLoadingEmpresas, setErroEmpresas]);

  const excluirEmpresa = useCallback(async (id: string) => {
    setLoadingEmpresas(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      removerEmpresa(id);
      toast.success('Empresa excluída com sucesso');
    } catch (error) {
      const mensagem = 'Erro ao excluir empresa';
      setErroEmpresas(mensagem);
      toast.error(mensagem);
      throw error;
    } finally {
      setLoadingEmpresas(false);
    }
  }, [removerEmpresa, setLoadingEmpresas, setErroEmpresas]);

  const alternarStatusEmpresa = useCallback(async (id: string, ativo: boolean) => {
    try {
      await editarEmpresa(id, { ativo });
    } catch (error) {
      console.error('Erro ao alterar status da empresa:', error);
    }
  }, [editarEmpresa]);

  return {
    empresas,
    loading: loadingEmpresas,
    erro: erroEmpresas,
    carregarEmpresas,
    criarEmpresa,
    editarEmpresa,
    excluirEmpresa,
    alternarStatusEmpresa
  };
}