// app/api/auth/login/route.js - Login con desencriptación
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import pool from '@/lib/db';
import { generateToken } from '@/lib/jwt';
import { decryptJSON } from '@/lib/crypto';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validaciones
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase();

    // Buscar usuario por email
    const result = await pool.query(
      'SELECT id, email, password_hash, full_name FROM users WHERE email LIKE $1',
      [`%"plain":"${emailLower}"%`]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Descifrar email
    const emailData = JSON.parse(user.email);
    const decryptedEmailObj = decryptJSON(
      emailData.encrypted,
      emailData.iv,
      emailData.authTag
    );

    // Descifrar nombre completo si existe
    let decryptedFullName = null;
    if (user.full_name) {
      try {
        const fullNameData = JSON.parse(user.full_name);
        const fullNameObj = decryptJSON(
          fullNameData.encrypted,
          fullNameData.iv,
          fullNameData.authTag
        );
        decryptedFullName = fullNameObj.fullName;
      } catch (error) {
        console.error('Error al descifrar nombre:', error);
      }
    }

    // Generar token JWT
    const token = generateToken({
      id: user.id,
      email: decryptedEmailObj.email
    });

    return NextResponse.json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        email: decryptedEmailObj.email,
        fullName: decryptedFullName
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}