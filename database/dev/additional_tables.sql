-- Agregar tablas faltantes al esquema SQLite
-- Estas son tablas adicionales que se encontraron en el sistema actual

-- Tabla para likes de reviews
CREATE TABLE IF NOT EXISTS review_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    review_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    UNIQUE(user_id, review_id)
);

-- Tabla para comentarios de listas
CREATE TABLE IF NOT EXISTS list_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    list_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla para likes de listas
CREATE TABLE IF NOT EXISTS list_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    list_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(list_id, user_id)
);

-- Tabla para seguimiento de artistas
CREATE TABLE IF NOT EXISTS artist_follows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    artist_id TEXT NOT NULL,
    artist_name TEXT NOT NULL,
    artist_image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, artist_id)
);

-- Tabla para favoritos de tracks
CREATE TABLE IF NOT EXISTS track_favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    track_id TEXT NOT NULL,
    track_name TEXT,
    artist_name TEXT,
    album_name TEXT,
    image_url TEXT,
    duration_ms INTEGER,
    preview_url TEXT,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, track_id)
);

-- Tabla para likes de threads del foro
CREATE TABLE IF NOT EXISTS forum_thread_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    thread_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (thread_id) REFERENCES forum_threads(id) ON DELETE CASCADE,
    UNIQUE(user_id, thread_id)
);

-- Tabla para likes de replies del foro
CREATE TABLE IF NOT EXISTS forum_reply_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    reply_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reply_id) REFERENCES forum_replies(id) ON DELETE CASCADE,
    UNIQUE(user_id, reply_id)
);

-- Índices adicionales para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_review_likes_user_id ON review_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_review_likes_review_id ON review_likes(review_id);
CREATE INDEX IF NOT EXISTS idx_list_comments_list_id ON list_comments(list_id);
CREATE INDEX IF NOT EXISTS idx_list_comments_user_id ON list_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_list_likes_list_id ON list_likes(list_id);
CREATE INDEX IF NOT EXISTS idx_list_likes_user_id ON list_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_artist_follows_user_id ON artist_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_artist_follows_artist_id ON artist_follows(artist_id);
CREATE INDEX IF NOT EXISTS idx_track_favorites_user_id ON track_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_track_favorites_track_id ON track_favorites(track_id);
CREATE INDEX IF NOT EXISTS idx_forum_thread_likes_user_id ON forum_thread_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_thread_likes_thread_id ON forum_thread_likes(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_reply_likes_user_id ON forum_reply_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_reply_likes_reply_id ON forum_reply_likes(reply_id);
