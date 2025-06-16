// Componente optimizado con React.memo para evitar re-renders innecesarios
import React, { memo, useMemo } from 'react';
import Link from 'next/link';
import { 
  MessageSquare, ThumbsUp, Eye, Pin, Lock, Globe
} from 'lucide-react';

// Función pura para formatear tiempo (se puede memoizar)
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'hace unos segundos';
  if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} h`;
  if (diffInSeconds < 2592000) return `hace ${Math.floor(diffInSeconds / 86400)} días`;
  
  return date.toLocaleDateString('es');
};

// Mapa de códigos de idioma a nombres (estático)
const languageNames = {
  'es': 'Español',
  'en': 'English',
  'fr': 'Français',
  'de': 'Deutsch',
  'it': 'Italiano',
  'pt': 'Português',
  'ru': 'Русский',
  'ja': '日本語',
  'ko': '한국어',  
  'zh': '中文',
  'ar': 'العربية',
  'hi': 'हिन्दी',
  'other': 'Otro'
};

// Componente para mostrar estadísticas de un hilo (memoizado)
const ThreadStats = memo(({ thread }) => {
  return (
    <div className="flex items-center space-x-4 text-sm text-theme-muted">
      <div className="flex items-center space-x-1">
        <Eye className="w-4 h-4" />
        <span>{thread.views_count}</span>
      </div>
      <div className="flex items-center space-x-1">
        <MessageSquare className="w-4 h-4" />
        <span>{thread.replies_count}</span>
      </div>
      <div className="flex items-center space-x-1">
        <ThumbsUp className="w-4 h-4" />
        <span>{thread.likes_count}</span>
      </div>
    </div>
  );
});

ThreadStats.displayName = 'ThreadStats';

// Componente para mostrar metadatos del hilo (memoizado)
const ThreadMeta = memo(({ thread }) => {
  const timeAgo = useMemo(() => formatTimeAgo(thread.created_at), [thread.created_at]);
  const languageName = useMemo(() => 
    languageNames[thread.language] || thread.language, 
    [thread.language]
  );

  return (
    <div className="flex items-center space-x-3 text-sm text-theme-muted mt-1">
      <span>por @{thread.author_username}</span>
      <span>•</span>
      <span>{timeAgo}</span>
      <span>•</span>
      <span className="bg-theme-accent/30 px-2 py-1 rounded-lg text-theme-accent">
        #{thread.category}
      </span>
      {thread.language && (
        <>
          <span>•</span>
          <span className="bg-blue-500/30 px-2 py-1 rounded-lg text-blue-400 flex items-center space-x-1">
            <Globe className="w-3 h-3" />
            <span>{languageName}</span>
          </span>
        </>
      )}
    </div>
  );
});

ThreadMeta.displayName = 'ThreadMeta';

// Componente para mostrar iconos de estado del hilo (memoizado)
const ThreadIcons = memo(({ thread }) => {
  if (!thread.is_pinned && !thread.is_locked) return null;

  return (
    <div className="flex items-center space-x-2 flex-shrink-0">
      {thread.is_pinned && (
        <Pin className="w-4 h-4 text-yellow-400" />
      )}
      {thread.is_locked && (
        <Lock className="w-4 h-4 text-red-400" />
      )}
    </div>
  );
});

ThreadIcons.displayName = 'ThreadIcons';

// Componente principal de la tarjeta del hilo (memoizado)
const OptimizedThreadCard = memo(({ thread }) => {
  // Memoizar la fecha de última actividad solo si es diferente a created_at
  const lastActivity = useMemo(() => {
    if (thread.last_activity !== thread.created_at) {
      return formatTimeAgo(thread.last_activity);
    }
    return null;
  }, [thread.last_activity, thread.created_at]);

  return (
    <Link href={`/community/thread/${thread.id}`}>
      <div className="bg-theme-card backdrop-blur-sm rounded-2xl p-6 border border-theme-border hover:bg-theme-hover transition-all duration-300 cursor-pointer group">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3 flex-1">
            <ThreadIcons thread={thread} />
            <div className="flex-1">
              <h3 className="text-theme-primary font-bold text-lg group-hover:text-theme-accent transition-colors line-clamp-1">
                {thread.title}
              </h3>
              <ThreadMeta thread={thread} />
            </div>
          </div>
        </div>

        {thread.content && (
          <p className="text-theme-secondary mb-4 line-clamp-2">
            {thread.content}
          </p>
        )}

        <div className="flex items-center justify-between">
          <ThreadStats thread={thread} />
          {lastActivity && (
            <div className="text-xs text-theme-muted">
              <span>Última actividad: {lastActivity}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
});

OptimizedThreadCard.displayName = 'OptimizedThreadCard';

export default OptimizedThreadCard;
