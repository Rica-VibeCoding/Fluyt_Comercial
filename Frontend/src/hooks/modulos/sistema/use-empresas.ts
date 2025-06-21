import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { Empresa, EmpresaFormData } from '@/types/sistema';
import { useLocalStorage } from '@/hooks/globais/use-local-storage';

// Mock data para desenvolvimento
const mockEmpresas: Empresa[] = [
  {
    id: '1',
    nome: 'Fluyt Móveis & Design',
    cnpj: '12.345.678/0001-90',
    email: 'contato@fluyt.com.br',
    telefone: '(11) 98765-4321',
    endereco: 'Av. Paulista, 1000 - São Paulo/SP',
    ativo: true,
    funcionarios: 45,
    dataFundacao: '2020-01-15',
    createdAt: '2020-01-15T10:00:00Z'
  },
  {
    id: '2',
    nome: 'Fluyt Filial Santos',
    cnpj: '12.345.678/0002-71',
    email: 'santos@fluyt.com.br',
    telefone: '(13) 3456-7890',
    endereco: 'Rua do Comércio, 500 - Santos/SP',
    ativo: true,
    funcionarios: 18,
    dataFundacao: '2022-06-10',
    createdAt: '2022-06-10T10:00:00Z'
  },
  {
    id: '3',
    nome: 'Fluyt Norte',
    cnpj: '12.345.678/0003-52',
    email: 'norte@fluyt.com.br',
    telefone: '(11) 97777-8888',
    endereco: 'Av. Marginal, 2000 - Guarulhos/SP',
    ativo: false,
    funcionarios: 8,
    dataFundacao: '2023-03-20',
    createdAt: '2023-03-20T10:00:00Z'
  }
];

