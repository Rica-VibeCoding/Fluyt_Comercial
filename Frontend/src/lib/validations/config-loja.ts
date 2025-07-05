/**
 * Validações centralizadas para o módulo de configuração de loja
 * Mantém consistência entre frontend e backend
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class ConfigLojaValidator {
  /**
   * Valida hierarquia de descontos: vendedor < gerente < admin
   */
  static validateDiscountHierarchy(
    discountVendor: number,
    discountManager: number,
    discountAdmin: number
  ): ValidationResult {
    const errors: string[] = [];

    if (discountVendor > discountManager) {
      errors.push('Limite de desconto do vendedor não pode ser maior que o do gerente');
    }

    if (discountManager > discountAdmin) {
      errors.push('Limite de desconto do gerente não pode ser maior que o do administrador');
    }

    if (discountVendor > discountAdmin) {
      errors.push('Limite de desconto do vendedor não pode ser maior que o do administrador');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida campos obrigatórios da configuração
   */
  static validateRequiredFields(data: any): ValidationResult {
    const errors: string[] = [];

    if (!data.storeId) {
      errors.push('Loja é obrigatória');
    }

    if (data.freightPercentage === undefined || data.freightPercentage === null) {
      errors.push('Percentual de frete é obrigatório');
    }

    if (data.assemblyPercentage === undefined || data.assemblyPercentage === null) {
      errors.push('Percentual de montagem é obrigatório');
    }

    if (data.executiveProjectPercentage === undefined || data.executiveProjectPercentage === null) {
      errors.push('Percentual de projeto executivo é obrigatório');
    }

    if (!data.numberFormat) {
      errors.push('Formato de numeração é obrigatório');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida valores percentuais (0-100)
   */
  static validatePercentages(data: any): ValidationResult {
    const errors: string[] = [];
    const percentageFields = [
      { field: 'discountLimitVendor', label: 'Limite de desconto vendedor' },
      { field: 'discountLimitManager', label: 'Limite de desconto gerente' },
      { field: 'discountLimitAdminMaster', label: 'Limite de desconto administrador' },
      { field: 'freightPercentage', label: 'Percentual de frete' },
      { field: 'assemblyPercentage', label: 'Percentual de montagem' },
      { field: 'executiveProjectPercentage', label: 'Percentual de projeto executivo' }
    ];

    percentageFields.forEach(({ field, label }) => {
      const value = data[field];
      if (value !== undefined && value !== null) {
        if (value < 0 || value > 100) {
          errors.push(`${label} deve estar entre 0% e 100%`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida configuração completa
   */
  static validateConfigLoja(data: any): ValidationResult {
    const allErrors: string[] = [];

    // Valida campos obrigatórios
    const requiredValidation = this.validateRequiredFields(data);
    allErrors.push(...requiredValidation.errors);

    // Valida percentuais
    const percentageValidation = this.validatePercentages(data);
    allErrors.push(...percentageValidation.errors);

    // Valida hierarquia de descontos
    if (
      data.discountLimitVendor !== undefined &&
      data.discountLimitManager !== undefined &&
      data.discountLimitAdminMaster !== undefined
    ) {
      const hierarchyValidation = this.validateDiscountHierarchy(
        data.discountLimitVendor,
        data.discountLimitManager,
        data.discountLimitAdminMaster
      );
      allErrors.push(...hierarchyValidation.errors);
    }

    // Valida valor de medição
    if (data.defaultMeasurementValue !== undefined && data.defaultMeasurementValue < 0) {
      allErrors.push('Valor padrão de medição não pode ser negativo');
    }

    // Valida número inicial
    if (data.initialNumber !== undefined && data.initialNumber < 1) {
      allErrors.push('Número inicial deve ser maior que zero');
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors
    };
  }
}