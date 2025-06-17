# 🔐 CONFIGURAR VARIABLES DE ENTORNO EN VERCEL

## 📋 PASO A PASO

### 1. 🌐 Ir al Dashboard de Vercel
- URL: https://vercel.com/imsaitams-projects/tuneboxd
- Click en "Settings"

### 2. ⚙️ Navegar a Environment Variables
- En el menú lateral, click en "Environment Variables"
- Click en "Add New"

### 3. 📝 Agregar las siguientes variables:

#### 🗄️ BASE DE DATOS
```
Name: DATABASE_URL
Value: postgresql://neondb_owner:npg_lXKaEiD2pF4n@ep-shy-rain-a85s4po9-pooler.eastus2.azure.neon.tech/neondb?sslmode=require
Environment: Production
```

#### 🔐 AUTENTICACIÓN
```
Name: JWT_SECRET
Value: e962ff98a36e5c95561e33070a7b7332ca30322931570b7a725315584f7f7c3e
Environment: Production
```

```
Name: SESSION_SECRET
Value: 59d5c016c433757d98afbf073a7dd59486bacc6798d2b35c548546550e66f648
Environment: Production
```

```
Name: ENCRYPTION_KEY
Value: 8ebe14c5b44915b5d4da8027e3480ee6
Environment: Production
```

#### 📧 EMAIL (RESEND)
```
Name: RESEND_API_KEY
Value: [TU_API_KEY_DE_RESEND]
Environment: Production
```

```
Name: FROM_EMAIL
Value: TuneBoxd <noreply@tuneboxd.xyz>
Environment: Production
```

```
Name: SUPPORT_EMAIL
Value: support@tuneboxd.xyz
Environment: Production
```

```
Name: VERIFIED_DOMAIN
Value: tuneboxd.xyz
Environment: Production
```

#### 🎵 SPOTIFY
```
Name: SPOTIFY_CLIENT_ID
Value: cdffd446edc84f24869404bd9d2fb1b2
Environment: Production
```

```
Name: SPOTIFY_CLIENT_SECRET
Value: 07dd56fd683e436ab9db319af8b6f020
Environment: Production
```

#### 🌐 APLICACIÓN
```
Name: NEXT_PUBLIC_APP_URL
Value: https://tuneboxd.xyz
Environment: Production
```

```
Name: NODE_ENV
Value: production
Environment: Production
```

### 4. 🚀 Redesplegar
Una vez configuradas todas las variables:
- Ve a "Deployments"
- Click en "Redeploy" en el último deployment fallido
- O ejecuta: `npx vercel --prod` nuevamente

---

## 📋 CHECKLIST VARIABLES

- [ ] DATABASE_URL (PostgreSQL Neon)
- [ ] JWT_SECRET
- [ ] SESSION_SECRET  
- [ ] ENCRYPTION_KEY
- [ ] RESEND_API_KEY ⚠️ (necesitas tu API key real)
- [ ] FROM_EMAIL
- [ ] SUPPORT_EMAIL
- [ ] VERIFIED_DOMAIN
- [ ] SPOTIFY_CLIENT_ID
- [ ] SPOTIFY_CLIENT_SECRET
- [ ] NEXT_PUBLIC_APP_URL
- [ ] NODE_ENV

---

## ⚠️ IMPORTANTE

**NECESITAS TU API KEY DE RESEND:**
1. Ve a https://resend.com/dashboard
2. Ve a "API Keys"
3. Copia tu API key (empieza con `re_`)
4. Úsala como valor para `RESEND_API_KEY`

---

## 🔄 DESPUÉS DE CONFIGURAR

```bash
# Redesplegar
npx vercel --prod
```

O desde el dashboard de Vercel:
1. Ve a "Deployments"
2. Click en los tres puntos del último deployment
3. Click "Redeploy"
