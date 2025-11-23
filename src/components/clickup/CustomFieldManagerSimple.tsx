/**
 * CustomFieldManager Simplificado - Sem dependências externas
 * Versão temporária para Docker build
 */

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Settings, X } from 'lucide-react'

interface SimpleCustomField {
  id: string
  name: string
  type: string
  required: boolean
  entityType: string
  isActive: boolean
}

const mockFields: SimpleCustomField[] = [
  {
    id: '1',
    name: 'Lote de Produção',
    type: 'TEXT',
    required: true,
    entityType: 'product',
    isActive: true
  },
  {
    id: '2',
    name: 'Data de Validade',
    type: 'DATE',
    required: true,
    entityType: 'product',
    isActive: true
  },
  {
    id: '3',
    name: 'Temperatura',
    type: 'NUMBER',
    required: false,
    entityType: 'product',
    isActive: true
  }
]

const fieldTypes = [
  { value: 'TEXT', label: 'Texto' },
  { value: 'NUMBER', label: 'Número' },
  { value: 'DATE', label: 'Data' },
  { value: 'BOOLEAN', label: 'Sim/Não' }
]

export const CustomFieldManagerSimple: React.FC = () => {
  const [fields, setFields] = useState<SimpleCustomField[]>(mockFields)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'TEXT',
    required: false,
    entityType: 'product'
  })

  const handleCreateField = () => {
    if (!formData.name.trim()) return

    const newField: SimpleCustomField = {
      id: Date.now().toString(),
      ...formData,
      isActive: true
    }

    setFields(prev => [...prev, newField])
    setFormData({ name: '', type: 'TEXT', required: false, entityType: 'product' })
    setIsCreateDialogOpen(false)
  }

  const handleDeleteField = (fieldId: string) => {
    setFields(prev => prev.filter(field => field.id !== fieldId))
  }

  const renderFieldValue = (field: SimpleCustomField) => {
    switch (field.type) {
      case 'TEXT':
        return <Input placeholder="Digite o texto..." className="h-8" title="Campo de texto" />
      case 'NUMBER':
        return <Input type="number" placeholder="Digite um número..." className="h-8" title="Campo numérico" />
      case 'DATE':
        return <Input type="date" className="h-8" title="Campo de data" />
      case 'BOOLEAN':
        return (
          <div className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" title="Marcar como sim" />
            <Label className="text-sm">Sim</Label>
          </div>
        )
      default:
        return <Input placeholder="Digite o valor..." className="h-8" title="Campo de valor" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Campos Customizados</h3>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Campo
        </Button>
      </div>

      {/* Fields List */}
      <div className="grid gap-4">
        {fields.map(field => (
          <Card key={field.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-medium">{field.name}</h4>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline">{fieldTypes.find(t => t.value === field.type)?.label}</Badge>
                    {field.required && <Badge variant="secondary">Obrigatório</Badge>}
                    <Badge variant="outline">{field.entityType}</Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteField(field.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">Exemplo de valor:</Label>
                {renderFieldValue(field)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      {isCreateDialogOpen && (
        <Card className="p-4">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Novo Campo Customizado
          </h4>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Campo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Lote de Produção"
              />
            </div>
            
            <div>
              <Label htmlFor="type">Tipo de Campo</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full p-2 border rounded"
                title="Selecione o tipo de campo"
              >
                {fieldTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="required"
                checked={formData.required}
                onChange={(e) => setFormData(prev => ({ ...prev, required: e.target.checked }))}
                className="rounded"
                title="Marcar como obrigatório"
              />
              <Label htmlFor="required">Campo obrigatório</Label>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleCreateField}>
                Criar Campo
              </Button>
              <Button 
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
