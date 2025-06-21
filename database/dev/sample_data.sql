-- Datos de muestra para TuneBoxd SQLite
-- Basado en la exportación de Neon

-- Insertar usuarios
INSERT INTO users (id, username, email, password_hash, email_verified, profile_image, created_at, updated_at) VALUES
(14, 'ImSaitam', 'matutedesanto@gmail.com', '$2b$10$fssVKPi.JewiZvCRK2GuCu4tPBJclSc6X7JM2clXOF9HSToq9CleO', 1, 'https://media1.tenor.com/m/Bv6sPMO0UucAAAAd/masayoshi-takanaka-takanaka.gif', '2025-06-19 22:30:55', '2025-06-20 23:39:54'),
(15, 'antods', 'antods003@gmail.com', '$2b$10$SiaLo22PeFcMDWVB1K5JEeZ9H3tJujP45MFeM2a8b.ldfz.3PZe6a', 1, NULL, '2025-06-20 18:41:51', '2025-06-20 18:42:12');

-- Insertar álbumes
INSERT INTO albums (id, name, spotify_id, image_url, release_date, created_at, updated_at) VALUES
(2, 'Global Warming', '4aawyAB9vmqN3uQ7FjRGTy', 'https://i.scdn.co/image/ab67616d0000b273c4d0ee0f34f2e8c2b5f31d1a', '2012-11-19', '2025-06-18 11:45:48', '2025-06-18 11:45:48'),
(3, 'Por cesárea', '633jS6fM44Zbr1gyI0eF19', 'https://i.scdn.co/image/ab67616d0000b27378d066acf66eb772239cca78', '2024-04-26', '2025-06-18 11:48:01', '2025-06-18 11:48:01'),
(4, 'Ado''s Best Adobum', '4G1L7sZheq5RAFNbqSbp3O', 'https://i.scdn.co/image/ab67616d0000b2737e39bafe4f50dd5e15cfe9b0', '2025-04-08', '2025-06-18 12:25:13', '2025-06-18 12:25:13'),
(5, 'La Grasa de las Capitales: Edición 40º Aniversario (2019 Remasterizado)', '5lp7CMQbROn0mpFWZLaPf3', 'https://i.scdn.co/image/ab67616d0000b273d9172a63ab39eae0bcafcb14', '2019-12-20', '2025-06-18 14:50:07', '2025-06-18 14:50:07'),
(6, 'UTA''S SONGS ONE PIECE FILM RED', '7Ixqxq13tWhrbnIabk3172', 'https://i.scdn.co/image/ab67616d0000b2730cbecafa929898c82adc519c', '2022-08-10', '2025-06-19 19:58:46', '2025-06-19 19:58:46'),
(7, 'LONG SEASON', '4EX1fAypgQC9wDjGI5QzbZ', 'https://i.scdn.co/image/ab67616d0000b273f9f1de08fccfce6067fbd225', '1996-10-25', '2025-06-20 04:33:39', '2025-06-20 04:33:39'),
(8, 'FLYING BEAGLE', '3rtHKkpPLmiwHNiHA0Kr3d', 'https://i.scdn.co/image/ab67616d0000b27382448b157380d980b97c820f', '1987-10-21', '2025-06-20 05:12:00', '2025-06-20 05:12:00'),
(9, 'PACIFIC', '6PnbwR4pgQQZDrLUdw6Kc7', 'https://i.scdn.co/image/ab67616d0000b273a7177b1d4c69494024e02579', '1978-01-01', '2025-06-20 05:18:23', '2025-06-20 05:18:23'),
(10, 'Fina Estampa', '6fBP4q8gYKo4LU9V6zVT3i', 'https://i.scdn.co/image/ab67616d0000b273795193773593a1dae9bc0b12', '1994-01-01', '2025-06-20 18:43:48', '2025-06-20 18:43:48'),
(11, 'Travelling Without Moving (Remastered)', '4yrrPNjd9RcqnuDnoEhlER', 'https://i.scdn.co/image/ab67616d0000b2736407aa9a5e5215cf554ad5d1', '1996-09-09', '2025-06-20 20:56:04', '2025-06-20 20:56:04'),
(12, 'FANÁTICO', '5S6TLyMgO3WBE3v8FISDOw', 'https://i.scdn.co/image/ab67616d0000b273fa5d0f60d3acd25af6b0637b', '2024-09-27', '2025-06-20 22:20:40', '2025-06-20 22:20:40');

