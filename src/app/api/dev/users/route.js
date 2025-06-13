import { userService } from '../../../../lib/database.js';

export async function GET(request) {
  try {
    // Solo permitir en desarrollo
    if (process.env.NODE_ENV === 'production') {
      return Response.json(
        { success: false, message: 'Esta función solo está disponible en desarrollo' },
        { status: 403 }
      );
    }

    const users = await userService.getAllUsers();
    
    return Response.json({
      success: true,
      users: users
    });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    return Response.json(
      { success: false, message: 'Error obteniendo usuarios: ' + error.message },
      { status: 500 }
    );
  }
}
