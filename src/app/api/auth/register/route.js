import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userService } from "../../../../lib/database-adapter.js";
import { generateVerificationToken, sendVerificationEmail } from '../../../../lib/email-resend.js';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request) {
  try {
    const { username, email, password } = await request.json();

    // Validar datos de entrada
    if (!username || !email || !password) {
      return Response.json(
        { success: false, message: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { success: false, message: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    // Validar contraseña
    if (password.length < 8) {
      return Response.json(
        { success: false, message: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const existingUser = await userService.findByEmailOrUsername(email, username);

    if (existingUser) {
      const field = existingUser.email.toLowerCase() === email.toLowerCase() ? 'email' : 'username';
      return Response.json(
        { success: false, message: `Este ${field} ya está en uso` },
        { status: 409 }
      );
    }

    // Hash de la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generar token de verificación
    const verificationToken = generateVerificationToken();

    // Crear nuevo usuario en la base de datos
    const result = await userService.create({
      username,
      email: email.toLowerCase(),
      password_hash: hashedPassword,
      verification_token: verificationToken
    });

    // Enviar email de verificación
    const emailResult = await sendVerificationEmail(email.toLowerCase(), username, verificationToken);
    
    if (emailResult.success) {
      console.log(`✅ Email de verificación enviado a ${email}`);
    } else {
      console.error(`❌ Error enviando email de verificación: ${emailResult.error}`);
      // Continuar con el registro aunque falle el email
    }

    return Response.json({
      success: true,
      message: 'Cuenta creada exitosamente. Te hemos enviado un correo de verificación. Por favor, revisa tu bandeja de entrada.',
      user: {
        username,
        email: email.toLowerCase(),
        verified: false
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    return Response.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
