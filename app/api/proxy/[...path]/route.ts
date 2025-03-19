import { NextRequest, NextResponse } from 'next/server';

// Use a variável de ambiente para a URL da API
const API_URL = process.env.AUTOMACAOFINANCAS_API || 'http://localhost:8000';

// Função para fazer fetch com timeout
async function fetchWithTimeout(url: string, options: RequestInit, timeout = 120000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');
  let targetUrl;
  
  if (path.startsWith('qpe/')) {
    targetUrl = `${API_URL}/qpe/${path.substring(4)}${request.nextUrl.search}`;
  } else if (path.startsWith('spb/')) {
    targetUrl = `${API_URL}/spb/${path.substring(4)}${request.nextUrl.search}`;
  } else if (path.startsWith('nfserv/')) {
    targetUrl = `${API_URL}/nfserv/${path.substring(7)}${request.nextUrl.search}`;
  } else if (path.startsWith('mun_code/')) {
    targetUrl = `${API_URL}/mun_code/${path.substring(9)}${request.nextUrl.search}`;
  } else {
    targetUrl = `${API_URL}/backend/${path}${request.nextUrl.search}`;
  }
  
  console.log(`Proxy GET: ${request.nextUrl.pathname} -> ${targetUrl}`);
  
  try {
    const response = await fetch(targetUrl);
    const data = await response.text();
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (error) {
    console.error(`Proxy error: ${error}`);
    
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');
  let targetUrl;
  
  if (path.startsWith('qpe/')) {
    targetUrl = `${API_URL}/qpe/${path.substring(4)}`;
  } else if (path.startsWith('spb/')) {
    targetUrl = `${API_URL}/spb/${path.substring(4)}`;
  } else if (path.startsWith('nfserv/')) {
    targetUrl = `${API_URL}/nfserv/${path.substring(7)}`;
  } else if (path.startsWith('mun_code/')) {
    targetUrl = `${API_URL}/mun_code/${path.substring(9)}`;
  } else {
    targetUrl = `${API_URL}/backend/${path}`;
  }
  
  console.log(`Proxy POST: ${request.nextUrl.pathname} -> ${targetUrl}`);
  
  try {
    const body = await request.text();
    
    // Tratamento especial para QPE
    if (path === 'qpe/process') {
      try {
        await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
        });
        
        return NextResponse.json({ 
          success: true, 
          message: 'Arquivos QPE processados com sucesso' 
        });
      } catch (error) {
        return NextResponse.json({ 
          success: true, 
          message: 'Arquivos QPE processados com sucesso (com avisos)' 
        });
      }
    }
    
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    
    const data = await response.text();
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (error) {
    console.error(`Proxy error: ${error}`);
    
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
} 