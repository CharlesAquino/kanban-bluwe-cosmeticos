import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json()

    console.log('[Assistant API] Recebida pergunta:', question)

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    // Detecção automática para perguntas sobre quantidades
    const quantityKeywords = ['quantos', 'quantas', 'existem', 'total', 'há', 'são']
    const isQuantityQuestion = quantityKeywords.some(keyword =>
      question.toLowerCase().includes(keyword)
    )

    console.log('[Assistant API] Detecção de quantidade:', { isQuantityQuestion, hasApiKey: !!apiKey })

    if (isQuantityQuestion && apiKey) {
      console.log('[Assistant API] Pergunta sobre quantidade detectada, usando get_current_data diretamente')
      try {
        const toolResult = await executeTool('get_current_data', {})
        const finalResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: systemContext },
              { role: 'user', content: question },
              { role: 'user', content: `TOOL_RESULT: ${JSON.stringify(toolResult)}` }
            ],
            max_tokens: 800,
            temperature: 0.0,
          }),
        })

        if (finalResponse.ok) {
          const finalData = await finalResponse.json()
          const response = finalData.choices?.[0]?.message?.content || 'Erro na resposta'
          console.log('[Assistant API] Resposta para quantidade:', response)
          return NextResponse.json({ response })
        }
      } catch (error) {
        console.error('[Assistant API] Erro na detecção automática:', error)
      }
    }

    const systemContext = `
Você é um assistente especialista em um sistema específico de kanban para produção de insumos cosméticos da Bluwe.

FERRAMENTAS SEGURAS DISPONÍVEIS (apenas metadados públicos):
- get_system_knowledge: Consulta base de conhecimento estruturada sobre o sistema
- get_current_data: Dados estatísticos atuais (contagens, status)
- get_entity_info: Informações sobre entidades do sistema (products, buckets, etc.)
- search_features: Busca funcionalidades do sistema

Para usar ferramentas, responda com: TOOL_CALL: { "tool": "nome_ferramenta", "params": {...} }

IMPORTANTE: Use apenas essas ferramentas seguras. NUNCA tente acessar código fonte, arquivos ou dados sensíveis.

DETALHES DO SISTEMA (conhecimento incorporado):
- PRODUTOS: Nome + Família (Linha Pink, Linha SkinCare, Capilar, Solar, Neutra) + OP + Lote + Quantidade em kg
- FLUXO DE PRODUÇÃO: PRODUCAO_1KG → AVALIACAO_COR → PRODUCAO_5KG → AVALIACAO_FINAL → APROVADO
- FINALIZAÇÃO: Botão "Finalizar" no card quando produto está em "Aprovado"
- SEMI-ACABADOS: Após finalização, produto aparece na aba "Semi-Acabados" automaticamente
- BALDES AUTOMÁTICOS: Sistema gera baldes de 18kg (ex: 33kg = 18kg + 15kg)
- STATUS DOS BALDES: aguardando → in_packaging → partial → packaged → returned
- AÇÕES: Enviar para envase, Registrar envase (parcial/total), Devolver
- MÉTRICAS: Total, Envasado, Saldo por item e família

INSTRUÇÕES PARA RESPOSTAS:
- Use ferramentas quando precisar de informações específicas ou dados atuais
- Seja específico sobre famílias: "Linha Pink", "SkinCare", "Capilar"
- Explique baldes: "Cada produto gera baldes de 18kg automaticamente ao ser finalizado"
- Seja preciso: "Clique em 'Enviar para envase' nos baldes selecionados"
- Use termos técnicos: OP, lote, kg, baldes, envase parcial/total
- Sugira eficiência: "Envase baldes completos primeiro"

ESTRATÉGIA DE RESPOSTA:
1. Para perguntas sobre QUANTIDADES/CONTAGENS (quantos, quantas, existem, total): use get_current_data
2. Para informações sobre entidades (products, buckets, semi-finished): use get_entity_info
3. Para funcionalidades do sistema: use search_features
4. Para conhecimento geral/sistema: use get_system_knowledge
5. Combine informações das ferramentas para resposta completa

EXEMPLOS DE USO DE FERRAMENTAS:
- "Quantos produtos existem?" → TOOL_CALL: { "tool": "get_current_data" }
- "Quantos produtos há no sistema?" → TOOL_CALL: { "tool": "get_current_data" }
- "Quantos baldes estão em envase?" → TOOL_CALL: { "tool": "get_current_data" }
- "Qual é o total de itens?" → TOOL_CALL: { "tool": "get_current_data" }
- "Quantas famílias existem?" → TOOL_CALL: { "tool": "get_current_data" }
- "Como funcionam os baldes?" → TOOL_CALL: { "tool": "get_entity_info", "params": {"entity": "product_buckets"} }
- "Quais funcionalidades existem?" → TOOL_CALL: { "tool": "search_features" }
`

    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      console.log('[Assistant API] Sem OPENAI_API_KEY, usando fallback')
      const response = getFallbackResponse(question)
      return NextResponse.json({ response })
    }

    console.log('[Assistant API] Chamando OpenAI...')

    // Primeiro, tenta obter resposta inicial (pode incluir TOOL_CALL)
    const initialResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemContext },
          { role: 'user', content: question }
        ],
        max_tokens: 600,
        temperature: 0.0, // Totalmente determinístico
      }),
    })

    if (!initialResponse.ok) {
      console.error('[Assistant API] OpenAI error:', initialResponse.status)
      const response = getFallbackResponse(question)
      return NextResponse.json({ response })
    }

    const initialData = await initialResponse.json()
    let assistantMessage = initialData.choices?.[0]?.message?.content || 'Erro na resposta'

    console.log('[Assistant API] Resposta inicial do OpenAI:', assistantMessage)

    // Verifica se há TOOL_CALL na resposta
    const toolCallMatch = assistantMessage.match(/TOOL_CALL:\s*(\{.*?\})/s)
    console.log('[Assistant API] Tool call match:', toolCallMatch ? 'Encontrado' : 'Não encontrado')

    if (toolCallMatch) {
      try {
        const toolCall = JSON.parse(toolCallMatch[1])
        console.log('[Assistant API] Tool call detectado:', toolCall)

        // Executa a ferramenta
        const toolResult = await executeTool(toolCall.tool, toolCall.params || {})

        // Segunda chamada com resultado da ferramenta
        const finalResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: systemContext },
              { role: 'user', content: question },
              { role: 'assistant', content: `TOOL_CALL: ${JSON.stringify(toolCall)}` },
              { role: 'user', content: `TOOL_RESULT: ${JSON.stringify(toolResult)}` }
            ],
            max_tokens: 800,
            temperature: 0.0, // Totalmente determinístico
          }),
        })

        if (finalResponse.ok) {
          const finalData = await finalResponse.json()
          assistantMessage = finalData.choices?.[0]?.message?.content || assistantMessage
          console.log('[Assistant API] Resposta final com tool:', assistantMessage)
        }
      } catch (error) {
        console.error('[Assistant API] Erro no tool calling:', error)
        // Continua com resposta inicial
      }
    }

    console.log('[Assistant API] Resposta final:', assistantMessage)

    return NextResponse.json({ response: assistantMessage })
  } catch (error) {
    console.error('[Assistant API] Erro geral:', error)
    const response = getFallbackResponse('erro')
    return NextResponse.json({ response })
  }
}

