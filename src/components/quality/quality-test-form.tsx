'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Beaker, CheckCircle, XCircle, Plus } from 'lucide-react'
import { useGlobalData } from '@/contexts/global-context'

interface QualityTestFormProps {
  onTestAdded?: () => void
}

export function QualityTestForm({ onTestAdded }: QualityTestFormProps) {
  const { products } = useGlobalData()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    productId: '',
    batch: '',
    stage: '',
    parameter: 'pH' as 'pH' | 'viscosidade' | 'cor' | 'densidade' | 'estabilidade' | 'pureza',
    measuredValue: '',
    unit: 'pH',
    operator: '',
    notes: ''
  })

  // Especificações por parâmetro (valores de referência para cosméticos)
  const parameterSpecs = {
    pH: { target: 5.5, min: 5.2, max: 5.8, unit: 'pH', description: 'pH ideal para produtos cosméticos' },
    viscosidade: { target: 1200, min: 1000, max: 1400, unit: 'cps', description: 'Viscosidade em centipoise' },
    cor: { target: 0, min: -5, max: 5, unit: 'ΔE', description: 'Diferença de cor (Delta E)' },
    densidade: { target: 1.0, min: 0.9, max: 1.1, unit: 'g/cm³', description: 'Densidade do produto' },
    estabilidade: { target: 100, min: 95, max: 100, unit: '%', description: 'Estabilidade física (%)' },
    pureza: { target: 99, min: 98, max: 100, unit: '%', description: 'Pureza do ativo (%)' }
  }

  type ParamKey = keyof typeof parameterSpecs
  const handleParameterChange = (parameter: ParamKey) => {
    const specs = parameterSpecs[parameter]
    setFormData(prev => ({
      ...prev,
      parameter,
      unit: specs.unit
    }))
  }

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId)
    if (product) {
      setFormData(prev => ({
        ...prev,
        productId,
        batch: product.batch || '',
        stage: product.currentStage
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const product = products.find(p => p.id === formData.productId)
      const specs = parameterSpecs[formData.parameter]

      const payload = {
        productId: formData.productId,
        productName: product?.name || '',
        batch: formData.batch,
        stage: formData.stage,
        parameter: formData.parameter,
        targetValue: specs.target,
        tolMin: specs.min,
        tolMax: specs.max,
        measuredValue: Number(formData.measuredValue),
        unit: formData.unit,
        operator: formData.operator,
        notes: formData.notes
      }

      const res = await fetch('/api/quality/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Falha ao registrar análise')

      // Disparar evento neural se reprovado
      const isApprovedTest = Number(formData.measuredValue) >= specs.min && Number(formData.measuredValue) <= specs.max
      if (!isApprovedTest) {
        // Importação dinâmica para evitar overhead
        import('@/lib/event-dispatcher').then(({ events }) => {
          events.qualityTestFailed(
            formData.productId,
            product?.name || '',
            formData.parameter,
            Number(formData.measuredValue),
            { min: specs.min, max: specs.max },
            formData.operator
          )
        })
      }

      setIsOpen(false)
      setFormData({
        productId: '',
        batch: '',
        stage: '',
        parameter: 'pH',
        measuredValue: '',
        unit: 'pH',
        operator: '',
        notes: ''
      })
      onTestAdded?.()
    } catch (error) {
      console.error('Erro ao registrar análise:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const specs = parameterSpecs[formData.parameter]
  const measuredValue = parseFloat(formData.measuredValue)
  const isApproved = !isNaN(measuredValue) &&
    measuredValue >= specs.min &&
    measuredValue <= specs.max

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nova Análise
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Beaker className="h-5 w-5" />
            Registrar Análise de Qualidade
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seleção do Produto */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="product">Produto</Label>
              <Select value={formData.productId} onValueChange={handleProductChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o produto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - {product.op}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="operator">Operador</Label>
              <Input
                id="operator"
                placeholder="Nome do operador"
                value={formData.operator}
                onChange={(e) => setFormData(prev => ({ ...prev, operator: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Informações do Produto */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="batch">Lote</Label>
              <Input
                id="batch"
                value={formData.batch}
                onChange={(e) => setFormData(prev => ({ ...prev, batch: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="stage">Estágio</Label>
              <Input
                id="stage"
                value={formData.stage}
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>

          {/* Parâmetro e Valor */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="parameter">Parâmetro</Label>
              <Select value={formData.parameter} onValueChange={handleParameterChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pH">pH</SelectItem>
                  <SelectItem value="viscosidade">Viscosidade</SelectItem>
                  <SelectItem value="cor">Cor</SelectItem>
                  <SelectItem value="densidade">Densidade</SelectItem>
                  <SelectItem value="estabilidade">Estabilidade</SelectItem>
                  <SelectItem value="pureza">Pureza</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="measuredValue">Valor Medido</Label>
              <Input
                id="measuredValue"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.measuredValue}
                onChange={(e) => setFormData(prev => ({ ...prev, measuredValue: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="unit">Unidade</Label>
              <Input
                id="unit"
                value={formData.unit}
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>

          {/* Especificações e Status */}
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">Especificações</h4>
                <div className="flex items-center gap-2">
                  {isNaN(measuredValue) ? (
                    <Badge variant="outline">Aguardando medição</Badge>
                  ) : isApproved ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Aprovado
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                      <XCircle className="h-3 w-3 mr-1" />
                      Reprovado
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Target</p>
                  <p className="font-semibold">{specs.target} {specs.unit}</p>
                </div>
                <div>
                  <p className="text-gray-600">Mínimo</p>
                  <p className="font-semibold text-red-600">{specs.min} {specs.unit}</p>
                </div>
                <div>
                  <p className="text-gray-600">Máximo</p>
                  <p className="font-semibold text-red-600">{specs.max} {specs.unit}</p>
                </div>
                <div>
                  <p className="text-gray-600">Medido</p>
                  <p className={`font-semibold ${isApproved ? 'text-green-600' : 'text-red-600'}`}>
                    {formData.measuredValue || '-'} {specs.unit}
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-2">{specs.description}</p>
            </CardContent>
          </Card>

          {/* Observações */}
          <div>
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Observações sobre a análise, desvios, ou ações tomadas..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.productId || !formData.measuredValue}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Registrando...' : 'Registrar Análise'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
