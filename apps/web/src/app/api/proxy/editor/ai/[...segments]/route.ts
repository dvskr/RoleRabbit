import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const DEFAULT_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const hopByHopHeaders = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade'
]);

async function forwardRequest(request: NextRequest, params: { segments?: string[] }) {
  const segments = Array.isArray(params.segments) ? params.segments : [];
  const targetPath = segments.join('/');
  const targetUrl = `${API_BASE_URL}/api/editor/ai/${targetPath}`;

  const init: RequestInit = {
    method: request.method,
    headers: {
      'Content-Type': request.headers.get('content-type') || 'application/json',
      cookie: request.headers.get('cookie') ?? ''
    },
    redirect: 'manual',
    cache: 'no-store'
  };

  if (!['GET', 'HEAD'].includes(request.method)) {
    const bodyText = await request.text();
    init.body = bodyText;
  }

  const backendResponse = await fetch(targetUrl, init);
  const responseHeaders = new Headers();

  backendResponse.headers.forEach((value, key) => {
    if (!hopByHopHeaders.has(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });

  const origin = request.headers.get('origin') || DEFAULT_ORIGIN;
  responseHeaders.set('Access-Control-Allow-Origin', origin);
  responseHeaders.set('Access-Control-Allow-Credentials', 'true');

  // Ensure Next can stream text/json without mismatched encodings
  responseHeaders.delete('content-encoding');
  responseHeaders.delete('content-length');

  const body = await backendResponse.arrayBuffer();
  return new NextResponse(body, {
    status: backendResponse.status,
    headers: responseHeaders
  });
}

export async function POST(request: NextRequest, context: { params: { segments?: string[] } }) {
  return forwardRequest(request, context.params);
}

export async function GET(request: NextRequest, context: { params: { segments?: string[] } }) {
  return forwardRequest(request, context.params);
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || DEFAULT_ORIGIN;
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': request.headers.get('access-control-request-headers') || 'content-type',
      'Access-Control-Allow-Credentials': 'true'
    }
  });
}

export const dynamic = 'force-dynamic';

