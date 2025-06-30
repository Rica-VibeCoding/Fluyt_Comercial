/**
 * Testes para funções de formatação monetária BR
 * Específico para sistema de móveis planejados
 */

import { formatarMoedaBR, parseMoedaBR } from '../formatters';

describe('Formatação Monetária BR - Móveis Planejados', () => {
  
  describe('parseMoedaBR', () => {
    it('deve converter formato BR corretamente', () => {
      expect(parseMoedaBR('R$ 1.234,56')).toBe(1234.56);
      expect(parseMoedaBR('1.234,56')).toBe(1234.56);
      expect(parseMoedaBR('1234,56')).toBe(1234.56);
    });

    it('deve converter formato US corretamente', () => {
      expect(parseMoedaBR('1,234.56')).toBe(1234.56);
      expect(parseMoedaBR('1234.56')).toBe(1234.56);
    });

    it('deve tratar valores inválidos', () => {
      expect(parseMoedaBR('')).toBe(0);
      expect(parseMoedaBR('abc')).toBe(0);
      expect(parseMoedaBR('R$')).toBe(0);
    });

    it('deve tratar números já convertidos', () => {
      expect(parseMoedaBR(1234.56)).toBe(1234.56);
      expect(parseMoedaBR(0)).toBe(0);
    });

    // Casos específicos para móveis planejados
    it('deve tratar valores típicos de móveis', () => {
      expect(parseMoedaBR('R$ 15.000,00')).toBe(15000); // Cozinha
      expect(parseMoedaBR('R$ 8.500,50')).toBe(8500.50); // Dormitório
      expect(parseMoedaBR('R$ 120.000,00')).toBe(120000); // Casa completa
    });
  });

  describe('formatarMoedaBR', () => {
    it('deve formatar com símbolo R$', () => {
      expect(formatarMoedaBR(1234.56)).toBe('R$ 1.234,56');
      expect(formatarMoedaBR(15000)).toBe('R$ 15.000,00');
    });

    it('deve formatar sem símbolo quando solicitado', () => {
      expect(formatarMoedaBR(1234.56, false)).toBe('1.234,56');
      expect(formatarMoedaBR(15000, false)).toBe('15.000,00');
    });

    it('deve tratar valores zero', () => {
      expect(formatarMoedaBR(0)).toBe('R$ 0,00');
      expect(formatarMoedaBR(0, false)).toBe('0,00');
    });

    // Casos específicos para móveis planejados
    it('deve formatar valores típicos de orçamento', () => {
      expect(formatarMoedaBR(25000)).toBe('R$ 25.000,00');
      expect(formatarMoedaBR(1250.75)).toBe('R$ 1.250,75');
    });
  });

  describe('Integração Parse + Format', () => {
    it('deve manter consistência bidirecional', () => {
      const valores = ['R$ 1.234,56', '15.000,00', '8500,50'];
      
      valores.forEach(valor => {
        const parsed = parseMoedaBR(valor);
        const formatted = formatarMoedaBR(parsed);
        const reparsed = parseMoedaBR(formatted);
        
        expect(reparsed).toBe(parsed);
      });
    });
  });
});