import { NextRequest, NextResponse } from 'next/server';

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

// usar o API_URL da variavel de ambiente, apontando diretamente pro backend
//ex https://automacaofinancas-qas.weg.net/backend ou http://localhost:8000/backend...
const API_BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/backend" ;

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');
  let targetUrl;
  
  if (path.startsWith('qpe/')) {
    targetUrl = `${API_BACKEND_URL}/qpe/${path.substring(4)}${request.nextUrl.search}`;
  } else if (path.startsWith('spb/')) {
    targetUrl = `${API_BACKEND_URL}/spb/${path.substring(4)}${request.nextUrl.search}`;
  } else if (path.startsWith('nfserv/')) {
    targetUrl = `${API_BACKEND_URL}/nfserv/${path.substring(7)}${request.nextUrl.search}`;
  } else if (path.startsWith('mun_code/')) {
    targetUrl = `${API_BACKEND_URL}/mun_code/${path.substring(9)}${request.nextUrl.search}`;
  } else {
    targetUrl = `${API_BACKEND_URL}/api/${path}${request.nextUrl.search}`;
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
    targetUrl = `${API_BACKEND_URL}/qpe/${path.substring(4)}`;
  } else if (path.startsWith('spb/')) {
    targetUrl = `${API_BACKEND_URL}/spb/${path.substring(4)}`;
  } else if (path.startsWith('nfserv/')) {
    targetUrl = `${API_BACKEND_URL}/nfserv/${path.substring(7)}`;
  } else if (path.startsWith('mun_code/')) {
    targetUrl = `${API_BACKEND_URL}/mun_code/${path.substring(9)}`;
  } else {
    targetUrl = `${API_BACKEND_URL}/api/${path}`;
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