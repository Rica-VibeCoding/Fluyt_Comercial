import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import type { Funcionario, FuncionarioFormData } from '@/types/sistema';
import { useEmpresas } from './use-empresas';
import { useLojas } from './use-lojas';
import { useSetores } from './use-setores';
import { apiClient } from '@/services/api-client';

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


    if (!dados.setorId) {
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

      // ✅ CHAMAR API REAL (com tratamento de offline)
      const response = await apiClient.criarFuncionario(dados);
      
      if (response.success && response.data) {
        // ✅ SUCESSO: Converter dados do backend para frontend
        const novoFuncionario = converterBackendParaFrontend(response.data);
        setFuncionarios(prev => [...prev, novoFuncionario]);
        toast.success('Funcionário criado com sucesso!');
        console.log('✅ Funcionário criado:', novoFuncionario.nome);
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

      // ✅ CHAMADA REAL DA API (não mais simulação fake)
      const response = await apiClient.atualizarFuncionario(id, dados);
      
      if (response.success && response.data) {
        // Converter dados do backend para frontend
        const funcionarioAtualizado = converterBackendParaFrontend(response.data);
        setFuncionarios(prev => prev.map(funcionario => 
          funcionario.id === id ? funcionarioAtualizado : funcionario
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
      
      // ✅ CHAMADA REAL DA API 
      const response = await apiClient.atualizarFuncionario(id, dadosAtualizacao);
      
      if (response.success && response.data) {
        const funcionarioAtualizado = converterBackendParaFrontend(response.data);
        setFuncionarios(prev => prev.map(f => 
          f.id === id ? funcionarioAtualizado : f
        ));
        
        const novoStatus = funcionarioAtualizado.ativo ? 'ativado' : 'desativado';
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
      // Chamar API real
      const response = await apiClient.excluirFuncionario(id);
      
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
      // ✅ CARREGAR FUNCIONÁRIOS DIRETAMENTE (teste de conectividade removido)
      console.log('🔄 Carregando funcionários da API...');
      const response = await apiClient.listarFuncionarios();
      
      if (response.success && response.data) {
        // ✅ SUCESSO: Converter dados do backend para frontend
        const funcionariosConvertidos = response.data.items.map(converterBackendParaFrontend);
        setFuncionarios(funcionariosConvertidos);
        console.log(`✅ ${funcionariosConvertidos.length} funcionários carregados da API`);
        
        // ✅ Funcionários carregados com sucesso
      } else {
        // Backend retornou erro específico (400, 401, 500, etc)
        console.warn('⚠️ Backend retornou erro:', response.error);
        setFuncionarios([]); // Lista vazia, não dados fake
        toast.error(`Erro do servidor: ${response.error || 'Erro desconhecido'}`);
      }
      
    } catch (error) {
      // Erro inesperado na comunicação
      console.error('🚨 Erro inesperado ao carregar funcionários:', error);
      setFuncionarios([]);
      
      toast.error('Erro de comunicação com o servidor', {
        description: 'Tente novamente em alguns segundos'
      });
    } finally {
      setLoading(false);
    }
  }, []); // ✅ Dependência removida - função não existe mais

  // ✅ Converter dados do backend (snake_case) para frontend (camelCase) 
  // Esta função traduz os nomes dos campos entre as duas camadas
  const converterBackendParaFrontend = (dadosBackend: any): Funcionario => {
    return {
      // IDs e campos básicos (já vêm certos)
      id: dadosBackend.id,
      nome: dadosBackend.nome,
      email: dadosBackend.email,
      telefone: dadosBackend.telefone,
      
      // Relacionamentos com outras tabelas
      setorId: dadosBackend.setorId || dadosBackend.setor_id, // Backend pode vir nos dois formatos
      setor: dadosBackend.setor_nome || dadosBackend.setor, // Nome do setor via JOIN
      lojaId: dadosBackend.lojaId || dadosBackend.loja_id, // Backend pode vir nos dois formatos  
      loja: dadosBackend.loja_nome || dadosBackend.loja, // Nome da loja via JOIN
      
      // Campos financeiros (com fallback para zero)
      salario: dadosBackend.salario || 0,
      comissao: dadosBackend.comissao || dadosBackend.comissao_percentual_vendedor || dadosBackend.comissao_percentual_gerente || 0,
      
      // Campos de trabalho
      dataAdmissao: dadosBackend.dataAdmissao || dadosBackend.data_admissao,
      ativo: dadosBackend.ativo !== undefined ? dadosBackend.ativo : true, // Padrão ativo
      
      // ⚠️ ATENÇÃO: Backend usa 'perfil', Frontend usa 'tipoFuncionario' 
      tipoFuncionario: dadosBackend.tipoFuncionario || dadosBackend.perfil || 'VENDEDOR',
      nivelAcesso: dadosBackend.nivelAcesso || dadosBackend.nivel_acesso || 'USUARIO',
      
      // Campo calculado no frontend (sempre zero por enquanto)
      performance: 0, 
      
      // Configurações específicas por tipo de funcionário
      configuracoes: {
        limiteDesconto: dadosBackend.configuracoes?.limiteDesconto || dadosBackend.limite_desconto || 0,
        valorMedicao: dadosBackend.configuracoes?.valorMedicao || dadosBackend.valor_medicao || 0,
        minimoGarantido: dadosBackend.configuracoes?.minimoGarantido || dadosBackend.valor_minimo_garantido || 0,
      },
      
      // Timestamps (sempre presentes)
      createdAt: dadosBackend.criadoEm || dadosBackend.created_at || new Date().toISOString(),
      updatedAt: dadosBackend.atualizadoEm || dadosBackend.updated_at || new Date().toISOString(),
    };
  };

  // Carregar dados na inicialização
  useEffect(() => {
    carregarFuncionarios();
  }, [carregarFuncionarios]);

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