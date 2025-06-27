import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import type { Funcionario, FuncionarioFormData } from '@/types/sistema';
import { useEmpresas } from './use-empresas';
import { useLojas } from './use-lojas';
import { useSetores } from './use-setores';
import { equipeService } from '@/services/equipe-service';

export function useEquipe() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Hooks para relacionamentos
  const { obterEmpresasAtivas } = useEmpresas();
  const { obterLojasAtivas } = useLojas();
  const { obterSetoresAtivos } = useSetores();

  // ✅ FUNÇÃO REMOVIDA - estava causando loop de render

  // ✅ VALIDAR DADOS DO FUNCIONÁRIO
  // Esta função verifica se todos os campos obrigatórios estão preenchidos corretamente
  // Retorna uma lista de erros (vazia se tudo estiver ok)
  const validarFuncionario = useCallback((dados: FuncionarioFormData): string[] => {
    const erros: string[] = [];

    if (!dados.nome || dados.nome.trim().length < 2) {
      erros.push('Nome deve ter pelo menos 2 caracteres');
    }

    if (!dados.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
      erros.push('Email inválido');
    }

    if (!dados.telefone || dados.telefone.replace(/[^\d]/g, '').length < 10) {
      erros.push('Telefone inválido');
    }

    if (!dados.setorId || dados.setorId.trim() === '') {
      erros.push('Setor é obrigatório');
    }

    if (!dados.lojaId) {
      erros.push('Loja é obrigatória');
    }

    if (!dados.nivelAcesso) {
      erros.push('Nível de acesso é obrigatório');
    }

    if (!dados.tipoFuncionario) {
      erros.push('Tipo de funcionário é obrigatório');
    }

    if (dados.salario < 0) {
      erros.push('Salário deve ser um valor positivo');
    }

    if (dados.comissao < 0 || dados.comissao > 100) {
      erros.push('Comissão deve estar entre 0% e 100%');
    }

    if (!dados.dataAdmissao) {
      erros.push('Data de admissão é obrigatória');
    }

    // Validações específicas por tipo
    if (dados.tipoFuncionario === 'MEDIDOR' && (!dados.configuracoes?.valorMedicao || dados.configuracoes.valorMedicao <= 0)) {
      erros.push('Valor por medição é obrigatório para medidores');
    }

    return erros;
  }, []);

  // Verificar duplicidade de email
  const verificarEmailDuplicado = useCallback((email: string, funcionarioId?: string): boolean => {
    return funcionarios.some(funcionario => 
      funcionario.email.toLowerCase() === email.toLowerCase() && 
      funcionario.id !== funcionarioId
    );
  }, [funcionarios]);

  // ✅ CRIAR NOVO FUNCIONÁRIO (com tratamento robusto de erros)
  // Esta função envia os dados para o backend e atualiza a lista local
  // Retorna true se funcionário foi criado com sucesso, false se deu erro
  const criarFuncionario = useCallback(async (dados: FuncionarioFormData): Promise<boolean> => {
    setLoading(true);
    
    try {
      // ✅ VALIDAÇÕES LOCAIS PRIMEIRO (sempre funcionam)
      const erros = validarFuncionario(dados);

      if (erros.length > 0) {
        erros.forEach(erro => toast.error(erro));
        return false;
      }

      // ✅ CHAMAR SERVIÇO DEDICADO (com conversões centralizadas)
      const response = await equipeService.criar(dados);
      
      if (response.success && response.data) {
        // ✅ SUCESSO: Dados já vêm convertidos do serviço
        setFuncionarios(prev => [...prev, response.data!]);
        toast.success('Funcionário criado com sucesso!');
        console.log('✅ Funcionário criado:', response.data.nome);
        return true;
      } else {
        // Backend retornou erro específico
        toast.error(response.error || 'Erro ao criar funcionário');
        console.warn('⚠️ Erro do backend ao criar funcionário:', response.error);
        return false;
      }

    } catch (error) {
      // Backend offline ou erro de rede
      console.error('🚨 Erro ao criar funcionário (backend offline?):', error);
      toast.error('Servidor indisponível. Tente novamente quando estiver online.', {
        description: 'O funcionário não foi salvo ainda'
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [validarFuncionario]);

  // Atualizar funcionário
  const atualizarFuncionario = useCallback(async (id: string, dados: FuncionarioFormData): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Validações
      const erros = validarFuncionario(dados);
      
      if (verificarEmailDuplicado(dados.email, id)) {
        erros.push('Email já cadastrado');
      }

      if (erros.length > 0) {
        erros.forEach(erro => toast.error(erro));
        return false;
      }

      // ✅ CHAMAR SERVIÇO DEDICADO (com conversões centralizadas)
      const response = await equipeService.atualizar(id, dados);
      
      if (response.success && response.data) {
        // ✅ SUCESSO: Dados já vêm convertidos do serviço
        setFuncionarios(prev => prev.map(funcionario => 
          funcionario.id === id ? response.data! : funcionario
        ));
        toast.success('Funcionário atualizado com sucesso!');
        return true;
      } else {
        toast.error(response.error || 'Erro ao atualizar funcionário');
        return false;
      }

    } catch (error) {
      toast.error('Erro ao atualizar funcionário');
      return false;
    } finally {
      setLoading(false);
    }
  }, [validarFuncionario, verificarEmailDuplicado, obterLojasAtivas]);

  // ✅ Alternar status do funcionário (API real, não simulação)
  const alternarStatusFuncionario = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    
    try {
      // Buscar funcionário atual para saber o status
      const funcionario = funcionarios.find(f => f.id === id);
      if (!funcionario) {
        toast.error('Funcionário não encontrado');
        return;
      }

      // Preparar dados para atualização (apenas o campo ativo)
      const dadosAtualizacao = { ativo: !funcionario.ativo };
      
      // ✅ CHAMAR SERVIÇO DEDICADO (com conversões centralizadas)
      const response = await equipeService.atualizar(id, dadosAtualizacao);
      
      if (response.success && response.data) {
        // ✅ SUCESSO: Dados já vêm convertidos do serviço
        setFuncionarios(prev => prev.map(f => 
          f.id === id ? response.data! : f
        ));
        
        const novoStatus = response.data!.ativo ? 'ativado' : 'desativado';
        toast.success(`Funcionário ${novoStatus} com sucesso!`);
      } else {
        toast.error(response.error || 'Erro ao alterar status do funcionário');
      }

    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }, [funcionarios]);

  // Excluir funcionário
  const excluirFuncionario = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Chamar serviço dedicado
      const response = await equipeService.excluir(id);
      
      if (response.success) {
        setFuncionarios(prev => prev.filter(f => f.id !== id));
        toast.success('Funcionário excluído com sucesso!');
        return true;
      } else {
        toast.error(response.error || 'Erro ao excluir funcionário');
        return false;
      }

    } catch (error) {
      console.error('Erro ao excluir funcionário:', error);
      toast.error('Erro ao conectar com o servidor');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obter funcionários ativos
  const obterFuncionariosAtivos = useCallback((): Funcionario[] => {
    return funcionarios.filter(funcionario => funcionario.ativo);
  }, [funcionarios]);

  // Obter funcionário por ID
  const obterFuncionarioPorId = useCallback((id: string): Funcionario | undefined => {
    return funcionarios.find(funcionario => funcionario.id === id);
  }, [funcionarios]);

  // Buscar funcionários
  const buscarFuncionarios = useCallback((termo: string): Funcionario[] => {
    if (!termo.trim()) return funcionarios;
    
    const termoBusca = termo.toLowerCase().trim();
    return funcionarios.filter(funcionario =>
      funcionario.nome.toLowerCase().includes(termoBusca) ||
      funcionario.email.toLowerCase().includes(termoBusca) ||
      funcionario.setor?.toLowerCase().includes(termoBusca) ||
      funcionario.tipoFuncionario.toLowerCase().includes(termoBusca)
    );
  }, [funcionarios]);

  // Estatísticas
  const estatisticas = {
    total: funcionarios.length,
    ativos: funcionarios.filter(f => f.ativo).length,
    inativos: funcionarios.filter(f => !f.ativo).length,
    vendedores: funcionarios.filter(f => f.tipoFuncionario === 'VENDEDOR').length,
    gerentes: funcionarios.filter(f => f.tipoFuncionario === 'GERENTE').length,
    medidores: funcionarios.filter(f => f.tipoFuncionario === 'MEDIDOR').length,
    admins: funcionarios.filter(f => f.tipoFuncionario === 'ADMIN_MASTER').length
  };

  // ✅ CARREGAR FUNCIONÁRIOS DA API REAL (com teste de conectividade)
  // Esta função testa a conectividade primeiro, depois carrega os dados do Supabase
  // Se backend estiver offline, mostra estado vazio sem quebrar a aplicação
  const carregarFuncionarios = useCallback(async () => {
    setLoading(true);
    
    try {
      // ✅ CARREGAR FUNCIONÁRIOS VIA SERVIÇO DEDICADO
      console.log('🔄 Carregando funcionários via serviço...');
      
      // Usar serviço com conversões centralizadas
      const response = await equipeService.listar();
      
      if (response.success && response.data) {
        // ✅ SUCESSO: Dados já vêm convertidos do serviço
        setFuncionarios(response.data.items);
        console.log(`✅ ${response.data.items.length} funcionários carregados via serviço`);
      } else {
        // Backend retornou erro específico (400, 401, 500, etc)
        console.warn('⚠️ Backend retornou erro:', response.error);
        toast.error(response.error || 'Erro ao carregar funcionários');
        setFuncionarios([]); // Lista vazia, não dados fake
      }
    } catch (error: any) {
      // Tratar especificamente erro de autenticação
      if (error?.message?.includes('403') || error?.message?.includes('Not authenticated')) {
        console.error('🚫 Erro de autenticação - usuário não está logado ou token expirado');
        toast.error('Faça login para acessar funcionários', {
          description: 'Sua sessão pode ter expirado'
        });
        // Limpar dados de autenticação inválidos
        localStorage.removeItem('fluyt_auth_token');
        localStorage.removeItem('fluyt_refresh_token');
        localStorage.removeItem('fluyt_user');
        
        // Redirecionar para login se não estiver na página de login
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      } else {
        console.error('❌ Erro ao carregar funcionários:', error);
        toast.error('Erro ao carregar funcionários - Verifique se está logado');
      }
      
      setFuncionarios([]); // Lista vazia em caso de erro
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Carregar dados ao montar - simplificado para React 18 StrictMode
  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      if (!mounted) return;
      
      // Verificar se há token JWT antes de fazer a requisição
      const authToken = localStorage.getItem('fluyt_auth_token');
      if (!authToken) {
        console.warn('🚫 Token JWT não encontrado - usuário não está logado');
        setFuncionarios([]);
        setLoading(false);
        return;
      }
      
      // Token JWT já é usado automaticamente pelo equipeService
      
      if (!mounted) return;
      
      await carregarFuncionarios();
    };
    
    loadData();
    
    // Cleanup function simples para React 18 StrictMode
    return () => {
      mounted = false;
    };
  }, [carregarFuncionarios]);

  // REMOVIDA função converterBackendParaFrontend
  // Agora todas as conversões são feitas no equipe-service.ts de forma centralizada

  return {
    funcionarios,
    loading,
    estatisticas,
    criarFuncionario,
    atualizarFuncionario,
    alternarStatusFuncionario,
    excluirFuncionario,
    obterFuncionariosAtivos,
    obterFuncionarioPorId,
    buscarFuncionarios,
    carregarFuncionarios,
    // Dados para relacionamentos
    empresas: obterEmpresasAtivas(),
    lojas: obterLojasAtivas(),
    setores: obterSetoresAtivos()
  };
}