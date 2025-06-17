# 🚀 GUÍA COMPLETA: SUBIR TUNEBOXD A VERCEL

## 📋 **PASOS PREVIOS COMPLETADOS ✅**
- ✅ Código preparado para producción
- ✅ PostgreSQL driver instalado
- ✅ Adaptador de base de datos universal creado
- ✅ Configuración de Vercel lista
- ✅ Git inicializado y commit realizado

---

## 🔧 **PASO 1: CREAR CUENTA EN SUPABASE**

### 1.1 Registrarse en Supabase
1. Ve a **https://supabase.com**
2. Haz clic en **"Start your project"**
3. Regístrate con GitHub, Google o email
4. Confirma tu email si es necesario

### 1.2 Crear Proyecto
1. Haz clic en **"New Project"**
2. Rellena los datos:
   - **Name**: `tuneboxd-production`
   - **Database Password**: (Guarda esta contraseña segura!)
   - **Region**: `South America (São Paulo)` (más cercano)
3. Haz clic en **"Create new project"**
4. **Espera 2-3 minutos** a que se cree el proyecto

### 1.3 Obtener URL de Conexión
1. En tu proyecto de Supabase, ve a **Settings** → **Database**
2. Busca **"Connection string"** → **"URI"**
3. Copia la URL, se ve así:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghijk.supabase.co:5432/postgres
   ```
4. **¡GUARDA ESTA URL!** La necesitarás para Vercel

### 1.4 Crear las Tablas
1. En Supabase, ve a **SQL Editor**
2. Haz clic en **"New query"**
3. Copia y pega todo el contenido del archivo `database-schema.sql`
4. Haz clic en **"Run"**
5. Deberías ver: `Success. No rows returned`

---

## 🚀 **PASO 2: SUBIR A VERCEL**

### 2.1 Crear Cuenta en Vercel
1. Ve a **https://vercel.com**
2. Haz clic en **"Sign Up"**
3. Registrate con GitHub (recomendado)
4. Autoriza Vercel para acceder a tus repositorios

### 2.2 Subir el Código a GitHub
1. Ve a **https://github.com**
2. Haz clic en **"New repository"**
3. Nombre: `tuneboxd`
4. Descripción: `TuneBoxd - Red social musical`
5. **Público** o **Privado** (como prefieras)
6. **NO** marques "Initialize with README"
7. Haz clic en **"Create repository"**

### 2.3 Conectar tu Proyecto Local con GitHub
```bash
# En tu terminal, en la carpeta del proyecto
cd /home/matu-ntbk/Desktop/dev/tuneboxd

# Agregar GitHub como remote
git remote add origin https://github.com/TU-USUARIO/tuneboxd.git

# Subir el código
git branch -M main
git push -u origin main
```

### 2.4 Importar en Vercel
1. En Vercel, haz clic en **"Add New..."** → **"Project"**
2. Busca tu repositorio `tuneboxd`
3. Haz clic en **"Import"**
4. **Configure Project:**
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `./` (dejar por defecto)
   - **Build Command**: `npm run build` (dejar por defecto)
   - **Output Directory**: `.next` (dejar por defecto)

### 2.5 IMPORTANTE: Configurar Variables de Entorno
**Antes de hacer deploy**, haz clic en **"Environment Variables"** y agrega:

```
DATABASE_URL = postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
JWT_SECRET = tu-jwt-secret-super-seguro-de-al-menos-32-caracteres-aqui
SPOTIFY_CLIENT_ID = tu-client-id-de-spotify
SPOTIFY_CLIENT_SECRET = tu-client-secret-de-spotify
NEXTAUTH_URL = https://tu-proyecto.vercel.app
NODE_ENV = production
```

**¿Dónde obtener las credenciales de Spotify?**
1. Ve a **https://developer.spotify.com/dashboard**
2. Inicia sesión con tu cuenta Spotify
3. Haz clic en **"Create app"**
4. Rellena:
   - **App name**: `TuneBoxd`
   - **App description**: `Red social musical`
   - **Website**: `https://tu-dominio.com`
   - **Redirect URI**: `https://tu-dominio.com/api/auth/callback/spotify`
