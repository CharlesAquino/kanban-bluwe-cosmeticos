'use client'

import useSWR from 'swr'
import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, UserCog, UserPlus } from 'lucide-react'
import { ModOperator, ModActivity } from '@/lib/mod-types'

const operatorsFetcher = async (url: string): Promise<ModOperator[]> => {
  const res = await fetch(url, { cache: 'no-store' })
  const json = await res.json()
  if (!res.ok || !json?.success) throw new Error(json?.error || `Erro ${res.status}`)
  return json.data as ModOperator[]
}

const activitiesFetcher = async (url: string): Promise<ModActivity[]> => {
  const res = await fetch(url, { cache: 'no-store' })
  const json = await res.json()
  if (!res.ok || !json?.success) throw new Error(json?.error || `Erro ${res.status}`)
  return json.data as ModActivity[]
}

export default function ModAdminPage() {
  const {
    data: operators,
    error: operatorsError,
    isLoading: loadingOperators,
    mutate: mutateOperators,
  } = useSWR<ModOperator[]>('/api/mod/operators', operatorsFetcher, {
    revalidateOnFocus: false,
  })

  const {
    data: activities,
    error: activitiesError,
    isLoading: loadingActivities,
    mutate: mutateActivities,
  } = useSWR<ModActivity[]>('/api/mod/activities', activitiesFetcher, {
    revalidateOnFocus: false,
  })

  const [editingOperator, setEditingOperator] = useState<ModOperator | null>(null)
  const [savingOperator, setSavingOperator] = useState(false)

  const [activityOperatorId, setActivityOperatorId] = useState<string>('')
  const [activityType, setActivityType] = useState<'producao' | 'administrativa'>('producao')
  const [activityDescription, setActivityDescription] = useState('')
  const [activityProductId, setActivityProductId] = useState('')
  const [savingActivity, setSavingActivity] = useState(false)

  const operatorList = operators || []
  const activityList = activities || []

  const handleSaveOperator = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingOperator?.name.trim()) return

    setSavingOperator(true)
    try {
      const res = await fetch('/api/mod/operators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingOperator.id || undefined,
          name: editingOperator.name,
          role: editingOperator.role,
          isActive: editingOperator.isActive,
          photo: editingOperator.photo ?? null,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json?.success) {
        alert(json?.error || 'Erro ao salvar operador')
        return
      }
      setEditingOperator(null)
      mutateOperators()
    } catch (error) {
      console.error('Erro ao salvar operador MOD:', error)
      alert('Erro ao salvar operador. Tente novamente.')
    } finally {
      setSavingOperator(false)
    }
  }

  const startNewOperator = () => {
    setEditingOperator({
      id: '',
      name: '',
      role: '',
      isActive: true,
      createdAt: '',
      updatedAt: '',
    })
  }

  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activityOperatorId || !activityDescription.trim()) return

    setSavingActivity(true)
    try {
      const res = await fetch('/api/mod/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operatorId: activityOperatorId,
          type: activityType,
          description: activityDescription,
          productId: activityProductId || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json?.success) {
        alert(json?.error || 'Erro ao registrar atividade')
        return
      }
      setActivityDescription('')
      setActivityProductId('')
      mutateActivities()
    } catch (error) {
      console.error('Erro ao registrar atividade MOD:', error)
      alert('Erro ao registrar atividade. Tente novamente.')
    } finally {
      setSavingActivity(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Administração – MOD</h1>
          <p className="text-gray-600 text-sm">
            Cadastro de operadores (MOD) e registro de atividades de produção e administrativas.
          </p>
        </div>
        <Button type="button" onClick={startNewOperator} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Novo MOD
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Operadores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Operadores MOD
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingOperators && (
              <div className="text-sm text-gray-500 flex items-center gap-2 mb-3">
                <Loader2 className="h-4 w-4 animate-spin" /> Carregando operadores...
              </div>
            )}
            {operatorsError && !loadingOperators && (
              <div className="text-sm text-red-600 mb-3">
                Erro ao carregar operadores: {(operatorsError as Error).message}
              </div>
            )}

            {!loadingOperators && !operatorsError && operatorList.length === 0 && (
              <p className="text-sm text-gray-500 mb-3">
                Nenhum MOD cadastrado ainda. Use o botão &quot;Novo MOD&quot; para cadastrar.
              </p>
            )}

            {operatorList.length > 0 && (
              <ul className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                {operatorList.map((op) => (
                  <li
                    key={op.id}
                    className="flex items-center justify-between rounded-lg border px-3 py-2 bg-white cursor-pointer hover:bg-slate-50"
                    onClick={() => setEditingOperator(op)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden text-[10px] text-slate-500">
                        {op.photo ? (
                          <Image
                            src={op.photo}
                            alt={op.name}
                            width={36}
                            height={36}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span>MOD</span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{op.name}</div>
                        <div className="text-xs text-gray-500">
                          {op.role || 'Função não definida'}
                        </div>
                      </div>
                    </div>
                    <Badge variant={op.isActive ? 'default' : 'outline'}>
                      {op.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}

            {editingOperator && (
              <form onSubmit={handleSaveOperator} className="space-y-3 border-t pt-3 mt-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">Nome</label>
                  <Input
                    value={editingOperator.name}
                    onChange={(e) =>
                      setEditingOperator((prev) => (prev ? { ...prev, name: e.target.value } : prev))
                    }
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">Função / Papel</label>
                  <Input
                    value={editingOperator.role || ''}
                    onChange={(e) =>
                      setEditingOperator((prev) =>
                        prev ? { ...prev, role: e.target.value || null } : prev
                      )
                    }
                    placeholder="Ex.: Operador de Mistura, Líder de Turno, Administrativo..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">Foto (opcional)</label>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden text-[10px] text-slate-500">
                      {editingOperator.photo ? (
                        <Image
                          src={editingOperator.photo}
                          alt={editingOperator.name || 'Foto do operador'}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>Sem foto</span>
                      )}
                    </div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          const result = typeof reader.result === 'string' ? reader.result : ''
                          setEditingOperator((prev) =>
                            prev ? { ...prev, photo: result || null } : prev
                          )
                        }
                        reader.readAsDataURL(file)
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="mod-active"
                    type="checkbox"
                    checked={editingOperator.isActive}
                    onChange={(e) =>
                      setEditingOperator((prev) =>
                        prev ? { ...prev, isActive: e.target.checked } : prev
                      )
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="mod-active" className="text-xs text-gray-700">
                    Ativo
                  </label>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingOperator(null)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" size="sm" disabled={savingOperator}>
                    {savingOperator ? (
                      <span className="inline-flex items-center gap-1">
                        <Loader2 className="h-4 w-4 animate-spin" /> Salvando...
                      </span>
                    ) : (
                      'Salvar'
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Atividades */}
        <Card>
          <CardHeader>
            <CardTitle>Atividades de MOD</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSaveActivity} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700">Operador</label>
                <Select
                  value={activityOperatorId}
                  onValueChange={setActivityOperatorId}
                  disabled={operatorList.length === 0}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder={
                      operatorList.length === 0
                        ? 'Cadastre um MOD primeiro'
                        : 'Selecione o operador'
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {operatorList.map((op) => (
                      <SelectItem key={op.id} value={op.id}>
                        {op.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700">Tipo de atividade</label>
                <Select
                  value={activityType}
                  onValueChange={(v: 'producao' | 'administrativa') => setActivityType(v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="producao">Produção</SelectItem>
                    <SelectItem value="administrativa">Administrativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700">Descrição</label>
                <Input
                  value={activityDescription}
                  onChange={(e) => setActivityDescription(e.target.value)}
                  placeholder="Ex.: Operando reator, conferindo documentos, reunião de alinhamento..."
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700">
                  OP / Produto (opcional)
                </label>
                <Input
                  value={activityProductId}
                  onChange={(e) => setActivityProductId(e.target.value)}
                  placeholder="ID da OP ou identificação do produto"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={savingActivity || !activityOperatorId || !activityDescription.trim()}
                >
                  {savingActivity ? (
                    <span className="inline-flex items-center gap-1">
                      <Loader2 className="h-4 w-4 animate-spin" /> Registrando...
                    </span>
                  ) : (
                    'Registrar atividade'
                  )}
                </Button>
              </div>
            </form>

            <div className="border-t pt-3">
              <h3 className="text-xs font-semibold text-gray-700 mb-2">
                Atividades recentes
              </h3>
              {loadingActivities && (
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" /> Carregando atividades...
                </div>
              )}
              {activitiesError && !loadingActivities && (
                <div className="text-xs text-red-600">
                  Erro ao carregar atividades: {(activitiesError as Error).message}
                </div>
              )}
              {!loadingActivities && !activitiesError && activityList.length === 0 && (
                <p className="text-xs text-gray-500">
                  Nenhuma atividade registrada ainda.
                </p>
              )}
              {!loadingActivities && !activitiesError && activityList.length > 0 && (
                <ul className="space-y-1 max-h-60 overflow-y-auto text-xs">
                  {activityList.map((act) => (
                    <li
                      key={act.id}
                      className="flex items-start justify-between gap-2 rounded-md border px-2 py-1.5 bg-white"
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          {act.operatorName || act.operatorId}{' '}
                          <span className="text-[10px] text-gray-500">({act.type})</span>
                        </div>
                        <div className="text-[11px] text-gray-700">{act.description}</div>
                        {act.productId && (
                          <div className="text-[10px] text-gray-500">
                            OP/Produto: {act.productId}
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-500 text-right min-w-[120px]">
                        {new Date(act.startedAt).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
