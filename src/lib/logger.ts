/**
 * Sistema de Logging Inteligente para Fluyt
 * 
 * Controla logs baseado no ambiente de desenvolvimento/produção
 * e permite logging condicional por módulo/categoria
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LogCategory = 
  | 'sessao'      // Store e persistência de sessão
  | 'navegacao'   // Roteamento e navegação entre páginas
  | 'orcamento'   // Cálculos financeiros e simulações
  | 'clientes'    // Operações com clientes
  | 'ambientes'   // Gestão de ambientes
  | 'contratos'   // Geração e gestão de contratos
  | 'sistema'     // Configurações e sistema
  | 'api'         // Chamadas para backend/Supabase
  | 'performance' // Métricas de performance
  | 'error'       // Tratamento de erros
  | 'debug';      // Debug geral

interface LogConfig {
  enabled: boolean;
  level: LogLevel;
  categories: Set<LogCategory>;
  showTimestamp: boolean;
  showCategory: boolean;
}

class Logger {
  private config: LogConfig;

  constructor() {
    this.config = {
      enabled: process.env.NODE_ENV === 'development',
      level: 'debug',
      categories: new Set<LogCategory>(['error', 'warn'] as LogCategory[]), // Sempre mostrar erros e warnings
      showTimestamp: true,
      showCategory: true
    };

    // Em desenvolvimento, habilitar categorias baseado em localStorage
    if (typeof window !== 'undefined' && this.config.enabled) {
      this.loadDebugConfig();
    }
  }

  private loadDebugConfig() {
    try {
      const debugCategories = localStorage.getItem('fluyt-debug-categories');
      if (debugCategories) {
        const categories = JSON.parse(debugCategories) as LogCategory[];
        categories.forEach(cat => this.config.categories.add(cat));
      } else {
        // Configuração padrão para desenvolvimento
        this.config.categories.add('sessao');
        this.config.categories.add('navegacao');
        this.config.categories.add('orcamento');
      }
    } catch (error) {
      // Ignorar erros de localStorage
    }
  }

  private shouldLog(level: LogLevel, category: LogCategory): boolean {
    if (!this.config.enabled) return false;
    if (!this.config.categories.has(category)) return false;
    
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };

    return levels[level] >= levels[this.config.level];
  }

  private formatMessage(level: LogLevel, category: LogCategory, message: string, data?: any): [string, any?] {
    const parts = [];
    
    if (this.config.showTimestamp) {
      parts.push(`[${new Date().toLocaleTimeString()}]`);
    }
    
    if (this.config.showCategory) {
      const emoji = this.getCategoryEmoji(category);
      parts.push(`${emoji} ${category.toUpperCase()}`);
    }

    const formattedMessage = `${parts.join(' ')} ${message}`;
    
    return data !== undefined ? [formattedMessage, data] : [formattedMessage];
  }

  private getCategoryEmoji(category: LogCategory): string {
    const emojis: Record<LogCategory, string> = {
      sessao: '💾',
      navegacao: '🧭',
      orcamento: '💰',
      clientes: '👥',
      ambientes: '🏢',
      contratos: '📋',
      sistema: '⚙️',
      api: '🌐',
      performance: '⚡',
      error: '❌',
      debug: '🔍'
    };
    return emojis[category] || '📝';
  }

  debug(category: LogCategory, message: string, data?: any) {
    if (this.shouldLog('debug', category)) {
      const [formattedMessage, ...args] = this.formatMessage('debug', category, message, data);
      console.log(formattedMessage, ...args);
    }
  }

  info(category: LogCategory, message: string, data?: any) {
    if (this.shouldLog('info', category)) {
      const [formattedMessage, ...args] = this.formatMessage('info', category, message, data);
      console.info(formattedMessage, ...args);
    }
  }

  warn(category: LogCategory, message: string, data?: any) {
    if (this.shouldLog('warn', category)) {
      const [formattedMessage, ...args] = this.formatMessage('warn', category, message, data);
      console.warn(formattedMessage, ...args);
    }
  }

  error(category: LogCategory, message: string, data?: any) {
    if (this.shouldLog('error', category)) {
      const [formattedMessage, ...args] = this.formatMessage('error', category, message, data);
      console.error(formattedMessage, ...args);
    }
  }

  // Métodos de configuração para desenvolvimento
  enableCategory(category: LogCategory) {
    this.config.categories.add(category);
    this.saveDebugConfig();
  }

  disableCategory(category: LogCategory) {
    this.config.categories.delete(category);
    this.saveDebugConfig();
  }

  enableAllCategories() {
    const allCategories: LogCategory[] = [
      'sessao', 'navegacao', 'orcamento', 'clientes', 'ambientes', 
      'contratos', 'sistema', 'api', 'performance', 'error', 'debug'
    ];
    allCategories.forEach(cat => this.config.categories.add(cat));
    this.saveDebugConfig();
  }

  disableAllCategories() {
    this.config.categories.clear();
    this.config.categories.add('error'); // Sempre manter erros
    this.saveDebugConfig();
  }

  private saveDebugConfig() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('fluyt-debug-categories', 
          JSON.stringify(Array.from(this.config.categories)));
      } catch (error) {
        // Ignorar erros de localStorage
      }
    }
  }

  // Métodos auxiliares para debug
  getActiveCategories(): LogCategory[] {
    return Array.from(this.config.categories);
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }
}

// Instância singleton
export const logger = new Logger();

// Convenientes helpers para categorias específicas
export const sessionLogger = {
  debug: (message: string, data?: any) => logger.debug('sessao', message, data),
  info: (message: string, data?: any) => logger.info('sessao', message, data),
  warn: (message: string, data?: any) => logger.warn('sessao', message, data),
  error: (message: string, data?: any) => logger.error('sessao', message, data),
};

export const navigationLogger = {
  debug: (message: string, data?: any) => logger.debug('navegacao', message, data),
  info: (message: string, data?: any) => logger.info('navegacao', message, data),
  warn: (message: string, data?: any) => logger.warn('navegacao', message, data),
  error: (message: string, data?: any) => logger.error('navegacao', message, data),
};

export const budgetLogger = {
  debug: (message: string, data?: any) => logger.debug('orcamento', message, data),
  info: (message: string, data?: any) => logger.info('orcamento', message, data),
  warn: (message: string, data?: any) => logger.warn('orcamento', message, data),
  error: (message: string, data?: any) => logger.error('orcamento', message, data),
};

export const contractLogger = {
  debug: (message: string, data?: any) => logger.debug('contratos', message, data),
  info: (message: string, data?: any) => logger.info('contratos', message, data),
  warn: (message: string, data?: any) => logger.warn('contratos', message, data),
  error: (message: string, data?: any) => logger.error('contratos', message, data),
};

// Helper para exposição global em desenvolvimento
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).flytLogger = {
    logger,
    enableCategory: (category: LogCategory) => logger.enableCategory(category),
    disableCategory: (category: LogCategory) => logger.disableCategory(category),
    enableAll: () => logger.enableAllCategories(),
    disableAll: () => logger.disableAllCategories(),
    getActive: () => logger.getActiveCategories(),
    help: () => {
      console.log(`
🔍 FLUYT LOGGER - Comandos disponíveis:

flytLogger.enableCategory('categoria')  - Habilita logs de uma categoria
flytLogger.disableCategory('categoria') - Desabilita logs de uma categoria
flytLogger.enableAll()                 - Habilita todas as categorias
flytLogger.disableAll()                - Desabilita todas (menos erros)
flytLogger.getActive()                 - Lista categorias ativas

📋 Categorias disponíveis:
sessao, navegacao, orcamento, clientes, ambientes, contratos, sistema, api, performance, error, debug

💡 Exemplo:
flytLogger.enableCategory('orcamento')
flytLogger.enableCategory('contratos')
      `);
    }
  };
}

export default logger;