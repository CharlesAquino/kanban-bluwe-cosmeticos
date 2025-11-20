const LLAMA_ENDPOINT = process.env.LLAMA_ENDPOINT as string | undefined;

export type LlamaMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type LlamaResponse = unknown;

export type CallLlamaOptions = {
  /** Nome do modelo no endpoint (quando suportado). */
  model?: string;
  /** Temperatura da amostragem (0.0–1.0). Default: 0.7 */
  temperature?: number;
};

export async function callLlama(
  messages: LlamaMessage[],
  options: CallLlamaOptions = {}
): Promise<LlamaResponse> {
  if (!LLAMA_ENDPOINT) {
    throw new Error('LLAMA_ENDPOINT environment variable is not set');
  }

  const { model = 'llama3-2-lightweight', temperature = 0.7 } = options;

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature,
  };

  const response = await fetch(LLAMA_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let errorBody: unknown = null;
    try {
      const text = await response.text();
      // Tenta parsear JSON, se não der, devolve o texto cru
      try {
        errorBody = JSON.parse(text);
      } catch {
        errorBody = text;
      }
    } catch {
      // Ignora erro ao ler corpo da resposta
    }

    throw new Error(
      `Llama request failed with status ${response.status}: ${JSON.stringify(errorBody)}`
    );
  }

  return response.json();
}
