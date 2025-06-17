# 🚀 Guía Completa de Despliegue - TuneBoxd en Vercel

## ✅ Estado Actual
- **Build exitoso** - La aplicación compila correctamente
- **Resend configurado** - Email service listo  
- **Dominio verificado** - tuneboxd.xyz configurado en Resend
- **Variables de entorno** - Preparadas para producción
- **Configuración de seguridad** - Headers y middleware implementados

## 📋 Pasos para Desplegar

### 1. 🗄️ Configurar Base de Datos PostgreSQL

**Elige una opción:**

#### ⭐ Opción A: Neon (Recomendado)
1. Ir a **https://neon.tech**
2. Crear cuenta gratuita
3. **Create Project**:
   - Project name: `tuneboxd-production`
   - Region: `US East (N. Virginia)`
4. Copiar **Connection String** (se ve así):
   ```
   postgresql://username:password@host/database?sslmode=require
   ```

#### Opción B: Supabase
1. Ir a **https://supabase.com**
2. Crear nuevo proyecto: `tuneboxd-production`
3. **Settings** → **Database** → Connection string

### 2. 🚀 Desplegar en Vercel

#### Paso 1: Login
```bash
npx vercel login
```
*Elegir GitHub y autorizar*

#### Paso 2: Primer despliegue (preview)
```bash
cd /home/matu-ntbk/Desktop/dev/tuneboxd
npx vercel
```
**Responder:**
- Project name: `tuneboxd`
- Link to existing project: `No`
- Directory: `./` (default)
- Otros: usar defaults

#### Paso 3: Despliegue de producción
```bash
npx vercel --prod
```

### 3. ⚙️ Configurar Variables de Entorno

En **Vercel Dashboard** → Tu proyecto → **Settings** → **Environment Variables**

**Agregar estas variables:**

| Variable | Valor |
|----------|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Tu connection string de PostgreSQL |
| `JWT_SECRET` | `e962ff98a36e5c95561e33070a7b7332ca30322931570b7a725315584f7f7c3e` |
| `RESEND_API_KEY` | `re_tu_api_key_de_resend` |
| `NEXT_PUBLIC_APP_URL` | `https://tuneboxd.xyz` |
| `FROM_EMAIL` | `TuneBoxd <noreply@tuneboxd.xyz>` |
| `SUPPORT_EMAIL` | `support@tuneboxd.xyz` |
| `VERIFIED_DOMAIN` | `tuneboxd.xyz` |
| `SPOTIFY_CLIENT_ID` | `cdffd446edc84f24869404bd9d2fb1b2` |
| `SPOTIFY_CLIENT_SECRET` | `07dd56fd683e436ab9db319af8b6f020` |
| `SESSION_SECRET` | `59d5c016c433757d98afbf073a7dd59486bacc6798d2b35c548546550e66f648` |
| `ENCRYPTION_KEY` | `8ebe14c5b44915b5d4da8027e3480ee6` |

### 4. 🌐 Configurar Dominio

#### En Vercel:
1. **Settings** → **Domains**
2. Agregar `tuneboxd.xyz`
3. Agregar `www.tuneboxd.xyz` (opcional)

#### En tu DNS:
```
Type: A
Name: @
Value: 76.76.19.61

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 5. 🔧 Configurar Base de Datos

**Después del despliegue, ejecutar:**

```bash
# Temporal - agregar DATABASE_URL local para migración
echo "DATABASE_URL=tu-postgresql-url-aqui" >> .env.local

# Ejecutar migración de esquema
node scripts/migrate-to-postgres.js
```

### 6. ✅ Verificar Funcionamiento

**Checklist:**
- [ ] https://tuneboxd.xyz carga
- [ ] Registro de usuario funciona
- [ ] Email de verificación llega
- [ ] Login funciona
- [ ] Búsqueda de Spotify funciona
- [ ] Crear reseña funciona

---

## 🛠️ Comandos Útiles

### Redeploy:
```bash
npx vercel --prod
```

### Ver logs:
```bash
npx vercel logs
```

### Ver variables:
```bash
npx vercel env ls
```

## 🚨 Troubleshooting

### ❌ Error de Base de Datos:
1. Verificar `DATABASE_URL` en Vercel
2. Ejecutar `node scripts/migrate-to-postgres.js`
3. Verificar que PostgreSQL esté accesible

### ❌ Error de Email:
1. Verificar `RESEND_API_KEY`
2. Verificar dominio en Resend dashboard
3. Revisar logs de Vercel

### ❌ Error de Spotify:
1. Verificar `SPOTIFY_CLIENT_ID` y `SPOTIFY_CLIENT_SECRET`
2. Agregar domain en Spotify App settings

---

## 🎯 Próximos Pasos

1. **Configurar base de datos** (Neon recomendado)
2. **Ejecutar:** `npx vercel login`
3. **Ejecutar:** `npx vercel --prod`
4. **Configurar variables** en Vercel Dashboard
5. **Configurar dominio** DNS
6. **Migrar base de datos** con script
7. **¡Lanzar!** 🚀

---

**¡Tu aplicación TuneBoxd estará lista para el mundo! 🎵**
