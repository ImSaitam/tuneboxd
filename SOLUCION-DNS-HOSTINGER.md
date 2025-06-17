# 🔧 SOLUCIÓN DNS HOSTINGER → VERCEL

## 🚨 PROBLEMA IDENTIFICADO

Tu dominio `tuneboxd.xyz` está apuntando a **Hostinger** (IP: 84.32.84.32) en lugar de **Vercel** (IP: 76.76.21.21).

## 📋 SOLUCIÓN: CAMBIAR DNS EN HOSTINGER

### OPCIÓN 1: CAMBIAR REGISTROS A (Recomendado)

1. **Inicia sesión en Hostinger:**
   - Ir a https://hpanel.hostinger.com
   - Usar tus credenciales de Hostinger

2. **Acceder al DNS:**
   - En el panel principal, buscar **"Dominios"**
   - Click en **tuneboxd.xyz**
   - Ir a **"DNS / Nameservers"**

3. **Modificar registros A:**
   
   **Buscar estos registros actuales y cambiarlos:**
   ```
   Tipo: A
   Nombre: @ (o tuneboxd.xyz)
   Valor: 84.32.84.32 ← CAMBIAR ESTO
   ```
   
   **Por estos nuevos valores:**
   ```
   Tipo: A
   Nombre: @
   Valor: 76.76.21.21 ← NUEVO VALOR
   TTL: 3600
   ```
   
   ```
   Tipo: A
   Nombre: www
   Valor: 76.76.21.21 ← NUEVO VALOR
   TTL: 3600
   ```

4. **Eliminar registros conflictivos:**
   - Eliminar cualquier registro AAAA (IPv6)
   - Eliminar registros CNAME que apunten a Hostinger
   - Mantener solo los registros A que apunten a Vercel

### OPCIÓN 2: CAMBIAR NAMESERVERS (Más fácil)

Si prefieres que Vercel maneje todo automáticamente:

1. **En Hostinger:**
   - Ir a **"DNS / Nameservers"**
   - Cambiar de **"Hostinger nameservers"** a **"Custom nameservers"**
   - Introducir:
     ```
     ns1.vercel-dns.com
     ns2.vercel-dns.com
     ```

2. **Guardar cambios**

## ⏱️ TIEMPO DE PROPAGACIÓN

- **Registros A:** 30 minutos - 2 horas
- **Nameservers:** 2-24 horas
- **Verificación automática en Vercel:** Cada hora

## 🔍 VERIFICAR CAMBIOS

Después de hacer los cambios, espera 30 minutos y ejecuta:

```bash
python3 -c "import socket; print('Nueva IP:', socket.gethostbyname('tuneboxd.xyz'))"
```

**Resultado esperado:** `76.76.21.21`

## 🌐 URLs PARA ACCEDER

### Panel de Hostinger:
- **Login:** https://hpanel.hostinger.com
- **Gestión de dominios:** Panel Principal → Dominios

### Panel de Vercel:
- **Login:** https://vercel.com/dashboard
- **Proyecto:** https://vercel.com/imsaitams-projects/tuneboxd

## 🚨 PASOS DETALLADOS PARA HOSTINGER

### Paso 1: Login
![Hostinger Login](https://hpanel.hostinger.com)

### Paso 2: Ir a Dominios
- En el menú lateral: **"Dominios"**
- Click en **tuneboxd.xyz**

### Paso 3: Configurar DNS
- Tab **"DNS / Nameservers"**
- Sección **"DNS Zone"**

### Paso 4: Editar Registros
**ANTES (Hostinger):**
```
A  @    84.32.84.32
A  www  84.32.84.32
```

**DESPUÉS (Vercel):**
```
A  @    76.76.21.21
A  www  76.76.21.21
```

### Paso 5: Guardar
- Click **"Save"** o **"Guardar cambios"**

## ✅ VERIFICACIÓN FINAL

Una vez propagado el DNS:

1. **Verificar IP:**
   ```bash
   python3 -c "import socket; print(socket.gethostbyname('tuneboxd.xyz'))"
   ```
   Debe mostrar: `76.76.21.21`

2. **Verificar aplicación:**
   ```bash
   curl -I https://tuneboxd.xyz
   ```
   Debe mostrar: `HTTP/2 200` con servidor Vercel

3. **Verificar en navegador:**
   - https://tuneboxd.xyz debe mostrar tu aplicación TuneBoxd
   - No debe mostrar la página de Hostinger

## 🆘 SI NECESITAS AYUDA

Si no encuentras alguna opción en Hostinger:
- Buscar **"DNS Zone Editor"**
- Buscar **"Manage DNS"**
- Buscar **"Advanced DNS"**
- O contactar soporte de Hostinger

## 📞 COMANDOS DE VERIFICACIÓN

```bash
# Verificar IP actual
python3 -c "import socket; print('IP actual:', socket.gethostbyname('tuneboxd.xyz'))"

# Verificar si responde la aplicación
curl -s https://tuneboxd.xyz | grep -i "tuneboxd\|next\|react" || echo "Todavía Hostinger"

# Verificar estado en Vercel
npx vercel domains ls
```

---

**🎯 OBJETIVO:** Cambiar la IP de `84.32.84.32` (Hostinger) a `76.76.21.21` (Vercel)

**⏰ TIEMPO ESTIMADO:** 30 minutos - 2 horas para propagación completa
