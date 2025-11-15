/**
 * Utilitários de validação aplicando clean code:
 * - Single Responsibility: Apenas validações
 * - Pure Functions: Funções puras sem efeitos colaterais
 * - Type Safety: Tipagem robusta
 * - Error Handling: Tratamento consistente de erros
 */

import { VALIDATION_LIMITS } from './constants'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

/**
 * Valida dados de produto aplicando clean code:
 * - Pure Function: Não modifica dados originais
 * - Early Return: Sai rápido se inválido
 * - Comprehensive: Valida todos os campos necessários
 */
export function validateProductData(data: {
  name: string
  op: string
  batch: string
  quantity: number
}): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Validação de nome
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Nome do produto é obrigatório')
  } else if (data.name.length < VALIDATION_LIMITS.PRODUCT_NAME_MIN_LENGTH) {
    errors.push(`Nome deve ter pelo menos ${VALIDATION_LIMITS.PRODUCT_NAME_MIN_LENGTH} caracteres`)
  } else if (data.name.length > VALIDATION_LIMITS.PRODUCT_NAME_MAX_LENGTH) {
    errors.push(`Nome não pode ter mais de ${VALIDATION_LIMITS.PRODUCT_NAME_MAX_LENGTH} caracteres`)
  }

  // Validação de OP
  if (!data.op || data.op.trim().length === 0) {
    errors.push('Ordem de produção (OP) é obrigatória')
  } else if (data.op.length < VALIDATION_LIMITS.OP_MIN_LENGTH) {
    errors.push(`OP deve ter pelo menos ${VALIDATION_LIMITS.OP_MIN_LENGTH} caracteres`)
  } else if (data.op.length > VALIDATION_LIMITS.OP_MAX_LENGTH) {
    errors.push(`OP não pode ter mais de ${VALIDATION_LIMITS.OP_MAX_LENGTH} caracteres`)
  }

  // Validação de lote
  if (!data.batch || data.batch.trim().length === 0) {
    errors.push('Lote é obrigatório')
  } else if (data.batch.length < VALIDATION_LIMITS.BATCH_MIN_LENGTH) {
    errors.push(`Lote deve ter pelo menos ${VALIDATION_LIMITS.BATCH_MIN_LENGTH} caracteres`)
  } else if (data.batch.length > VALIDATION_LIMITS.BATCH_MAX_LENGTH) {
    errors.push(`Lote não pode ter mais de ${VALIDATION_LIMITS.BATCH_MAX_LENGTH} caracteres`)
  }

  // Validação de quantidade
  if (typeof data.quantity !== 'number' || isNaN(data.quantity)) {
    errors.push('Quantidade deve ser um número válido')
  } else if (data.quantity <= 0) {
    errors.push('Quantidade deve ser maior que zero')
  } else if (data.quantity < VALIDATION_LIMITS.QUANTITY_MIN) {
    errors.push(`Quantidade mínima é ${VALIDATION_LIMITS.QUANTITY_MIN}kg`)
  } else if (data.quantity > VALIDATION_LIMITS.QUANTITY_MAX) {
    errors.push(`Quantidade máxima é ${VALIDATION_LIMITS.QUANTITY_MAX}kg`)
  }

  // Avisos (não erros)
  if (data.quantity > 1000) {
    warnings.push('Quantidade muito alta - verifique se está correto')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

/**
 * Valida formato de email aplicando clean code:
 * - Regex Pattern: Padrão robusto de email
 * - Type Safety: Tipagem adequada
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida formato de telefone aplicando clean code:
 * - Brazilian Format: Formato brasileiro
 * - Flexible: Aceita diferentes formatos
 */
export function validatePhone(phone: string): boolean {
  // Remove caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '')

  // Deve ter entre 10 e 11 dígitos (com DDD)
  return cleaned.length >= 10 && cleaned.length <= 11
}

/**
 * Valida CPF aplicando clean code:
 * - Brazilian CPF: Algoritmo brasileiro
 * - Checksum: Verificação de dígitos verificadores
 */
export function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '')

  if (cleaned.length !== 11 || /^(\d)\1{10}$/.test(cleaned)) {
    return false
  }

  // Cálculo dos dígitos verificadores
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i)
  }

  let digit1 = 11 - (sum % 11)
  if (digit1 >= 10) digit1 = 0

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i)
  }

  let digit2 = 11 - (sum % 11)
  if (digit2 >= 10) digit2 = 0

  return parseInt(cleaned[9]) === digit1 && parseInt(cleaned[10]) === digit2
}

/**
 * Sanitiza texto aplicando clean code:
 * - Remove HTML: Segurança contra XSS
 * - Trim: Remove espaços desnecessários
 * - Normalize: Normaliza caracteres
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
}

/**
 * Formata número para exibição aplicando clean code:
 * - Locale Specific: Formatação brasileira
 * - Precision: Controle de casas decimais
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value)
}

/**
 * Formata moeda aplicando clean code:
 * - Brazilian Format: Formato brasileiro
 * - Symbol: Símbolo do Real
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

/**
 * Valida se string é numérica aplicando clean code:
 * - Type Safety: Tipagem adequada
 * - Edge Cases: Trata casos extremos
 */
export function isNumeric(value: string): boolean {
  if (typeof value !== 'string') return false
  return !isNaN(Number(value)) && !isNaN(parseFloat(value))
}

/**
 * Valida comprimento de string aplicando clean code:
 * - Range Check: Verifica limites
 * - Type Safety: Tipagem adequada
 */
export function validateStringLength(
  value: string,
  minLength: number,
  maxLength: number
): boolean {
  const length = value?.length || 0
  return length >= minLength && length <= maxLength
}
