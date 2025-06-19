import { userService } from "../../../../lib/database-adapter.js";
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    // Si es una solicitud desde el navegador (link del email), redirigir a la página
    const userAgent = request.headers.get('user-agent') || '';
    const isFromBrowser = userAgent.includes('Mozilla') || userAgent.includes('Chrome') || userAgent.includes('Safari');
    
    if (isFromBrowser && token) {
      // Redirigir a la página de verificación
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tuneboxd.xyz';
      return NextResponse.redirect(`${baseUrl}/auth/verify-email?token=${token}`);
    }

    if (!token) {
      return Response.json(
        { success: false, message: 'Token de verificación requerido' },
        { status: 400 }
      );
    }

    // Buscar el token de verificación
    const user = await userService.findVerificationToken(token);
    
    if (!user) {
      return Response.json(
        { success: false, message: 'Token de verificación inválido o expirado' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya está verificado
    if (user.email_verified) {
      return Response.json(
        { success: true, message: 'Tu cuenta ya estaba verificada' }
      );
    }

    // Verificar el usuario
    await userService.verifyUser(user.id);
    
    // Eliminar el token usado
    await userService.deleteVerificationToken(token);

    // Nota: Se eliminó el envío del email de bienvenida para evitar spam
    // El usuario ya recibió el email de verificación al registrarse

    return Response.json({
      success: true,
      message: 'Cuenta verificada exitosamente. ¡Bienvenido a Tuneboxd!'
    });

  } catch (error) {
    console.error('Error verificando email:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
