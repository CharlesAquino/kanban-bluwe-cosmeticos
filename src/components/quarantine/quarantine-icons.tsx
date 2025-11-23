/**
 * Ícones Customizados para Quarentena
 * Componentes SVG otimizados para alta resolução
 */

import React from 'react'

interface IconProps {
  className?: string
  size?: number
  color?: string
}

// ============================================
// ÍCONES POR FAMÍLIA DE PRODUTO
// ============================================

export const GelIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
    <path d="M12 6v12M8 10h8M8 14h8" />
  </svg>
)

export const TopCoatIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2v20M6 6h12M6 10h12M6 14h12M6 18h12" />
    <circle cx="12" cy="4" r="2" />
  </svg>
)

export const BaseIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 12h18M3 6h18M3 18h18M6 3v18M18 3v18" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

export const HigienizadorIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
    <path d="M12 6v12M8 10h8" />
    <circle cx="12" cy="12" r="1" />
  </svg>
)

export const EsmalteIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2v6M6 8h12M8 8v12c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V8" />
    <path d="M10 8l4-6 4 6" />
  </svg>
)

// ============================================
// ÍCONES DE STATUS
// ============================================

export const QuarantineIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 9h6v6H9z" />
    <path d="M12 6v12M6 12h12" />
  </svg>
)

export const ReleasedIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

export const PendingIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

// ============================================
// ÍCONES DE AÇÃO
// ============================================

export const QuarantineActionIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 12h18M12 3v18" />
    <circle cx="12" cy="12" r="9" />
  </svg>
)

export const ReleaseActionIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M13 9l3 3m0 0l-3 3m3-3H8m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

export const ApproveActionIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

// ============================================
// ÍCONES DE ESTADO VAZIO
// ============================================

export const EmptyQuarantineIcon: React.FC<IconProps> = ({ className = '', size = 64, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
    <path d="M12 6v12M8 10h8M8 14h8" />
    <path d="M6 6l12 12M18 6l-12 12" />
  </svg>
)

export const LoadingIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${className} animate-spin`}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a10 10 0 0 1 10 10" />
  </svg>
)

// ============================================
// ÍCONES DECORATIVOS
// ============================================

export const DecorativeStar: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    className={className}
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

export const DecorativeCircle: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
  </svg>
)

export const DecorativeDot: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    className={className}
  >
    <circle cx="12" cy="12" r="4" />
  </svg>
)

// ============================================
// MAPA DE ÍCONES POR FAMÍLIA
// ============================================

export const familyIconMap = {
  'Gel': GelIcon,
  'TopCoat': TopCoatIcon,
  'Base': BaseIcon,
  'Higienizador': HigienizadorIcon,
  'Esmalte': EsmalteIcon,
}

export const statusIconMap = {
  'quarantine': QuarantineIcon,
  'released': ReleasedIcon,
  'pending': PendingIcon,
}

export const actionIconMap = {
  'quarantine': QuarantineActionIcon,
  'release': ReleaseActionIcon,
  'approve': ApproveActionIcon,
}

/**
 * Obtém ícone para uma família
 */
export function getFamilyIcon(family: string): React.FC<IconProps> {
  for (const [key, icon] of Object.entries(familyIconMap)) {
    if (family.includes(key)) {
      return icon
    }
  }
  return GelIcon
}

/**
 * Obtém ícone para um status
 */
export function getStatusIcon(status: string): React.FC<IconProps> {
  return statusIconMap[status as keyof typeof statusIconMap] || PendingIcon
}

/**
 * Obtém ícone para uma ação
 */
export function getActionIcon(action: string): React.FC<IconProps> {
  return actionIconMap[action as keyof typeof actionIconMap] || ApproveActionIcon
}

export default {
  GelIcon,
  TopCoatIcon,
  BaseIcon,
  HigienizadorIcon,
  EsmalteIcon,
  QuarantineIcon,
  ReleasedIcon,
  PendingIcon,
  QuarantineActionIcon,
  ReleaseActionIcon,
  ApproveActionIcon,
  EmptyQuarantineIcon,
  LoadingIcon,
  DecorativeStar,
  DecorativeCircle,
  DecorativeDot,
  familyIconMap,
  statusIconMap,
  actionIconMap,
  getFamilyIcon,
  getStatusIcon,
  getActionIcon,
}
