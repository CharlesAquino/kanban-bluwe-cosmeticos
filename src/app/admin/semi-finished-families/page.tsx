'use client'

import useSWR from 'swr'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { KANBAN_KNOWLEDGE_BASE } from '@/lib/knowledge-base'
import { Loader2, PlusCircle } from 'lucide-react'

interface SemiFinishedFamily {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

const fetcher = async (url: string): Promise<SemiFinishedFamily[]> => {
  const res = await fetch(url, { cache: 'no-store' })
  const json = await res.json()
  if (!res.ok || !json?.success) {
    throw new Error(json?.error || `Erro ${res.status}`)
  }
  return json.data as SemiFinishedFamily[]
}

export default function SemiFinishedFamiliesAdminPage() {
  const { data, error, isLoading, mutate } = useSWR<SemiFinishedFamily[]>(
    '/api/semi-finished/families',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)

  const families = data || []

  const existingNames = new Set(families.map((f) => f.name.toLowerCase()))
  const suggestedFamilies = (KANBAN_KNOWLEDGE_BASE.entities.products.families || []).filter(
    (name) => !existingNames.has(name.toLowerCase())
  )

  const handleCreate = async (nameOverride?: string) => {
    const name = (nameOverride ?? newName).trim()
    if (!name) return

    setSaving(true)
    try {
      const res = await fetch('/api/semi-finished/families', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const json = await res.json()
      if (!res.ok || !json?.success) {
        alert(json?.error || 'Falha ao salvar categoria')
        return
      }
      setNewName('')
      mutate()
    } catch (error) {
      console.error('Erro ao criar categoria de semi-acabado:', error)
      alert('Erro ao criar categoria. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Administração – Categorias de Semi-Acabados
        </h1>
        <p className="text-gray-600">
          Cadastro interno de famílias de produtos semi-acabados, alinhado ao desenho
          operacional do Kanban de Semi-Acabados.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Nova categoria / família</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-end">
            <div className="flex-1 space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Nome da categoria
              </label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex.: Linha Pink, Linha SkinCare, Capilar..."
              />
            </div>
            <Button
              type="button"
              className="md:w-48 flex items-center gap-2"
              disabled={saving || !newName.trim()}
              onClick={() => handleCreate()}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
              Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Categorias cadastradas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Carregando categorias...
              </div>
            )}
            {error && !isLoading && (
              <div className="text-sm text-red-600">
                Erro ao carregar categorias: {(error as Error).message}
              </div>
            )}
            {!isLoading && !error && families.length === 0 && (
              <p className="text-sm text-gray-500">
                Nenhuma categoria cadastrada ainda. Use o formulário acima para criar as primeiras.
              </p>
            )}
            {!isLoading && !error && families.length > 0 && (
              <ul className="space-y-2">
                {families.map((family) => (
                  <li
                    key={family.id}
                    className="flex items-center justify-between rounded-lg border px-3 py-2 bg-white"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{family.name}</div>
                      <div className="text-xs text-gray-500">
                        Criada em{' '}
                        {new Date(family.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                    <Badge variant="secondary">Semi-Acabados</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sugestões do Kanban</CardTitle>
          </CardHeader>
          <CardContent>
            {suggestedFamilies.length === 0 ? (
              <p className="text-sm text-gray-500">
                Todas as famílias sugeridas já foram cadastradas.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {suggestedFamilies.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleCreate(name)}
                    className="px-3 py-1 rounded-full border text-sm bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
