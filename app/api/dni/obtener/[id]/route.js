// app/api/dni/obtener/[id]/route.js - Obtener DNI descifrado
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken, extractToken } from '@/lib/jwt';
import { decryptJSON } from '@/lib/crypto';

export async function GET(request, { params }) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'Token requerido' },
        { status: 401 }
      );
    }

    let userPayload;
    try {
      userPayload = verifyToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    const { id } = params;

    // Buscar registro
    const result = await pool.query(
      `SELECT id, dni, encrypted_data, iv, auth_tag, created_at, updated_at 
       FROM dni_records 
       WHERE id = $1 AND user_id = $2`,
      [id, userPayload.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Registro no encontrado o no autorizado' },
        { status: 404 }
      );
    }

    const record = result.rows[0];

    // Descifrar datos
    let datosDescifrados;
    try {
      datosDescifrados = decryptJSON(
        record.encrypted_data,
        record.iv,
        record.auth_tag
      );
    } catch (error) {
      console.error('Error al descifrar:', error);
      return NextResponse.json(
        { error: 'Error al descifrar datos' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      record: {
        id: record.id,
        dni: record.dni,
        datos: datosDescifrados,
        createdAt: record.created_at,
        updatedAt: record.updated_at
      }
    });

  } catch (error) {
    console.error('Error obteniendo DNI:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Obtener todos los registros del usuario
export async function POST(request) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'Token requerido' },
        { status: 401 }
      );
    }

    let userPayload;
    try {
      userPayload = verifyToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    // Obtener todos los registros del usuario
    const result = await pool.query(
      `SELECT id, dni, encrypted_data, iv, auth_tag, created_at 
       FROM dni_records 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userPayload.id]
    );

    // Descifrar todos los registros
    const registros = result.rows.map(record => {
      try {
        const datos = decryptJSON(record.encrypted_data, record.iv, record.auth_tag);
        return {
          id: record.id,
          dni: record.dni,
          nombreCompleto: datos.nombreCompleto,
          createdAt: record.created_at
        };
      } catch (error) {
        console.error(`Error descifrando registro ${record.id}`);
        return null;
      }
    }).filter(Boolean);

    return NextResponse.json({
      success: true,
      total: registros.length,
      registros
    });

  } catch (error) {
    console.error('Error obteniendo historial:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}