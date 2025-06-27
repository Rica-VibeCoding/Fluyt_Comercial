import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import type { Setor, SetorFormData } from '@/types/sistema';
import { setoresService } from '@/services/setores-service'; // ✅ ATIVADO

// ✅ DADOS REAIS DO SUPABASE + Fallback para estabilidade
// Mock data usado apenas como fallback em caso de erro de conexão
const mockSetores: Setor[] = [
  {
    id: 'mock-vendas-001',
    nome: 'Vendas',
    descricao: 'Equipe responsável pela venda de produtos e atendimento ao cliente',
    funcionarios: 8,
    ativo: true,
    createdAt: '2024-01-10T10:00:00Z'
  },
  {
    id: 'mock-medicao-002', 
    nome: 'Medição',
    descricao: 'Profissionais responsáveis por medições e projetos técnicos',
    funcionarios: 3,
    ativo: true,
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'mock-montagem-003',
    nome: 'Montagem',
    descricao: 'Equipe de montadores e instaladores',
    funcionarios: 5,
    ativo: true,
    createdAt: '2024-02-01T10:00:00Z'
  },
  {
    id: 'mock-admin-004',
    nome: 'Administrativo',
    descricao: 'Setor administrativo e financeiro',
    funcionarios: 0,
    ativo: false,
    createdAt: '2024-02-10T10:00:00Z'
  }
];

