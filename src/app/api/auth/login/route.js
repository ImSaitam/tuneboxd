import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userService } from "../../../../lib/database-adapter.js";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validar datos de entrada
    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, message: 'Email y contraseña son requeridos' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Content-Encoding': 'identity'
          }
        }
      );
    }

    // Buscar usuario por email
    const user = await userService.findByEmail(email);
    
    if (!user) {
      return Response.json(
        { success: false, message: 'Credenciales inválidas' },
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        }
      );
    }

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return Response.json(
        { success: false, message: 'Credenciales inválidas' },
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        }
      );
    }

    // Verificar si el usuario está verificado
    if (!user.verified) {
      return Response.json(
        { 
          success: false, 
          message: 'Por favor verifica tu cuenta antes de iniciar sesión. Revisa tu email o solicita un nuevo enlace de verificación.',
          needsVerification: true,
          email: user.email
        },
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        }
      );
    }

    // Generar JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        username: user.username 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remover contraseña de la respuesta
    const { password: _, ...userWithoutPassword } = user;

    const responseData = {
      success: true,
      token,
      user: userWithoutPassword,
      message: 'Inicio de sesión exitoso'
    };

    return new Response(
      JSON.stringify(responseData),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Content-Encoding': 'identity'
        }
      }
    );

  } catch (error) {
    console.error('Error en login:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }
    );
  }
}
