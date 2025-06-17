#!/bin/bash

# Script para configurar variables de entorno via CLI y redesplegar

echo "🔐 Configurando variables de entorno en Vercel..."

# Variables que podemos configurar automáticamente
npx vercel env add DATABASE_URL production <<< "postgresql://neondb_owner:npg_lXKaEiD2pF4n@ep-shy-rain-a85s4po9-pooler.eastus2.azure.neon.tech/neondb?sslmode=require"
npx vercel env add JWT_SECRET production <<< "e962ff98a36e5c95561e33070a7b7332ca30322931570b7a725315584f7f7c3e"
npx vercel env add SESSION_SECRET production <<< "59d5c016c433757d98afbf073a7dd59486bacc6798d2b35c548546550e66f648"
npx vercel env add ENCRYPTION_KEY production <<< "8ebe14c5b44915b5d4da8027e3480ee6"
npx vercel env add FROM_EMAIL production <<< "TuneBoxd <noreply@tuneboxd.xyz>"
npx vercel env add SUPPORT_EMAIL production <<< "support@tuneboxd.xyz"
npx vercel env add VERIFIED_DOMAIN production <<< "tuneboxd.xyz"
npx vercel env add SPOTIFY_CLIENT_ID production <<< "cdffd446edc84f24869404bd9d2fb1b2"
npx vercel env add SPOTIFY_CLIENT_SECRET production <<< "07dd56fd683e436ab9db319af8b6f020"
npx vercel env add NEXT_PUBLIC_APP_URL production <<< "https://tuneboxd.xyz"
npx vercel env add NODE_ENV production <<< "production"

echo ""
echo "⚠️  FALTA CONFIGURAR MANUALMENTE:"
echo "- RESEND_API_KEY (obtenerla de https://resend.com/dashboard)"
echo ""
echo "📋 Para agregar RESEND_API_KEY:"
echo "npx vercel env add RESEND_API_KEY production"
echo "(Te pedirá que ingreses el valor)"
echo ""
echo "🚀 Después ejecuta:"
echo "npx vercel --prod"
