import { userService, albumService, reviewService } from '../../../../lib/database.js';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    // Solo permitir en desarrollo
    if (process.env.NODE_ENV === 'production') {
      return Response.json(
        { success: false, message: 'Esta función solo está disponible en desarrollo' },
        { status: 403 }
      );
    }

    // Crear usuario de prueba
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    let testUserId;
    try {
      console.log('Creando usuario de prueba...');
      testUserId = await userService.createUser({
        username: 'musiclover',
        email: 'test@musicboxd.com',
        password: hashedPassword
      });
      console.log('Usuario creado con ID:', testUserId);
    } catch (error) {
      console.log('Error creando usuario:', error.message);
      // El usuario ya existe, obtenerlo por email O username
      let existingUser = await userService.findByEmail('test@musicboxd.com');
      if (!existingUser) {
        existingUser = await userService.findByUsername('musiclover');
      }
      console.log('Usuario existente encontrado:', existingUser);
      
      if (!existingUser) {
        throw new Error('No se pudo crear ni encontrar el usuario de prueba');
      }
      
      testUserId = existingUser.id;
    }

    // Álbumes de ejemplo
    const sampleAlbums = [
      {
        spotify_id: 'sample1',
        name: 'The Dark Side of the Moon',
        artist: 'Pink Floyd',
        release_date: '1973-03-01',
        image_url: 'https://i.scdn.co/image/ab67616d0000b273ea7caaff71dea1051d49b2fe',
        spotify_url: 'https://open.spotify.com/album/4LH4d3cOWNNsVw41Gqt2kv'
      },
      {
        spotify_id: 'sample2',
        name: 'Random Access Memories',
        artist: 'Daft Punk',
        release_date: '2013-05-17',
        image_url: 'https://i.scdn.co/image/ab67616d0000b273728345a2c97e4c3297e8abe3',
        spotify_url: 'https://open.spotify.com/album/4m2880jivSbbyEGAKfITCa'
      },
      {
        spotify_id: 'sample3',
        name: 'Kind of Blue',
        artist: 'Miles Davis',
        release_date: '1959-08-17',
        image_url: 'https://i.scdn.co/image/ab67616d0000b273e5d8db8a25f7c5b6cca8cf96',
        spotify_url: 'https://open.spotify.com/album/1weenld61qoidwYuZ1GESA'
      },
      {
        spotify_id: 'sample4',
        name: 'OK Computer',
        artist: 'Radiohead',
        release_date: '1997-06-16',
        image_url: 'https://i.scdn.co/image/ab67616d0000b273c8b444df094279e70d0ed856',
        spotify_url: 'https://open.spotify.com/album/6dVIqQ8qmQ5GBnJ9shOYGE'
      },
      {
        spotify_id: 'sample5',
        name: 'To Pimp a Butterfly',
        artist: 'Kendrick Lamar',
        release_date: '2015-03-15',
        image_url: 'https://i.scdn.co/image/ab67616d0000b273cdb645498cd3d8a2db4d05e1',
        spotify_url: 'https://open.spotify.com/album/7ycBtnsMtyVbbwTfJwRjSP'
      }
    ];

    // Crear álbumes y reseñas
    const createdAlbums = [];
    for (const albumData of sampleAlbums) {
      console.log('Creando álbum:', albumData.name);
      const album = await albumService.findOrCreateAlbum(albumData);
      console.log('Álbum creado/encontrado:', album);
      createdAlbums.push(album.id);
    }

    // Crear reseñas de ejemplo
    const sampleReviews = [
      {
        album_id: createdAlbums[0],
        rating: 5,
        title: 'Una obra maestra atemporal',
        content: 'The Dark Side of the Moon es más que un álbum, es una experiencia. La forma en que Pink Floyd construye cada canción y las conecta entre sí es simplemente brillante. Los temas de alienación y locura siguen siendo relevantes hoy en día.'
      },
      {
        album_id: createdAlbums[1],
        rating: 4,
        title: 'El regreso perfecto',
        content: 'Después de tantos años, Daft Punk regresó con este álbum increíble. La producción es impecable y cada colaboración aporta algo único. "Get Lucky" es instantáneamente pegadiza pero todo el álbum tiene profundidad.'
      },
      {
        album_id: createdAlbums[2],
        rating: 5,
        title: 'Jazz en su máxima expresión',
        content: 'Kind of Blue define lo que significa el jazz modal. Miles Davis y su banda crean un ambiente único en cada track. Es el tipo de álbum que descubres algo nuevo cada vez que lo escuchas.'
      },
      {
        album_id: createdAlbums[3],
        rating: 5,
        title: 'Visionario y adelantado a su tiempo',
        content: 'OK Computer predijo muchos aspectos de la era digital actual. Radiohead creó algo completamente nuevo aquí, mezclando rock alternativo con elementos electrónicos de manera magistral.'
      },
      {
        album_id: createdAlbums[4],
        rating: 4,
        title: 'Arte en forma de rap',
        content: 'Kendrick Lamar eleva el hip-hop a nuevas alturas con este álbum conceptual. Las letras son poesía pura y la producción es innovadora. Un álbum importante tanto musical como socialmente.'
      }
    ];

    for (let i = 0; i < sampleReviews.length; i++) {
      const reviewData = {
        ...sampleReviews[i],
        user_id: testUserId
      };
      
      try {
        await reviewService.createReview(reviewData);
      } catch (error) {
        // La reseña ya existe, saltarla
        console.log('Reseña ya existe, saltando...');
      }
    }

    return Response.json({
      success: true,
      message: 'Datos de prueba creados exitosamente',
      testUser: {
        email: 'test@musicboxd.com',
        password: 'password123',
        username: 'musiclover'
      }
    });

  } catch (error) {
    console.error('Error creando datos de prueba:', error);
    return Response.json(
      { success: false, message: 'Error creando datos de prueba: ' + error.message },
      { status: 500 }
    );
  }
}
