// Verificar usuarios y probar listening history con usuario existente
import { query } from './src/lib/database-adapter.js';

async function testWithExistingUser() {
  try {
    console.log('🔍 Verificando usuarios existentes...');
    
    // Buscar usuarios
    const users = await query('SELECT id, username, email FROM users ORDER BY id LIMIT 5');
    
    if (users.length === 0) {
      console.log('❌ No hay usuarios en la base de datos');
      return;
    }
    
    console.log('👥 Usuarios encontrados:');
    users.forEach(user => {
      console.log(`  - ID: ${user.id}, Username: ${user.username}, Email: ${user.email}`);
    });
    
    // Usar el primer usuario para la prueba
    const testUser = users[0];
    console.log(`\n🧪 Probando con usuario ID: ${testUser.id}`);
    
    const { listeningHistoryService, albumService } = await import('./src/lib/database-adapter.js');
    
    // Buscar un álbum existente o usar el que sabemos que existe
    const albums = await query('SELECT id, name, artist_name FROM albums LIMIT 3');
    
    if (albums.length === 0) {
      console.log('❌ No hay álbumes en la base de datos');
      return;
    }
    
    console.log('💿 Álbumes encontrados:');
    albums.forEach(album => {
      console.log(`  - ID: ${album.id}, Name: ${album.name}, Artist: ${album.artist_name}`);
    });
    
    const testAlbum = albums[0];
    
    // Probar addToHistory
    console.log(`\n🎵 Agregando álbum "${testAlbum.name}" al historial del usuario "${testUser.username}"...`);
    
    try {
      await listeningHistoryService.addToHistory(testUser.id, testAlbum.id);
      console.log('✅ Álbum agregado al historial exitosamente');
      
      // Verificar que se agregó
      const history = await listeningHistoryService.findByUserId(testUser.id);
      console.log(`📋 Historial del usuario: ${history.length} entradas`);
      
      if (history.length > 0) {
        console.log('📄 Última entrada:');
        console.log(`  - Album ID: ${history[0].album_id}`);
        console.log(`  - Listened at: ${history[0].listened_at}`);
      }
      
    } catch (error) {
      console.error('❌ Error agregando al historial:', error.message);
    }
    
    console.log('\n🎉 Test completado');
    
  } catch (error) {
    console.error('❌ Error en test:', error);
  }
  
  process.exit(0);
}

testWithExistingUser();
