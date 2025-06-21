'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Users, Building2, Calculator, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';

// Definindo os tipos para melhor tipagem
interface StepConfig {
  id: number;
  path: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const useStepper = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);

  // Garantir que só executamos no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Configuração das etapas centralizada e independente
  const steps: StepConfig[] = [
    { 
      id: 1, 
      path: '/painel/clientes', 
      label: 'Cliente', 
      description: 'Cadastro concluído',
      icon: Users
    },
    { 
      id: 2, 
      path: '/painel/ambientes', 
      label: 'Ambientes', 
      description: '4 ambientes importados',
      icon: Building2
    },
    { 
      id: 3, 
      path: '/painel/orcamento', 
      label: 'Orçamento', 
      description: 'Em andamento',
      icon: Calculator
    },
    { 
      id: 4, 
      path: '/painel/contratos', 
      label: 'Contrato', 
      description: 'Pendente',
      icon: FileText
    }
  ];

  // Função para determinar o step atual baseado na URL
  const getCurrentStep = (): number => {
    // Mapeia paths para step IDs de forma mais robusta
    const pathStepMap = {
      '/clientes': 1,
      '/ambientes': 2,
      '/orcamento': 3,
      '/contratos': 4
    };

    // Verifica qual path está incluído na URL atual
    for (const [path, stepId] of Object.entries(pathStepMap)) {
      if (pathname.includes(path)) {
        return stepId;
      }
    }
    
    // Default para o primeiro step se não encontrar match
    return 1;
  };

  // Função de navegação robusta e independente que preserva parâmetros
  const navigateToStep = (stepId: number) => {
    if (!isClient) return; // Não navegar durante SSR
    
    try {
      const step = steps.find(s => s.id === stepId);
      if (step) {
        // Preservar parâmetros de cliente na navegação
        const clienteId = searchParams.get('clienteId');
        const clienteNome = searchParams.get('clienteNome');
        
        let url = step.path;
        const params = new URLSearchParams();
        
        if (clienteId) {
          params.set('clienteId', clienteId);
        }
        if (clienteNome) {
          params.set('clienteNome', clienteNome);
        }
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        
        console.log(`🧭 Navegando para step ${stepId} com parâmetros:`, url);
        router.push(url);
      } else {
        console.warn(`Step com ID ${stepId} não encontrado`);
      }
    } catch (error) {
      console.error('Erro ao navegar para step:', error);
    }
  };

  // Função para verificar se um step é clicável
  const isStepClickable = (stepId: number): boolean => {
    // Permite navegar para qualquer etapa, não apenas as já visitadas
    return isClient; // Só permitir clicks no cliente
  };

  // Função para verificar se um step foi completado
  const isStepCompleted = (stepId: number): boolean => {
    const currentStep = getCurrentStep();
    return currentStep > stepId;
  };

  // Função para verificar se um step é o atual
  const isStepCurrent = (stepId: number): boolean => {
    const currentStep = getCurrentStep();
    return currentStep === stepId;
  };

  return {
    currentStep: getCurrentStep(),
    steps,
    navigateToStep,
    isStepClickable,
    isStepCompleted,
    isStepCurrent
  };
}; 