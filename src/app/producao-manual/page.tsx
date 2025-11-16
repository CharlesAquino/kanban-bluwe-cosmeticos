"use client"

import React, { useState } from 'react'
import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Plus, Save, Clock, Scale } from 'lucide-react'
import type { ModOperator } from '@/lib/mod-types'

interface ProducaoManual {
  operadorId: string
  produtoCategoria: 'GEIS' | 'BASES' | 'ESMALTES' | 'OUTROS'
  loteOP: string
  quantidadeKg: number
  etapaAtual: string
  tempoInicio: Date
  tempoFim?: Date
  status: 'EM_ANDAMENTO' | 'CONCLUIDO' | 'PAUSADO'
  observacoes?: string
}

export default function ProducaoManualPage() {
  const [formData, setFormData] = useState<ProducaoManual>({
    operadorId: '',
    produtoCategoria: 'GEIS',
    loteOP: '',
    quantidadeKg: 0,
    etapaAtual: '',
    tempoInicio: new Date(),
    status: 'EM_ANDAMENTO',
    observacoes: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const {
    data: operadores,
    error: operadoresError,
    isLoading: operadoresLoading,
  } = useSWR<ModOperator[]>(
    '/api/mod/operators',
    async (url: string) => {
      const res = await fetch(url, { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok || !json?.success) throw new Error(json?.error || `Erro ${res.status}`)
      return json.data as ModOperator[]
    },
    {
      revalidateOnFocus: false,
    }
  )

  // Etapas por categoria
  const etapasPorCategoria = {
    GEIS: ['MISTURA', 'REPOUSO', 'CONTROLE_VISCOSIDADE', 'ACABAMENTO'],
    BASES: ['EMULSIFICACAO', 'PH_CONTROLE', 'ESTABILIDADE_TESTE', 'ACABAMENTO'],
    ESMALTES: ['PIGMENTACAO', 'BRILHO_CONTROLE', 'SECAGEM', 'DUREZA_TESTE'],
    OUTROS: ['PREPARACAO', 'PROCESSAMENTO', 'CONTROLES', 'ACABAMENTO']
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/producao-manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        console.log('Produção salva:', result.data)
        setSuccess(true)
        
        // Reset form
        setTimeout(() => {
          setFormData({
            operadorId: '',
            produtoCategoria: 'GEIS',
            loteOP: '',
            quantidadeKg: 0,
            etapaAtual: '',
            tempoInicio: new Date(),
            status: 'EM_ANDAMENTO',
            observacoes: ''
          })
          setSuccess(false)
        }, 2000)
      } else {
        console.error('Erro ao salvar:', result.error)
        alert('Erro ao salvar produção: ' + result.error)
      }
      
    } catch (error) {
      console.error('Erro ao salvar produção:', error)
      alert('Erro ao salvar produção. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof ProducaoManual, value: string | number | Date) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📊 Registro de Produção Manual
        </h1>
        <p className="text-gray-600">
          Insira os dados da produção em tempo real para acompanhamento estratégico
        </p>
      </div>

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800">Produção registrada com sucesso!</span>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Nova Ordem de Produção
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados do Operador */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="operador">Operador</Label>
                <Select
                  value={formData.operadorId}
                  onValueChange={(value) => handleInputChange('operadorId', value)}
                  disabled={operadoresLoading || !operadores?.length}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        operadoresLoading
                          ? 'Carregando operadores...'
                          : !operadores?.length
                          ? 'Cadastre um MOD em MOD Admin (/admin/mod)'
                          : 'Selecione o operador'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {operadores?.map((op) => (
                      <SelectItem key={op.id} value={op.id}>
                        {op.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {operadoresError && (
                  <p className="text-xs text-red-600">
                    Erro ao carregar operadores MOD: {(operadoresError as Error).message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="loteOP">Número da OP</Label>
                <Input
                  id="loteOP"
                  placeholder="Ex: OP-2024-001"
                  value={formData.loteOP}
                  onChange={(e) => handleInputChange('loteOP', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Dados do Produto */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria do Produto</Label>
                <Select
                  value={formData.produtoCategoria}
                  onValueChange={(value: 'GEIS' | 'BASES' | 'ESMALTES' | 'OUTROS') => handleInputChange('produtoCategoria', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GEIS">🧪 GÉIS</SelectItem>
                    <SelectItem value="BASES">💧 BASES</SelectItem>
                    <SelectItem value="ESMALTES">🎨 ESMALTES</SelectItem>
                    <SelectItem value="OUTROS">📦 OUTROS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantidade">
                  <Scale className="h-4 w-4 inline mr-1" />
                  Quantidade (kg)
                </Label>
                <Input
                  id="quantidade"
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={formData.quantidadeKg || ''}
                  onChange={(e) => handleInputChange('quantidadeKg', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="etapa">Etapa Atual</Label>
                <Select
                  value={formData.etapaAtual}
                  onValueChange={(value) => handleInputChange('etapaAtual', value)}
                  disabled={!formData.produtoCategoria}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a etapa" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.produtoCategoria && 
                      etapasPorCategoria[formData.produtoCategoria].map(etapa => (
                        <SelectItem key={etapa} value={etapa}>
                          {etapa}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Status e Tempo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status da Produção</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'EM_ANDAMENTO' | 'CONCLUIDO' | 'PAUSADO') => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EM_ANDAMENTO">
                      <Badge className="bg-blue-100 text-blue-800">🔄 Em Andamento</Badge>
                    </SelectItem>
                    <SelectItem value="CONCLUIDO">
                      <Badge className="bg-green-100 text-green-800">✅ Concluído</Badge>
                    </SelectItem>
                    <SelectItem value="PAUSADO">
                      <Badge className="bg-yellow-100 text-yellow-800">⏸️ Pausado</Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tempoInicio">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Início da Produção
                </Label>
                <Input
                  id="tempoInicio"
                  type="datetime-local"
                  value={formData.tempoInicio.toISOString().slice(0, 16)}
                  onChange={(e) => handleInputChange('tempoInicio', new Date(e.target.value))}
                  required
                />
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações (opcional)</Label>
              <Textarea
                id="observacoes"
                placeholder="Detalhes adicionais sobre a produção..."
                value={formData.observacoes || ''}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                rows={3}
              />
            </div>

            {/* Resumo */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">📋 Resumo da Produção</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Operador:</span>
                  <div className="font-medium">
                    {operadores?.find(op => op.id === formData.operadorId)?.name || 'Não selecionado'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Categoria:</span>
                  <div className="font-medium">{formData.produtoCategoria}</div>
                </div>
                <div>
                  <span className="text-gray-600">Quantidade:</span>
                  <div className="font-medium">{formData.quantidadeKg} kg</div>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <div className="font-medium">{formData.status}</div>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isSubmitting || !formData.operadorId || !formData.loteOP}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Salvando...' : 'Registrar Produção'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
