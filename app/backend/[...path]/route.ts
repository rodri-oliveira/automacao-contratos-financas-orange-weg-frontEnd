import { NextRequest, NextResponse } from 'next/server';

// Obtém a URL base do backend a partir das variáveis de ambiente
const getBaseUrl = () => {
  return process.env.AUTO_CONTRACT_FINAN || 'http://localhost:8000'; // Fallback para localhost em desenvolvimento
};

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');
  const baseUrl = getBaseUrl(); // Usa a URL base do backend
  let targetUrl;
  
  // Mapear rotas especiais
  if (path.startsWith('qpe/')) {
    targetUrl = `${baseUrl}/qpe/${path.substring(4)}${request.nextUrl.search}`;
  } else if (path.startsWith('spb/')) {
    targetUrl = `${baseUrl}/spb/${path.substring(4)}${request.nextUrl.search}`;
  } else if (path.startsWith('nfserv/')) {
    targetUrl = `${baseUrl}/nfserv/${path.substring(7)}${request.nextUrl.search}`;
  } else if (path.startsWith('mun_code/')) {
    targetUrl = `${baseUrl}/mun_code/${path.substring(9)}${request.nextUrl.search}`;
  } else {
    targetUrl = `${baseUrl}/backend/${path}${request.nextUrl.search}`;
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
  const baseUrl = getBaseUrl(); // Usa a URL base do backend
  let targetUrl;
  
  // Mapear rotas especiais
  if (path.startsWith('qpe/')) {
    targetUrl = `${baseUrl}/qpe/${path.substring(4)}`;
  } else if (path.startsWith('spb/')) {
    targetUrl = `${baseUrl}/spb/${path.substring(4)}`;
  } else if (path.startsWith('nfserv/')) {
    targetUrl = `${baseUrl}/nfserv/${path.substring(7)}`;
  } else if (path.startsWith('mun_code/')) {
    targetUrl = `${baseUrl}/mun_code/${path.substring(9)}`;
  } else {
    targetUrl = `${baseUrl}/backend/${path}`;
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