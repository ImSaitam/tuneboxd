/**
 * Script para crear un hilo de bienvenida en el foro de TuneBoxd
 * Este script crea un hilo oficial de bienvenida a la comunidad
 */

import { query, run } from '../src/lib/database-adapter.js';

const WELCOME_THREAD = {
  user_id: 2, // Asumiendo que el usuario con ID 1 es el admin/creador
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

---
*Hilo oficial de bienvenida - Fijado por el equipo de TuneBoxd*`,
  category: "general",
  language: "es",
  is_pinned: true,
  is_locked: false
};

async function createWelcomeThread() {
  console.log('🎵 Creando hilo de bienvenida para TuneBoxd...\n');

  try {
    // Verificar si ya existe un hilo de bienvenida
    const existingThread = await query(`
      SELECT id, title FROM forum_threads 
      WHERE title ILIKE '%bienvenid%' OR title ILIKE '%welcome%'
      ORDER BY created_at DESC
      LIMIT 1
    `);

    if (existingThread.length > 0) {
      console.log('⚠️  Ya existe un hilo de bienvenida:');
      console.log(`   ID: ${existingThread[0].id}`);
      console.log(`   Título: "${existingThread[0].title}"`);
      console.log('\n¿Deseas continuar creando un nuevo hilo? (cancelando por seguridad)');
      return;
    }

    // Verificar que el usuario admin existe
    const adminUser = await query('SELECT id, username FROM users WHERE id = ? LIMIT 1', [WELCOME_THREAD.user_id]);
    
    if (adminUser.length === 0) {
      console.log('❌ Usuario admin no encontrado. Buscando primer usuario disponible...');
      const firstUser = await query('SELECT id, username FROM users ORDER BY id ASC LIMIT 1');
      
      if (firstUser.length === 0) {
        console.log('❌ No hay usuarios en la base de datos. No se puede crear el hilo.');
        return;
      }
      
      WELCOME_THREAD.user_id = firstUser[0].id;
      console.log(`✅ Usando usuario: ${firstUser[0].username} (ID: ${firstUser[0].id})`);
    } else {
      console.log(`✅ Usuario admin encontrado: ${adminUser[0].username} (ID: ${adminUser[0].id})`);
    }

    // Crear el hilo de bienvenida
    console.log('📝 Creando hilo de bienvenida...');
    
    const result = await run(`
      INSERT INTO forum_threads (
        user_id, 
        title, 
        content, 
        category, 
        language, 
        is_pinned, 
        is_locked,
        views_count,
        replies_count,
        likes_count,
        created_at, 
        updated_at,
        last_activity
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0, NOW(), NOW(), NOW())
    `, [
      WELCOME_THREAD.user_id,
      WELCOME_THREAD.title,
      WELCOME_THREAD.content,
      WELCOME_THREAD.category,
      WELCOME_THREAD.language,
      WELCOME_THREAD.is_pinned,
      WELCOME_THREAD.is_locked
    ]);

    // Obtener el ID del hilo creado
    const newThread = await query(`
      SELECT id, title, user_id, category, language, is_pinned 
      FROM forum_threads 
      WHERE user_id = ? AND title = ?
      ORDER BY created_at DESC 
      LIMIT 1
    `, [WELCOME_THREAD.user_id, WELCOME_THREAD.title]);

    if (newThread.length > 0) {
      const thread = newThread[0];
      console.log('\n🎉 ¡Hilo de bienvenida creado exitosamente!');
      console.log(`   📋 ID del hilo: ${thread.id}`);
      console.log(`   📝 Título: "${thread.title}"`);
      console.log(`   👤 Autor: Usuario ID ${thread.user_id}`);
      console.log(`   🏷️  Categoría: ${thread.category}`);
      console.log(`   🌐 Idioma: ${thread.language}`);
      console.log(`   📌 Fijado: ${thread.is_pinned ? 'Sí' : 'No'}`);
      console.log(`\n🔗 URL del hilo: https://tuneboxd.xyz/community/thread/${thread.id}`);

      // Verificar en la base de datos
      const verification = await query(`
        SELECT 
          ft.*,
          u.username as author_username
        FROM forum_threads ft
        LEFT JOIN users u ON ft.user_id = u.id
        WHERE ft.id = ?
      `, [thread.id]);

      if (verification.length > 0) {
        const vThread = verification[0];
        console.log('\n✅ Verificación exitosa:');
        console.log(`   Autor: @${vThread.author_username}`);
        console.log(`   Fecha de creación: ${vThread.created_at}`);
        console.log(`   Contenido: ${vThread.content.substring(0, 100)}...`);
      }

    } else {
      console.log('❌ Error: No se pudo verificar la creación del hilo');
    }

  } catch (error) {
    console.error('💥 Error creando el hilo de bienvenida:', error);
    console.error('   Detalles:', error.message);
  }
}

// Función auxiliar para mostrar estadísticas del foro
async function showForumStats() {
  try {
    console.log('\n📊 Estadísticas actuales del foro:');
    
    const totalThreads = await query('SELECT COUNT(*) as count FROM forum_threads');
    console.log(`   Total de hilos: ${totalThreads[0]?.count || 0}`);

    const pinnedThreads = await query('SELECT COUNT(*) as count FROM forum_threads WHERE is_pinned = true');
    console.log(`   Hilos fijados: ${pinnedThreads[0]?.count || 0}`);

    const categories = await query(`
      SELECT category, COUNT(*) as count 
      FROM forum_threads 
      GROUP BY category 
      ORDER BY count DESC
    `);
    console.log('   Por categoría:');
    categories.forEach(cat => {
      console.log(`     - ${cat.category}: ${cat.count} hilos`);
    });

    const languages = await query(`
      SELECT language, COUNT(*) as count 
      FROM forum_threads 
      GROUP BY language 
      ORDER BY count DESC
    `);
    console.log('   Por idioma:');
    languages.forEach(lang => {
      console.log(`     - ${lang.language}: ${lang.count} hilos`);
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
  }
}

// Ejecutar el script
console.log('🚀 Iniciando creación del hilo de bienvenida...\n');

createWelcomeThread()
  .then(() => showForumStats())
  .then(() => {
    console.log('\n✨ ¡Proceso completado! El hilo de bienvenida está listo para recibir a nuevos usuarios.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
