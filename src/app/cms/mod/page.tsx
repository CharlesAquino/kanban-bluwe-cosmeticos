'use client'

import { useState } from 'react'

export default function ModPage() {
  const [analysis, setAnalysis] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generateAnalysis = async () => {
    setLoading(true)
    setError('')
    setAnalysis('')

    try {
      const response = await fetch('/api/ai/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Analise a situação atual do MOD (Monitoramento Operacional Diário) e forneça:
              
1. **Status Geral**: Avalie o desempenho geral das operações
2. **Pontos Críticos**: Identifique gargalos ou problemas urgentes
3. **Recomendações**: Sugira ações prioritárias para melhorar
4. **Tendências**: Comente com os padrões observados

Formato da resposta: Use títulos claros e linguagem direta.`
            }
          ],
          options: { temperature: 0.7, max_tokens: 1500 }
        })
      })

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Erro ao gerar análise')
      }

      setAnalysis(data.response || '')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Análise MOD</h2>
            <p className="text-slate-600 mt-1">Análise inteligente do Monitoramento Operacional Diário</p>
          </div>
          <button
            onClick={generateAnalysis}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Gerando...' : 'Gerar Análise'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">❌ {error}</p>
          </div>
        )}

        {analysis && (
          <div className="prose prose-slate max-w-none">
            <div className="whitespace-pre-wrap bg-slate-50 rounded-lg p-6 border border-slate-200">
              {analysis}
            </div>
          </div>
        )}

        {!analysis && !loading && !error && (
          <div className="text-center py-12 text-slate-500">
            <p>Clique em "Gerar Análise" para iniciar a análise inteligente do MOD</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-600">Analisando dados do MOD...</p>
          </div>
        )}
      </div>
    </div>
  )
}
