/**
 * Layout do painel REFATORADO
 * Versão limpa sem conflitos de context
 */

'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { SidebarProvider, useSidebar } from '../../components/layout/sidebar/core/sidebar-context';
import { ThemeProvider } from '../../components/layout/sidebar/themes/theme-provider';
import { Sidebar } from '../../components/layout/sidebar/core/sidebar';
import { SidebarHeader } from '../../components/layout/sidebar/components/sidebar-header';
import { SidebarMenu } from '../../components/layout/sidebar/components/sidebar-menu';
import { SidebarFooter } from '../../components/layout/sidebar/components/sidebar-footer';
import { SidebarUser } from '../../components/layout/sidebar/components/sidebar-user';
import { SidebarToggle } from '../../components/layout/sidebar/components/sidebar-toggle';
import { menuItems } from '../../components/layout/sidebar/config/menu-config';

// Importar ProgressStepper dinamicamente sem SSR
const ProgressStepper = dynamic(() => import('../../components/layout/progress-stepper').then(mod => ({ default: mod.ProgressStepper })), { 
  ssr: false,
  loading: () => (
    <div className="bg-white border-b border-gray-200">
      <div className="px-8 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-8">
            {/* ✨ SKELETON que imita exatamente o ProgressStepper final */}
            {[
              { label: 'Cliente', width: 'w-16' },
              { label: 'Ambientes', width: 'w-20' }, 
              { label: 'Orçamento', width: 'w-18' },
              { label: 'Contrato', width: 'w-16' }
            ].map((item, index) => (
              <React.Fragment key={index}>
                <div className="flex items-center">
                  {/* Círculo do ícone */}
                  <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse flex-shrink-0"></div>
                  {/* Textos do lado */}
                  <div className="ml-4 text-left">
                    <div className={`h-4 bg-gray-200 rounded ${item.width} mb-1 animate-pulse`}></div>
                    <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                </div>
                {/* Linha conectora entre os passos */}
                {index < 3 && (
                  <div className="flex-1 min-w-16 max-w-24">
                    <div className="h-0.5 bg-gray-200"></div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
});

// import { DebugPersistenciaCompacto } from '../../components/shared/debug-persistencia'; // REMOVIDO

// Componente interno que tem acesso ao context
function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapse } = useSidebar();
  
  // Não mostrar ProgressStepper nas páginas de sistema
  const shouldShowProgressStepper = !pathname.startsWith('/painel/sistema');
  
  // Altura real calculada do ProgressStepper
  const progressStepperHeight = 100;
  
  // Calcular largura da sidebar baseado no estado de collapse e responsividade
  const sidebarWidth = isCollapsed ? '4rem' : '16rem';
  const sidebarWidthMobile = '16rem'; // Sidebar sempre expandida em mobile

  return (
    <div className="min-h-screen bg-gray-50 layout-container overflow-hidden">
      {/* Header Mobile com Toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <SidebarToggle />
          <h1 className="text-lg font-semibold text-gray-900">D-Art Fluyt</h1>
        </div>
      </div>

      {/* Overlay para mobile quando sidebar aberta */}
      <div 
        className={`
          fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden
          transition-opacity duration-300
          ${!isCollapsed ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={() => {
          // Fechar sidebar no mobile quando clicar no overlay
          if (!isCollapsed) {
            toggleCollapse();
          }
        }}
      />

      {/* Sidebar Desktop */}
      <div 
        className={`
          hidden md:block fixed left-0 top-0 h-screen overflow-y-auto overflow-x-hidden z-30 border-r
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-16' : 'w-64'}
        `}
        style={{
          backgroundColor: 'hsl(var(--sidebar-background, 0 0% 98%))',
          borderColor: 'hsl(var(--sidebar-accent, 240 4.8% 95.9%))',
          color: 'hsl(var(--sidebar-foreground, 240 10% 3.9%))'
        }}
      >
        <Sidebar>
          <SidebarHeader />
          <SidebarMenu items={menuItems} />
          <SidebarFooter>
            <SidebarUser />
          </SidebarFooter>
        </Sidebar>
      </div>

      {/* Sidebar Mobile */}
      <div 
        className={`
          md:hidden fixed left-0 top-0 h-screen overflow-y-auto overflow-x-hidden z-50 border-r
          transition-transform duration-300 ease-in-out
          ${!isCollapsed ? 'translate-x-0' : '-translate-x-full'}
          w-64
        `}
        style={{
          backgroundColor: 'hsl(var(--sidebar-background, 0 0% 98%))',
          borderColor: 'hsl(var(--sidebar-accent, 240 4.8% 95.9%))',
          color: 'hsl(var(--sidebar-foreground, 240 10% 3.9%))'
        }}
      >
        <Sidebar>
          <SidebarHeader />
          <SidebarMenu items={menuItems} />
          <SidebarFooter>
            <SidebarUser />
          </SidebarFooter>
        </Sidebar>
      </div>
      
      {/* ProgressStepper fixo - Desktop */}
      {shouldShowProgressStepper && (
        <div 
          className="hidden md:block fixed top-0 right-0 z-50 bg-white border-b shadow-sm transition-all duration-300"
          style={{ 
            left: sidebarWidth 
          }}
        >
          <ProgressStepper />
        </div>
      )}

      {/* ProgressStepper fixo - Mobile */}
      {shouldShowProgressStepper && (
        <div 
          className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b shadow-sm"
        >
          <ProgressStepper />
        </div>
      )}
      
      {/* Container principal - Desktop */}
      <div 
        className="hidden md:flex h-screen flex-col transition-all duration-300"
        style={{
          marginLeft: sidebarWidth
        }}
      >
        <main 
          className="page-content-smooth flex-1 bg-gray-50 transition-all duration-300 overflow-y-auto component-fade-in visible"
          style={{ paddingTop: '1rem' }}
        >
          <div className="max-w-7xl mx-auto p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Container principal - Mobile */}
      <div className="md:hidden h-screen flex flex-col">
        <main 
          className="page-content-smooth flex-1 bg-gray-50 overflow-y-auto component-fade-in visible"
          style={{ paddingTop: '1rem' }}
        >
          <div className="max-w-7xl mx-auto p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
      
      {/* Debug de persistência - REMOVIDO para produção */}
      {/* {process.env.NODE_ENV === 'development' && <DebugPersistenciaCompacto />} */}
    </div>
  );
}

export default function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <ThemeProvider>
        <LayoutContent>{children}</LayoutContent>
      </ThemeProvider>
    </SidebarProvider>
  );
} 