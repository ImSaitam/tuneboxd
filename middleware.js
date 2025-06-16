// Middleware optimizado para cache y seguridad admin
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secret-key-muy-seguro';

export async function middleware(request) {
  const response = NextResponse.next();
  
  // Protección de rutas admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    try {
      // Obtener token de las cookies o headers
      const token = request.cookies.get('auth_token')?.value || 
                   request.headers.get('authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return NextResponse.redirect(new URL('/login?redirect=' + encodeURIComponent(request.nextUrl.pathname), request.url));
      }

      // Verificar token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // En un middleware real, aquí harías una consulta a la DB para verificar el rol
      // Por simplicidad, asumimos que el token contiene la info del rol
      
      // Si llega aquí, el token es válido, continuar
    } catch (error) {
      console.error('Error en middleware admin:', error);
      return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
    }
  }
  
  // Cache para APIs del foro
  if (request.nextUrl.pathname.startsWith('/api/forum/')) {
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    response.headers.set('Content-Encoding', 'identity'); // Evitar compresión
  }
  
  return response;
}

export const config = {
  matcher: [
    '/api/forum/:path*',
    '/admin/:path*'
  ]
};
