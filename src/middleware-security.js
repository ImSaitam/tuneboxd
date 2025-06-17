// Middleware de seguridad para producción
import { NextResponse } from 'next/server';

// Configuración de seguridad
const SECURITY_HEADERS = {
  // Prevenir XSS
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  
  // HTTPS
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  
  // CSP (Content Security Policy)
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.spotify.com https://accounts.spotify.com https://i.scdn.co wss://ws.spotify.com",
    "media-src 'self' https://p.scdn.co",
    "frame-src 'none'",
  ].join('; '),
  
  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions Policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

// Rate limiting simple (en producción usar Redis)
const rateLimit = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minuto
  const maxRequests = parseInt(process.env.MAX_REQUESTS_PER_MINUTE) || 100;
  
  const current = rateLimit.get(ip) || { count: 0, resetTime: now + windowMs };
  
  if (now > current.resetTime) {
    current.count = 1;
    current.resetTime = now + windowMs;
  } else {
    current.count++;
  }
  
  rateLimit.set(ip, current);
  
  return current.count > maxRequests;
}

export function middleware(request) {
  const response = NextResponse.next();
  
  // Solo aplicar en producción
  if (process.env.NODE_ENV === 'production') {
    // Aplicar headers de seguridad
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    // Rate limiting
    const ip = request.ip || 'unknown';
    if (isRateLimited(ip)) {
      return new NextResponse('Too Many Requests', { 
        status: 429,
        headers: {
          'Retry-After': '60'
        }
      });
    }
    
    // Verificar origen en requests críticos
    if (request.method !== 'GET') {
      const origin = request.headers.get('origin');
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['https://tuneboxd.xyz'];
      
      if (origin && !allowedOrigins.includes(origin)) {
        return new NextResponse('Forbidden', { status: 403 });
      }
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
