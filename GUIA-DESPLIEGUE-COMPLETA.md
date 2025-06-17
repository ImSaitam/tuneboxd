## 🚀 GUÍA COMPLETA PARA SUBIR TUNEBOXD A TU DOMINIO

¡Perfecto! Tu proyecto ya está listo para producción. El build se completó exitosamente.

### **PASO 2: CONFIGURAR BASE DE DATOS EN PRODUCCIÓN**

Tienes dos opciones principales:

#### **OPCIÓN A: SUPABASE (Recomendado - Más fácil)**
1. Ve a **https://supabase.com** y crea una cuenta
2. Crea un nuevo proyecto:
   - **Nombre**: `tuneboxd-production`
   - **Región**: `South America (São Paulo)`
   - **Password**: (guarda esta contraseña)
3. Espera 2-3 minutos a que se cree
4. Ve a **Settings** → **Database** → **Connection string**
5. Copia la URL que se ve así:
   ```
   postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
   ```

#### **OPCIÓN B: RAILWAY**
1. Ve a **https://railway.app** y crea una cuenta
2. Crea nuevo proyecto → **Deploy PostgreSQL**
3. Ve a **Variables** y copia `DATABASE_URL`

### **PASO 3: CONFIGURAR VERCEL**

1. **Instalar Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Iniciar sesión:**
   ```bash
   vercel login
   ```

3. **Configurar variables de entorno en Vercel:**
   ```bash
   vercel env add DATABASE_URL
   ```
   Pega tu URL de base de datos cuando te lo pida.

   Agregar más variables:
   ```bash
   vercel env add JWT_SECRET
   vercel env add SPOTIFY_CLIENT_ID
   vercel env add SPOTIFY_CLIENT_SECRET
   vercel env add NEXT_PUBLIC_BASE_URL
   ```

   **Valores sugeridos:**
   - `JWT_SECRET`: Una cadena aleatoria segura (ej: `tu-jwt-secret-muy-seguro-123456`)
   - `NEXT_PUBLIC_BASE_URL`: Tu dominio (ej: `https://tudominio.com`)
   - Para Spotify, necesitas crear una app en https://developer.spotify.com

### **PASO 4: DESPLEGAR**

1. **Primer despliegue:**
   ```bash
   cd /home/matu-ntbk/Desktop/dev/tuneboxd
   vercel --prod
   ```

2. **Configurar dominio personalizado:**
   - En Vercel Dashboard, ve a tu proyecto
   - **Settings** → **Domains**
   - Agrega tu dominio
   - Configura los DNS según las instrucciones

### **PASO 5: CONFIGURAR DNS** (Dependiendo de tu proveedor)

**Si tu dominio está en Cloudflare/Namecheap/GoDaddy:**
- Agrega un registro CNAME:
  - **Nombre**: `@` (o tu subdominio)
  - **Valor**: `cname.vercel-dns.com`

### **¿CUÁL ES TU DOMINIO?**
Dime qué dominio tienes para darte instrucciones específicas para tu proveedor de DNS.

### **COMANDOS LISTOS PARA EJECUTAR:**

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login a Vercel
vercel login

# 3. Desplegar
cd /home/matu-ntbk/Desktop/dev/tuneboxd
vercel --prod
```

**¿Tienes ya cuenta en Vercel o prefieres que te ayude con otro hosting?**
