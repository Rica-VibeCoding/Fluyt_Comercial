/**
 * Testes para AmbienteMaterialDetail
 */

import { render, screen } from '@testing-library/react';
import { AmbienteMaterialDetail } from '../ambiente-materiais-detail';

// Mock dos dados de teste baseados na estrutura real do Supabase
const mockMateriais = {
  linha_detectada: 'Unique',
  caixa: {
    material: 'MDF',
    cor: 'Frapê',
    espessura: '18mm'
  },
  portas: {
    modelo: 'Frontal Brilhart Color',
    espessura: '18mm'
  },
  ferragens: {
    puxadores: 'Ponto > 2551 - Pux. Manari',
    corredicas: 's/amortecedor'
  },
  valor_total: {
    valor_venda: 'R$ 8.698,50',
    custo_fabrica: 'R$ 966,50'
  }
};

describe('AmbienteMaterialDetail', () => {
  it('renderiza linha detectada corretamente', () => {
    render(<AmbienteMaterialDetail materiais={mockMateriais} />);
    
    expect(screen.getByText('Unique')).toBeInTheDocument();
  });

  it('exibe seções de materiais quando disponíveis', () => {
    render(<AmbienteMaterialDetail materiais={mockMateriais} />);
    
    expect(screen.getByText('Caixa')).toBeInTheDocument();
    expect(screen.getByText('Portas')).toBeInTheDocument();
    expect(screen.getByText('Ferragens')).toBeInTheDocument();
    expect(screen.getByText('Valores')).toBeInTheDocument();
  });

  it('exibe dados específicos da caixa', () => {
    render(<AmbienteMaterialDetail materiais={mockMateriais} />);
    
    expect(screen.getByText('Material:')).toBeInTheDocument();
    expect(screen.getByText('MDF')).toBeInTheDocument();
    expect(screen.getByText('Cor:')).toBeInTheDocument();
    expect(screen.getByText('Frapê')).toBeInTheDocument();
  });

  it('exibe valores monetários formatados', () => {
    render(<AmbienteMaterialDetail materiais={mockMateriais} />);
    
    expect(screen.getByText('R$ 8.698,50')).toBeInTheDocument();
    expect(screen.getByText('R$ 966,50')).toBeInTheDocument();
  });

  it('mostra fallback quando materiais são nulos', () => {
    render(<AmbienteMaterialDetail materiais={null} />);
    
    expect(screen.getByText('Materiais não disponíveis')).toBeInTheDocument();
  });

  it('mostra fallback quando materiais são vazios', () => {
    render(<AmbienteMaterialDetail materiais={{}} />);
    
    expect(screen.getByText('Nenhum detalhe de material disponível')).toBeInTheDocument();
  });

  it('ignora seções com dados nulos', () => {
    const materiaisComNulos = {
      ...mockMateriais,
      paineis: null,
      porta_perfil: null
    };
    
    render(<AmbienteMaterialDetail materiais={materiaisComNulos} />);
    
    expect(screen.queryByText('Painéis')).not.toBeInTheDocument();
    expect(screen.queryByText('Perfis')).not.toBeInTheDocument();
  });
});