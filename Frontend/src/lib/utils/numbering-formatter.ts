/**
 * Utilitário para formatação de numeração
 * Simplifica a lógica de geração de exemplos
 */

export const NumberingFormatter = {
  /**
   * Gera exemplo de numeração baseado no formato
   */
  generateExample(prefix: string, format: string, initialNumber: number): string {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const paddedNumber = initialNumber.toString().padStart(6, '0');

    const formatMappings = {
      'YYYY': year,
      'MM': month,
      'NNNNNN': paddedNumber
    };

    let example = format;
    Object.entries(formatMappings).forEach(([pattern, value]) => {
      example = example.replace(new RegExp(pattern, 'g'), value);
    });

    return `${prefix}-${example}`;
  },

  /**
   * Valida formato de numeração
   */
  validateFormat(format: string): boolean {
    const validPatterns = ['YYYY', 'MM', 'NNNNNN'];
    return validPatterns.some(pattern => format.includes(pattern));
  },

  /**
   * Lista formatos disponíveis
   */
  getAvailableFormats(): Array<{ value: string; label: string; example: string }> {
    const basePrefix = 'ORC';
    const baseNumber = 1001;
    
    return [
      {
        value: 'YYYY-NNNNNN',
        label: 'Ano-Número',
        example: this.generateExample(basePrefix, 'YYYY-NNNNNN', baseNumber)
      },
      {
        value: 'MM-YYYY-NNNN',
        label: 'Mês-Ano-Número',
        example: this.generateExample(basePrefix, 'MM-YYYY-NNNN', baseNumber)
      },
      {
        value: 'NNNNNN',
        label: 'Apenas Número',
        example: this.generateExample(basePrefix, 'NNNNNN', baseNumber)
      }
    ];
  }
};