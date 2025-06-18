// Verificar tablas en la base de datos
import { query } from './src/lib/database-adapter.js';

async function verifyTables() {
  try {
    console.log('🔍 Verificando tablas en la base de datos...\n');
    
    // Verificar que las tablas existen
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('albums', 'artists')
    `);
    console.log('📋 Tablas encontradas:', tablesResult);
    
    if (tablesResult.length === 0) {
      console.log('❌ No se encontraron las tablas albums y artists');
      console.log('🔧 Ejecutando script para crear las tablas...');
      
      // Crear las tablas
      await query(`
        CREATE TABLE IF NOT EXISTS artists (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          spotify_id VARCHAR(255) UNIQUE,
          image_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await query(`
        CREATE TABLE IF NOT EXISTS albums (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          artist_id INTEGER REFERENCES artists(id),
          spotify_id VARCHAR(255) UNIQUE,
          artist_name VARCHAR(255),
          image_url TEXT,
          release_date DATE,
          total_tracks INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ Tablas creadas exitosamente');
    } else {
      console.log('✅ Tablas ya existen');
    }
    
    // Verificar la estructura de la tabla albums
    const albumsStructure = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'albums' 
      ORDER BY ordinal_position
    `);
    console.log('\n📊 Estructura tabla albums:');
    albumsStructure.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Test del albumService
    console.log('\n🧪 Probando albumService...');
    const { albumService } = await import('./src/lib/database-adapter.js');
    
    const testAlbum = {
      spotify_id: 'test-spotify-id-' + Date.now(),
      name: 'Test Album',
      artist: 'Test Artist',
      image_url: 'https://example.com/image.jpg',
      release_date: '2023-01-01'
    };
    
    const createdAlbum = await albumService.findOrCreateAlbum(testAlbum);
    console.log('✅ Album creado/encontrado:', createdAlbum);
    
    // Limpiar test
    await query('DELETE FROM albums WHERE spotify_id = ?', [testAlbum.spotify_id]);
    console.log('🧹 Test album eliminado');
    
    console.log('\n🎉 Verificación completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error verificando tablas:', error);
  }
  
  process.exit(0);
}

verifyTables();
