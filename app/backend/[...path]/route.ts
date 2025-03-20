import { NextRequest, NextResponse } from 'next/server';

// Detecção de ambiente para determinar a URL da API
const isDevelopment = process.env.NODE_ENV === 'development';
// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_URL = isDevelopment 
  ? 'http://localhost:8000' 
  : process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');
  let targetUrl;
  console.log("{API_URL}", {API_URL});
  // Mapear rotas especiais
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
  
  // Mapear rotas especiais
  if (path.startsWith('qpe/')) {
    targetUrl = `${API_URL}/backend/qpe/${path.substring(4)}`;
  } else if (path.startsWith('spb/')) {
    targetUrl = `${API_URL}/backend/spb/${path.substring(4)}`;
  } else if (path.startsWith('nfserv/')) {
    targetUrl = `${API_URL}/backend/nfserv/${path.substring(7)}`;
  } else if (path.startsWith('mun_code/')) {
    targetUrl = `${API_URL}/backend/mun_code/${path.substring(9)}`;
  } else {
    targetUrl = `${API_URL}/backend/${path}`;
  }
  
  console.log(`Proxy POST: ${request.nextUrl.pathname} -> ${targetUrl}`);
  
  try {
    const body = await request.text();
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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