import { NextResponse } from 'next/server';
import { chromium } from 'playwright';

// Configurações do navegador
const BROWSER_OPTIONS = {
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--single-process',
    '--disable-gpu'
  ]
};

// Tempo máximo de espera para o carregamento da página (em milissegundos)
const PAGE_LOAD_TIMEOUT = 30000;

export async function POST(request: Request) {
  let browser;
  
  try {
    // Verifica se a requisição é do tipo POST
    if (request.method !== 'POST') {
      return NextResponse.json(
        { error: 'Método não permitido. Use POST.' },
        { status: 405 }
      );
    }

    // Verifica se o Playwright está habilitado
    if (process.env.PLAYWRIGHT_ENABLED !== 'true') {
      return NextResponse.json(
        { error: 'Funcionalidade de screenshot desativada' },
        { status: 503 }
      );
    }

    // Extrai a URL do corpo da requisição
    const { url } = await request.json();
    
    // Valida a URL
    if (!url) {
      return NextResponse.json(
        { error: 'O parâmetro URL é obrigatório' },
        { status: 400 }
      );
    }

    // Valida se a URL é válida
    try {
      new URL(url);
    } catch (error) {
      console.error('URL inválida:', url, error);
      return NextResponse.json(
        { 
          error: 'URL inválida',
          details: error instanceof Error ? error.message : String(error)
        },
        { status: 400 }
      );
    }

    // Inicia o navegador
    browser = await chromium.launch(BROWSER_OPTIONS);
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1,
    });
    
    const page = await context.newPage();
    
    // Configura o tempo limite para o carregamento da página
    page.setDefaultTimeout(PAGE_LOAD_TIMEOUT);

    // Navega até a URL
    const response = await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: PAGE_LOAD_TIMEOUT 
    });

    // Verifica se a página carregou corretamente
    if (!response || !response.ok()) {
      throw new Error(`Falha ao carregar a página: ${response?.status()} ${response?.statusText()}`);
    }
    
    // Tira o screenshot como buffer
    const screenshotBuffer = await page.screenshot({ 
      fullPage: true,
      type: 'png',
      quality: 80
    });
    
    // Fecha o navegador
    await browser.close();
    browser = null;
    
    // Converte o buffer para base64
    const base64Image = screenshotBuffer.toString('base64');
    
    // Retorna a imagem como base64
    return new NextResponse(
      JSON.stringify({ image: base64Image }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600', // Cache de 1 hora
        },
      }
    );
    
  } catch (error) {
    console.error('Erro ao capturar screenshot:', error);
    
    // Fecha o navegador em caso de erro
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error('Erro ao fechar o navegador:', e);
      }
    }
    
    // Retorna uma resposta de erro apropriada
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    return NextResponse.json(
      { 
        error: 'Falha ao capturar o screenshot',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}

// Configuração para evitar cache excessivo em desenvolvimento
// e garantir que a rota não seja estática
export const dynamic = 'force-dynamic';
export const revalidate = 0;
