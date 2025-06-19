export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-white">
            TuneBoxd
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            La plataforma definitiva para descubrir, revisar y compartir música. 
            Conéctate con la comunidad musical más apasionada.
          </p>
        </div>
        
        <div className="space-y-4">
          <p className="text-lg text-yellow-400 font-semibold">
            🚀 Próximamente
          </p>
          <p className="text-gray-400 max-w-lg mx-auto">
            Estamos trabajando para ofrecerte la mejor experiencia musical. 
            Pronto podrás explorar álbumes, crear listas personalizadas y descubrir nueva música.
          </p>
        </div>

        <div className="pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 space-y-3">
              <div className="text-3xl">🎵</div>
              <h3 className="text-white font-semibold">Descubre Música</h3>
              <p className="text-gray-300 text-sm">
                Explora millones de álbumes y encuentra tu próxima canción favorita
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 space-y-3">
              <div className="text-3xl">⭐</div>
              <h3 className="text-white font-semibold">Crea Reseñas</h3>
              <p className="text-gray-300 text-sm">
                Comparte tus opiniones y lee las reseñas de otros melómanos
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 space-y-3">
              <div className="text-3xl">👥</div>
              <h3 className="text-white font-semibold">Comunidad</h3>
              <p className="text-gray-300 text-sm">
                Conéctate con personas que comparten tu pasión por la música
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8">
          <p className="text-gray-500 text-sm">
            © 2025 TuneBoxd. Desarrollado con ❤️ para los amantes de la música.
          </p>
        </div>
      </div>
    </div>
  );
}