async function executeTool(tool: string, params: any) {
  try {
    // Chama o endpoint de ferramentas internamente
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/assistant/tools`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool, params }),
    })

    if (!response.ok) {
      throw new Error(`Tool API error: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('[Assistant API] Erro executando tool:', error)
    return { error: 'Tool execution failed', tool }
  }
}

function getFallbackResponse(question: string): string {
  const q = question.toLowerCase()

  if (q.includes('família') || q.includes('familia')) {
    return 'Famílias organizam produtos no Semi-Acabados: Linha Pink (rosa), SkinCare (azul), Capilar (verde), Solar (amarelo), Neutra (cinza). Cada família tem cores distintas.'
  }

  if (q.includes('balde')) {
    return 'Baldes são gerados automaticamente ao finalizar produtos: cada 18kg vira um balde. Último balde pode ter quantidade menor. Status: aguardando → enviado → parcial → concluído.'
  }

  if (q.includes('finalizar') || q.includes('produção')) {
    return 'Produtos passam pelos estágios: Produção 1kg → Análise C.Q. → Produção Reator → Análise Reator → Aprovado. No card "Aprovado", clique "Finalizar" para mover para Semi-Acabados com baldes.'
  }

  if (q.includes('envase') || q.includes('envasar')) {
    return 'Para envasar: 1) Selecione baldes, 2) Clique "Enviar para envase", 3) Selecione balde e clique "Registrar envase" informando kg (parcial ou total).'
  }

  if (q.includes('saldo') || q.includes('quantidade')) {
    return 'Saldos aparecem na aba Semi-Acabados. Cada item mostra Total (kg produzidos), Envasado (kg processados) e Saldo restante. Baldes mostram kg restantes.'
  }

  if (q.includes('sistema') || q.includes('como funciona')) {
    return 'Sistema de kanban para cosméticos: produtos avançam por estágios até finalização. Então geram baldes de 18kg no Semi-Acabados para envase organizado por famílias.'
  }

  if (q.includes('otimização') || q.includes('eficiência')) {
    return 'Para eficiência: envie baldes de 18kg completos primeiro. Monitore famílias com alto saldo. Evite baldes parciais recorrentes.'
  }

  return 'Pergunte sobre famílias, baldes, envase, saldos ou processos do sistema. Ex: "Como funciona o sistema?" ou "Como envasar baldes?".'
}
