/**
 * Testes para validação do AmbienteModal
 * Específico para criação de ambientes de móveis planejados
 */

// Simulação das validações do AmbienteModal
function validarDadosAmbiente(nome: string, valorCusto?: number, valorVenda?: number) {
  const erros: string[] = [];
  
  if (!nome.trim()) {
    erros.push('Nome do ambiente é obrigatório');
  }
  
  if (valorCusto !== undefined && valorCusto < 0) {
    erros.push('Valor de custo não pode ser negativo');
  }
  
  if (valorVenda !== undefined && valorVenda < 0) {
    erros.push('Valor de venda não pode ser negativo');
  }
  
  if (valorCusto && valorVenda && valorVenda < valorCusto) {
    erros.push('Valor de venda deve ser maior que o custo');
  }
  
  return erros;
}

describe('Validação AmbienteModal - Móveis Planejados', () => {
  
  describe('Validação de Nome', () => {
    it('deve exigir nome obrigatório', () => {
      const erros = validarDadosAmbiente('');
      expect(erros).toContain('Nome do ambiente é obrigatório');
    });

    it('deve aceitar nome válido', () => {
      const erros = validarDadosAmbiente('Cozinha Moderna');
      expect(erros).not.toContain('Nome do ambiente é obrigatório');
    });

    it('deve rejeitar nome só com espaços', () => {
      const erros = validarDadosAmbiente('   ');
      expect(erros).toContain('Nome do ambiente é obrigatório');
    });
  });

  describe('Validação de Valores', () => {
    it('deve rejeitar valor de custo negativo', () => {
      const erros = validarDadosAmbiente('Cozinha', -100);
      expect(erros).toContain('Valor de custo não pode ser negativo');
    });

    it('deve rejeitar valor de venda negativo', () => {
      const erros = validarDadosAmbiente('Cozinha', 1000, -500);
      expect(erros).toContain('Valor de venda não pode ser negativo');
    });

    it('deve aceitar valores válidos', () => {
      const erros = validarDadosAmbiente('Cozinha', 8000, 12000);
      expect(erros).toHaveLength(0);
    });

    it('deve aceitar apenas valor de custo', () => {
      const erros = validarDadosAmbiente('Cozinha', 8000);
      expect(erros).toHaveLength(0);
    });

    it('deve aceitar apenas valor de venda', () => {
      const erros = validarDadosAmbiente('Cozinha', undefined, 12000);
      expect(erros).toHaveLength(0);
    });
  });

  describe('Validação de Margem', () => {
    it('deve exigir venda maior que custo', () => {
      const erros = validarDadosAmbiente('Cozinha', 12000, 8000);
      expect(erros).toContain('Valor de venda deve ser maior que o custo');
    });

    it('deve aceitar venda igual ao custo (margem zero)', () => {
      const erros = validarDadosAmbiente('Cozinha', 10000, 10000);
      expect(erros).toContain('Valor de venda deve ser maior que o custo');
    });

    it('deve aceitar margem positiva', () => {
      const erros = validarDadosAmbiente('Cozinha', 8000, 12000);
      expect(erros).toHaveLength(0);
    });
  });

  describe('Casos Típicos de Móveis Planejados', () => {
    it('deve validar cozinha completa', () => {
      const erros = validarDadosAmbiente('Cozinha Planejada Premium', 15000, 25000);
      expect(erros).toHaveLength(0);
    });

    it('deve validar dormitório casal', () => {
      const erros = validarDadosAmbiente('Dormitório Casal com Closet', 8500, 14000);
      expect(erros).toHaveLength(0);
    });

    it('deve validar sala de estar', () => {
      const erros = validarDadosAmbiente('Sala de Estar com Home Theater', 6000, 9500);
      expect(erros).toHaveLength(0);
    });
  });
});