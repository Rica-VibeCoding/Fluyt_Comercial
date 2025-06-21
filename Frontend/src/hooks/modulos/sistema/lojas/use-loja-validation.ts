import { useCallback } from 'react';
import type { LojaFormData } from '@/types/sistema';

// Hook especializado para validações de loja
export function useLojaValidation() {
  // Validar código (letras e números)
  const validarCodigo = useCallback((codigo: string): boolean => {
    return codigo && codigo.trim().length >= 3 && /^[A-Za-z0-9]+$/.test(codigo.trim());
  }, []);

  // Validar telefone
  const validarTelefone = useCallback((telefone: string): boolean => {
    const cleaned = telefone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 11;
  }, []);

  // Validar email
  const validarEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // Validar dados completos da loja
  const validarLoja = useCallback((dados: LojaFormData): string[] => {
    const erros: string[] = [];

    if (!dados.nome || dados.nome.trim().length < 3) {
      erros.push('Nome da loja deve ter pelo menos 3 caracteres');
    }

    if (!validarCodigo(dados.codigo)) {
      erros.push('Código deve ter pelo menos 3 caracteres (apenas letras e números)');
    }

    if (!dados.endereco || dados.endereco.trim().length < 10) {
      erros.push('Endereço deve ter pelo menos 10 caracteres');
    }

    if (!validarTelefone(dados.telefone)) {
      erros.push('Telefone inválido');
    }

    if (!validarEmail(dados.email)) {
      erros.push('Email inválido');
    }

    if (!dados.gerente || dados.gerente.trim().length < 3) {
      erros.push('Nome do gerente deve ter pelo menos 3 caracteres');
    }

    if (!dados.empresaId) {
      erros.push('Empresa é obrigatória');
    }

    if (dados.metaMes <= 0) {
      erros.push('Meta mensal deve ser maior que zero');
    }

    return erros;
  }, [validarCodigo, validarTelefone, validarEmail]);

  return {
    validarCodigo,
    validarTelefone,
    validarEmail,
    validarLoja
  };
}