import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { Loja, LojaFormData } from '@/types/sistema';
import { useEmpresas } from './use-empresas';
import { useLocalStorage } from '@/hooks/globais/use-local-storage';

// Mock data para desenvolvimento
const mockLojas: Loja[] = [
  {
    id: '1',
    nome: 'Fluyt São Paulo - Centro',
    codigo: 'SP001',
    endereco: 'Av. Paulista, 1000 - Centro, São Paulo/SP',
    telefone: '(11) 98765-4321',
    email: 'centro@fluyt.com.br',
    gerente: 'Maria Silva',
    funcionarios: 15,
    vendasMes: 245000,
    metaMes: 200000,
    ativa: true,
    empresaId: '1',
    empresa: 'Fluyt Móveis & Design',
    dataAbertura: '2020-01-15',
    createdAt: '2020-01-15T10:00:00Z'
  },
  {
    id: '2',
    nome: 'Fluyt Santos - Centro',
    codigo: 'ST001',
    endereco: 'Rua do Comércio, 500 - Centro, Santos/SP',
    telefone: '(13) 3456-7890',
    email: 'santos@fluyt.com.br',
    gerente: 'João Santos',
    funcionarios: 8,
    vendasMes: 128000,
    metaMes: 150000,
    ativa: true,
    empresaId: '2',
    empresa: 'Fluyt Filial Santos',
    dataAbertura: '2022-06-10',
    createdAt: '2022-06-10T10:00:00Z'
  },
  {
    id: '3',
    nome: 'Fluyt ABC - Shopping',
    codigo: 'ABC001',
    endereco: 'Shopping ABC - Santo André/SP',
    telefone: '(11) 2345-6789',
    email: 'abc@fluyt.com.br',
    gerente: 'Ana Costa',
    funcionarios: 12,
    vendasMes: 189000,
    metaMes: 180000,
    ativa: true,
    empresaId: '1',
    empresa: 'Fluyt Móveis & Design',
    dataAbertura: '2021-03-20',
    createdAt: '2021-03-20T10:00:00Z'
  },
  {
    id: '4',
    nome: 'Fluyt Norte - Inativa',
    codigo: 'NR001',
    endereco: 'Av. Marginal, 2000 - Guarulhos/SP',
    telefone: '(11) 97777-8888',
    email: 'norte@fluyt.com.br',
    gerente: 'Carlos Oliveira',
    funcionarios: 0,
    vendasMes: 0,
    metaMes: 120000,
    ativa: false,
    empresaId: '3',
    empresa: 'Fluyt Norte',
    dataAbertura: '2023-03-20',
    createdAt: '2023-03-20T10:00:00Z'
  }
];

