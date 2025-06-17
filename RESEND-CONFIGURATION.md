# Configuración de Resend para TuneBoxd

## 📧 ¿Qué es Resend?

Resend es un servicio moderno de email API diseñado específicamente para desarrolladores. Ofrece:

- **3,000 emails gratis al mes** (perfecto para proyectos pequeños)
- **API simple y moderna**
- **Plantillas HTML hermosas**
- **Excelente deliverability**
- **Fácil integración con Next.js**

## 🚀 Configuración Paso a Paso

### 1. Crear cuenta en Resend

1. Ve a [https://resend.com](https://resend.com)
2. Crea una cuenta gratuita
3. Verifica tu email

### 2. Obtener API Key

1. Ve a tu dashboard de Resend
2. Navega a "API Keys" en el menú lateral
3. Haz clic en "Create API Key"
4. Dale un nombre como "TuneBoxd Development"
5. Copia la API key generada

### 3. Configurar dominio (Opcional pero recomendado)

**Opción A: Usar dominio de prueba (Más fácil)**
- Resend te permite usar `onboarding@resend.dev` para pruebas
- Perfecto para desarrollo

**Opción B: Configurar tu propio dominio**
1. Ve a "Domains" en tu dashboard
2. Agrega tu dominio (ej: `tuneboxd.com`)
3. Configura los registros DNS según las instrucciones
4. Verifica el dominio

### 4. Actualizar variables de entorno

Edita tu archivo `.env.local`:

```bash
# Resend Configuration
RESEND_API_KEY=re_tu_api_key_real_aqui

# Your application domain
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email configuration
FROM_EMAIL=noreply@tudominio.com
# O usa el dominio de prueba: FROM_EMAIL=onboarding@resend.dev
```

### 5. Probar la configuración

Ejecuta el script de prueba:

```bash
node test-resend-config.js
```

## 📝 Ejemplo de uso

```javascript
import { sendVerificationEmail } from './src/lib/email-resend.js';

// Enviar email de verificación
const result = await sendVerificationEmail(
  'usuario@example.com',
  'usuario123',
  'token_de_verificacion'
);

if (result.success) {
  console.log('Email enviado:', result.messageId);
} else {
  console.error('Error:', result.error);
}
```

## 🔧 Funciones disponibles

- `sendVerificationEmail(email, username, token)` - Email de verificación de cuenta
- `sendWelcomeEmail(email, username)` - Email de bienvenida
- `sendPasswordResetEmail(email, username, resetToken)` - Email de recuperación de contraseña
- `verifyEmailConfig()` - Verificar configuración

## 📊 Límites del plan gratuito

- **3,000 emails/mes**
- **100 emails/día**
- **1 dominio personalizado**
- **Soporte por email**

## 🚨 Troubleshooting

### Error: "RESEND_API_KEY no está configurada"
- Verifica que tu API key esté en `.env.local`
- Asegúrate de que el archivo `.env.local` esté en la raíz del proyecto
- Reinicia tu servidor de desarrollo

### Error: "Invalid API key"
- Verifica que hayas copiado la API key completa
- Asegúrate de que la API key no haya expirado
- Genera una nueva API key si es necesario

### Emails no llegan
- Revisa la carpeta de spam
- Verifica que el dominio esté configurado correctamente
- Usa el dominio de prueba `onboarding@resend.dev` para desarrollo

### Error: "Domain not verified"
- Completa la verificación de tu dominio en el dashboard de Resend
- O usa el dominio de prueba para desarrollo

## 🔄 Migración desde Nodemailer

Tu proyecto ya está configurado para usar Resend. Los cambios principales:

1. ✅ Paquete `resend` instalado
2. ✅ Nuevo servicio `email-resend.js` creado
3. ✅ Endpoints actualizados para usar Resend
4. ✅ Plantillas de email mejoradas
5. ✅ Variables de entorno configuradas

## 🎯 Próximos pasos

1. **Obtén tu API key de Resend**
2. **Actualiza tu `.env.local`**
3. **Ejecuta el script de prueba**
4. **¡Empieza a enviar emails!**

## 📞 Soporte

Si tienes problemas:
- Revisa la [documentación de Resend](https://resend.com/docs)
- Verifica tu configuración con `node test-resend-config.js`
- Revisa los logs de tu aplicación Next.js