5. Acepta los términos y haz clic en **"Save"**
6. Copia **Client ID** y **Client Secret**

### 2.6 Hacer Deploy
1. Después de configurar las variables, haz clic en **"Deploy"**
2. **Espera 2-3 minutos** a que se construya
3. Si todo va bien, verás: ✅ **"Your project has been deployed"**

---

## 🌐 **PASO 3: CONFIGURAR TU DOMINIO PERSONALIZADO**

### 3.1 En Vercel
1. Ve a tu proyecto en Vercel
2. Haz clic en **"Settings"** → **"Domains"**
3. Haz clic en **"Add"**
4. Ingresa tu dominio: `tudominio.com`
5. Haz clic en **"Add"**

### 3.2 Configurar DNS
Vercel te dará instrucciones específicas, pero generalmente necesitas:

**Para dominio principal (ej: tudominio.com):**
```
Type: A
Name: @
Value: 76.76.19.61
```

**Para www (ej: www.tudominio.com):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 3.3 Esperar Propagación
- El DNS puede tardar hasta 48 horas
- Generalmente funciona en 5-30 minutos
- Puedes verificar en: https://www.whatsmydns.net/

---

## 🧪 **PASO 4: PROBAR LA APLICACIÓN**

### 4.1 Verificaciones Básicas
1. **Abrir tu dominio**: `https://tudominio.com`
2. **Probar registro**: Crear una cuenta nueva
3. **Probar login**: Iniciar sesión
4. **Probar funcionalidades**: Buscar música, hacer reseñas

### 4.2 Si Hay Errores
1. **Ver logs en Vercel**:
   - Ve a tu proyecto → **"Functions"** → Ver logs de errores
2. **Verificar variables de entorno**:
   - Settings → Environment Variables
3. **Verificar base de datos**:
   - Ir a Supabase → SQL Editor → Probar query simple

---

## 🎯 **COMANDOS ÚTILES**

### Redesplegar después de cambios:
```bash
git add .
git commit -m "Descripción del cambio"
git push
```
*Vercel se redesplega automáticamente*

### Ver logs locales:
```bash
npm run build
npm start
```

### Acceder a la base de datos:
- **Panel de Supabase**: Interfaz visual
- **SQL Editor**: Para queries directas

---

## 🔒 **SEGURIDAD POST-DESPLIEGUE**

### Variables Críticas a Verificar:
- ✅ `DATABASE_URL` - Conexión a base de datos
- ✅ `JWT_SECRET` - Al menos 32 caracteres aleatorios
- ✅ `SPOTIFY_CLIENT_SECRET` - Nunca compartir
- ✅ `NODE_ENV=production` - Para optimizaciones

### Configuraciones DNS de Seguridad:
```
# SSL/TLS automático por Vercel
# HTTPS redirect automático
# Security headers automáticos
```

---

## 📞 **SOLUCIÓN DE PROBLEMAS COMUNES**

### Error: "Database connection failed"
- Verificar `DATABASE_URL` en variables de entorno
- Verificar que Supabase esté funcionando

### Error: "Spotify API failed"
- Verificar `SPOTIFY_CLIENT_ID` y `SPOTIFY_CLIENT_SECRET`
- Verificar redirect URLs en Spotify Dashboard

### Error: "Next.js build failed"
- Ver logs específicos en Vercel
- Verificar que no haya errores de sintaxis

### Dominio no funciona:
- Esperar propagación DNS (hasta 48h)
- Verificar configuración DNS
- Usar herramientas como `dig tudominio.com`

---

## 🎉 **¡LISTO PARA PRODUCCIÓN!**

Una vez completados todos los pasos:
- ✅ Aplicación funcionando en tu dominio
- ✅ Base de datos PostgreSQL en producción
- ✅ SSL/HTTPS automático
- ✅ CDN global de Vercel
- ✅ Despliegues automáticos desde Git

**¡Tu TuneBoxd ya está en vivo! 🚀**
