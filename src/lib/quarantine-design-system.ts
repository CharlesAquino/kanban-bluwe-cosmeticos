/**
 * Design System para Página de Quarentena
 * Centraliza paletas, tokens e componentes visuais
 */

// ============================================
// PALETAS DE CORES POR FAMÍLIA
// ============================================

export const familyColorPalettes = {
  'Gel': {
    primary: '#EC4899',      // Pink-500
    secondary: '#F472B6',    // Pink-400
    light: '#FCE7F3',        // Pink-100
    dark: '#BE185D',         // Pink-800
    gradient: 'from-pink-400 to-rose-500',
    icon: '🧴',
    description: 'Géis e Tratamentos'
  },
  'TopCoat': {
    primary: '#F59E0B',      // Amber-500
    secondary: '#FBBF24',    // Amber-400
    light: '#FEF3C7',        // Amber-100
    dark: '#B45309',         // Amber-800
    gradient: 'from-amber-400 to-orange-500',
    icon: '✨',
    description: 'Top Coats'
  },
  'Base': {
    primary: '#F59E0B',      // Amber-500
    secondary: '#FBBF24',    // Amber-400
    light: '#FEF3C7',        // Amber-100
    dark: '#B45309',         // Amber-800
    gradient: 'from-amber-400 to-orange-500',
    icon: '🎨',
    description: 'Bases'
  },
  'Higienizador': {
    primary: '#06B6D4',      // Cyan-500
    secondary: '#22D3EE',    // Cyan-400
    light: '#CFFAFE',        // Cyan-100
    dark: '#0E7490',         // Cyan-800
    gradient: 'from-cyan-400 to-blue-500',
    icon: '🧼',
    description: 'Higienizadores'
  },
  'Esmalte': {
    primary: '#A855F7',      // Purple-500
    secondary: '#C084FC',    // Purple-400
    light: '#F3E8FF',        // Purple-100
    dark: '#6B21A8',         // Purple-800
    gradient: 'from-purple-400 to-violet-500',
    icon: '💅',
    description: 'Esmaltes'
  },
  'default': {
    primary: '#3B82F6',      // Blue-500
    secondary: '#60A5FA',    // Blue-400
    light: '#DBEAFE',        // Blue-100
    dark: '#1E40AF',         // Blue-800
    gradient: 'from-blue-400 to-indigo-500',
    icon: '📦',
    description: 'Produto'
  }
}

// ============================================
// TOKENS DE DESIGN
// ============================================

export const designTokens = {
  // Espaçamento
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
  },

  // Sombras
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  },

  // Bordas
  borderRadius: {
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '1rem',       // 16px
    xl: '1.5rem',     // 24px
    '2xl': '2rem',    // 32px
    full: '9999px',
  },

  // Transições
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slowest: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Z-index
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
}

// ============================================
// VARIAÇÕES DE STATUS
// ============================================

export const statusVariations = {
  'quarantine': {
    label: 'Em Quarentena',
    color: '#F59E0B',      // Amber
    bgColor: '#FEF3C7',    // Amber-100
    icon: '🔒',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  'released': {
    label: 'Liberado',
    color: '#10B981',      // Emerald
    bgColor: '#D1FAE5',    // Emerald-100
    icon: '✅',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  'pending': {
    label: 'Pendente',
    color: '#8B5CF6',      // Violet
    bgColor: '#EDE9FE',    // Violet-100
    icon: '⏳',
    badge: 'bg-violet-100 text-violet-800 border-violet-200',
  },
  'approved': {
    label: 'Aprovado',
    color: '#06B6D4',      // Cyan
    bgColor: '#CFFAFE',    // Cyan-100
    icon: '👍',
    badge: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  },
}

// ============================================
// ANIMAÇÕES PREDEFINIDAS
// ============================================

export const animationClasses = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  slideDown: 'animate-slide-down',
  slideLeft: 'animate-slide-left',
  slideRight: 'animate-slide-right',
  bounce: 'animate-bounce',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  ping: 'animate-ping',
  scaleIn: 'animate-scale-in',
  scaleOut: 'animate-scale-out',
}

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

/**
 * Obtém paleta de cores para uma família
 */
export function getFamilyPalette(family: string) {
  for (const [key, palette] of Object.entries(familyColorPalettes)) {
    if (family.includes(key)) {
      return palette
    }
  }
  return familyColorPalettes.default
}

/**
 * Obtém variação de status
 */
export function getStatusVariation(status: string) {
  return statusVariations[status as keyof typeof statusVariations] || statusVariations.pending
}

/**
 * Gera classe Tailwind para gradiente
 */
export function getGradientClass(family: string): string {
  const palette = getFamilyPalette(family)
  return `bg-gradient-to-br ${palette.gradient}`
}

/**
 * Calcula cor com opacidade
 */
export function withOpacity(color: string, opacity: number): string {
  // Converte hex para RGB e aplica opacidade
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

// ============================================
// COMPONENTES VISUAIS PREDEFINIDOS
// ============================================

export const visualComponents = {
  postItCard: {
    borderRadius: designTokens.borderRadius.xl,
    shadow: designTokens.shadows.xl,
    padding: designTokens.spacing.lg,
    transition: designTokens.transitions.base,
  },
  badge: {
    borderRadius: designTokens.borderRadius.full,
    padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  button: {
    borderRadius: designTokens.borderRadius.lg,
    padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
    transition: designTokens.transitions.fast,
    shadow: designTokens.shadows.md,
  },
  icon: {
    size: '1.5rem',
    transition: designTokens.transitions.fast,
  },
}

// ============================================
// TEMAS PREDEFINIDOS
// ============================================

export const themes = {
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#1E293B',
    textSecondary: '#64748B',
    border: '#E2E8F0',
  },
  dark: {
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F1F5F9',
    textSecondary: '#CBD5E1',
    border: '#334155',
  },
}

export default {
  familyColorPalettes,
  designTokens,
  statusVariations,
  animationClasses,
  visualComponents,
  themes,
  getFamilyPalette,
  getStatusVariation,
  getGradientClass,
  withOpacity,
}
