# 🗄️ CONFIGURACIÓN DE BASE DE DATOS POSTGRESQL - NEON

## 📋 PASOS DETALLADOS

### 1. 🚀 CREAR CUENTA EN NEON

1. **Ir a Neon**: https://neon.tech
2. **Registrarse** con GitHub, Google, o email
3. **Verificar email** si es necesario

### 2. 🏗️ CREAR PROYECTO

1. **Click en "Create Project"**
2. **Configurar proyecto**:
   ```
   Project name: tuneboxd
   Database name: neondb (default está bien)
   Region: US East (N. Virginia) - us-east-1
   PostgreSQL version: 16 (latest)
   ```
3. **Click "Create Project"**

### 3. 📋 OBTENER CONNECTION STRING

Después de crear el proyecto, verás una pantalla con:

```sql
-- Tu connection string se verá así:
postgresql://[username]:[password]@[endpoint]/neondb?sslmode=require

-- Ejemplo:
postgresql://neondb_owner:AbCd123XyZ@ep-cool-water-12345678.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**¡COPIA ESTA URL COMPLETA!** 📝

### 4. 🔧 CONFIGURAR LOCALMENTE

#### Opción A: Usando .env.local
```bash
# Crear/editar .env.local
echo 'DATABASE_URL="postgresql://tu-connection-string-aqui"' >> .env.local
```

#### Opción B: Variable de entorno temporal
```bash
export DATABASE_URL="postgresql://tu-connection-string-aqui"
```

### 5. 🛠️ INSTALAR DEPENDENCIAS Y CONFIGURAR ESQUEMA

```bash
# Instalar dependencia de PostgreSQL
npm install pg

# Ejecutar script de configuración
./scripts/setup-neon-database.sh
```

### 6. ✅ VERIFICAR CONFIGURACIÓN

```bash
# Probar conexión
node -e "
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});
pool.query('SELECT NOW()').then(res => {
    console.log('✅ Conexión exitosa:', res.rows[0]);
    pool.end();
}).catch(err => console.error('❌ Error:', err.message));
"
```

---

## 🚀 ALTERNATIVA: SCRIPT AUTOMATIZADO

Si prefieres una configuración automática:

### Paso 1: Configurar DATABASE_URL
```bash
# Reemplazar con tu connection string de Neon
export DATABASE_URL="postgresql://username:password@endpoint/neondb?sslmode=require"
```

### Paso 2: Ejecutar configuración
```bash
./scripts/setup-neon-database.sh
```

---

## 📊 VERIFICACIÓN FINAL

### Verificar que las tablas se crearon:
```sql
-- Ejecutar en Neon SQL Editor o via psql
\dt
```

Deberías ver:
- `users`
- `follows` 
- `reviews`
- `likes`
- `lists`
- `list_albums`

---

## 🔐 CONFIGURAR EN VERCEL

Una vez que tu base de datos local funcione:

1. **Ir a Vercel Dashboard**
2. **Tu proyecto → Settings → Environment Variables**
3. **Agregar nueva variable**:
   ```
   Name: DATABASE_URL
   Value: postgresql://tu-connection-string-de-neon
   Environment: Production
   ```

---

## 🆘 RESOLUCIÓN DE PROBLEMAS

### Error: "Connection refused"
```bash
# Verificar que el URL esté correcto
echo $DATABASE_URL

# Verificar que incluya ?sslmode=require al final
```

### Error: "Password authentication failed"
```bash
# Verificar que hayas copiado el password completo
# Regenerar password en Neon Dashboard si es necesario
```

### Error: "Database does not exist"
```bash
# Verificar que uses 'neondb' como database name
# O usar el nombre que hayas configurado
```

---

## 📝 NOTAS IMPORTANTES

1. **Plan Gratuito**: Neon ofrece 512MB de almacenamiento gratis
2. **SSL Requerido**: Siempre incluir `?sslmode=require`
3. **Región**: Usar US East para mejor latencia con Vercel
4. **Backups**: Neon incluye backups automáticos

---

## 🎯 PRÓXIMO PASO

Una vez configurada la base de datos:
```bash
./deploy-production.sh
```
