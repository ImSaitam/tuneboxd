import { NextResponse } from 'next/server';
import { albumService, listeningHistoryService } from '../../../../lib/database.js';

export async function POST() {
  try {
    // Datos de álbumes de ejemplo para el historial
    const sampleAlbums = [
      {
        spotify_id: '1DFixLWuPkv3KT3TnV35m3',
        name: 'Emotion (Deluxe)',
        artist: 'Carly Rae Jepsen',
        release_date: '2015-08-21',
        image_url: 'https://i.scdn.co/image/ab67616d0000b2735618ee6467c0becf0dd23d68',
        spotify_url: 'https://open.spotify.com/album/1DFixLWuPkv3KT3TnV35m3'
      },
      {
        spotify_id: '6mEQK9m2krja6X1cfsAjfl',
        name: 'Ado',
        artist: 'Ado',
        release_date: '2022-10-12',
        image_url: 'https://i.scdn.co/image/ab6761610000e5eb8fcb3b8ec2d4fce71d1fb5bd',
        spotify_url: 'https://open.spotify.com/artist/6mEQK9m2krja6X1cfsAjfl'
      },
      {
        spotify_id: '4yP0hdKOZPNshxUOjY0cZj',
        name: 'After Hours',
        artist: 'The Weeknd',
        release_date: '2020-03-20',
        image_url: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
        spotify_url: 'https://open.spotify.com/album/4yP0hdKOZPNshxUOjY0cZj'
      },
      {
        spotify_id: '2Foc5Q5nqNiosCNqttzHof',
        name: 'Random Access Memories',
        artist: 'Daft Punk',
        release_date: '2013-05-17',
        image_url: 'https://i.scdn.co/image/ab67616d0000b273de3c04b5fc750b68044e5ccb',
        spotify_url: 'https://open.spotify.com/album/2Foc5Q5nqNiosCNqttzHof'
      },
      {
        spotify_id: '4LH4d3cOWNNsVw41Gqt2kv',
        name: 'The Dark Side of the Moon',
        artist: 'Pink Floyd',
        release_date: '1973-03-01',
        image_url: 'https://i.scdn.co/image/ab67616d0000b273ea7caaff71dea1051d49b2fe',
        spotify_url: 'https://open.spotify.com/album/4LH4d3cOWNNsVw41Gqt2kv'
      }
    ];

    // Crear los álbumes en la base de datos
    const albumRecords = [];
    for (const albumData of sampleAlbums) {
      const album = await albumService.findOrCreateAlbum(albumData);
      albumRecords.push(album);
    }

    // Simular historial de escucha para los usuarios 4, 5, y 6
    const userIds = [4, 5, 6];
    const now = new Date();
    
    for (const userId of userIds) {
      // Agregar entradas para hoy
      await listeningHistoryService.addToHistory(userId, albumRecords[0].id);
      await listeningHistoryService.addToHistory(userId, albumRecords[1].id);
      
      // Agregar entradas para ayer
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Simular entradas de ayer modificando la fecha en la base de datos
      await listeningHistoryService.addToHistory(userId, albumRecords[2].id);
      await listeningHistoryService.addToHistory(userId, albumRecords[3].id);
      
      // Agregar entradas para hace 2 días
      const twoDaysAgo = new Date(now);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      
      await listeningHistoryService.addToHistory(userId, albumRecords[4].id);
      await listeningHistoryService.addToHistory(userId, albumRecords[0].id);
    }

    // Actualizar las fechas manualmente en la base de datos para simular diferentes días
    const db = (await import('../../../../lib/database.js')).default;
    
    // Obtener las últimas entradas y actualizarlas con fechas pasadas
    const recentEntries = await db.allAsync(`
      SELECT id, user_id FROM listening_history 
      ORDER BY listened_at DESC 
      LIMIT 18
    `);

    // Actualizar fechas para crear historial realista
    for (let i = 0; i < recentEntries.length; i++) {
      const entry = recentEntries[i];
      let targetDate = new Date();
      
      if (i < 6) {
        // Las primeras 6 entradas son de hoy
        targetDate = new Date();
      } else if (i < 12) {
        // Las siguientes 6 son de ayer
        targetDate.setDate(targetDate.getDate() - 1);
      } else {
        // Las últimas 6 son de hace 2 días
        targetDate.setDate(targetDate.getDate() - 2);
      }
      
      // Agregar variación de horas para hacer más realista
      targetDate.setHours(Math.floor(Math.random() * 24));
      targetDate.setMinutes(Math.floor(Math.random() * 60));
      
      await db.runAsync(
        'UPDATE listening_history SET listened_at = ? WHERE id = ?',
        [targetDate.toISOString(), entry.id]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Datos de historial de escucha creados exitosamente',
      created: {
        albums: albumRecords.length,
        historyEntries: recentEntries.length
      }
    });

  } catch (error) {
    console.error('Error creando datos de historial:', error);
    return NextResponse.json({
      success: false,
      message: 'Error al crear datos de historial',
      error: error.message
    }, { status: 500 });
  }
}
