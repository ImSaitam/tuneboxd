// Middleware de mantenimiento para Tuneboxd
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Verificar si el modo mantenimiento está activado
  const maintenanceMode = process.env.MAINTENANCE_MODE === 'true';
  
  // Si el modo mantenimiento está activado, mostrar página de mantenimiento
  if (maintenanceMode && !request.nextUrl.pathname.startsWith('/maintenance')) {
    // Permitir acceso a assets estáticos
    if (
      request.nextUrl.pathname.startsWith('/_next') ||
      request.nextUrl.pathname.startsWith('/api/health') ||
      request.nextUrl.pathname.includes('.')
    ) {
      return NextResponse.next();
    }
    
    // Redirigir a la página de mantenimiento
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