export function useEmpresas() {
  const [empresas, setEmpresas, clearEmpresas] = useLocalStorage<Empresa[]>('fluyt_empresas', mockEmpresas);
  const [loading, setLoading] = useState(false);

  // Validar CNPJ (implementação simplificada)
  const validarCNPJ = useCallback((cnpj: string): boolean => {
    const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
    return cnpjLimpo.length === 14;
  }, []);

  // Validar email
  const validarEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // Validar telefone
  const validarTelefone = useCallback((telefone: string): boolean => {
    const telefoneNumeros = telefone.replace(/[^\d]/g, '');
    return telefoneNumeros.length >= 10;
  }, []);

  // Validar dados da empresa
  const validarEmpresa = useCallback((dados: EmpresaFormData): string[] => {
    const erros: string[] = [];

    if (!dados.nome || dados.nome.trim().length < 2) {
      erros.push('Nome da empresa deve ter pelo menos 2 caracteres');
    }

    if (!validarCNPJ(dados.cnpj)) {
      erros.push('CNPJ inválido');
    }

    if (!validarEmail(dados.email)) {
      erros.push('Email inválido');
    }

    if (!validarTelefone(dados.telefone)) {
      erros.push('Telefone inválido');
    }

    if (!dados.endereco || dados.endereco.trim().length < 10) {
      erros.push('Endereço deve ter pelo menos 10 caracteres');
    }

    return erros;
  }, [validarCNPJ, validarEmail, validarTelefone]);

  // Verificar duplicidade de CNPJ
  const verificarCNPJDuplicado = useCallback((cnpj: string, empresaId?: string): boolean => {
    const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
    return empresas.some(empresa => 
      empresa.cnpj.replace(/[^\d]/g, '') === cnpjLimpo && 
      empresa.id !== empresaId
    );
  }, [empresas]);

  // Verificar duplicidade de email
  const verificarEmailDuplicado = useCallback((email: string, empresaId?: string): boolean => {
    return empresas.some(empresa => 
      empresa.email.toLowerCase() === email.toLowerCase() && 
      empresa.id !== empresaId
    );
  }, [empresas]);

  // Criar empresa
  const criarEmpresa = useCallback(async (dados: EmpresaFormData): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Validações
      const erros = validarEmpresa(dados);
      
      if (verificarCNPJDuplicado(dados.cnpj)) {
        erros.push('CNPJ já cadastrado');
      }
      
      if (verificarEmailDuplicado(dados.email)) {
        erros.push('Email já cadastrado');
      }

      if (erros.length > 0) {
        erros.forEach(erro => toast.error(erro));
        return false;
      }

      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const novaEmpresa: Empresa = {
        id: Date.now().toString(),
        ...dados,
        ativo: true,
        funcionarios: 0,
        createdAt: new Date().toISOString()
      };

      setEmpresas(prev => [...prev, novaEmpresa]);
      toast.success('Empresa criada com sucesso!');
      return true;

    } catch (error) {
      toast.error('Erro ao criar empresa');
      return false;
    } finally {
      setLoading(false);
    }
  }, [validarEmpresa, verificarCNPJDuplicado, verificarEmailDuplicado]);

  // Atualizar empresa
  const atualizarEmpresa = useCallback(async (id: string, dados: EmpresaFormData): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Validações
      const erros = validarEmpresa(dados);
      
      if (verificarCNPJDuplicado(dados.cnpj, id)) {
        erros.push('CNPJ já cadastrado');
      }
      
      if (verificarEmailDuplicado(dados.email, id)) {
        erros.push('Email já cadastrado');
      }

      if (erros.length > 0) {
        erros.forEach(erro => toast.error(erro));
        return false;
      }

      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setEmpresas(prev => prev.map(empresa => 
        empresa.id === id 
          ? { ...empresa, ...dados, updatedAt: new Date().toISOString() }
          : empresa
      ));

      toast.success('Empresa atualizada com sucesso!');
      return true;

    } catch (error) {
      toast.error('Erro ao atualizar empresa');
      return false;
    } finally {
      setLoading(false);
    }
  }, [validarEmpresa, verificarCNPJDuplicado, verificarEmailDuplicado]);

  // Alternar status da empresa
  const alternarStatusEmpresa = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setEmpresas(prev => prev.map(empresa => 
        empresa.id === id 
          ? { ...empresa, ativo: !empresa.ativo, updatedAt: new Date().toISOString() }
          : empresa
      ));

      const empresa = empresas.find(e => e.id === id);
      const novoStatus = !empresa?.ativo ? 'ativada' : 'desativada';
      toast.success(`Empresa ${novoStatus} com sucesso!`);

    } catch (error) {
      toast.error('Erro ao alterar status da empresa');
    } finally {
      setLoading(false);
    }
  }, [empresas]);

  // Excluir empresa
  const excluirEmpresa = useCallback(async (id: string): Promise<boolean> => {
    const empresa = empresas.find(e => e.id === id);
    
    if (!empresa) {
      toast.error('Empresa não encontrada');
      return false;
    }

    // Verificar se tem funcionários vinculados
    if (empresa.funcionarios && empresa.funcionarios > 0) {
      toast.error('Não é possível excluir empresa com funcionários vinculados');
      return false;
    }

    setLoading(true);
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setEmpresas(prev => prev.filter(e => e.id !== id));
      toast.success('Empresa excluída com sucesso!');
      return true;

    } catch (error) {
      toast.error('Erro ao excluir empresa');
      return false;
    } finally {
      setLoading(false);
    }
  }, [empresas]);

  // Obter empresas ativas
  const obterEmpresasAtivas = useCallback((): Empresa[] => {
    return empresas.filter(empresa => empresa.ativo);
  }, [empresas]);

  // Obter empresa por ID
  const obterEmpresaPorId = useCallback((id: string): Empresa | undefined => {
    return empresas.find(empresa => empresa.id === id);
  }, [empresas]);

  // Buscar empresas
  const buscarEmpresas = useCallback((termo: string): Empresa[] => {
    if (!termo.trim()) return empresas;
    
    const termoBusca = termo.toLowerCase().trim();
    return empresas.filter(empresa =>
      empresa.nome.toLowerCase().includes(termoBusca) ||
      empresa.cnpj.includes(termoBusca) ||
      empresa.email.toLowerCase().includes(termoBusca)
    );
  }, [empresas]);

  // Estatísticas
  const estatisticas = {
    total: empresas.length,
    ativas: empresas.filter(e => e.ativo).length,
    inativas: empresas.filter(e => !e.ativo).length,
    totalFuncionarios: empresas.reduce((total, empresa) => total + (empresa.funcionarios || 0), 0)
  };

  // Resetar dados para mock inicial
  const resetarDados = useCallback(() => {
    clearEmpresas();
    toast.success('Dados resetados para configuração inicial!');
  }, [clearEmpresas]);

  return {
    empresas,
    loading,
    estatisticas,
    criarEmpresa,
    atualizarEmpresa,
    alternarStatusEmpresa,
    excluirEmpresa,
    obterEmpresasAtivas,
    obterEmpresaPorId,
    buscarEmpresas,
    resetarDados,
    validarCNPJ,
    validarEmail,
    validarTelefone
  };
}