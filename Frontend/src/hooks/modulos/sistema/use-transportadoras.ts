import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { Transportadora, TransportadoraFormData } from '@/types/sistema';
import { useLocalStorage } from '@/hooks/globais/use-local-storage';

// Mock data para desenvolvimento
const mockTransportadoras: Transportadora[] = [
  {
    id: '1',
    nomeEmpresa: 'Transportes Rápido Ltda',
    valorFixo: 150,
    telefone: '(11) 3000-1111',
    email: 'contato@rapidotransportes.com.br',
    ativo: true,
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    nomeEmpresa: 'Logística Express',
    valorFixo: 180,
    telefone: '(11) 3000-2222',
    email: 'vendas@logisticaexpress.com.br',
    ativo: true,
    createdAt: '2024-01-16T10:00:00Z'
  },
  {
    id: '3',
    nomeEmpresa: 'Entrega Fácil Transportes',
    valorFixo: 120,
    telefone: '(11) 3000-3333',
    email: 'operacao@entregafacil.com.br',
    ativo: false,
    createdAt: '2024-01-17T10:00:00Z'
  },
  {
    id: '4',
    nomeEmpresa: 'Mundial Cargas',
    valorFixo: 200,
    telefone: '(11) 3000-4444',
    email: 'comercial@mundialcargas.com.br',
    ativo: true,
    createdAt: '2024-01-18T10:00:00Z'
  },
  {
    id: '5',
    nomeEmpresa: 'TransFret Logística',
    valorFixo: 160,
    telefone: '(11) 3000-5555',
    email: 'atendimento@transfret.com.br',
    ativo: true,
    createdAt: '2024-01-19T10:00:00Z'
  }
];