-- Insertar algunos reviews de ejemplo
INSERT INTO reviews (id, user_id, spotify_album_id, rating, created_at, updated_at) VALUES
(3, 14, '4EX1fAypgQC9wDjGI5QzbZ', 4, '2025-06-20 05:10:23', '2025-06-20 05:10:23'),
(4, 14, '633jS6fM44Zbr1gyI0eF19', 5, '2025-06-20 06:14:18', '2025-06-20 06:14:18');

-- Insertar algunas follows de ejemplo
INSERT INTO follows (id, follower_id, following_id, created_at) VALUES
(1, 14, 15, '2025-06-20 18:45:31'),
(2, 15, 14, '2025-06-20 18:52:44');

-- Insertar algunas listas de ejemplo
INSERT INTO lists (id, user_id, name, description, is_public, created_at, updated_at) VALUES
(8, 14, 'Albums japoneses', NULL, 1, '2025-06-20 05:10:23', '2025-06-20 05:10:23'),
(9, 14, 'Álbumes de prueba', NULL, 1, '2025-06-20 06:14:18', '2025-06-20 06:14:18');

-- Insertar algunos álbumes en listas
INSERT INTO list_albums (id, list_id, spotify_album_id, album_name, artist_name, image_url, order_index, added_at) VALUES
(1, 8, '4EX1fAypgQC9wDjGI5QzbZ', 'LONG SEASON', 'Fishmans', 'https://i.scdn.co/image/ab67616d0000b273f9f1de08fccfce6067fbd225', 1, '2025-06-20 05:10:23'),
(2, 8, '3rtHKkpPLmiwHNiHA0Kr3d', 'FLYING BEAGLE', '菊池ひみこ', 'https://i.scdn.co/image/ab67616d0000b27382448b157380d980b97c820f', 2, '2025-06-20 05:12:00');

-- Insertar historial de escucha
INSERT INTO listening_history (id, user_id, album_id, listened_at, created_at, updated_at) VALUES
(8, 14, 7, '2025-06-20 05:10:23', '2025-06-20 05:10:23', '2025-06-20 05:10:23'),
(9, 14, 8, '2025-06-20 05:12:00', '2025-06-20 05:12:00', '2025-06-20 05:12:00'),
(10, 15, 10, '2025-06-20 18:43:48', '2025-06-20 18:43:48', '2025-06-20 18:43:48');

-- Insertar un thread del foro de ejemplo
INSERT INTO forum_threads (id, user_id, title, content, category, language, is_pinned, last_activity, created_at, updated_at) VALUES
(5, 14, '🎵 ¡Bienvenidos a TuneBoxd! - Guía de la Comunidad', 
'# 🎶 ¡Bienvenidos a TuneBoxd!

¡Hola y bienvenidos a nuestra comunidad musical! 🎵

Este es un espacio donde puedes:
- 📝 **Reseñar álbumes** y compartir tus opiniones
- 📋 **Crear listas** de tus álbumes favoritos
- 👥 **Seguir** a otros usuarios con gustos similares
- 💬 **Participar** en discusiones musicales

## 📖 Cómo empezar:

1. **Explora álbumes** usando la búsqueda
2. **Escribe reseñas** honestas y constructivas
3. **Crea listas temáticas** (por género, año, mood, etc.)
4. **Conecta** con otros melómanos

## 🎯 Reglas de la comunidad:

- Respeta las opiniones de otros usuarios
- Mantén las discusiones centradas en la música
- No hagas spam
- Sé constructivo en tus críticas

¡Esperamos que disfrutes explorando y compartiendo música con nosotros! 🎶

---
*¿Tienes preguntas? ¡No dudes en preguntar!*', 
'general', 'es', 1, '2025-06-20 06:19:27', '2025-06-19 14:35:27', '2025-06-19 14:35:27');

PRAGMA foreign_keys = ON;
