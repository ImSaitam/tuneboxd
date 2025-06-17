# Configuración de Base de Datos para Producción

## Opciones Recomendadas

### 1. Neon (Recomendado) 🚀
- **URL**: https://neon.tech
- **Características**: PostgreSQL serverless, auto-escalado, plan gratuito generoso
- **Configuración**:
  1. Crear cuenta en Neon
  2. Crear nueva base de datos
  3. Obtener connection string
  4. Actualizar `DATABASE_URL` en variables de entorno

### 2. Supabase
- **URL**: https://supabase.com
- **Características**: PostgreSQL con API automática, auth integrado
- **Configuración similar a Neon**

### 3. Vercel Postgres
- **URL**: Integrado con Vercel
- **Comando**: `vercel postgres create`

## Migración de Esquema

Una vez tengas la base de datos PostgreSQL, ejecuta:

```bash
# 1. Instalar herramientas de migración
npm install --save-dev @types/sqlite3 pg

# 2. Exportar datos de SQLite (si necesarios)
node scripts/export-sqlite-data.js

# 3. Crear tablas en PostgreSQL
node scripts/create-postgres-schema.js
```

## Variables de Entorno para Vercel

Configurar en Vercel Dashboard:
- `DATABASE_URL`: tu-connection-string-postgresql
- `JWT_SECRET`: (generado)
- `RESEND_API_KEY`: tu-api-key
- `SPOTIFY_CLIENT_ID`: tu-client-id
- `SPOTIFY_CLIENT_SECRET`: tu-client-secret
- `SESSION_SECRET`: (generado)
- `ENCRYPTION_KEY`: (generado)
