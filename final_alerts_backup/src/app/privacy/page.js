'use client';

import { ArrowLeft, Shield, Eye, Lock, Database, Mail } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';

export default function PrivacyPage() {
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
                <Shield className="w-5 h-5 text-theme-button" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-theme-primary">Política de Privacidad</h1>
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
              <Eye className="w-6 h-6 text-theme-accent" />
              <h2 className="text-xl font-semibold text-theme-primary">1. Introducción</h2>
            </div>
            <div className="text-theme-secondary space-y-3">
              <p>
                En <strong className="text-theme-primary">Tuneboxd</strong>, respetamos su privacidad y nos comprometemos 
                a proteger sus datos personales. Esta Política de Privacidad explica cómo recopilamos, utilizamos, 
                almacenamos y protegemos su información cuando utiliza nuestra plataforma.
              </p>
              <p>
                Al utilizar Tuneboxd, usted acepta las prácticas descritas en esta política. 
                Si no está de acuerdo con estas prácticas, no debe utilizar nuestro servicio.
              </p>
            </div>
          </section>

          {/* Información que Recopilamos */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-theme-accent" />
              <h2 className="text-xl font-semibold text-theme-primary">2. Información que Recopilamos</h2>
            </div>
            <div className="text-theme-secondary space-y-3">
              <h3 className="font-medium text-theme-primary">2.1 Información Personal</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Email:</strong> Requerido para el registro y verificación de cuenta</li>
                <li><strong>Nombre de usuario:</strong> Su identificador público en la plataforma</li>
                <li><strong>Contraseña:</strong> Almacenada de forma segura y encriptada</li>
              </ul>
              
              <h3 className="font-medium text-theme-primary">2.2 Contenido del Usuario</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Reseñas de álbumes y comentarios</li>
                <li>Listas personalizadas de música</li>
                <li>Interacciones sociales (likes, seguimientos)</li>
                <li>Historial de actividad en la plataforma</li>
              </ul>
              
              <h3 className="font-medium text-theme-primary">2.3 Datos de Uso</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Páginas visitadas y tiempo de navegación</li>
                <li>Búsquedas realizadas en la plataforma</li>
                <li>Preferencias de configuración y tema</li>
                <li>Información del dispositivo y navegador (anónima)</li>
              </ul>
            </div>
          </section>

          {/* Cómo Utilizamos su Información */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-theme-accent" />
              <h2 className="text-xl font-semibold text-theme-primary">3. Cómo Utilizamos su Información</h2>
            </div>
            <div className="text-theme-secondary space-y-3">
              <h3 className="font-medium text-theme-primary">3.1 Propósitos Principales</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Proporcionar y mantener los servicios de Tuneboxd</li>
                <li>Verificar su identidad y autenticar su cuenta</li>
                <li>Personalizar su experiencia en la plataforma</li>
                <li>Facilitar las interacciones sociales entre usuarios</li>
              </ul>
              
              <h3 className="font-medium text-theme-primary">3.2 Comunicaciones</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Enviar confirmaciones de verificación de email</li>
                <li>Notificar sobre actividad relevante en su cuenta</li>
                <li>Proporcionar actualizaciones importantes del servicio</li>
                <li>Responder a consultas de soporte técnico</li>
              </ul>
              
              <h3 className="font-medium text-theme-primary">3.3 Mejoras del Servicio</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Analizar el uso de la plataforma para mejoras</li>
                <li>Desarrollar nuevas funcionalidades</li>
                <li>Prevenir fraude y uso indebido</li>
                <li>Generar estadísticas anónimas</li>
              </ul>
            </div>
          </section>

          {/* Datos Musicales y Spotify */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-theme-accent" />
              <h2 className="text-xl font-semibold text-theme-primary">4. Datos Musicales y Servicios de Terceros</h2>
            </div>
            <div className="text-theme-secondary space-y-3">
              <h3 className="font-medium text-theme-primary">4.1 API de Spotify</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Utilizamos la API pública de Spotify solo para obtener información de catálogo musical</li>
                <li>NO accedemos a datos personales de su cuenta de Spotify</li>
                <li>NO recopilamos información sobre sus hábitos de escucha en Spotify</li>
                <li>Los datos musicales se utilizan únicamente para funciones de búsqueda y exploración</li>
              </ul>
              
              <h3 className="font-medium text-theme-primary">4.2 Sin Integración de Cuenta</h3>
              <p>
                Es importante aclarar que Tuneboxd <strong>NO requiere</strong> que conecte su cuenta de Spotify. 
                Su cuenta de Tuneboxd es completamente independiente y se gestiona mediante su dirección de email.
              </p>
            </div>
          </section>

          {/* Compartir Información */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-theme-accent" />
              <h2 className="text-xl font-semibold text-theme-primary">5. Compartir su Información</h2>
            </div>
            <div className="text-theme-secondary space-y-3">
              <h3 className="font-medium text-theme-primary">5.1 Lo que NO hacemos</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>NO vendemos sus datos personales a terceros</li>
                <li>NO compartimos su email con empresas externas</li>
                <li>NO utilizamos sus datos para publicidad externa</li>
                <li>NO accedemos a sus cuentas de redes sociales</li>
              </ul>
              
              <h3 className="font-medium text-theme-primary">5.2 Contenido Público</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Su nombre de usuario y contenido público son visibles para otros usuarios</li>
                <li>Las listas públicas pueden ser vistas por cualquier visitante</li>
                <li>Puede controlar la visibilidad de su contenido en su configuración</li>
              </ul>
              
              <h3 className="font-medium text-theme-primary">5.3 Casos Excepcionales</h3>
              <p>
                Solo compartiremos información personal si es requerido por ley, para proteger nuestros derechos 
                legales, o para prevenir daños a otros usuarios o a la plataforma.
              </p>
            </div>
          </section>

          {/* Seguridad */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-theme-accent" />
              <h2 className="text-xl font-semibold text-theme-primary">6. Seguridad de los Datos</h2>
            </div>
            <div className="text-theme-secondary space-y-3">
              <h3 className="font-medium text-theme-primary">6.1 Medidas de Protección</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Encriptación de contraseñas y datos sensibles</li>
                <li>Conexiones seguras HTTPS en toda la plataforma</li>
                <li>Verificación de email para activación de cuentas</li>
                <li>Monitoreo regular de seguridad</li>
              </ul>
              
              <h3 className="font-medium text-theme-primary">6.2 Su Responsabilidad</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Mantenga su contraseña segura y privada</li>
                <li>Cierre sesión en dispositivos compartidos</li>
                <li>Reporte actividad sospechosa inmediatamente</li>
                <li>Use una contraseña única para Tuneboxd</li>
              </ul>
            </div>
          </section>

          {/* Sus Derechos */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-theme-accent" />
              <h2 className="text-xl font-semibold text-theme-primary">7. Sus Derechos</h2>
            </div>
            <div className="text-theme-secondary space-y-3">
              <h3 className="font-medium text-theme-primary">7.1 Control de sus Datos</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Acceso:</strong> Puede ver toda la información asociada a su cuenta</li>
                <li><strong>Corrección:</strong> Puede actualizar su información personal</li>
                <li><strong>Eliminación:</strong> Puede eliminar su cuenta y datos asociados</li>
                <li><strong>Portabilidad:</strong> Puede exportar su contenido</li>
              </ul>
              
              <h3 className="font-medium text-theme-primary">7.2 Configuración de Privacidad</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Controle la visibilidad de sus listas</li>
                <li>Gestione quién puede seguirle</li>
                <li>Configure las notificaciones que desea recibir</li>
                <li>Elija qué información mostrar en su perfil</li>
              </ul>
            </div>
          </section>

          {/* Cookies y Tecnologías Similares */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-theme-accent" />
              <h2 className="text-xl font-semibold text-theme-primary">8. Cookies y Almacenamiento Local</h2>
            </div>
            <div className="text-theme-secondary space-y-3">
              <h3 className="font-medium text-theme-primary">8.1 Uso de Cookies</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Cookies esenciales para el funcionamiento de la sesión</li>
                <li>Preferencias de usuario (tema, configuración)</li>
                <li>Análisis básico de uso (anónimo)</li>
                <li>NO utilizamos cookies de seguimiento publicitario</li>
              </ul>
              
              <h3 className="font-medium text-theme-primary">8.2 Control de Cookies</h3>
              <p>
                Puede configurar su navegador para rechazar cookies, aunque esto puede afectar 
                la funcionalidad de algunas características de Tuneboxd.
              </p>
            </div>
          </section>

          {/* Cambios en la Política */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-theme-accent" />
              <h2 className="text-xl font-semibold text-theme-primary">9. Cambios en esta Política</h2>
            </div>
            <div className="text-theme-secondary space-y-3">
              <p>
                Podemos actualizar esta Política de Privacidad ocasionalmente. Cuando realicemos cambios 
                significativos, se lo notificaremos a través de la plataforma o por email. La fecha de 
                &quot;última actualización&quot; al inicio de esta política indica cuándo se realizaron los cambios más recientes.
              </p>
              <p>
                Su uso continuado de Tuneboxd después de dichos cambios constituye su aceptación de la nueva política.
              </p>
            </div>
          </section>

          {/* Contacto */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-theme-accent" />
              <h2 className="text-xl font-semibold text-theme-primary">10. Contacto</h2>
            </div>
            <div className="text-theme-secondary">
              <p>
                Si tiene preguntas sobre esta Política de Privacidad o sobre el manejo de sus datos personales, 
                puede contactarnos a través de los canales de soporte disponibles en nuestra plataforma.
              </p>
            </div>
          </section>

          {/* Footer de la página */}
          <div className="border-t border-theme-border pt-6 mt-8">
            <div className="bg-theme-hover rounded-lg p-4">
              <p className="text-theme-secondary text-sm text-center">
                Su privacidad es importante para nosotros. Esta política explica claramente cómo protegemos 
                y utilizamos su información en Tuneboxd.
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
