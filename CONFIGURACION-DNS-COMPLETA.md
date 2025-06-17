# 🌐 GUÍA COMPLETA: CONFIGURACIÓN DNS PARA TUNEBOXD.XYZ

## 📋 INFORMACIÓN REQUERIDA

Según la configuración de Vercel, necesitas configurar estos registros DNS:

```
Tipo: A
Nombre: @ (o tuneboxd.xyz)
Valor: 76.76.21.21

Tipo: A
Nombre: www
Valor: 76.76.21.21
```

## 🔍 PASO 1: IDENTIFICAR TU PROVEEDOR DE DNS

Primero necesitas saber dónde compraste tu dominio o quién maneja tu DNS:

### Proveedores Comunes:
- **GoDaddy**
- **Namecheap** 
- **Cloudflare**
- **Google Domains (ahora Squarespace)**
- **AWS Route 53**
- **DigitalOcean**
- **Hostinger**
- **Porkbun**

## 🛠️ PASO 2: CONFIGURAR REGISTROS DNS

### 🔸 **OPCIÓN A: GoDaddy**

1. Ir a [godaddy.com](https://godaddy.com) → Iniciar sesión
2. Ir a **"My Products"** → **"DNS"**
3. Buscar **tuneboxd.xyz** → Click **"DNS"**
4. En la sección **"Records"**:

   **Registro 1:**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   TTL: 1 hour
   ```

   **Registro 2:**
   ```
   Type: A
   Name: www
   Value: 76.76.21.21
   TTL: 1 hour
   ```

### 🔸 **OPCIÓN B: Namecheap**

1. Ir a [namecheap.com](https://namecheap.com) → Iniciar sesión
2. **"Domain List"** → **"Manage"** junto a tuneboxd.xyz
3. **"Advanced DNS"** tab
4. Añadir estos registros:

   **Registro 1:**
   ```
   Type: A Record
   Host: @
   Value: 76.76.21.21
   TTL: Automatic
   ```

   **Registro 2:**
   ```
   Type: A Record
   Host: www
   Value: 76.76.21.21
   TTL: Automatic
   ```

### 🔸 **OPCIÓN C: Cloudflare**

1. Ir a [cloudflare.com](https://cloudflare.com) → Dashboard
2. Seleccionar **tuneboxd.xyz**
3. Ir a **"DNS"** → **"Records"**
4. **"Add record"**:

   **Registro 1:**
   ```
   Type: A
   Name: tuneboxd.xyz
   IPv4 address: 76.76.21.21
   Proxy status: DNS only (gray cloud)
   TTL: Auto
   ```

   **Registro 2:**
   ```
   Type: A
   Name: www
   IPv4 address: 76.76.21.21
   Proxy status: DNS only (gray cloud)
   TTL: Auto
   ```

### 🔸 **OPCIÓN D: Google Domains / Squarespace**

1. Ir a [domains.google.com](https://domains.google.com) (o Squarespace)
2. Seleccionar **tuneboxd.xyz**
3. **"DNS"** → **"Custom records"**
4. Añadir:

   **Registro 1:**
   ```
   Type: A
   Name: @
   Data: 76.76.21.21
   TTL: 1h
   ```

   **Registro 2:**
   ```
   Type: A
   Name: www
   Data: 76.76.21.21
   TTL: 1h
   ```

## 🔸 **OPCIÓN E: USAR NAMESERVERS DE VERCEL (Más fácil)**

Si quieres que Vercel maneje todo automáticamente:

1. **En tu proveedor de dominio**, cambiar los nameservers a:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```

2. **Pasos generales:**
   - Ir a la configuración de tu dominio
   - Buscar "Nameservers" o "DNS Servers"
   - Cambiar de "Default" a "Custom"
   - Poner los nameservers de Vercel
   - Guardar cambios

## ⏱️ PASO 3: VERIFICAR LA CONFIGURACIÓN

### Comando para verificar DNS:
```bash
# Verificar registro A para el dominio principal
dig tuneboxd.xyz A

# Verificar registro A para www
dig www.tuneboxd.xyz A
```

### O usar herramientas online:
- [whatsmydns.net](https://whatsmydns.net)
- [dnschecker.org](https://dnschecker.org)

## ⏰ TIEMPOS DE PROPAGACIÓN

- **Cambios de registros A**: 1-24 horas
- **Cambios de nameservers**: 24-48 horas
- **Verificación en Vercel**: Automática cada hora

## 🔄 PASO 4: VERIFICAR EN VERCEL

Después de configurar el DNS, verifica en Vercel:

```bash
cd /home/matu-ntbk/Desktop/dev/tuneboxd
vercel domains ls
```

## 🚨 PROBLEMAS COMUNES

### 1. **DNS no propaga**
- Esperar más tiempo (hasta 48h)
- Verificar que no hay registros en conflicto
- Limpiar cache DNS local: `sudo systemctl flush-dns`

### 2. **Certificado SSL no se genera**
- Vercel lo hace automáticamente cuando el DNS está correcto
- Puede tomar hasta 24 horas

### 3. **Error "Domain not verified"**
- Verificar que los registros A apuntan a `76.76.21.21`
- Verificar que no hay espacios extra en la configuración

## ✅ RESULTADO ESPERADO

Una vez configurado correctamente:

- ✅ **https://tuneboxd.xyz** → Redirige a tu aplicación
- ✅ **https://www.tuneboxd.xyz** → Redirige a tu aplicación  
- ✅ **Certificado SSL**: Automático y válido
- ✅ **Status en Vercel**: ● Verified

## 📞 AYUDA ESPECÍFICA

**Si me dices cuál es tu proveedor de dominio, puedo darte instrucciones más específicas.**

Los más comunes son:
- GoDaddy
- Namecheap  
- Cloudflare
- Google Domains
- Hostinger

**¿Dónde compraste tuneboxd.xyz?**
