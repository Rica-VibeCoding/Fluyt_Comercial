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

    // Código agora é opcional
    if (dados.codigo && !validarCodigo(dados.codigo)) {
      erros.push('Código deve ter pelo menos 3 caracteres (apenas letras e números)');
    }

    // Endereço agora é opcional
    if (dados.endereco && dados.endereco.trim().length < 5) {
      erros.push('Endereço deve ter pelo menos 5 caracteres');
    }

    // Telefone agora é opcional
    if (dados.telefone && !validarTelefone(dados.telefone)) {
      erros.push('Telefone inválido');
    }

    // Email agora é opcional
    if (dados.email && !validarEmail(dados.email)) {
      erros.push('Email inválido');
    }

    // Gerente é obrigatório (deve ser selecionado)
    if (!dados.gerente_id) {
      erros.push('Gerente é obrigatório');
    }

    if (!dados.empresaId) {
      erros.push('Empresa é obrigatória');
    }

    // Data de abertura é opcional, mas se preenchida deve ser válida
    if (dados.dataAbertura && isNaN(Date.parse(dados.dataAbertura))) {
      erros.push('Data de abertura inválida');
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