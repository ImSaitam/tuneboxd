import { userService } from '../../../../../lib/database.js';

export async function GET(request, { params }) {
  try {
    const { username } = await params;

    if (!username) {
      return Response.json(
        { success: false, message: 'Username es requerido' },
        { status: 400 }
      );
    }

    // Buscar usuario por username
    const user = await userService.findByUsername(username);
    
    if (!user) {
      return Response.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Remover información sensible
    const { password, reset_token, reset_token_expires, ...publicUser } = user;

    return Response.json({
      success: true,
      user: publicUser
    });

  } catch (error) {
    console.error('Error obteniendo perfil de usuario:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
