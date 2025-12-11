// app/api/auth/register/route.js - Registro con encriptación
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import pool from '@/lib/db';
import { generateToken } from '@/lib/jwt';
import { encryptJSON } from '@/lib/crypto';

export async function POST(request) {
  try {
    const { email, password, fullName } = await request.json();

    // Validaciones
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase();

    // Verificar si el email ya existe
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email LIKE $1',
      [`%"plain":"${emailLower}"%`]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 409 }
      );
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Encriptar email
    const emailEncrypted = encryptJSON({ email: emailLower });

    // Encriptar nombre completo si existe
    let fullNameData = null;
    if (fullName) {
      const fullNameEncrypted = encryptJSON({ fullName });
      fullNameData = JSON.stringify({
        encrypted: fullNameEncrypted.encrypted,
        iv: fullNameEncrypted.iv,
        authTag: fullNameEncrypted.authTag
      });
    }

    // Guardar usuario con datos encriptados
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, created_at',
      [
        JSON.stringify({
          plain: emailLower,
          encrypted: emailEncrypted.encrypted,
          iv: emailEncrypted.iv,
          authTag: emailEncrypted.authTag
        }),
        passwordHash,
        fullNameData
      ]
    );

    const user = result.rows[0];

    // Generar token JWT
    const token = generateToken({
      id: user.id,
      email: emailLower
    });

    return NextResponse.json({
      success: true,
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: user.id,
        email: emailLower,
        fullName: fullName || null,
        createdAt: user.created_at
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}