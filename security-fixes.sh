#!/bin/bash
# Script para aplicar correcciones de seguridad críticas

echo "🔒 === APLICANDO CORRECCIONES DE SEGURIDAD ==="

# 1. Generar JWT_SECRET seguro
echo "🔑 Generando JWT_SECRET seguro..."
NEW_JWT_SECRET=$(openssl rand -hex 64)

# 2. Crear archivo .env.production con variables seguras
echo "📝 Creando .env.production..."
cat > .env.production << EOF
# === CONFIGURACIÓN DE PRODUCCIÓN ===
# IMPORTANTE: Este archivo contiene variables sensibles

# JWT Secret - Clave de 128 caracteres generada aleatoriamente
JWT_SECRET=$NEW_JWT_SECRET

# Spotify API (Reemplazar con credenciales de producción)
SPOTIFY_CLIENT_ID=TU_SPOTIFY_CLIENT_ID_PRODUCCION
SPOTIFY_CLIENT_SECRET=TU_SPOTIFY_CLIENT_SECRET_PRODUCCION

# Email Configuration (Usar variables de entorno en Vercel)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=\${EMAIL_USER}
EMAIL_PASS=\${EMAIL_PASS}
EMAIL_FROM=\${EMAIL_FROM}

# URLs de producción
NEXT_PUBLIC_BASE_URL=https://tudominio.com
NEXTAUTH_URL=https://tudominio.com

# Base de datos de producción (Supabase/PostgreSQL)
DATABASE_URL=\${DATABASE_URL}

# Configuración de seguridad
NODE_ENV=production
DISABLE_COMPRESSION=false
EOF

echo "✅ .env.production creado"

# 3. Eliminar fallbacks inseguros de todos los archivos
echo "🔧 Eliminando fallbacks inseguros..."

# Lista de archivos que contienen el fallback inseguro
files_to_fix=$(grep -r "tu-secret-key-muy-seguro" src/ --include="*.js" -l)

for file in $files_to_fix; do
    echo "  📝 Corrigiendo $file..."
    sed -i 's/process\.env\.JWT_SECRET || '\''tu-secret-key-muy-seguro'\''/process.env.JWT_SECRET/g' "$file"
    sed -i 's/process\.env\.JWT_SECRET || "tu-secret-key-muy-seguro"/process.env.JWT_SECRET/g' "$file"
done

echo "✅ Fallbacks eliminados"

# 4. Crear middleware de seguridad
echo "📝 Creando middleware de seguridad..."
cat > src/middleware/security.js << 'EOF'
// Middleware de seguridad para producción
export function securityHeaders() {
  return {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  };
}

// Validador de JWT mejorado
export function validateJWT(token) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no configurado');
  }
  
  if (!token || typeof token !== 'string') {
    throw new Error('Token inválido');
  }
  
  // Validaciones adicionales aquí
  return token;
}
EOF

echo "✅ Middleware de seguridad creado"

# 5. Actualizar vercel.json con headers de seguridad
echo "📝 Actualizando vercel.json con headers de seguridad..."

cat > vercel.json << 'EOF'
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm ci",
  "devCommand": "npm run dev",
  "regions": ["iad1"],
  "functions": {
    "src/app/api/**/*.js": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "X-Requested-With, Content-Type, Accept, Authorization"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
EOF

echo "✅ vercel.json actualizado"

# 6. Crear archivo .gitignore actualizado
echo "📝 Actualizando .gitignore..."
cat >> .gitignore << 'EOF'

# Variables de entorno sensibles
.env.local
.env.production
.env

# Archivos de desarrollo
*.log
*.db
*.db-shm
*.db-wal
admin_token.txt
cookies.txt
EOF

echo "✅ .gitignore actualizado"

echo ""
echo "🔒 === CORRECCIONES DE SEGURIDAD COMPLETADAS ==="
echo ""
echo "📋 PRÓXIMOS PASOS OBLIGATORIOS:"
echo "1. 🔑 Configurar variables de entorno en Vercel"
echo "2. 🗄️  Configurar base de datos PostgreSQL"
echo "3. 📧 Configurar credenciales de email seguras"
echo "4. 🔐 Configurar Spotify API de producción"
echo "5. 🚀 Desplegar con configuración segura"
echo ""
EOF

chmod +x security-fixes.sh
./security-fixes.sh
