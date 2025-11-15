'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Calculator,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Target
} from 'lucide-react'
import type { CapabilityIndices } from '@/lib/types'

interface ProcessCapabilityProps {
  capabilityData?: CapabilityIndices
  onCalculate?: (lsl: number, usl: number) => void
}

export function ProcessCapability({ capabilityData, onCalculate }: ProcessCapabilityProps) {
  const [lsl, setLsl] = useState('')
  const [usl, setUsl] = useState('')

  const handleCalculate = () => {
    const lslValue = parseFloat(lsl)
    const uslValue = parseFloat(usl)

    if (!isNaN(lslValue) && !isNaN(uslValue) && onCalculate) {
      onCalculate(lslValue, uslValue)
    }
  }

  const getCapabilityColor = (cpk?: number) => {
    if (!cpk) return 'bg-gray-100 text-gray-800'
    if (cpk >= 1.33) return 'bg-green-100 text-green-800'
    if (cpk >= 1.0) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getCapabilityIcon = (cpk?: number) => {
    if (!cpk) return <Calculator className="h-4 w-4" />
    if (cpk >= 1.33) return <CheckCircle className="h-4 w-4" />
    if (cpk >= 1.0) return <AlertTriangle className="h-4 w-4" />
    return <XCircle className="h-4 w-4" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Análise de Capacidade do Processo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Formulário de especificações */}
        {!capabilityData && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold">Definir Especificações</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lsl">Limite Inferior (LSL)</Label>
                <Input
                  id="lsl"
                  type="number"
                  step="0.001"
                  value={lsl}
                  onChange={(e) => setLsl(e.target.value)}
                  placeholder="Ex: 9.8"
                />
              </div>
              <div>
                <Label htmlFor="usl">Limite Superior (USL)</Label>
                <Input
                  id="usl"
                  type="number"
                  step="0.001"
                  value={usl}
                  onChange={(e) => setUsl(e.target.value)}
                  placeholder="Ex: 10.2"
                />
              </div>
            </div>
            <Button onClick={handleCalculate} className="w-full">
              <Calculator className="h-4 w-4 mr-2" />
              Calcular Capacidade
            </Button>
          </div>
        )}

        {/* Resultados da análise */}
        {capabilityData && (
          <div className="space-y-4">
            {/* Status geral */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                {getCapabilityIcon(capabilityData.cpk)}
                <span className="font-semibold">Status do Processo</span>
              </div>
              <Badge className={getCapabilityColor(capabilityData.cpk)}>
                {capabilityData.cpk ?
                  `Cpk = ${capabilityData.cpk.toFixed(3)}` :
                  'Não calculado'
                }
              </Badge>
            </div>

            {/* Índices de capacidade */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold">Índices Cp</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div>Cp: <span className="font-mono">{capabilityData.cp?.toFixed(3) || 'N/A'}</span></div>
                  <div>Cpu: <span className="font-mono">{capabilityData.cpu?.toFixed(3) || 'N/A'}</span></div>
                  <div>Cpl: <span className="font-mono">{capabilityData.cpl?.toFixed(3) || 'N/A'}</span></div>
                  <div>Cpk: <span className="font-mono">{capabilityData.cpk?.toFixed(3) || 'N/A'}</span></div>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="font-semibold">Índices Pp</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div>Pp: <span className="font-mono">{capabilityData.pp?.toFixed(3) || 'N/A'}</span></div>
                  <div>Ppu: <span className="font-mono">{capabilityData.ppu?.toFixed(3) || 'N/A'}</span></div>
                  <div>Ppl: <span className="font-mono">{capabilityData.ppl?.toFixed(3) || 'N/A'}</span></div>
                  <div>Ppk: <span className="font-mono">{capabilityData.ppk?.toFixed(3) || 'N/A'}</span></div>
                </div>
              </div>
            </div>

            {/* Nível Sigma e DPMO */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-purple-600" />
                  <span className="font-semibold">Nível Sigma</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {capabilityData.sigmaLevel?.toFixed(1) || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">σ</div>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="font-semibold">DPMO</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {capabilityData.dpmo?.toLocaleString() || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Defeitos/Milhão</div>
              </div>
            </div>

            {/* Interpretação */}
            {capabilityData.interpretation && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Interpretação</h4>
                <p className="text-sm text-gray-700">{capabilityData.interpretation}</p>
              </div>
            )}

            {/* Botão para recalcular */}
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                <Calculator className="h-4 w-4 mr-2" />
                Nova Análise
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
