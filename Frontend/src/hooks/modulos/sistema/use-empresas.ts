import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import type { Empresa, EmpresaFormData } from '@/types/sistema';
import { empresaService, converterEmpresaAPIParaFrontend, converterEmpresaFormDataParaPayload } from '@/services/empresa-service';

// Interface para filtros de busca
interface FiltrosEmpresa {
  busca?: string;
  data_inicio?: string;
  data_fim?: string;
  page?: number;
  limit?: number;
}

export function useEmpresas() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Carregar empresas da API
  const carregarEmpresas = useCallback(async (filtros?: FiltrosEmpresa) => {
    setLoading(true);
    setErro(null);

    try {
      const response = await empresaService.listar(filtros);
      
      if (response.success && response.data) {
        // Converter empresas da API para formato frontend
        const empresasConvertidas = response.data.items.map(empresaAPI => ({
          ...converterEmpresaAPIParaFrontend(empresaAPI),
          // Garantir que os campos obrigatórios estejam presentes
          total_lojas: empresaAPI.total_lojas || 0,
          lojas_ativas: empresaAPI.lojas_ativas || 0
        }));
        
        setEmpresas(empresasConvertidas);
      } else {
        throw new Error(response.error || 'Erro ao carregar empresas');
      }
    } catch (error: any) {
      const mensagemErro = error.message || 'Erro ao carregar empresas';
      setErro(mensagemErro);
      toast.error(mensagemErro);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar empresas ao montar o componente
  useEffect(() => {
    carregarEmpresas();
  }, [carregarEmpresas]);

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

  // Validar dados da empresa - apenas nome obrigatório
  const validarEmpresa = useCallback((dados: EmpresaFormData): string[] => {
    const erros: string[] = [];

    // ✅ Único campo obrigatório
    if (!dados.nome || dados.nome.trim().length < 2) {
      erros.push('Nome da empresa deve ter pelo menos 2 caracteres');
    }

    // ✅ Validações condicionais - apenas se preenchidos
    if (dados.cnpj && !validarCNPJ(dados.cnpj)) {
      erros.push('CNPJ inválido');
    }

    if (dados.email && !validarEmail(dados.email)) {
      erros.push('Email inválido');
    }

    if (dados.telefone && !validarTelefone(dados.telefone)) {
      erros.push('Telefone inválido');
    }

    return erros;
  }, [validarCNPJ, validarEmail, validarTelefone]);

  // Criar empresa
  const criarEmpresa = useCallback(async (dados: EmpresaFormData): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Validações locais
      const erros = validarEmpresa(dados);
      if (erros.length > 0) {
        erros.forEach(erro => toast.error(erro));
        return false;
      }

      // Converter dados para formato da API
      const payload = converterEmpresaFormDataParaPayload(dados);
      
      // Chamar API
      const response = await empresaService.criar(payload);
      
      if (response.success && response.data) {
        // Recarregar lista de empresas
        await carregarEmpresas();
        toast.success('Empresa criada com sucesso!');
        return true;
      } else {
        throw new Error(response.error || 'Erro ao criar empresa');
      }

    } catch (error: any) {
      const mensagemErro = error.message || 'Erro ao criar empresa';
      toast.error(mensagemErro);
      return false;
    } finally {
      setLoading(false);
    }
  }, [validarEmpresa, carregarEmpresas]);

  // Atualizar empresa
  const atualizarEmpresa = useCallback(async (id: string, dados: EmpresaFormData): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Validações locais
      const erros = validarEmpresa(dados);
      if (erros.length > 0) {
        erros.forEach(erro => toast.error(erro));
        return false;
      }

      // Converter dados para formato da API
      const payload = converterEmpresaFormDataParaPayload(dados);
      
      // Chamar API
      const response = await empresaService.atualizar(id, payload);
      
      if (response.success && response.data) {
        // Recarregar lista de empresas
        await carregarEmpresas();
        toast.success('Empresa atualizada com sucesso!');
        return true;
      } else {
        throw new Error(response.error || 'Erro ao atualizar empresa');
      }

    } catch (error: any) {
      const mensagemErro = error.message || 'Erro ao atualizar empresa';
      toast.error(mensagemErro);
      return false;
    } finally {
      setLoading(false);
    }
  }, [validarEmpresa, carregarEmpresas]);

  // Alternar status da empresa
  const alternarStatusEmpresa = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    
    try {
      const empresa = empresas.find(e => e.id === id);
      if (!empresa) {
        throw new Error('Empresa não encontrada');
      }

      // Atualizar apenas o status
      const response = await empresaService.atualizar(id, {
        ativo: !empresa.ativo
      });

      if (response.success) {
        // Recarregar lista de empresas
        await carregarEmpresas();
        const novoStatus = !empresa.ativo ? 'ativada' : 'desativada';
        toast.success(`Empresa ${novoStatus} com sucesso!`);
      } else {
        throw new Error(response.error || 'Erro ao alterar status');
      }

    } catch (error: any) {
      const mensagemErro = error.message || 'Erro ao alterar status da empresa';
      toast.error(mensagemErro);
    } finally {
      setLoading(false);
    }
  }, [empresas, carregarEmpresas]);

  // Excluir empresa
  const excluirEmpresa = useCallback(async (id: string): Promise<boolean> => {
    const empresa = empresas.find(e => e.id === id);
    
    if (!empresa) {
      toast.error('Empresa não encontrada');
      return false;
    }

    // Verificar se tem lojas vinculadas
    if (empresa.total_lojas && empresa.total_lojas > 0) {
      toast.error('Não é possível excluir empresa com lojas vinculadas');
      return false;
    }

    setLoading(true);
    
    try {
      // Chamar API
      const response = await empresaService.excluir(id);
      
      if (response.success) {
        // Recarregar lista de empresas
        await carregarEmpresas();
        toast.success('Empresa excluída com sucesso!');
        return true;
      } else {
        throw new Error(response.error || 'Erro ao excluir empresa');
      }

    } catch (error: any) {
      const mensagemErro = error.message || 'Erro ao excluir empresa';
      toast.error(mensagemErro);
      return false;
    } finally {
      setLoading(false);
    }
  }, [empresas, carregarEmpresas]);

  // Obter empresas ativas
  const obterEmpresasAtivas = useCallback((): Empresa[] => {
    return empresas.filter(empresa => empresa.ativo);
  }, [empresas]);

  // Obter empresa por ID
  const obterEmpresaPorId = useCallback((id: string): Empresa | undefined => {
    return empresas.find(empresa => empresa.id === id);
  }, [empresas]);

  // Buscar empresas localmente (filtro rápido)
  const buscarEmpresas = useCallback((termo: string): Empresa[] => {
    if (!termo.trim()) return empresas;
    
    const termoBusca = termo.toLowerCase().trim();
    return empresas.filter(empresa =>
      empresa.nome.toLowerCase().includes(termoBusca) ||
      (empresa.cnpj && empresa.cnpj.includes(termoBusca)) ||
      (empresa.email && empresa.email.toLowerCase().includes(termoBusca))
    );
  }, [empresas]);

  // Verificar disponibilidade de CNPJ
  const verificarCNPJDisponivel = useCallback(async (cnpj: string, empresaId?: string): Promise<boolean> => {
    if (!cnpj) return true;

    try {
      const response = await empresaService.verificarCNPJ(cnpj, empresaId);
      return response.success && response.data ? response.data.disponivel : false;
    } catch {
      return false;
    }
  }, []);

  // Verificar disponibilidade de nome
  const verificarNomeDisponivel = useCallback(async (nome: string, empresaId?: string): Promise<boolean> => {
    if (!nome) return true;

    try {
      const response = await empresaService.verificarNome(nome, empresaId);
      return response.success && response.data ? response.data.disponivel : false;
    } catch {
      return false;
    }
  }, []);

  // Estatísticas
  const estatisticas = {
    total: empresas.length,
    ativas: empresas.filter(e => e.ativo).length,
    inativas: empresas.filter(e => !e.ativo).length,
    totalLojas: empresas.reduce((total, empresa) => total + (empresa.total_lojas || 0), 0),
    lojasAtivas: empresas.reduce((total, empresa) => total + (empresa.lojas_ativas || 0), 0)
  };

  // Teste de conectividade
  const testarConectividade = useCallback(async (): Promise<boolean> => {
    try {
      const response = await empresaService.testePublico();
      if (response.success) {
        toast.success('Conectado ao backend!');
        return true;
      } else {
        toast.error('Erro ao conectar com o backend');
        return false;
      }
    } catch {
      toast.error('Backend não está acessível');
      return false;
    }
  }, []);

  // Resetar dados (limpar cache local)
  const resetarDados = useCallback(() => {
    setEmpresas([]);
    setErro(null);
    setLoading(false);
    toast.success('Dados de empresas resetados!');
  }, []);

  return {
    empresas,
    loading,
    erro,
    estatisticas,
    carregarEmpresas,
    criarEmpresa,
    atualizarEmpresa,
    alternarStatusEmpresa,
    excluirEmpresa,
    obterEmpresasAtivas,
    obterEmpresaPorId,
    buscarEmpresas,
    verificarCNPJDisponivel,
    verificarNomeDisponivel,
    testarConectividade,
    resetarDados,
    validarCNPJ,
    validarEmail,
    validarTelefone
  };
}