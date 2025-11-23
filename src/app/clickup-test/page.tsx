/**
 * Página de Teste - Funcionalidades ClickUp
 * Testa Tags, Tasks e Custom Fields
 */

'use client'

import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TagManager } from '@/components/clickup/TagManager'
import { TaskBoard } from '@/components/clickup/TaskBoard'
import { CustomFieldManager } from '@/components/clickup/CustomFieldManager'
import { Tag, Plus, Settings, CheckCircle } from 'lucide-react'

// Criar QueryClient
const queryClient = new QueryClient()

function ClickupTestContent() {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({})

  const handleTagSelect = (tagId: string) => {
    setSelectedTags(prev => [...prev, tagId])
  }

  const handleTagUnselect = (tagId: string) => {
    setSelectedTags(prev => prev.filter(id => id !== tagId))
  }

  const handleCustomFieldChange = (fieldId: string, value: any) => {
    setCustomFieldValues(prev => ({ ...prev, [fieldId]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚀 Teste das Funcionalidades ClickUp
          </h1>
          <p className="text-gray-600">
            Testando Tags, Tasks e Custom Fields com Mock Data
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Tags Criadas</p>
                  <p className="text-2xl font-bold">2</p>
                </div>
                <Tag className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Tasks Ativas</p>
                  <p className="text-2xl font-bold">1</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Custom Fields</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <Settings className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="tags" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tags">🏷️ Tags</TabsTrigger>
            <TabsTrigger value="tasks">📋 Tasks</TabsTrigger>
            <TabsTrigger value="custom-fields">⚙️ Custom Fields</TabsTrigger>
          </TabsList>

          {/* Tags Tab */}
          <TabsContent value="tags" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Sistema de Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Tags Selecionadas:</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.length === 0 ? (
                      <p className="text-blue-700 text-sm">Nenhuma tag selecionada</p>
                    ) : (
                      selectedTags.map(tagId => (
                        <Badge key={tagId} variant="secondary">
                          Tag ID: {tagId}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>

                <TagManager
                  entityType="product"
                  selectedTags={selectedTags}
                  onTagSelect={handleTagSelect}
                  onTagUnselect={handleTagUnselect}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Board de Tarefas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TaskBoard />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Custom Fields Tab */}
          <TabsContent value="custom-fields" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Campos Customizados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">Valores Atuais:</h3>
                  <pre className="text-purple-700 text-xs bg-purple-100 p-2 rounded">
                    {JSON.stringify(customFieldValues, null, 2)}
                  </pre>
                </div>

                <CustomFieldManager
                  entityType="product"
                  values={customFieldValues}
                  onChange={handleCustomFieldChange}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Test Results */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>🧪 Resultados dos Testes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-700">✅ Funcionando:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Carregamento de tags mock</li>
                  <li>• Criação/edição de tags</li>
                  <li>• Seleção/deseleção de tags</li>
                  <li>• Board de tarefas visual</li>
                  <li>• Custom fields básicos</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-orange-700">⚠️ Limitações:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Dados são mock (não persistem)</li>
                  <li>• Sem conexão real com banco</li>
                  <li>• Sem autenticação real</li>
                  <li>• Sem websockets em tempo real</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Wrapper com QueryClientProvider
export default function ClickupTestPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ClickupTestContent />
    </QueryClientProvider>
  )
}