export function useLojas() {
  const { obterEmpresaPorId } = useEmpresas();
  const [lojas, setLojas, clearLojas] = useLocalStorage<Loja[]>('fluyt_lojas', mockLojas);
  const [loading, setLoading] = useState(false);

  // Validar código da loja
  const validarCodigo = useCallback((codigo: string): boolean => {
    const codigoLimpo = codigo.trim().toUpperCase();
    return codigoLimpo.length >= 3 && /^[A-Z0-9]+$/.test(codigoLimpo);
  }, []);

  // Validar email
  const validarEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }, []);

  // Validar telefone
  const validarTelefone = useCallback((telefone: string): boolean => {
    const telefoneNumeros = telefone.replace(/[^\d]/g, '');
    return telefoneNumeros.length >= 10;
  }, []);

  // Validar dados da loja
  const validarLoja = useCallback((dados: LojaFormData): string[] => {
    const erros: string[] = [];

    if (!dados.nome || dados.nome.trim().length < 3) {
      erros.push('Nome da loja deve ter pelo menos 3 caracteres');
    }

    if (!validarCodigo(dados.codigo)) {
      erros.push('Código deve ter pelo menos 3 caracteres (apenas letras e números)');
    }

    if (!dados.endereco || dados.endereco.trim().length < 10) {
      erros.push('Endereço deve ter pelo menos 10 caracteres');
    }

    if (!validarTelefone(dados.telefone)) {
      erros.push('Telefone inválido');
    }

    if (!validarEmail(dados.email)) {
      erros.push('Email inválido');
    }

    if (!dados.gerente || dados.gerente.trim().length < 3) {
      erros.push('Nome do gerente deve ter pelo menos 3 caracteres');
    }

    if (!dados.empresaId) {
      erros.push('Empresa é obrigatória');
    }

    if (dados.metaMes <= 0) {
      erros.push('Meta mensal deve ser maior que zero');
    }

    return erros;
  }, [validarCodigo, validarTelefone, validarEmail]);

  // Verificar duplicidade de código
  const verificarCodigoDuplicado = useCallback((codigo: string, lojaId?: string): boolean => {
    const codigoLimpo = codigo.trim().toUpperCase();
    return lojas.some(loja => 
      loja.codigo.toUpperCase() === codigoLimpo && 
      loja.id !== lojaId
    );
  }, [lojas]);

  // Gerar próximo código
  const gerarProximoCodigo = useCallback((empresaId: string): string => {
    const lojasEmpresa = lojas.filter(loja => loja.empresaId === empresaId);
    const numero = (lojasEmpresa.length + 1).toString().padStart(3, '0');
    
    // Usar as primeiras 2 letras da empresa como prefixo
    const prefixos: Record<string, string> = {
      '1': 'SP', // Fluyt São Paulo
      '2': 'ST', // Fluyt Santos
      '3': 'NR'  // Fluyt Norte
    };
    
    const prefixo = prefixos[empresaId] || 'FL';
    return `${prefixo}${numero}`;
  }, [lojas]);

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
        dataAbertura: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };

      setLojas(prev => [...prev, novaLoja]);
      toast.success('Loja criada com sucesso!');
      return true;

    } catch (error) {
      toast.error('Erro ao criar loja');
      return false;
    } finally {
      setLoading(false);
    }
  }, [validarLoja, verificarCodigoDuplicado, obterEmpresaPorId]);

  // Atualizar loja
  const atualizarLoja = useCallback(async (id: string, dados: LojaFormData): Promise<boolean> => {
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

      setLojas(prev => prev.map(loja => 
        loja.id === id 
          ? { 
              ...loja, 
              ...dados, 
              codigo: dados.codigo.toUpperCase(),
              empresa: empresa.nome,
              updatedAt: new Date().toISOString() 
            }
          : loja
      ));

      toast.success('Loja atualizada com sucesso!');
      return true;

    } catch (error) {
      toast.error('Erro ao atualizar loja');
      return false;
    } finally {
      setLoading(false);
    }
  }, [validarLoja, verificarCodigoDuplicado, obterEmpresaPorId]);

  // Alternar status da loja
  const alternarStatusLoja = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setLojas(prev => prev.map(loja => 
        loja.id === id 
          ? { ...loja, ativa: !loja.ativa, updatedAt: new Date().toISOString() }
          : loja
      ));

      const loja = lojas.find(l => l.id === id);
      const novoStatus = !loja?.ativa ? 'ativada' : 'desativada';
      toast.success(`Loja ${novoStatus} com sucesso!`);

    } catch (error) {
      toast.error('Erro ao alterar status da loja');
    } finally {
      setLoading(false);
    }
  }, [lojas]);

  // Excluir loja
  const excluirLoja = useCallback(async (id: string): Promise<boolean> => {
    const loja = lojas.find(l => l.id === id);
    
    if (!loja) {
      toast.error('Loja não encontrada');
      return false;
    }

    // Verificar se tem funcionários vinculados
    if (loja.funcionarios > 0) {
      toast.error('Não é possível excluir loja com funcionários vinculados');
      return false;
    }

    setLoading(true);
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setLojas(prev => prev.filter(l => l.id !== id));
      toast.success('Loja excluída com sucesso!');
      return true;

    } catch (error) {
      toast.error('Erro ao excluir loja');
      return false;
    } finally {
      setLoading(false);
    }
  }, [lojas]);

  // Atualizar vendas da loja
  const atualizarVendas = useCallback(async (id: string, vendas: number): Promise<void> => {
    setLoading(true);
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 300));

      setLojas(prev => prev.map(loja => 
        loja.id === id 
          ? { ...loja, vendasMes: vendas, updatedAt: new Date().toISOString() }
          : loja
      ));

      toast.success('Vendas atualizadas com sucesso!');

    } catch (error) {
      toast.error('Erro ao atualizar vendas');
    } finally {
      setLoading(false);
    }
  }, []);

  // Atualizar meta da loja
  const atualizarMeta = useCallback(async (id: string, meta: number): Promise<void> => {
    if (meta <= 0) {
      toast.error('Meta deve ser maior que zero');
      return;
    }

    setLoading(true);
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 300));

      setLojas(prev => prev.map(loja => 
        loja.id === id 
          ? { ...loja, metaMes: meta, updatedAt: new Date().toISOString() }
          : loja
      ));

      toast.success('Meta atualizada com sucesso!');

    } catch (error) {
      toast.error('Erro ao atualizar meta');
    } finally {
      setLoading(false);
    }
  }, []);

  // Obter lojas ativas
  const obterLojasAtivas = useCallback((): Loja[] => {
    return lojas.filter(loja => loja.ativa);
  }, [lojas]);

  // Obter lojas por empresa
  const obterLojasPorEmpresa = useCallback((empresaId: string): Loja[] => {
    return lojas.filter(loja => loja.empresaId === empresaId);
  }, [lojas]);

  // Obter loja por ID
  const obterLojaPorId = useCallback((id: string): Loja | undefined => {
    return lojas.find(loja => loja.id === id);
  }, [lojas]);

  // Buscar lojas
  const buscarLojas = useCallback((termo: string): Loja[] => {
    if (!termo.trim()) return lojas;
    
    const termoBusca = termo.toLowerCase().trim();
    return lojas.filter(loja =>
      loja.nome.toLowerCase().includes(termoBusca) ||
      loja.codigo.toLowerCase().includes(termoBusca) ||
      loja.gerente.toLowerCase().includes(termoBusca) ||
      loja.endereco.toLowerCase().includes(termoBusca)
    );
  }, [lojas]);

  // Calcular performance
  const calcularPerformance = useCallback((vendas: number, meta: number): number => {
    return meta > 0 ? Math.round((vendas / meta) * 100) : 0;
  }, []);

  // Obter performance de uma loja
  const obterPerformanceLoja = useCallback((id: string): number => {
    const loja = lojas.find(l => l.id === id);
    return loja ? calcularPerformance(loja.vendasMes, loja.metaMes) : 0;
  }, [lojas, calcularPerformance]);

  // Estatísticas
  const estatisticas = {
    total: lojas.length,
    ativas: lojas.filter(l => l.ativa).length,
    inativas: lojas.filter(l => !l.ativa).length,
    totalFuncionarios: lojas.reduce((total, loja) => total + loja.funcionarios, 0),
    vendasTotais: lojas.reduce((total, loja) => total + loja.vendasMes, 0),
    metaTotal: lojas.reduce((total, loja) => total + loja.metaMes, 0),
    performanceMedia: lojas.length > 0 
      ? Math.round(lojas.reduce((total, loja) => total + calcularPerformance(loja.vendasMes, loja.metaMes), 0) / lojas.length)
      : 0
  };

  // Resetar dados para mock inicial
  const resetarDados = useCallback(() => {
    clearLojas();
    toast.success('Dados de lojas resetados para configuração inicial!');
  }, [clearLojas]);

  return {
    lojas,
    loading,
    estatisticas,
    criarLoja,
    atualizarLoja,
    alternarStatusLoja,
    excluirLoja,
    atualizarVendas,
    atualizarMeta,
    obterLojasAtivas,
    obterLojasPorEmpresa,
    obterLojaPorId,
    buscarLojas,
    calcularPerformance,
    obterPerformanceLoja,
    gerarProximoCodigo,
    resetarDados,
    validarCodigo,
    validarTelefone
  };
}