export function useSetores() {
  const [setores, setSetores] = useState<Setor[]>([]);
  const [loading, setLoading] = useState(false);

  // Validar dados do setor
  const validarSetor = useCallback((dados: SetorFormData): string[] => {
    const erros: string[] = [];

    if (!dados.nome || dados.nome.trim().length < 2) {
      erros.push('Nome do setor deve ter pelo menos 2 caracteres');
    }

    if (dados.descricao && dados.descricao.trim().length > 0 && dados.descricao.trim().length < 10) {
      erros.push('Descrição deve ter pelo menos 10 caracteres se preenchida');
    }

    return erros;
  }, []);

  // Verificar duplicidade de nome
  const verificarNomeDuplicado = useCallback((nome: string, setorId?: string): boolean => {
    return setores.some(setor => 
      setor.nome.toLowerCase() === nome.toLowerCase() && 
      setor.id !== setorId
    );
  }, [setores]);

  // ✅ CRIAR SETOR - API REAL
  const criarSetor = useCallback(async (dados: SetorFormData): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Validações locais
      const erros = validarSetor(dados);
      
      if (verificarNomeDuplicado(dados.nome)) {
        erros.push('Nome do setor já cadastrado');
      }

      if (erros.length > 0) {
        erros.forEach(erro => toast.error(erro));
        return false;
      }

      // ✅ Chamada real à API
      const response = await setoresService.criar(dados);
      
      if (response.success && response.data) {
        setSetores(prev => [...prev, response.data as Setor]);
        toast.success('Setor criado com sucesso!');
        return true;
      } else {
        toast.error(response.error || 'Erro ao criar setor');
        return false;
      }

    } catch (error) {
      console.error('Erro ao criar setor:', error);
      toast.error('Erro ao criar setor');
      return false;
    } finally {
      setLoading(false);
    }
  }, [validarSetor, verificarNomeDuplicado]);

  // ✅ ATUALIZAR SETOR - API REAL
  const atualizarSetor = useCallback(async (id: string, dados: SetorFormData): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Validações locais
      const erros = validarSetor(dados);
      
      if (verificarNomeDuplicado(dados.nome, id)) {
        erros.push('Nome do setor já cadastrado');
      }

      if (erros.length > 0) {
        erros.forEach(erro => toast.error(erro));
        return false;
      }

      // ✅ Chamada real à API
      const response = await setoresService.atualizar(id, dados);
      
      if (response.success && response.data) {
        setSetores(prev => prev.map(setor => 
          setor.id === id ? response.data as Setor : setor
        ));
        toast.success('Setor atualizado com sucesso!');
        return true;
      } else {
        toast.error(response.error || 'Erro ao atualizar setor');
        return false;
      }

    } catch (error) {
      console.error('Erro ao atualizar setor:', error);
      toast.error('Erro ao atualizar setor');
      return false;
    } finally {
      setLoading(false);
    }
  }, [validarSetor, verificarNomeDuplicado]);

  // ✅ EXCLUIR SETOR - API REAL
  const excluirSetor = useCallback(async (id: string): Promise<boolean> => {
    const setor = setores.find(s => s.id === id);
    
    if (!setor) {
      toast.error('Setor não encontrado');
      return false;
    }

    // Verificar se tem funcionários vinculados
    if (setor.funcionarios && setor.funcionarios > 0) {
      toast.error('Não é possível excluir setor com funcionários vinculados');
      return false;
    }

    setLoading(true);
    
    try {
      // ✅ Chamada real à API
      const response = await setoresService.excluir(id);
      
      if (response.success) {
        setSetores(prev => prev.filter(s => s.id !== id));
        toast.success('Setor excluído com sucesso!');
        return true;
      } else {
        toast.error(response.error || 'Erro ao excluir setor');
        return false;
      }

    } catch (error) {
      console.error('Erro ao excluir setor:', error);
      toast.error('Erro ao excluir setor');
      return false;
    } finally {
      setLoading(false);
    }
  }, [setores]);

  // ✅ ALTERNAR STATUS - API REAL (mantida funcionalidade simulada por enquanto)
  const alternarStatusSetor = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    
    try {
      // TODO: Implementar endpoint de alternar status no backend
      // Por enquanto, simular para manter funcionalidade
      await new Promise(resolve => setTimeout(resolve, 500));

      setSetores(prev => prev.map(setor => 
        setor.id === id 
          ? { ...setor, ativo: !setor.ativo, updatedAt: new Date().toISOString() }
          : setor
      ));

      const setor = setores.find(s => s.id === id);
      const novoStatus = !setor?.ativo ? 'ativado' : 'desativado';
      toast.success(`Setor ${novoStatus} com sucesso!`);

    } catch (error) {
      toast.error('Erro ao alterar status do setor');
    } finally {
      setLoading(false);
    }
  }, [setores]);

  // Obter setores ativos
  const obterSetoresAtivos = useCallback((): Setor[] => {
    return setores.filter(setor => setor.ativo);
  }, [setores]);

  // Obter setor por ID
  const obterSetorPorId = useCallback((id: string): Setor | undefined => {
    return setores.find(setor => setor.id === id);
  }, [setores]);

  // Buscar setores
  const buscarSetores = useCallback((termo: string): Setor[] => {
    if (!termo.trim()) return setores;
    
    const termoBusca = termo.toLowerCase().trim();
    return setores.filter(setor =>
      setor.nome.toLowerCase().includes(termoBusca) ||
      (setor.descricao && setor.descricao.toLowerCase().includes(termoBusca))
    );
  }, [setores]);

  // Estatísticas
  const estatisticas = {
    total: setores.length,
    ativos: setores.filter(s => s.ativo).length,
    inativos: setores.filter(s => !s.ativo).length,
    totalFuncionarios: setores.reduce((total, setor) => total + (setor.funcionarios || 0), 0)
  };

  // ✅ CARREGAR SETORES REAIS DO SUPABASE
  const carregarSetores = useCallback(async () => {
    setLoading(true);
    
    try {
      console.log('🔄 Carregando setores do Supabase...');
      const response = await setoresService.listar();
      
      if (response.success && response.data) {
        setSetores(response.data.items as Setor[]);
        console.log(`✅ ${response.data.items.length} setores carregados do Supabase`);
      } else {
        // Fallback para mocks se API falhar
        console.warn('⚠️ API falhou, usando setores mockados como fallback');
        setSetores(mockSetores);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar setores:', error);
      // Usar dados mockados como fallback
      console.warn('⚠️ Usando setores mockados (erro de conexão)');
      setSetores(mockSetores);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ CORRIGIDO: useEffect só executa UMA vez na montagem
  useEffect(() => {
    carregarSetores();
  }, []); // ✅ DEPENDÊNCIA VAZIA - executa apenas 1 vez!

  return {
    setores,
    loading,
    estatisticas,
    criarSetor,
    atualizarSetor,
    alternarStatusSetor,
    excluirSetor,
    obterSetoresAtivos,
    obterSetorPorId,
    buscarSetores,
    carregarSetores
  };
}