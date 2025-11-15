/**
 * CONFIGURAÇÃO CENTRALIZADA DE FONTES
 *
 * Centraliza a configuração de todas as fontes utilizadas no projeto
 * para melhor manutenibilidade e performance.
 *
 * Referências:
 * - Next.js Font Optimization: https://nextjs.org/docs/app/building-your-application/optimizing/fonts
 * - Google Fonts: https://fonts.google.com/
 */

import { Geist, Geist_Mono } from "next/font/google";

/**
 * Fonte Sans Serif Principal (Geist)
 * - Otimizada para legibilidade em telas
 * - Variáveis latinas incluídas por padrão
 * - Performance otimizada com preload automático
 */
export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Melhora performance com font-display: swap
});

/**
 * Fonte Monospace para Código (Geist Mono)
 * - Design consistente com a fonte principal
 * - Otimizada para visualização de código
 * - Mesmas características de performance
 */
export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Classe CSS combinada para ambas as fontes
 * Aplicada automaticamente no elemento <body>
 */
export const fontClasses = `${geistSans.variable} ${geistMono.variable}`;
