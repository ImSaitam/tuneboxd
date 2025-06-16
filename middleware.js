// Middleware para compresión de respuestas API
import { NextResponse } from 'next/server';
import { gzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);

export async function middleware(request) {
  // Solo aplicar compresión a rutas de API
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Verificar si el cliente acepta gzip
  const acceptEncoding = request.headers.get('accept-encoding') || '';
  if (!acceptEncoding.includes('gzip')) {
    return NextResponse.next();
  }

  // Continuar con la request original
  const response = NextResponse.next();

  // Agregar headers de cache para APIs de foro
  if (request.nextUrl.pathname.startsWith('/api/forum/')) {
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  }

  return response;
}

export const config = {
  matcher: [
    '/api/forum/:path*',
    '/api/albums/:path*',
    '/api/reviews/:path*',
    '/api/artists/:path*'
  ]
};
