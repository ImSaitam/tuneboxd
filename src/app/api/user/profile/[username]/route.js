import { userService } from "../../../../../lib/database-adapter.js";

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

    // Remover información sensible y mapear profile_image a profile_picture
    const { password, reset_token, reset_token_expires, profile_image, ...publicUser } = user;

    return Response.json({
      success: true,
      user: {
        ...publicUser,
        profile_picture: profile_image  // Mapear profile_image (DB) a profile_picture (frontend)
      }
    });

  } catch (error) {
    console.error('Error obteniendo perfil de usuario:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
