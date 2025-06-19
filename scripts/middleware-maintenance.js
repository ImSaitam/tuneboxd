// Script para bloquear temporalmente el acceso
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Página de mantenimiento para todas las rutas
  return new NextResponse(
    `<!DOCTYPE html>
    <html>
    <head>
      <title>TuneBoxd - En Mantenimiento</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: system-ui; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white; 
          text-align: center; 
          padding: 50px;
          min-height: 100vh;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .container {
          background: rgba(255, 255, 255, 0.1);
          padding: 3rem;
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }
        h1 { font-size: 3rem; margin-bottom: 1rem; }
        p { font-size: 1.3rem; line-height: 1.6; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎵 TuneBoxd</h1>
        <h2>🔧 En Mantenimiento</h2>
        <p>Estamos mejorando tu experiencia musical.<br>
        Vuelve pronto.</p>
      </div>
    </body>
    </html>`,
    {
      status: 503,
      headers: {
        'Content-Type': 'text/html',
        'Retry-After': '3600' // Reintentar en 1 hora
      }
    }
  );
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
