"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageCircle, X, Send } from 'lucide-react'

type Message = {
  id: string
  text: string
  sender: 'user' | 'assistant'
  timestamp: Date
}

export function AssistantPanel() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Olá! Sou seu assistente inteligente para o kanban. Posso ajudar com perguntas sobre saldos, baldes ou ações no sistema. MCPs configurados: ' +
      (process.env.OPENAI_API_KEY ? 'OpenAI ✓ ' : 'OpenAI ✗ ') +
      (process.env.GITHUB_TOKEN ? 'GitHub ✓ ' : 'GitHub ✗ ') +
      (process.env.SLACK_WEBHOOK ? 'Slack ✓ ' : 'Slack ✗ ') +
      (process.env.PLAYWRIGHT_URL ? 'Playwright ✓' : 'Playwright ✗'), sender: 'assistant', timestamp: new Date() }
  ])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleSend = async () => {
    if (!input.trim()) return
    const questionText = input.trim()
    const userMsg: Message = { id: Date.now().toString(), text: questionText, sender: 'user', timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsThinking(true)

    try {
      // Usar OpenAI para resposta inteligente
      const response = await getSmartResponse(questionText)
      const assistantMsg: Message = { id: (Date.now() + 1).toString(), text: response, sender: 'assistant', timestamp: new Date() }
      setMessages(prev => [...prev, assistantMsg])
    } catch (error) {
      const errorMsg: Message = { id: (Date.now() + 1).toString(), text: 'Erro ao processar pergunta. Tente novamente.', sender: 'assistant', timestamp: new Date() }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsThinking(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend()
  }

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all"
        title="Assistente"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>

      {/* Painel lateral */}
      {open && (
        <div className="fixed top-0 right-0 z-40 h-full w-80 bg-white border-l border-slate-200 shadow-xl flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-semibold text-slate-800">Assistente Kanban</h3>
            <p className="text-sm text-slate-600">Pergunte sobre o sistema</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-2 rounded-lg text-sm ${
                  msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-2 rounded-lg text-sm bg-slate-100 text-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-slate-600">Pensando...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-slate-200">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Pergunte algo..."
                className="flex-1"
              />
              <Button onClick={handleSend} size="sm" disabled={!input.trim() || isThinking}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

async function getSmartResponse(question: string): Promise<string> {
  try {
    const response = await fetch('/api/assistant/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    return data.response || 'Erro na resposta'
  } catch (error) {
    console.error('Erro no assistente:', error)
    // Fallback para respostas hardcoded
    return getAssistantResponse(question)
  }
}

async function getAssistantResponse(question: string): Promise<string> {
  const q = question.toLowerCase()

  // Q&A básica (fallback)
  if (q.includes('saldo') || q.includes('quantidade')) {
    return 'Para ver saldos, acesse a aba Semi-Acabados. Cada item mostra o total, envasado e saldo restante.'
  }
  if (q.includes('balde') || q.includes('envase')) {
    return 'Para envasar: selecione um balde, clique "Registrar envase" e informe os kg. Para enviar: selecione baldes e clique "Enviar para envase".'
  }
  if (q.includes('finalizar') || q.includes('produção')) {
    return 'Quando um produto chega em "finalizado", clique no botão "Finalizar" no card. Ele será movido para Semi-Acabados automaticamente.'
  }
  if (q.includes('família')) {
    return 'Famílias são definidas no cadastro do produto. Elas organizam os itens em Semi-Acabados e influenciam as cores dos cabeçalhos.'
  }

  return 'Desculpe, não entendi. Pergunte sobre saldos, baldes, envase ou ações no sistema.'
}
