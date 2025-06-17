#!/bin/bash
# Script de deploy para Vercel - TuneBoxd

echo "🚀 === DEPLOY DE TUNEBOXD A VERCEL === 🚀"
echo ""

# Verificar que estamos en el directorio correcto
if [[ ! -f "package.json" ]]; then
    echo "❌ Error: package.json no encontrado. Ejecuta desde la raíz del proyecto."
    exit 1
fi

# Verificar que Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI no encontrado. Instalando..."
    sudo npm install -g vercel
fi

echo "1️⃣ Verificando archivos críticos..."

# Verificar archivos críticos
critical_files=("next.config.mjs" "vercel.json" ".env.production")
for file in "${critical_files[@]}"; do
    if [[ -f "$file" ]]; then
        echo "✅ $file existe"
    else
        echo "❌ $file NO encontrado"
        exit 1
    fi
done

echo ""
echo "2️⃣ Verificando variables de entorno..."

# Crear archivo temporal con variables para Vercel
cat > .env.vercel.tmp << EOF
# Variables de entorno para Vercel
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://tuneboxd.xyz
FROM_EMAIL="TuneBoxd <noreply@tuneboxd.xyz>"
SUPPORT_EMAIL="support@tuneboxd.xyz"
INFO_EMAIL="info@tuneboxd.xyz"
VERIFIED_DOMAIN=tuneboxd.xyz
MAX_REQUESTS_PER_MINUTE=100
MAX_LOGIN_ATTEMPTS=5
ALLOWED_ORIGINS=https://tuneboxd.xyz,https://www.tuneboxd.xyz
EOF

echo "✅ Variables de entorno preparadas"

echo ""
echo "3️⃣ Ejecutando build local..."

# Build local para verificar que todo funciona
npm run build

if [[ $? -ne 0 ]]; then
    echo "❌ Error en build local. Verifica los errores antes de hacer deploy."
    rm -f .env.vercel.tmp
    exit 1
fi

echo "✅ Build local exitoso"

echo ""
echo "4️⃣ Inicializando deploy a Vercel..."

# Login a Vercel (si no está logueado)
echo "Verificando login en Vercel..."
vercel whoami || vercel login

echo ""
echo "5️⃣ Configurando proyecto en Vercel..."

# Deploy a Vercel
echo "Iniciando deploy..."
vercel --prod

echo ""
echo "6️⃣ Variables de entorno a configurar en Vercel Dashboard:"
echo ""
echo "🔑 Variables críticas que debes configurar en vercel.com:"
echo "   - JWT_SECRET=e962ff98a36e5c95561e33070a7b7332ca30322931570b7a725315584f7f7c3e"
echo "   - RESEND_API_KEY=re_NT3cSNp7_PVe58HNZLTBE5o8Rrwa5C9Wj"
echo "   - SPOTIFY_CLIENT_ID=cdffd446edc84f24869404bd9d2fb1b2"
echo "   - SPOTIFY_CLIENT_SECRET=07dd56fd683e436ab9db319af8b6f020"
echo "   - DATABASE_URL=postgresql://usuario:password@host:5432/tuneboxd_production"
echo ""
echo "📧 Variables de email:"
echo "   - FROM_EMAIL=\"TuneBoxd <noreply@tuneboxd.xyz>\""
echo "   - SUPPORT_EMAIL=support@tuneboxd.xyz"
echo "   - INFO_EMAIL=info@tuneboxd.xyz"
echo "   - VERIFIED_DOMAIN=tuneboxd.xyz"
echo ""
echo "🔒 Variables de seguridad:"
echo "   - SESSION_SECRET=59d5c016c433757d98afbf073a7dd59486bacc6798d2b35c548546550e66f648"
echo "   - ENCRYPTION_KEY=8ebe14c5b44915b5d4da8027e3480ee6"
echo "   - MAX_REQUESTS_PER_MINUTE=100"
echo "   - MAX_LOGIN_ATTEMPTS=5"
echo "   - ALLOWED_ORIGINS=https://tuneboxd.xyz,https://www.tuneboxd.xyz"

echo ""
echo "7️⃣ Próximos pasos:"
echo "   1. Ve a vercel.com/dashboard"
echo "   2. Selecciona tu proyecto TuneBoxd"
echo "   3. Ve a Settings > Environment Variables"
echo "   4. Agrega todas las variables listadas arriba"
echo "   5. Configura tu dominio personalizado tuneboxd.xyz"
echo "   6. Configura base de datos PostgreSQL (Neon recomendado)"

echo ""
echo "📊 Base de datos recomendada:"
echo "   - Neon (gratis): https://neon.tech"
echo "   - Supabase (gratis): https://supabase.com"
echo "   - Railway: https://railway.app"

# Limpiar archivo temporal
rm -f .env.vercel.tmp

echo ""
echo "🎉 Deploy completado! Tu aplicación estará disponible en:"
echo "   - URL de Vercel: https://tuneboxd-xyz.vercel.app"
echo "   - Tu dominio: https://tuneboxd.xyz (una vez configurado)"
