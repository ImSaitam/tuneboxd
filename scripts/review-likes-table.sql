-- Script SQL para crear la tabla review_likes manualmente
-- Ejecutar este script en tu consola de base de datos PostgreSQL

-- Crear tabla review_likes
CREATE TABLE IF NOT EXISTS review_likes (
  id SERIAL PRIMARY KEY,
  review_id INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_review_likes_review_id ON review_likes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_likes_user_id ON review_likes(user_id);

-- Verificar la estructura
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'review_likes'
ORDER BY ordinal_position;
