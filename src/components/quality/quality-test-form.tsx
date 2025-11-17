'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Beaker, CheckCircle, XCircle, Plus, Settings, FileText, BarChart3, TrendingUp } from 'lucide-react'
import { useGlobalData } from '@/contexts/global-context'
import { SemiItem, semiFinishedFetcher } from '@/lib/semi-finished-lib'

interface QualityTestFormProps {
  onTestAdded?: () => void
}

export function QualityTestForm({ onTestAdded }: QualityTestFormProps) {
  const { products } = useGlobalData()
  const { data: semiItemsData } = useSWR<SemiItem[]>('/api/semi-finished', semiFinishedFetcher, {
    revalidateOnFocus: false,
  })
  const semiItems = semiItemsData || []
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
    // Delta E (cor): limite 1.7, atenção a partir de 1.4
    cor: {
      target: 0,
      min: 0,
      max: 1.7,
      unit: 'ΔE',
      description: 'Diferença de cor (ΔE). Até 1,4: dentro da meta. Entre 1,4 e 1,7: atenção. Acima de 1,7: reprovado.',
    },
    densidade: { target: 1.0, min: 0.9, max: 1.1, unit: 'g/cm³', description: 'Densidade do produto' },
    estabilidade: { target: 100, min: 95, max: 100, unit: '%', description: 'Estabilidade física (%)' },
    pureza: { target: 99, min: 98, max: 100, unit: '%', description: 'Pureza do ativo (%)' },
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

  const handleProductChange = (value: string) => {
    const [source, rawId] = value.split(':') as ['kanban' | 'semi', string]

    if (source === 'kanban') {
      const product = products.find((p) => p.id === rawId)
      if (product) {
        setFormData((prev) => ({
          ...prev,
          productId: product.id,
          batch: product.batch || '',
          stage: (product as { currentStage?: string }).currentStage ?? '',
        }))
      }
    } else if (source === 'semi') {
      const item = semiItems.find((s) => s.id === rawId)
      if (item) {
        // Vincula a análise ao productId original, mas marca o estágio como semi-acabado
        setFormData((prev) => ({
          ...prev,
          productId: item.productId,
          batch: item.batch || '',
          stage: 'SEMI_ACABADO',
        }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const product =
        products.find((p) => p.id === formData.productId) ||
        semiItems.find((s) => s.productId === formData.productId)
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
  const isApproved =
    !isNaN(measuredValue) && measuredValue >= specs.min && measuredValue <= specs.max
  const isAttention =
    formData.parameter === 'cor' &&
    !isNaN(measuredValue) &&
    measuredValue >= 1.4 &&
    measuredValue <= specs.max

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-slate-500 via-slate-600 to-slate-700 text-white border-0 shadow-lg shadow-slate-500/30 hover:shadow-slate-500/50 hover:-translate-y-0.5 transition-all duration-200 rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-slate-400/20 p-1">
              <Plus className="h-3 w-3 text-slate-200" />
            </div>
            <span>Nova Análise</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-100 bg-white/95 backdrop-blur-xl shadow-2xl">
        <DialogHeader className="space-y-3 pb-2">
          <DialogTitle className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 text-slate-700 p-3 shadow-inner">
              <Beaker className="h-6 w-6" />
            </div>
            <div>
              <span className="bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent font-semibold text-lg">
                Registrar Análise de Qualidade
              </span>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                Preencha os dados da análise de parâmetros críticos
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Seleção do Produto */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="product" className="text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                <div className="rounded-md bg-slate-100 p-1">
                  <Beaker className="h-3 w-3 text-slate-600" />
                </div>
                Produto
              </Label>
              <Select
                value={formData.productId ? `kanban:${formData.productId}` : ''}
                onValueChange={handleProductChange}
              >
                <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white/80 backdrop-blur-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition-all duration-200 hover:border-slate-300">
                  <SelectValue placeholder="Selecione o produto" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 bg-white/95 backdrop-blur-sm shadow-xl">
                  {products.map((product) => (
                    <SelectItem key={product.id} value={`kanban:${product.id}`} className="rounded-lg text-slate-700 focus:bg-slate-50 focus:text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                        [Kanban] {product.name} - {product.op}
                      </div>
                    </SelectItem>
                  ))}
                  {semiItems.map((item) => (
                    <SelectItem key={item.id} value={`semi:${item.id}`} className="rounded-lg text-slate-700 focus:bg-slate-50 focus:text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                        [Semi] {item.name} - {item.op}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="operator" className="text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                <div className="rounded-md bg-slate-100 p-1">
                  <Settings className="h-3 w-3 text-slate-600" />
                </div>
                Operador
              </Label>
              <Input
                id="operator"
                placeholder="Nome do operador"
                value={formData.operator}
                onChange={(e) => setFormData(prev => ({ ...prev, operator: e.target.value }))}
                required
                className="h-11 rounded-xl border-slate-200 bg-white/80 backdrop-blur-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition-all duration-200 hover:border-slate-300"
              />
            </div>
          </div>

          {/* Informações do Produto */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="batch" className="text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                <div className="rounded-md bg-slate-100 p-1">
                  <FileText className="h-3 w-3 text-slate-600" />
                </div>
                Lote
              </Label>
              <Input
                id="batch"
                value={formData.batch}
                onChange={(e) => setFormData(prev => ({ ...prev, batch: e.target.value }))}
                required
                className="h-11 rounded-xl border-slate-200 bg-white/80 backdrop-blur-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition-all duration-200 hover:border-slate-300"
              />
            </div>
            <div>
              <Label htmlFor="stage" className="text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                <div className="rounded-md bg-slate-100 p-1">
                  <TrendingUp className="h-3 w-3 text-slate-600" />
                </div>
                Estágio
              </Label>
              <Input
                id="stage"
                value={formData.stage}
                readOnly
                className="h-11 rounded-xl border-emerald-200 bg-emerald-50/80 backdrop-blur-sm text-slate-700 font-medium"
              />
            </div>
          </div>

          {/* Parâmetro e Valor */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="parameter" className="text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                <div className="rounded-md bg-slate-100 p-1">
                  <Beaker className="h-3 w-3 text-slate-600" />
                </div>
                Parâmetro
              </Label>
              <Select value={formData.parameter} onValueChange={handleParameterChange}>
                <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white/80 backdrop-blur-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition-all duration-200 hover:border-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 bg-white/95 backdrop-blur-sm shadow-xl">
                  <SelectItem value="pH" className="rounded-lg text-slate-700 focus:bg-slate-50 focus:text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                      🧪 pH
                    </div>
                  </SelectItem>
                  <SelectItem value="viscosidade" className="rounded-lg text-slate-700 focus:bg-slate-50 focus:text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                      🌊 Viscosidade
                    </div>
                  </SelectItem>
                  <SelectItem value="cor" className="rounded-lg text-slate-700 focus:bg-slate-50 focus:text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                      🎨 Cor
                    </div>
                  </SelectItem>
                  <SelectItem value="densidade" className="rounded-lg text-slate-700 focus:bg-slate-50 focus:text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                      ⚖️ Densidade
                    </div>
                  </SelectItem>
                  <SelectItem value="estabilidade" className="rounded-lg text-slate-700 focus:bg-slate-50 focus:text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                      🔄 Estabilidade
                    </div>
                  </SelectItem>
                  <SelectItem value="pureza" className="rounded-lg text-slate-700 focus:bg-slate-50 focus:text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                      💎 Pureza
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="measuredValue" className="text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                  <div className="rounded-md bg-slate-100 p-1">
                    <BarChart3 className="h-3 w-3 text-slate-600" />
                  </div>
                  Valor Medido
                </Label>
                <Input
                  id="measuredValue"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.measuredValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, measuredValue: e.target.value }))}
                  required
                  className="h-11 rounded-xl border-slate-200 bg-white/80 backdrop-blur-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition-all duration-200 hover:border-slate-300"
                />
              </div>
              <div>
                <Label htmlFor="unit" className="text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                  <div className="rounded-md bg-slate-100 p-1">
                    <FileText className="h-3 w-3 text-slate-600" />
                  </div>
                  Unidade
                </Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  readOnly
                  className="h-11 rounded-xl border-slate-200 bg-slate-50/80 backdrop-blur-sm text-slate-700 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Especificações e Status */}
          <Card className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50/80 via-white/60 to-slate-50/80 backdrop-blur-sm shadow-lg shadow-slate-500/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 text-slate-700 p-2 shadow-inner">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  <span className="bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent font-semibold">
                    Especificações
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isNaN(measuredValue) ? (
                    <Badge variant="outline" className="rounded-lg border-slate-200 text-slate-700 bg-slate-50">
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse"></div>
                        Aguardando medição
                      </div>
                    </Badge>
                  ) : isApproved ? (
                    isAttention && formData.parameter === 'cor' ? (
                      <Badge className="rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Aprovado (Atenção)
                        </div>
                      </Badge>
                    ) : (
                      <Badge className="rounded-lg bg-green-50 text-green-700 border border-green-200">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Aprovado
                        </div>
                      </Badge>
                    )
                  ) : (
                    <Badge className="rounded-lg bg-red-50 text-red-700 border border-red-200">
                      <div className="flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        Reprovado
                      </div>
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="rounded-xl bg-white/60 backdrop-blur-sm border border-slate-100 p-2">
                  <p className="text-xs font-medium text-slate-500 mb-1">Target</p>
                  <p className="font-semibold text-slate-900">{specs.target} {specs.unit}</p>
                </div>
                <div className="rounded-xl bg-white/60 backdrop-blur-sm border border-slate-100 p-2">
                  <p className="text-xs font-medium text-slate-500 mb-1">Mínimo</p>
                  <p className="font-semibold text-red-600">{specs.min} {specs.unit}</p>
                </div>
                <div className="rounded-xl bg-white/60 backdrop-blur-sm border border-slate-100 p-2">
                  <p className="text-xs font-medium text-slate-500 mb-1">Máximo</p>
                  <p className="font-semibold text-red-600">{specs.max} {specs.unit}</p>
                </div>
                <div className="rounded-xl bg-white/60 backdrop-blur-sm border border-slate-100 p-2">
                  <p className="text-xs font-medium text-slate-500 mb-1">Medido</p>
                  <p
                    className={`font-semibold ${
                      isNaN(measuredValue)
                        ? 'text-slate-600'
                        : isApproved
                        ? isAttention && formData.parameter === 'cor'
                          ? 'text-amber-600'
                          : 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {formData.measuredValue || '-'} {specs.unit}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-500 mt-3 leading-relaxed bg-slate-50/50 rounded-lg p-2 border border-slate-100">
                {specs.description}
              </p>
            </CardContent>
          </Card>

          {/* Observações */}
          <div>
            <Label htmlFor="notes" className="text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
              <div className="rounded-md bg-slate-100 p-1">
                <FileText className="h-3 w-3 text-slate-600" />
              </div>
              Observações (opcional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Observações sobre a análise, desvios, ou ações tomadas..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
              className="rounded-xl border-slate-200 bg-white/80 backdrop-blur-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition-all duration-200 hover:border-slate-300 resize-none"
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center gap-2">
                <div className="rounded-md bg-slate-100 p-1">
                  <XCircle className="h-3 w-3 text-slate-600" />
                </div>
                <span>Cancelar</span>
              </div>
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.productId || !formData.measuredValue}
              className="flex-1 bg-gradient-to-r from-slate-500 via-slate-600 to-slate-700 text-white border-0 shadow-lg shadow-slate-500/30 hover:shadow-slate-500/50 hover:-translate-y-0.5 transition-all duration-200 rounded-xl px-4 py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-lg"
            >
              <div className="flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <div className="relative w-4 h-4">
                    <div className="absolute inset-0 rounded-full border-2 border-slate-200 border-t-slate-500 animate-spin"></div>
                  </div>
                ) : (
                  <div className="rounded-lg bg-slate-400/20 p-1">
                    <CheckCircle className="h-3 w-3 text-slate-200" />
                  </div>
                )}
                <span>{isSubmitting ? 'Registrando...' : 'Registrar Análise'}</span>
              </div>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
