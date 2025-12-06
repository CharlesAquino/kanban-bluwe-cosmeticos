'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, User } from 'lucide-react'

interface Operator {
  id: string
  name: string
  email: string
  role: string
  createdAt?: string
}

export default function OperatorsPage() {
  const [operators, setOperators] = useState<Operator[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  
  // Form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'OPERATOR' | 'MOD_OPERATOR'>('OPERATOR')
  const [error, setError] = useState('')

  // Carregar operadores
  useEffect(() => {
    loadOperators()
  }, [])

  const loadOperators = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/mod/operators')
      const data = await res.json()
      
      if (data.success) {
        setOperators(data.data || [])
      } else {
        console.error('Erro ao carregar operadores:', data.error)
      }
    } catch (error) {
      console.error('Erro ao carregar operadores:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!name.trim() || !email.trim()) {
      setError('Nome e email são obrigatórios')
      return
    }

    // Validação básica de email
    if (!email.includes('@')) {
      setError('Email inválido')
      return
    }

    try {
      setCreating(true)
      const res = await fetch('/api/mod/operators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role })
      })

      const data = await res.json()

      if (data.success) {
        // Limpar form
        setName('')
        setEmail('')
        setRole('OPERATOR')
        setShowForm(false)
        
        // Recarregar lista
        await loadOperators()
      } else {
        setError(data.error || 'Erro ao criar operador')
      }
    } catch (error) {
      setError('Erro ao criar operador')
      console.error(error)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Cadastro de Operadores MOD</h1>
          <p className="text-slate-600 mt-1">Gerencie os operadores do sistema</p>
        </div>
        
        <Button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Operador
        </Button>
      </div>

      {/* Formulário de Cadastro */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Cadastrar Novo Operador</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nome Completo *
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: João Silva"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ex: joao.silva@empresa.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tipo de Operador
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'OPERATOR' | 'MOD_OPERATOR')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="OPERATOR">Operador Padrão</option>
                  <option value="MOD_OPERATOR">Operador MOD</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Operador MOD tem permissões adicionais para gerenciar produção
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setError('')
                    setName('')
                    setEmail('')
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={creating}
                >
                  {creating ? 'Cadastrando...' : 'Cadastrar Operador'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Operadores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Operadores Cadastrados ({operators.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-600">
              Carregando operadores...
            </div>
          ) : operators.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 mb-2">Nenhum operador cadastrado</p>
              <p className="text-sm text-slate-500">
                Clique em "Novo Operador" para cadastrar o primeiro
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Nome</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Tipo</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Cadastro</th>
                  </tr>
                </thead>
                <tbody>
                  {operators.map((operator) => (
                    <tr key={operator.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="font-medium text-slate-800">{operator.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{operator.email}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          operator.role === 'MOD_OPERATOR' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {operator.role === 'MOD_OPERATOR' ? 'MOD' : 'Operador'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-500">
                        {operator.createdAt 
                          ? new Date(operator.createdAt).toLocaleDateString('pt-BR')
                          : '-'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Informações Importantes</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Operador Padrão:</strong> Pode registrar MOD e visualizar dados</li>
          <li>• <strong>Operador MOD:</strong> Tem permissões adicionais para gerenciar produção</li>
          <li>• Os operadores cadastrados aqui ficam disponíveis para seleção no MOD Admin</li>
          <li>• É necessário cadastrar pelo menos um operador antes de iniciar produções</li>
        </ul>
      </div>
    </div>
  )
}
