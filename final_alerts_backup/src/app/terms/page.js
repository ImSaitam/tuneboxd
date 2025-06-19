'use client';

import { ArrowLeft, Scale, Shield, Users, Music, Mail, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';

export default function TermsPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-theme-primary">
      {/* Header */}
      <div className="bg-theme-card backdrop-blur-md border-b border-theme-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="text-theme-primary hover:text-theme-accent transition-colors"
            >
              <ArrowLeft size={24} />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-theme-accent rounded-full flex items-center justify-center">
                <Scale className="w-5 h-5 text-theme-button" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-theme-primary">Términos y Condiciones</h1>
                <p className="text-theme-secondary text-sm">Última actualización: 16 de junio de 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-theme-card backdrop-blur-md rounded-lg border border-theme-border p-8 space-y-8">

          {/* Introducción */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-theme-accent" />
              <h2 className="text-xl font-semibold text-theme-primary">1. Aceptación de los Términos</h2>
            </div>
            <div className="text-theme-secondary space-y-3">
              <p>
                Bienvenido a <strong className="text-theme-primary">Tuneboxd</strong>. Al acceder y utilizar nuestra plataforma, 
                usted acepta cumplir con estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, 
                no debe utilizar nuestro servicio.
              </p>
              <p>
                Tuneboxd es una plataforma dedicada a la reseña y descubrimiento de música, donde los usuarios pueden 
                crear cuentas, escribir reseñas, crear listas personalizadas e interactuar con otros amantes de la música.
              </p>
            </div>
          </section>

          {/* Registro y Cuentas */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-theme-accent" />
              <h2 className="text-xl font-semibold text-theme-primary">2. Registro y Cuentas de Usuario</h2>
            </div>
            <div className="text-theme-secondary space-y-3">
              <h3 className="font-medium text-theme-primary">2.1 Creación de Cuenta</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Para utilizar Tuneboxd, debe crear una cuenta proporcionando una dirección de email válida</li>
                <li>Debe verificar su dirección de email para activar completamente su cuenta</li>
                <li>Es responsable de mantener la confidencialidad de su contraseña</li>
                <li>Debe proporcionar información precisa y actualizada</li>
              </ul>
              
              <h3 className="font-medium text-theme-primary">2.2 Responsabilidades del Usuario</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Usted es responsable de todas las actividades que ocurran bajo su cuenta</li>
                <li>Debe notificar inmediatamente cualquier uso no autorizado de su cuenta</li>
                <li>No debe compartir su cuenta con terceros</li>
                <li>Debe ser mayor de 13 años para crear una cuenta</li>
              </ul>
            </div>
          </section>

          {/* Uso de Datos Musicales */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Music className="w-6 h-6 text-theme-accent" />
              <h2 className="text-xl font-semibold text-theme-primary">3. Uso de Datos Musicales</h2>
            </div>
            <div className="text-theme-secondary space-y-3">
              <h3 className="font-medium text-theme-primary">3.1 Integración con Spotify</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Utilizamos la API de Spotify únicamente para obtener información de música (álbumes, artistas, canciones)</li>
                <li>NO accedemos a su cuenta personal de Spotify ni a sus datos de escucha</li>
                <li>NO requerimos que inicie sesión con Spotify para usar nuestra plataforma</li>
                <li>Los datos musicales se utilizan exclusivamente para funciones de búsqueda y catálogo</li>
              </ul>
              
              <h3 className="font-medium text-theme-primary">3.2 Catálogo Musical</h3>
              <p>
                El catálogo de música disponible en Tuneboxd depende de los datos proporcionados por Spotify. 
                No garantizamos la disponibilidad continua de ningún álbum o artista específico.
              </p>
            </div>
          </section>

          {/* Contenido Generado por Usuarios */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-theme-accent" />
              <h2 className="text-xl font-semibold text-theme-primary">4. Contenido Generado por Usuarios</h2>
            </div>
            <div className="text-theme-secondary space-y-3">
              <h3 className="font-medium text-theme-primary">4.1 Reseñas y Comentarios</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Usted retiene los derechos de autor sobre el contenido que publica</li>
                <li>Al publicar, nos otorga una licencia no exclusiva para mostrar su contenido en la plataforma</li>
                <li>No debe publicar contenido que sea ofensivo, difamatorio o que viole derechos de terceros</li>
                <li>Nos reservamos el derecho de moderar y eliminar contenido inapropiado</li>
              </ul>
              
              <h3 className="font-medium text-theme-primary">4.2 Listas Personalizadas</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Puede crear listas públicas y privadas de álbumes</li>
                <li>Las listas públicas pueden ser vistas por otros usuarios</li>
                <li>Puede controlar la visibilidad de sus listas en cualquier momento</li>
              </ul>
              
              <h3 className="font-medium text-theme-primary">4.3 Interacciones Sociales</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Puede seguir a otros usuarios y ser seguido</li>
                <li>Puede dar &quot;like&quot; y comentar en listas de otros usuarios</li>
                <li>Debe mantener un comportamiento respetuoso en todas las interacciones</li>
              </ul>
            </div>
          </section>

          {/* Funcionalidades de la Plataforma */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-theme-accent" />
              <h2 className="text-xl font-semibold text-theme-primary">5. Funcionalidades y Servicios</h2>
            </div>
            <div className="text-theme-secondary space-y-3">
              <h3 className="font-medium text-theme-primary">5.1 Servicios Disponibles</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Búsqueda y exploración de música</li>
                <li>Creación y gestión de reseñas</li>
                <li>Listas personalizadas y públicas</li>
                <li>Sistema de seguimiento entre usuarios</li>
                <li>Notificaciones de actividad</li>
                <li>Historial personal de escucha</li>
              </ul>
              
              <h3 className="font-medium text-theme-primary">5.2 Disponibilidad del Servicio</h3>
              <p>
                Nos esforzamos por mantener el servicio disponible, pero no garantizamos un tiempo de actividad del 100%. 
                Podemos realizar mantenimientos programados y actualizaciones que pueden afectar temporalmente la disponibilidad.
              </p>
            </div>
          </section>

          {/* Privacidad y Datos */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-theme-accent" />
              <h2 className="text-xl font-semibold text-theme-primary">6. Privacidad y Protección de Datos</h2>
            </div>
            <div className="text-theme-secondary space-y-3">
              <h3 className="font-medium text-theme-primary">6.1 Datos Recopilados</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Dirección de email (para registro y verificación)</li>
                <li>Nombre de usuario elegido</li>
                <li>Contenido que publica (reseñas, listas, comentarios)</li>
                <li>Interacciones en la plataforma (likes, seguimientos, historial)</li>
              </ul>
              
              <h3 className="font-medium text-theme-primary">6.2 Uso de Datos</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Para proporcionar y mejorar nuestros servicios</li>
                <li>Para personalizar su experiencia en la plataforma</li>
                <li>Para comunicaciones relacionadas con el servicio</li>
                <li>Para generar estadísticas anónimas de uso</li>
              </ul>
              
              <h3 className="font-medium text-theme-primary">6.3 Protección de Datos</h3>
              <p>
                Implementamos medidas de seguridad apropiadas para proteger sus datos personales. 
                No vendemos ni compartimos sus datos personales con terceros para fines comerciales.
              </p>
            </div>
          </section>

          {/* Limitaciones de Responsabilidad */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-theme-accent" />
              <h2 className="text-xl font-semibold text-theme-primary">7. Limitaciones de Responsabilidad</h2>
            </div>
            <div className="text-theme-secondary space-y-3">
              <h3 className="font-medium text-theme-primary">7.1 Uso del Servicio</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>El servicio se proporciona &quot;tal como está&quot;</li>
                <li>No garantizamos que el servicio sea ininterrumpido o libre de errores</li>
                <li>No somos responsables del contenido publicado por otros usuarios</li>
                <li>El usuario utiliza el servicio bajo su propia responsabilidad</li>
              </ul>
              
              <h3 className="font-medium text-theme-primary">7.2 Contenido de Terceros</h3>
              <p>
                Los datos musicales provienen de servicios de terceros (Spotify). No somos responsables de 
                la precisión, disponibilidad o cambios en estos datos.
              </p>
            </div>
          </section>

          {/* Modificaciones y Terminación */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-6 h-6 text-theme-accent" />
              <h2 className="text-xl font-semibold text-theme-primary">8. Modificaciones y Terminación</h2>
            </div>
            <div className="text-theme-secondary space-y-3">
              <h3 className="font-medium text-theme-primary">8.1 Modificaciones de los Términos</h3>
              <p>
                Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                Las modificaciones significativas serán notificadas a los usuarios registrados. 
                El uso continuado del servicio constituye aceptación de los términos modificados.
              </p>
              
              <h3 className="font-medium text-theme-primary">8.2 Terminación de Cuenta</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Puede eliminar su cuenta en cualquier momento</li>
                <li>Podemos suspender o terminar cuentas que violen estos términos</li>
                <li>Al terminar su cuenta, su contenido público puede permanecer en la plataforma</li>
              </ul>
            </div>
          </section>

          {/* Contacto */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-theme-accent" />
              <h2 className="text-xl font-semibold text-theme-primary">9. Contacto</h2>
            </div>
            <div className="text-theme-secondary">
              <p>
                Si tiene preguntas sobre estos Términos y Condiciones, puede contactarnos a través de la 
                plataforma o mediante los canales de soporte disponibles en nuestra página principal.
              </p>
            </div>
          </section>

          {/* Footer de la página */}
          <div className="border-t border-theme-border pt-6 mt-8">
            <div className="bg-theme-hover rounded-lg p-4">
              <p className="text-theme-secondary text-sm text-center">
                Al utilizar Tuneboxd, usted confirma que ha leído, entendido y acepta estos Términos y Condiciones.
              </p>
              {!isAuthenticated && (
                <div className="flex gap-4 justify-center mt-4">
                  <Link 
                    href="/register"
                    className="bg-theme-accent text-theme-button px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Crear Cuenta
                  </Link>
                  <Link 
                    href="/login"
                    className="bg-theme-card border border-theme-border text-theme-primary px-6 py-2 rounded-lg hover:bg-theme-hover transition-colors"
                  >
                    Iniciar Sesión
                  </Link>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
