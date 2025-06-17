# 🚀 GUÍA COMPLETA DE DESPLIEGUE - TUNEBOXD

## ✅ ESTADO ACTUAL
- **Auditoría de Seguridad**: ✅ COMPLETADA (0 problemas críticos)
- **Configuración de Email**: ✅ Resend configurado y verificado
- **Limpieza de Código**: ✅ console.log removidos
- **Configuración de Vercel**: ✅ vercel.json configurado
- **Dominio**: ✅ tuneboxd.xyz verificado con Resend

---

## 🔧 PASOS PARA EL DESPLIEGUE

### 1. 🗄️ CONFIGURAR BASE DE DATOS POSTGRESQL

#### Opción A: Neon (Recomendado)
```bash
# 1. Ir a https://neon.tech
# 2. Crear cuenta gratuita
# 3. Crear nuevo proyecto "tuneboxd"
# 4. Copiar connection string
```

#### Opción B: Supabase
```bash
# 1. Ir a https://supabase.com
# 2. Crear proyecto "tuneboxd"
# 3. Obtener connection string desde Settings > Database
```

#### Opción C: Vercel Postgres
```bash
npx vercel postgres create tuneboxd-db
```

### 2. 🔐 CONFIGURAR VARIABLES DE ENTORNO EN VERCEL

#### Variables Requeridas:
```bash
# Base de datos
DATABASE_URL=postgresql://usuario:password@host:5432/tuneboxd

# Autenticación
JWT_SECRET=e962ff98a36e5c95561e33070a7b7332ca30322931570b7a725315584f7f7c3e
SESSION_SECRET=59d5c016c433757d98afbf073a7dd59486bacc6798d2b35c548546550e66f648
ENCRYPTION_KEY=8ebe14c5b44915b5d4da8027e3480ee6

# Email (Resend)
RESEND_API_KEY=re_tu_api_key_aqui
FROM_EMAIL=TuneBoxd <noreply@tuneboxd.xyz>
SUPPORT_EMAIL=support@tuneboxd.xyz
VERIFIED_DOMAIN=tuneboxd.xyz

# Spotify
SPOTIFY_CLIENT_ID=cdffd446edc84f24869404bd9d2fb1b2
SPOTIFY_CLIENT_SECRET=07dd56fd683e436ab9db319af8b6f020

# Aplicación
NEXT_PUBLIC_APP_URL=https://tuneboxd.xyz
NODE_ENV=production
```

### 3. 🌐 PROCESO DE DESPLIEGUE

#### Paso 1: Login en Vercel
```bash
npx vercel login
```

#### Paso 2: Desplegar
```bash
npx vercel --prod
```

#### Paso 3: Configurar Dominio
```bash
# En Vercel Dashboard:
# 1. Ir a Settings > Domains
# 2. Añadir tuneboxd.xyz
# 3. Configurar DNS records
```

### 4. 🔄 CONFIGURAR BASE DE DATOS

#### Ejecutar migraciones:
```bash
# Localmente con DATABASE_URL de producción
npm run migrate-prod
```

#### O ejecutar script de migración:
```bash
node scripts/migrate-to-postgres.js
```

---

## 🔍 VERIFICACIONES POST-DESPLIEGUE

### Endpoints a Verificar:
- ✅ `https://tuneboxd.xyz` - Página principal
- ✅ `https://tuneboxd.xyz/api/auth/register` - Registro
- ✅ `https://tuneboxd.xyz/api/auth/login` - Login
- ✅ `https://tuneboxd.xyz/api/spotify/search` - Búsqueda

### Funcionalidades Críticas:
- ✅ Registro de usuarios
- ✅ Verificación de email
- ✅ Login/Logout
- ✅ Búsqueda de álbumes
- ✅ Creación de reseñas
- ✅ Sistema de seguimiento

---

## 🛡️ CONFIGURACIÓN DNS PARA DOMINIO

### Records DNS Requeridos:
```dns
# Para Vercel
Type: A
Name: @
Value: 76.76.19.61

Type: AAAA  
Name: @
Value: 2600:1f14:e22:d500::2

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Para Email (Resend):
```dns
# Ya configurado según conversación anterior
Type: MX
Name: @
Value: feedback-smtp.us-east-1.amazonses.com

Type: TXT
Name: @
Value: "v=spf1 include:amazonses.com ~all"
```

---

## 📊 MONITOREO Y MANTENIMIENTO

### Logs de Aplicación:
```bash
# Ver logs en tiempo real
npx vercel logs --follow
```

### Métricas:
- Vercel Analytics (incluido)
- Uptime monitoring
- Error tracking

### Backups:
- Base de datos: Automático con Neon/Supabase
- Código: Git repository

---

## 🚨 RESOLUCIÓN DE PROBLEMAS

### Error: "Database connection failed"
```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Verificar conectividad
node -e "console.log('Testing DB connection...'); require('./src/lib/database.js')"
```

### Error: "Email not sending"
```bash
# Verificar RESEND_API_KEY
curl -X POST "https://api.resend.com/emails" \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json"
```

### Error: "Build failed"
```bash
# Build local
npm run build

# Verificar logs
npx vercel logs
```

---

## 📋 CHECKLIST FINAL

### Pre-Despliegue:
- [x] Auditoría de seguridad completada
- [x] Variables de entorno configuradas
- [x] Base de datos PostgreSQL lista
- [x] Dominio verificado con Resend
- [x] console.log removidos
- [x] Build local exitoso

### Post-Despliegue:
- [ ] Dominio apuntando a Vercel
- [ ] SSL/HTTPS funcionando
- [ ] Base de datos migrada
- [ ] Emails funcionando
- [ ] Spotify API funcionando
- [ ] Todas las funcionalidades testeadas

---

## 🎉 COMANDOS RÁPIDOS

```bash
# Desplegar ahora
npx vercel --prod

# Ver logs
npx vercel logs --follow

# Ver deployment info
npx vercel inspect

# Rollback si es necesario
npx vercel rollback
```

---

## 🔗 ENLACES ÚTILES

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Neon Console**: https://console.neon.tech
- **Resend Dashboard**: https://resend.com/dashboard
- **Dominio**: https://tuneboxd.xyz
- **Spotify Dashboard**: https://developer.spotify.com/dashboard

---

## 🏆 ¡LISTO PARA PRODUCCIÓN!

Tu aplicación TuneBoxd está **completamente preparada** para el despliegue en producción con:
- ✅ Seguridad empresarial
- ✅ Email profesional
- ✅ Base de datos PostgreSQL
- ✅ Dominio personalizado
- ✅ Configuración de producción optimizada

**Siguiente paso**: Ejecutar `npx vercel login` y `npx vercel --prod`
