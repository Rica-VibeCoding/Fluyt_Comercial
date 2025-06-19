/**
 * Hook DESCONTINUADO - REDIRECIONAMENTO PARA useEmpresasReal
 * Agente 1 - Migração: Este hook foi substituído por useEmpresasReal
 * @deprecated Use useEmpresasReal instead
 */

import { useCallback } from 'react';
import { useSistemaStore } from '@/store/sistema-store';
import { Empresa } from '@/types/sistema';
import { toast } from 'sonner';
import { useEmpresasReal } from '@/hooks/data/use-empresas-real';

// Mock de dados para desenvolvimento
const mockEmpresas: Empresa[] = [
  {
    id: '1',
    nome: 'Fluyt Móveis Planejados',
    cnpj: '12.345.678/0001-90',
    email: 'contato@fluyt.com.br',
    telefone: '(11) 3456-7890',
    endereco: 'Rua das Indústrias, 123, Vila Industrial, São Paulo-SP',
    ativo: true,
    funcionarios: 25,
    dataFundacao: '2020-01-15',
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
    funcionarios: 12,
    dataFundacao: '2022-06-20',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export function useEmpresasStore() {
  // 🔄 REDIRECIONAMENTO: Usar o hook unificado real
  const empresasReal = useEmpresasReal();
  
  // ⚠️ COMPATIBILIDADE: Manter interface antiga para componentes legacy
  toast.info('⚠️ useEmpresasStore descontinuado - migre para useEmpresasReal');

  const carregarEmpresas = useCallback(async () => {
    // Redirecionar para o hook real
    await empresasReal.recarregarDados();
  }, [empresasReal]);

  // 🔄 COMPATIBILIDADE: Redirecionar para hook real
  const criarEmpresa = useCallback(async (dadosEmpresa: Omit<Empresa, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Converter formato para compatibilidade
    const formData = {
      nome: dadosEmpresa.nome,
      cnpj: dadosEmpresa.cnpj || '',
      email: dadosEmpresa.email || '',
      telefone: dadosEmpresa.telefone || '',
      endereco: dadosEmpresa.endereco || ''
    };
    return await empresasReal.criarEmpresa(formData);
  }, [empresasReal]);

  const editarEmpresa = useCallback(async (id: string, dadosAtualizados: Partial<Empresa>) => {
    const formData = {
      nome: dadosAtualizados.nome || '',
      cnpj: dadosAtualizados.cnpj || '',
      email: dadosAtualizados.email || '',
      telefone: dadosAtualizados.telefone || '',
      endereco: dadosAtualizados.endereco || ''
    };
    return await empresasReal.atualizarEmpresa(id, formData);
  }, [empresasReal]);

  const excluirEmpresa = useCallback(async (id: string) => {
    return await empresasReal.excluirEmpresa(id);
  }, [empresasReal]);

  const alternarStatusEmpresa = useCallback(async (id: string, ativo: boolean) => {
    await empresasReal.alternarStatusEmpresa(id);
  }, [empresasReal]);

  return {
    // 🔄 Redirecionar dados do hook real
    empresas: empresasReal.empresas,
    loading: empresasReal.loading,
    erro: empresasReal.error,
    carregarEmpresas,
    criarEmpresa,
    editarEmpresa,
    excluirEmpresa,
    alternarStatusEmpresa
  };
}