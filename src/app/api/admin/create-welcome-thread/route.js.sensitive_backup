import { NextResponse } from 'next/server';
import { forumService, userService } from "../../../../lib/database-adapter.js";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

const WELCOME_THREAD = {
  title: "🎵 ¡Bienvenidos a TuneBoxd! - Guía de la Comunidad",
  content: `¡Hola y bienvenidos a **TuneBoxd**, la red social definitiva para amantes de la música! 🎶

## 🌟 ¿Qué es TuneBoxd?

TuneBoxd es tu espacio para descubrir, compartir y conectar a través de la música. Aquí puedes:

### 📝 **Reseñas y Calificaciones**
- Escribe reseñas detalladas de tus álbumes favoritos
- Califica música con nuestro sistema de 5 estrellas
- Descubre nueva música a través de las recomendaciones de la comunidad

### 👥 **Comunidad y Conexiones**
- Sigue a otros melómanos con gustos similares
- Participa en discusiones sobre tus artistas favoritos
- Comparte tu historial de escucha y descubrimientos

### 📊 **Seguimiento Personal**
- Mantén un registro de toda la música que escuchas
- Crea listas personalizadas de álbumes
- Ve tus estadísticas musicales y tendencias

## 🎯 **Cómo Empezar**

1. **Completa tu perfil** - Agrega una foto y biografía que refleje tu pasión musical
2. **Escribe tu primera reseña** - Comparte tu opinión sobre un álbum que te haya marcado
3. **Explora la comunidad** - Busca usuarios con gustos similares y síguelos
4. **Participa en el foro** - Únete a las conversaciones sobre música

## 📋 **Reglas de la Comunidad**

Para mantener un ambiente positivo y respetuoso:

- **Respeto mutuo**: Trata a todos los miembros con cortesía
- **Constructividad**: Las críticas deben ser constructivas y argumentadas
- **Diversidad musical**: Respetamos todos los géneros y gustos musicales
- **No spam**: Evita el contenido repetitivo o publicitario
- **Contenido apropiado**: Mantén las discusiones relacionadas con música

## 🏷️ **Categorías del Foro**

- **General**: Conversaciones generales sobre música
- **Recomendaciones**: Comparte y pide recomendaciones musicales
- **Reseñas**: Discute reseñas y análisis de álbumes
- **Discusión**: Debates profundos sobre música y tendencias
- **Noticias**: Últimas noticias del mundo musical

## 💡 **Tips para Nuevos Usuarios**

1. **Sé auténtico**: Comparte tu verdadera pasión por la música
2. **Explora géneros**: No te limites, explora nuevos sonidos
3. **Interactúa**: Comenta en las reseñas de otros usuarios
4. **Sé paciente**: Construir una red musical lleva tiempo

## 🔗 **Enlaces Útiles**

- [Página Principal](https://tuneboxd.xyz)
- [Explorar Álbumes](https://tuneboxd.xyz/search)
- [Perfiles de Usuarios](https://tuneboxd.xyz/social)

## 📞 **¿Necesitas Ayuda?**

Si tienes preguntas o necesitas asistencia:
- Responde a este hilo
- Busca en la categoría "General" del foro

---

**¡Que comience tu viaje musical en TuneBoxd!** 🚀

*¿Cuál fue el último álbum que te voló la cabeza? ¡Compártelo en los comentarios!*

## 🎨 **Guía de Formato Markdown**

¡Ahora puedes usar **Markdown** en tus posts! Aquí tienes algunos ejemplos:

- **Texto en negrita**: \`**texto**\` → **texto**
- *Texto en cursiva*: \`*texto*\` → *texto*
- [Enlaces](https://tuneboxd.xyz): \`[texto](url)\`
- \`Código\`: \`\`código\`\`
- > Citas: \`> texto\`

¡Experimenta y haz que tus posts se vean geniales! ✨

---
*Hilo oficial de bienvenida - Fijado por el equipo de TuneBoxd*`,
  category: "General",
  language: "es"
};

export async function POST(request) {
  try {
    // Verificar autenticación (opcional - puedes quitar esto si quieres que sea público)
    const authHeader = request.headers.get('authorization');
    let userId = 1; // Usuario por defecto

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId;
      } catch (error) {
        // Si no hay token válido, usar usuario por defecto
        console.log('No hay token válido, usando usuario por defecto');
      }
    }

    // Verificar si ya existe un hilo de bienvenida
    const existingThreads = await forumService.searchThreads('bienvenid', 5, 0);
    
    if (existingThreads.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Ya existe un hilo de bienvenida',
        existingThread: {
          id: existingThreads[0].id,
          title: existingThreads[0].title,
          url: `/community/thread/${existingThreads[0].id}`
        }
      }, { status: 400 });
    }

    // Buscar un usuario válido para crear el hilo
    const users = await userService.getAllUsers ? await userService.getAllUsers() : [];
    if (users.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No hay usuarios en el sistema para crear el hilo'
      }, { status: 400 });
    }

    // Usar el primer usuario disponible si el usuario especificado no existe
    const targetUser = users.find(u => u.id === userId) || users[0];

    // Crear el hilo de bienvenida
    const threadData = {
      user_id: targetUser.id,
      title: WELCOME_THREAD.title,
      content: WELCOME_THREAD.content,
      category: WELCOME_THREAD.category,
      language: WELCOME_THREAD.language
    };

    const threadId = await forumService.createThread(threadData);

    // Intentar marcar el hilo como fijado (si la base de datos lo permite)
    try {
      await forumService.pinThread ? await forumService.pinThread(threadId) : null;
    } catch (error) {
      console.log('No se pudo fijar el hilo automáticamente:', error.message);
    }

    // Obtener el hilo creado para confirmación
    const createdThread = await forumService.getThread(threadId);

    return NextResponse.json({
      success: true,
      message: 'Hilo de bienvenida creado exitosamente',
      thread: {
        id: threadId,
        title: createdThread?.title || WELCOME_THREAD.title,
        author: targetUser.username,
        category: WELCOME_THREAD.category,
        language: WELCOME_THREAD.language,
        url: `/community/thread/${threadId}`
      },
      fullUrl: `https://www.tuneboxd.xyz/community/thread/${threadId}`
    });

  } catch (error) {
    console.error('Error creando hilo de bienvenida:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    }, { status: 500 });
  }
}

// GET endpoint para verificar si ya existe un hilo de bienvenida
export async function GET() {
  try {
    const existingThreads = await forumService.searchThreads('bienvenid', 5, 0);
    
    return NextResponse.json({
      success: true,
      hasWelcomeThread: existingThreads.length > 0,
      threads: existingThreads.map(thread => ({
        id: thread.id,
        title: thread.title,
        author: thread.author_username,
        category: thread.category,
        url: `/community/thread/${thread.id}`
      }))
    });

  } catch (error) {
    console.error('Error verificando hilos de bienvenida:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    }, { status: 500 });
  }
}
