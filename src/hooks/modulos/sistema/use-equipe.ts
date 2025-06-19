import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { Funcionario, FuncionarioFormData } from '@/types/sistema';
import { useLocalStorage } from '@/hooks/globais/use-local-storage';
import { useEmpresas } from './use-empresas';
import { useLojas } from './use-lojas';
import { useSetores } from './use-setores';

// Mock data para desenvolvimento
const mockFuncionarios: Funcionario[] = [
  {
    id: '1',
    nome: 'João Silva Santos',
    email: 'joao@fluyt.com.br',
    telefone: '(11) 98765-4321',
    setor: 'Vendas',
    lojaId: '1',
    loja: 'Fluyt Móveis & Design',
    salario: 3500,
    comissao: 3.5,
    dataAdmissao: '2024-01-25',
    ativo: true,
    nivelAcesso: 'USUARIO',
    tipoFuncionario: 'VENDEDOR',
    performance: 95,
    configuracoes: {
      limiteDesconto: 15,
      overrideComissao: 3.5
    },
    createdAt: '2024-01-25T10:00:00Z'
  },
  {
    id: '2',
    nome: 'Maria Fernanda Oliveira',
    email: 'maria@fluyt.com.br',
    telefone: '(11) 97777-8888',
    setor: 'Vendas',
    lojaId: '1',
    loja: 'Fluyt Móveis & Design',
    salario: 6000,
    comissao: 2,
    dataAdmissao: '2024-02-01',
    ativo: true,
    nivelAcesso: 'GERENTE',
    tipoFuncionario: 'GERENTE',
    performance: 88,
    configuracoes: {
      limiteDesconto: 25,
      comissaoEspecifica: 2,
      minimoGarantido: 3000
    },
    createdAt: '2024-02-01T10:00:00Z'
  },
  {
    id: '3',
    nome: 'Carlos Alberto Medeiros',
    email: 'carlos@fluyt.com.br',
    telefone: '(11) 99999-1234',
    setor: 'Medição',
    lojaId: '2',
    loja: 'Fluyt Filial Santos',
    salario: 2800,
    comissao: 0,
    dataAdmissao: '2024-02-10',
    ativo: true,
    nivelAcesso: 'USUARIO',
    tipoFuncionario: 'MEDIDOR',
    performance: 92,
    configuracoes: {
      valorMedicao: 150
    },
    createdAt: '2024-02-10T10:00:00Z'
  }
];

export function useEquipe() {
  const [funcionarios, setFuncionarios, clearFuncionarios] = useLocalStorage<Funcionario[]>('fluyt_funcionarios', mockFuncionarios);
  const [loading, setLoading] = useState(false);
  
  // Hooks para relacionamentos
  const { obterEmpresasAtivas } = useEmpresas();
  const { obterLojasAtivas } = useLojas();
  const { obterSetoresAtivos } = useSetores();

  // Validar dados do funcionário
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


    if (!dados.setor) {
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

  // Criar funcionário
  const criarFuncionario = useCallback(async (dados: FuncionarioFormData): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Validações
      const erros = validarFuncionario(dados);
      
      if (verificarEmailDuplicado(dados.email)) {
        erros.push('Email já cadastrado');
      }

      if (erros.length > 0) {
        erros.forEach(erro => toast.error(erro));
        return false;
      }

      // Buscar nome da loja
      const lojas = obterLojasAtivas();
      const loja = lojas.find(l => l.id === dados.lojaId);

      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const novoFuncionario: Funcionario = {
        id: Date.now().toString(),
        ...dados,
        loja: loja?.nome || '',
        ativo: true,
        performance: 0,
        createdAt: new Date().toISOString()
      };

      setFuncionarios(prev => [...prev, novoFuncionario]);
      toast.success('Funcionário criado com sucesso!');
      return true;

    } catch (error) {
      toast.error('Erro ao criar funcionário');
      return false;
    } finally {
      setLoading(false);
    }
  }, [validarFuncionario, verificarEmailDuplicado, obterLojasAtivas]);

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

      // Buscar nome da loja
      const lojas = obterLojasAtivas();
      const loja = lojas.find(l => l.id === dados.lojaId);

      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setFuncionarios(prev => prev.map(funcionario => 
        funcionario.id === id 
          ? { ...funcionario, ...dados, loja: loja?.nome || '', updatedAt: new Date().toISOString() }
          : funcionario
      ));

      toast.success('Funcionário atualizado com sucesso!');
      return true;

    } catch (error) {
      toast.error('Erro ao atualizar funcionário');
      return false;
    } finally {
      setLoading(false);
    }
  }, [validarFuncionario, verificarEmailDuplicado, obterLojasAtivas]);

  // Alternar status do funcionário
  const alternarStatusFuncionario = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setFuncionarios(prev => prev.map(funcionario => 
        funcionario.id === id 
          ? { ...funcionario, ativo: !funcionario.ativo, updatedAt: new Date().toISOString() }
          : funcionario
      ));

      const funcionario = funcionarios.find(f => f.id === id);
      const novoStatus = !funcionario?.ativo ? 'ativado' : 'desativado';
      toast.success(`Funcionário ${novoStatus} com sucesso!`);

    } catch (error) {
      toast.error('Erro ao alterar status do funcionário');
    } finally {
      setLoading(false);
    }
  }, [funcionarios]);

  // Excluir funcionário
  const excluirFuncionario = useCallback(async (id: string): Promise<boolean> => {
    const funcionario = funcionarios.find(f => f.id === id);
    
    if (!funcionario) {
      toast.error('Funcionário não encontrado');
      return false;
    }

    setLoading(true);
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setFuncionarios(prev => prev.filter(f => f.id !== id));
      toast.success('Funcionário excluído com sucesso!');
      return true;

    } catch (error) {
      toast.error('Erro ao excluir funcionário');
      return false;
    } finally {
      setLoading(false);
    }
  }, [funcionarios]);

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
      funcionario.setor.toLowerCase().includes(termoBusca) ||
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

  // Resetar dados para mock inicial
  const resetarDados = useCallback(() => {
    clearFuncionarios();
    toast.success('Dados resetados para configuração inicial!');
  }, [clearFuncionarios]);

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
    resetarDados,
    // Dados para relacionamentos
    empresas: obterEmpresasAtivas(),
    lojas: obterLojasAtivas(),
    setores: obterSetoresAtivos()
  };
}