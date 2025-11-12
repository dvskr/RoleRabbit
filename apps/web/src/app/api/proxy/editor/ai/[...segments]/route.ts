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

  // Create an AbortController with a 5-minute timeout for AI operations (semantic matching takes time)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000); // 300 seconds (5 minutes)

  const init: RequestInit = {
    method: request.method,
    headers: {
      'Content-Type': request.headers.get('content-type') || 'application/json',
      cookie: request.headers.get('cookie') ?? ''
    },
    redirect: 'manual',
    cache: 'no-store',
    signal: controller.signal
  };

  if (!['GET', 'HEAD'].includes(request.method)) {
    const bodyText = await request.text();
    init.body = bodyText;
  }

  let backendResponse: Response;
  try {
    backendResponse = await fetch(targetUrl, init);
    clearTimeout(timeoutId); // Clear timeout on success
  } catch (error: any) {
    clearTimeout(timeoutId); // Clear timeout on error
    console.error('AI proxy request failed', {
      targetUrl,
      method: request.method,
      error: error?.message,
      code: error?.code
    });

    const origin = request.headers.get('origin') || DEFAULT_ORIGIN;
    const status =
      error?.name === 'AbortError' || error?.code === 'UND_ERR_CONNECT_TIMEOUT'
        ? 504
        : error?.code === 'UND_ERR_SOCKET' || error?.code === 'ECONNREFUSED'
          ? 502
          : 500;

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to reach the AI service. Please try again shortly.',
        code: 'AI_PROXY_NETWORK_FAILURE',
        details: {
          message: error?.message,
          code: error?.code ?? null
        }
      },
      {
        status,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Credentials': 'true'
        }
      }
    );
  }
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
  clearTimeout(timeoutId); // Ensure timeout is cleared after reading response
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
export const maxDuration = 300; // 5 minutes for AI operations (semantic matching can be slow)
export const fetchCache = 'force-no-store';
export const revalidate = 0;

