/**
 * Barrel exports principal para todos os componentes
 */

// Componentes de layout
export * from './layout';

// Componentes comuns
export * from './comum';

// Componentes compartilhados
export * from './shared';

// Componentes de módulos
export * from './modulos/clientes';
export * from './modulos/ambientes';
export * from './modulos/contratos';
export * from './modulos/sistema';

// UI components (shadcn/ui) - não criamos barrel export para ui pois são muitos componentes

// Providers
export { ClientProviders } from './providers/client-providers';

// Error boundary
export { ErrorBoundary } from './error-boundary';