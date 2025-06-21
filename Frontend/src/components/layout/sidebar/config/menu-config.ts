/**
 * Configuração do menu da sidebar
 */

import { 
  Home, 
  Users, 
  FileText, 
  Settings
} from 'lucide-react';
import type { MenuItem } from '../core/sidebar-types';

export const menuItems: MenuItem[] = [
  { 
    titulo: 'Dashboard', 
    icone: Home, 
    href: '/painel',
    descricao: 'Visão geral do sistema',
    ativo: true
  },
  { 
    titulo: 'Clientes', 
    icone: Users, 
    href: '/painel/clientes',
    descricao: 'Gestão de clientes',
    ativo: true
  },
  { 
    titulo: 'Ambientes', 
    icone: Home, 
    href: '/painel/ambientes',
    descricao: 'Projetos e ambientes',
    ativo: true
  },
  { 
    titulo: 'Orçamentos', 
    icone: FileText, 
    href: '/painel/orcamento',
    descricao: 'Simulador de propostas',
    ativo: true
  },
  { 
    titulo: 'Contratos', 
    icone: FileText, 
    href: '/painel/contratos',
    descricao: 'Gestão de contratos',
    ativo: true
  },
  { 
    titulo: 'Sistema', 
    icone: Settings, 
    href: '/painel/sistema',
    descricao: 'Configurações',
    ativo: true
  }
]; 