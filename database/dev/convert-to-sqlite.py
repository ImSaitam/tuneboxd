#!/usr/bin/env python3
"""
Script para convertir el dump de PostgreSQL a SQLite
"""

import re
import os

def convert_postgres_to_sqlite(input_file, output_file):
    """Convierte un archivo SQL de PostgreSQL a SQLite"""
    
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Eliminar comandos específicos de PostgreSQL
    postgres_specific = [
        r'SET\s+[^;]+;',
        r'SELECT pg_catalog\.[^;]+;',
        r'CREATE EXTENSION[^;]+;',
        r'COMMENT ON[^;]+;',
        r'CREATE FUNCTION[^;$]+\$\$[^$]*\$\$;',
        r'CREATE SEQUENCE[^;]+;',
        r'ALTER SEQUENCE[^;]+;',
        r'ALTER TABLE[^;]*SET DEFAULT nextval[^;]+;',
        r'GRANT[^;]+;',
        r'REVOKE[^;]+;',
    ]
    
    for pattern in postgres_specific:
        content = re.sub(pattern, '', content, flags=re.MULTILINE | re.DOTALL)
    
    # Reemplazar tipos de datos de PostgreSQL con equivalentes de SQLite
    type_mappings = {
        r'character varying\(\d+\)': 'TEXT',
        r'character varying': 'TEXT',
        r'varchar\(\d+\)': 'TEXT',
        r'varchar': 'TEXT',
        r'timestamp without time zone': 'DATETIME',
        r'timestamp with time zone': 'DATETIME',
        r'timestamp': 'DATETIME',
        r'boolean': 'INTEGER',
        r'text': 'TEXT',
        r'integer': 'INTEGER',
        r'bigint': 'INTEGER',
        r'smallint': 'INTEGER',
        r'numeric\(\d+,\d+\)': 'REAL',
        r'numeric': 'REAL',
        r'real': 'REAL',
        r'double precision': 'REAL',
    }
    
    for pg_type, sqlite_type in type_mappings.items():
        content = re.sub(pg_type, sqlite_type, content, flags=re.IGNORECASE)
    
    # Eliminar esquemas públicos
    content = re.sub(r'public\.', '', content)
    content = re.sub(r'SCHEMA public', '', content)
    
    # Convertir CREATE TABLE statements
    content = re.sub(r'CREATE TABLE (\w+) \(\s*', r'CREATE TABLE \1 (\n    ', content)
    
    # Eliminar USING btree de índices
    content = re.sub(r' USING btree', '', content)
    
    # Eliminar ONLY de ALTER TABLE
    content = re.sub(r'ALTER TABLE ONLY ', 'ALTER TABLE ', content)
    
    # Simplificar COPY statements (convertirlos en INSERT)
    copy_pattern = r'COPY (\w+) \([^)]+\) FROM stdin;([^\\]*)\\\.'
    
    def convert_copy_to_insert(match):
        table_name = match.group(1)
        data_lines = match.group(2).strip().split('\n')
        
        # Obtener las columnas de la definición de la tabla
        table_pattern = rf'CREATE TABLE {table_name} \((.*?)\);'
        table_match = re.search(table_pattern, content, re.DOTALL)
        
        if not table_match:
            return ''
        
        table_def = table_match.group(1)
        columns = []
        for line in table_def.split('\n'):
            line = line.strip()
            if line and not line.startswith('CONSTRAINT') and not line.startswith('CHECK'):
                col_name = line.split()[0]
                if col_name not in ['PRIMARY', 'FOREIGN', 'UNIQUE', 'CHECK']:
                    columns.append(col_name)
        
        inserts = []
        for line in data_lines:
            if line.strip():
                values = line.split('\t')
                # Convertir \N a NULL
                values = ['NULL' if v == '\\N' else f"'{v.replace(chr(39), chr(39)+chr(39))}'" for v in values]
                insert_sql = f"INSERT INTO {table_name} ({', '.join(columns[:len(values)])}) VALUES ({', '.join(values)});"
                inserts.append(insert_sql)
        
        return '\n'.join(inserts)
    
    content = re.sub(copy_pattern, convert_copy_to_insert, content, flags=re.DOTALL)
    
    # Limpiar líneas vacías múltiples
    content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
    
    # Eliminar comentarios de dump
    content = re.sub(r'--.*\n', '', content)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Convertido {input_file} -> {output_file}")

def create_basic_schema():
    """Crea un esquema básico de SQLite basado en la estructura de PostgreSQL"""
    
    schema = """
-- TuneBoxd Database Schema for SQLite
-- Converted from PostgreSQL

CREATE TABLE albums (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    artist_id INTEGER,
    spotify_id TEXT UNIQUE,
    image_url TEXT,
    release_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE artists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    spotify_id TEXT UNIQUE,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    profile_image TEXT,
    bio TEXT,
    location TEXT,
    website TEXT,
    is_verified INTEGER DEFAULT 0,
    email_verified INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    spotify_album_id TEXT NOT NULL,
    rating INTEGER,
    review_text TEXT,
    is_favorite INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE follows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    follower_id INTEGER NOT NULL,
    following_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(follower_id, following_id)
);

CREATE TABLE likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    review_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    UNIQUE(user_id, review_id)
);

CREATE TABLE lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_public INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE list_albums (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    list_id INTEGER NOT NULL,
    spotify_album_id TEXT NOT NULL,
    album_name TEXT,
    artist_name TEXT,
    image_url TEXT,
    order_index INTEGER,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE,
    UNIQUE(list_id, spotify_album_id)
);

CREATE TABLE watchlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    album_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
);

CREATE TABLE listening_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    album_id INTEGER NOT NULL,
    track_id TEXT,
    listened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
);

CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    from_user_id INTEGER,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    review_id INTEGER,
    list_id INTEGER,
    thread_id INTEGER,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE forum_threads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    language TEXT DEFAULT 'es',
    is_pinned INTEGER DEFAULT 0,
    is_locked INTEGER DEFAULT 0,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE forum_replies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (thread_id) REFERENCES forum_threads(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indices para mejorar rendimiento
CREATE INDEX idx_albums_artist_id ON albums(artist_id);
CREATE INDEX idx_albums_spotify_id ON albums(spotify_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_album_id ON reviews(spotify_album_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_likes_user_review ON likes(user_id, review_id);
CREATE INDEX idx_lists_user_id ON lists(user_id);
CREATE INDEX idx_list_albums_list_id ON list_albums(list_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);
CREATE INDEX idx_forum_threads_user_id ON forum_threads(user_id);
CREATE INDEX idx_forum_threads_category ON forum_threads(category);
CREATE INDEX idx_forum_replies_thread_id ON forum_replies(thread_id);
"""
    
    return schema

if __name__ == "__main__":
    # Crear esquema básico
    schema_content = create_basic_schema()
    
    with open('database/dev/sqlite_schema.sql', 'w', encoding='utf-8') as f:
        f.write(schema_content)
    
    print("✅ Esquema SQLite creado: database/dev/sqlite_schema.sql")
    print("🚀 Para crear la base de datos ejecuta:")
    print("   sqlite3 database/dev/tuneboxd_dev.db < database/dev/sqlite_schema.sql")
