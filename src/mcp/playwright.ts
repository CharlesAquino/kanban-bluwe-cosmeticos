// Verifica se estamos rodando no navegador
const isBrowser = typeof window !== 'undefined';

export async function screenshot({ url, name }: { url?: string; name?: string }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002';
  const targetUrl = url || baseUrl + '/semi-finished';
  const screenshotName = name || `screenshot-${Date.now()}`;

  // Se PLAYWRIGHT_ENABLED não está true, simula a resposta
  if (process.env.PLAYWRIGHT_ENABLED !== 'true') {
    await new Promise((r) => setTimeout(r, 150));
    console.log(`[MCP:playwright] screenshot SIMULADO -> ${targetUrl} (${screenshotName}.png)`);
    return { 
      ok: true, 
      path: `/screenshots/${screenshotName}.png`,
      url: `${baseUrl}/screenshots/${screenshotName}.png`
    };
  }

  try {
    // Chama a rota da API para capturar o screenshot
    const response = await fetch(`${baseUrl}/api/screenshot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: targetUrl }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Falha na requisição da API: ${error}`);
    }

    // Extrai a imagem em base64 da resposta
    const { image: base64Image } = await response.json();
    
    // Se estiver no navegador, cria um link de download
    let blobUrl = '';
    if (isBrowser) {
      // Converte base64 para blob
      const byteCharacters = atob(base64Image);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });
      
      blobUrl = URL.createObjectURL(blob);
      
      // Cria um link temporário para download
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${screenshotName}.png`;
      document.body.appendChild(a);
      a.click();
      
      // Limpeza
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }, 100);
      
      console.log(`[MCP:playwright] screenshot REAL -> ${targetUrl} capturado`);
      return { 
        ok: true, 
        path: `/screenshots/${screenshotName}.png`,
        url: blobUrl,
        base64: base64Image
      };
    }
    
    // Se não estiver no navegador, retorna apenas os dados em base64
    return { 
      ok: true, 
      path: `/screenshots/${screenshotName}.png`,
      base64: base64Image
    };
  } catch (error) {
    console.error('[MCP:playwright] Erro ao capturar screenshot:', error);
    return { 
      ok: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}
