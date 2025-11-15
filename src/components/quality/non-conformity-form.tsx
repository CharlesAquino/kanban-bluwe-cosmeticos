'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertTriangle, Plus } from 'lucide-react'
import { useGlobalData } from '@/contexts/global-context'

interface NonConformityFormProps {
  onNCAdded?: () => void
}

export function NonConformityForm({ onNCAdded }: NonConformityFormProps) {
  const { products } = useGlobalData()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    productId: '',
    batch: '',
    stage: '',
    type: 'qualidade' as 'qualidade' | 'processo' | 'material' | 'equipamento',
    severity: 'major' as 'critical' | 'major' | 'minor',
    description: '',
    responsible: '',
    deadline: ''
  })

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

      const payload = {
        productId: formData.productId,
        productName: product?.name || '',
        batch: formData.batch,
        stage: formData.stage,
        type: formData.type,
        severity: formData.severity,
        description: formData.description,
        status: 'open',
        createdAt: new Date().toISOString(),
        responsible: formData.responsible || undefined,
        deadline: formData.deadline || undefined
      }

      const res = await fetch('/api/quality/nc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Falha ao registrar não conformidade')

      // Disparar evento neural para NC
      import('@/lib/event-dispatcher').then(({ events }) => {
        events.nonConformityCreated(
          formData.productId,
          product?.name || '',
          formData.type,
          formData.severity,
          formData.description
        )
      })

      setIsOpen(false)
      setFormData({
        productId: '',
        batch: '',
        stage: '',
        type: 'qualidade',
        severity: 'major',
        description: '',
        responsible: '',
        deadline: ''
      })
      onNCAdded?.()
    } catch (error) {
      console.error('Erro ao registrar NC:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'major': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'minor': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
          <Plus className="h-4 w-4 mr-2" />
          Registrar NC
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Registrar Não Conformidade (CAPA)
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
              <Label htmlFor="batch">Lote</Label>
              <Input
                id="batch"
                value={formData.batch}
                onChange={(e) => setFormData(prev => ({ ...prev, batch: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Estágio */}
          <div>
            <Label htmlFor="stage">Estágio</Label>
            <Input
              id="stage"
              value={formData.stage}
              readOnly
              className="bg-gray-50"
            />
          </div>

          {/* Tipo e Severidade */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select value={formData.type} onValueChange={(value: typeof formData.type) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="qualidade">Qualidade</SelectItem>
                  <SelectItem value="processo">Processo</SelectItem>
                  <SelectItem value="material">Material</SelectItem>
                  <SelectItem value="equipamento">Equipamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="severity">Severidade</Label>
              <Select value={formData.severity} onValueChange={(value: typeof formData.severity) => setFormData(prev => ({ ...prev, severity: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor('critical')}>CRITICAL</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="major">
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor('major')}>MAJOR</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="minor">
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor('minor')}>MINOR</Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="description">Descrição da Não Conformidade</Label>
            <Textarea
              id="description"
              placeholder="Descreva detalhadamente o problema identificado..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              required
            />
          </div>

          {/* Responsável e Prazo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="responsible">Responsável (opcional)</Label>
              <Input
                id="responsible"
                placeholder="Nome do responsável"
                value={formData.responsible}
                onChange={(e) => setFormData(prev => ({ ...prev, responsible: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="deadline">Prazo (opcional)</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
              />
            </div>
          </div>

          {/* Preview da Severidade */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-semibold mb-2">Preview:</p>
            <div className="flex items-center gap-2">
              <Badge className={getSeverityColor(formData.severity)}>
                {formData.severity.toUpperCase()}
              </Badge>
              <Badge variant="outline">{formData.type}</Badge>
              <Badge variant="destructive">Status: Aberto</Badge>
            </div>
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
              disabled={isSubmitting || !formData.productId || !formData.description}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              {isSubmitting ? 'Registrando...' : 'Registrar NC'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
