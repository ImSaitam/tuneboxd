import jwt from 'jsonwebtoken';
import { userService } from "../../../../lib/database-adapter.js";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json(
        { success: false, message: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar si puede cambiar el username
    const usernameStatus = await userService.canChangeUsername(decoded.userId);
    
    return Response.json({
      success: true,
      canChangeUsername: usernameStatus.canChange,
      daysUntilUsernameChange: usernameStatus.daysRemaining
    });

  } catch (error) {
    console.error('Error verificando estado del perfil:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json(
        { success: false, message: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const { username, bio, profilePicture } = await request.json();

    // Validaciones
    if (bio && bio.length > 500) {
      return Response.json(
        { success: false, message: 'La biografía no puede exceder 500 caracteres' },
        { status: 400 }
      );
    }

    if (username && (username.length < 3 || username.length > 20)) {
      return Response.json(
        { success: false, message: 'El nombre de usuario debe tener entre 3 y 20 caracteres' },
        { status: 400 }
      );
    }

    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
      return Response.json(
        { success: false, message: 'El nombre de usuario solo puede contener letras, números y guiones bajos' },
        { status: 400 }
      );
    }

    // Actualizar perfil básico (bio y foto)
    if (bio !== undefined || profilePicture !== undefined) {
      await userService.updateProfile(decoded.userId, {
        bio: bio || null,
        profilePicture: profilePicture || null
      });
    }

    // Actualizar username si se proporciona
    if (username) {
      try {
        await userService.updateUsername(decoded.userId, username);
      } catch (error) {
        return Response.json(
          { success: false, message: error.message },
          { status: 400 }
        );
      }
    }

    // Obtener el usuario actualizado
    const updatedUser = await userService.findById(decoded.userId);
    const { password: _, reset_token, reset_token_expires, profile_image, ...publicUser } = updatedUser;

    return Response.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      user: {
        ...publicUser,
        profile_picture: profile_image  // Mapear profile_image (DB) a profile_picture (frontend)
      }
    });

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
