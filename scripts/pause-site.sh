#!/bin/bash

# Script para pausar el sitio web

echo "🚫 Pausando TuneBoxd..."

# Respaldar el layout actual
cp src/app/layout.js src/app/layout.js.backup

# Crear layout de mantenimiento
cat > src/app/layout.js << 'EOF'
export const metadata = {
  title: 'TuneBoxd - En Mantenimiento',
  description: 'Sitio temporalmente fuera de servicio',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: 'system-ui, sans-serif',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '600px',
          padding: '2rem',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            marginBottom: '1rem'
          }}>🎵 TuneBoxd</div>
          
          <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>🔧</div>
          
          <h1 style={{
            fontSize: '2.5rem',
            marginBottom: '1rem',
            fontWeight: '600'
          }}>Sitio en Mantenimiento</h1>
          
          <p style={{
            fontSize: '1.2rem',
            lineHeight: '1.6',
            marginBottom: '2rem',
            opacity: '0.9'
          }}>
            Estamos trabajando para mejorar tu experiencia musical.
            El sitio estará disponible nuevamente muy pronto.
          </p>
          
          <div style={{
            fontSize: '1rem',
            opacity: '0.7'
          }}>
            Tiempo estimado: Pocas horas<br/>
            Gracias por tu paciencia
          </div>
        </div>
      </body>
    </html>
  )
}
EOF

echo "✅ Layout de mantenimiento creado"
echo "📁 Backup guardado en: src/app/layout.js.backup"
echo ""
echo "Para desplegar la página de mantenimiento, ejecuta:"
echo "  npm run build && npx vercel --prod"
echo ""
echo "Para restaurar el sitio, ejecuta:"
echo "  ./restore-site.sh"
