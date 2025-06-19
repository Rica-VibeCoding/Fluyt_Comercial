/**
 * Barrel exports para utilitários da lib
 */

// Utilitários principais
export { cn } from './utils';

// Logger
export { 
  logger, 
  sessionLogger, 
  navigationLogger, 
  budgetLogger, 
  contractLogger 
} from './logger';

// Persistência
export { 
  persistenciaInteligente,
  type SessaoCliente
} from './persistencia-inteligente';

// Supabase
export { supabase } from './supabase';

// Store legada
export { ClienteStore } from './store/cliente-store';