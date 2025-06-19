/**
 * Testes para o componente Sidebar
 */

import { render, screen } from '@testing-library/react';
import { SidebarProvider } from '../core/sidebar-context';
import { Sidebar } from '../core/sidebar';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>{children}</SidebarProvider>
);

describe('Sidebar', () => {
  it('deve renderizar sem erros', () => {
    render(
      <TestWrapper>
        <Sidebar>
          <div>Conteúdo teste</div>
        </Sidebar>
      </TestWrapper>
    );
    
    expect(screen.getByText('Conteúdo teste')).toBeInTheDocument();
  });

  it('deve aplicar classes CSS corretas', () => {
    const { container } = render(
      <TestWrapper>
        <Sidebar className="teste-custom">
          <div>Conteúdo</div>
        </Sidebar>
      </TestWrapper>
    );
    
    const sidebar = container.firstChild as HTMLElement;
    expect(sidebar).toHaveClass('fixed', 'left-0', 'top-0', 'h-screen', 'teste-custom');
  });

  it('deve renderizar children corretamente', () => {
    render(
      <TestWrapper>
        <Sidebar>
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
        </Sidebar>
      </TestWrapper>
    );
    
    expect(screen.getByTestId('child1')).toBeInTheDocument();
    expect(screen.getByTestId('child2')).toBeInTheDocument();
  });
}); 