export function useTransportadoras() {
  const [transportadoras, setTransportadoras, clearTransportadoras] = useLocalStorage<Transportadora[]>('fluyt_transportadoras', mockTransportadoras);
  const [loading, setLoading] = useState(false);

  // Validar dados da transportadora
  const validarTransportadora = useCallback((dados: TransportadoraFormData): string[] => {
    const erros: string[] = [];

    if (!dados.nomeEmpresa || dados.nomeEmpresa.trim().length < 2) {
      erros.push('Nome da empresa deve ter pelo menos 2 caracteres');
    }

    if (!dados.valorFixo || dados.valorFixo <= 0) {
      erros.push('Valor fixo deve ser maior que zero');
    }

    if (!dados.telefone || dados.telefone.trim().length < 10) {
      erros.push('Telefone deve ter formato válido');
    }

    if (!dados.email || !dados.email.includes('@')) {
      erros.push('Email deve ter formato válido');
    }

    return erros;
  }, []);

  // Verificar duplicidade de nome
  const verificarNomeDuplicado = useCallback((nomeEmpresa: string, transportadoraId?: string): boolean => {
    const nomeLimpo = nomeEmpresa.trim().toLowerCase();
    return transportadoras.some(transportadora => 
      transportadora.nomeEmpresa.toLowerCase() === nomeLimpo && 
      transportadora.id !== transportadoraId
    );
  }, [transportadoras]);

  // Verificar duplicidade de email
  const verificarEmailDuplicado = useCallback((email: string, transportadoraId?: string): boolean => {
    const emailLimpo = email.trim().toLowerCase();
    return transportadoras.some(transportadora => 
      transportadora.email.toLowerCase() === emailLimpo && 
      transportadora.id !== transportadoraId
    );
  }, [transportadoras]);

  // Criar transportadora
  const criarTransportadora = useCallback(async (dados: TransportadoraFormData): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Validações
      const erros = validarTransportadora(dados);
      
      if (verificarNomeDuplicado(dados.nomeEmpresa)) {
        erros.push('Já existe uma transportadora com este nome');
      }

      if (verificarEmailDuplicado(dados.email)) {
        erros.push('Já existe uma transportadora com este email');
      }

      if (erros.length > 0) {
        erros.forEach(erro => toast.error(erro));
        return false;
      }

      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const novaTransportadora: Transportadora = {
        id: Date.now().toString(),
        ...dados,
        nomeEmpresa: dados.nomeEmpresa.trim(),
        email: dados.email.trim().toLowerCase(),
        ativo: true,
        createdAt: new Date().toISOString()
      };

      setTransportadoras(prev => [...prev, novaTransportadora]);
      toast.success('Transportadora cadastrada com sucesso!');
      return true;

    } catch (error) {
      toast.error('Erro ao cadastrar transportadora');
      return false;
    } finally {
      setLoading(false);
    }
  }, [validarTransportadora, verificarNomeDuplicado, verificarEmailDuplicado, setTransportadoras]);

  // Atualizar transportadora
  const atualizarTransportadora = useCallback(async (id: string, dados: TransportadoraFormData): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Validações
      const erros = validarTransportadora(dados);
      
      if (verificarNomeDuplicado(dados.nomeEmpresa, id)) {
        erros.push('Já existe uma transportadora com este nome');
      }

      if (verificarEmailDuplicado(dados.email, id)) {
        erros.push('Já existe uma transportadora com este email');
      }

      if (erros.length > 0) {
        erros.forEach(erro => toast.error(erro));
        return false;
      }

      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setTransportadoras(prev => prev.map(transportadora => 
        transportadora.id === id 
          ? { 
              ...transportadora, 
              ...dados, 
              nomeEmpresa: dados.nomeEmpresa.trim(),
              email: dados.email.trim().toLowerCase(),
              updatedAt: new Date().toISOString() 
            }
          : transportadora
      ));

      toast.success('Transportadora atualizada com sucesso!');
      return true;

    } catch (error) {
      toast.error('Erro ao atualizar transportadora');
      return false;
    } finally {
      setLoading(false);
    }
  }, [validarTransportadora, verificarNomeDuplicado, verificarEmailDuplicado, setTransportadoras]);

  // Excluir transportadora
  const excluirTransportadora = useCallback(async (id: string): Promise<boolean> => {
    const transportadora = transportadoras.find(t => t.id === id);
    
    if (!transportadora) {
      toast.error('Transportadora não encontrada');
      return false;
    }

    setLoading(true);
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setTransportadoras(prev => prev.filter(t => t.id !== id));
      toast.success('Transportadora excluída com sucesso!');
      return true;

    } catch (error) {
      toast.error('Erro ao excluir transportadora');
      return false;
    } finally {
      setLoading(false);
    }
  }, [transportadoras, setTransportadoras]);

  // Alternar status ativo/inativo
  const alternarStatus = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 300));

      setTransportadoras(prev => prev.map(transportadora => 
        transportadora.id === id 
          ? { ...transportadora, ativo: !transportadora.ativo, updatedAt: new Date().toISOString() }
          : transportadora
      ));

      const transportadora = transportadoras.find(t => t.id === id);
      const novoStatus = !transportadora?.ativo ? 'ativada' : 'desativada';
      toast.success(`Transportadora ${novoStatus} com sucesso!`);

    } catch (error) {
      toast.error('Erro ao alterar status');
    } finally {
      setLoading(false);
    }
  }, [transportadoras, setTransportadoras]);

  // Buscar transportadoras
  const buscarTransportadoras = useCallback((termo: string): Transportadora[] => {
    if (!termo.trim()) return transportadoras;
    
    const termoBusca = termo.toLowerCase().trim();
    return transportadoras.filter(transportadora =>
      transportadora.nomeEmpresa.toLowerCase().includes(termoBusca) ||
      transportadora.email.toLowerCase().includes(termoBusca) ||
      transportadora.telefone.includes(termoBusca)
    );
  }, [transportadoras]);

  // Filtrar por status
  const filtrarPorStatus = useCallback((ativo: boolean | 'all'): Transportadora[] => {
    if (ativo === 'all') return transportadoras;
    return transportadoras.filter(transportadora => transportadora.ativo === ativo);
  }, [transportadoras]);

  // Estatísticas
  const estatisticas = {
    total: transportadoras.length,
    ativas: transportadoras.filter(t => t.ativo).length,
    inativas: transportadoras.filter(t => !t.ativo).length,
    valorMedio: transportadoras.length > 0 
      ? transportadoras.reduce((sum, t) => sum + t.valorFixo, 0) / transportadoras.length
      : 0,
    menorValor: transportadoras.length > 0 
      ? Math.min(...transportadoras.map(t => t.valorFixo))
      : 0,
    maiorValor: transportadoras.length > 0 
      ? Math.max(...transportadoras.map(t => t.valorFixo))
      : 0
  };

  // Resetar dados para mock inicial
  const resetarDados = useCallback(() => {
    clearTransportadoras();
    toast.success('Dados resetados para configuração inicial!');
  }, [clearTransportadoras]);

  return {
    transportadoras,
    loading,
    estatisticas,
    criarTransportadora,
    atualizarTransportadora,
    excluirTransportadora,
    alternarStatus,
    buscarTransportadoras,
    filtrarPorStatus,
    resetarDados
  };
}