export async function safeFetch(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    // Verificar se a resposta é HTML (erro 404)
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('text/html')) {
      throw new Error(`API ${url} não encontrada (retornou HTML)`)
    }

    // Verificar se a resposta é OK
    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`)
    }

    // Tentar fazer parse do JSON
    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Erro na API ${url}:`, error)
    
    // Se já for um erro personalizado, propagar
    if (error instanceof Error && error.message.includes('API')) {
      throw error
    }
    
    // Erro genérico de conexão
    throw new Error(`Falha ao conectar com a API ${url}`)
  }
}

export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('não encontrada')) {
      return 'Endpoint da API não encontrado. Verifique se o servidor está online.'
    }
    if (error.message.includes('Erro 404')) {
      return 'Recurso não encontrado.'
    }
    if (error.message.includes('Erro 500')) {
      return 'Erro interno do servidor. Tente novamente mais tarde.'
    }
    if (error.message.includes('Failed to fetch')) {
      return 'Falha de conexão. Verifique sua internet.'
    }
    if (error.message.includes('SyntaxError')) {
      return 'Resposta inválida do servidor. Contate o suporte técnico.'
    }
    return error.message
  }
  return 'Erro desconhecido. Tente novamente.'
}
