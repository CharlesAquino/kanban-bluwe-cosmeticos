/**
 * AI Diagnostic utilities - Temporário
 */

export interface DiagnosticResult {
  success: boolean
  message: string
  details?: any
}

export const runDiagnostic = async (issue: string): Promise<DiagnosticResult> => {
  // Mock diagnostic - temporário
  return {
    success: true,
    message: `Diagnostic completed for: ${issue}`,
    details: {
      timestamp: new Date().toISOString(),
      status: 'resolved'
    }
  }
}

// Stubs utilizados pelas rotas de diagnóstico IA em /api/ai/diagnose.
// Mantêm o contrato sem depender de integrações reais de IA neste ambiente.
export const diagnoseFillingSystem = async (): Promise<DiagnosticResult> => {
  return runDiagnostic('filling-system')
}

export const generateCodeFixes = async (issues: string[]): Promise<any[]> => {
  return issues.map((issue, index) => ({
    id: index,
    issue,
    suggestion: `Analisar e corrigir: ${issue}`,
  }))
}
