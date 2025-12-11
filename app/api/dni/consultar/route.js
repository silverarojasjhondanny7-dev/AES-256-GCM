// app/api/dni/consultar/route.js - Consulta DNI con encriptación total
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken, extractToken } from '@/lib/jwt';
import { consultarDNI, validarDNI } from '@/lib/apiPeru';
import { encryptJSON } from '@/lib/crypto';

export async function POST(request) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token requerido' }, 
        { status: 401 }
      );
    }

    let userPayload;
    try {
      userPayload = verifyToken(token);
    } catch (error) {
      console.error('[Auth Error] Token inválido:', error.message);
      return NextResponse.json(
        { success: false, error: 'Token inválido o expirado' }, 
        { status: 403 }
      );
    }

    // Obtener y validar DNI
    const body = await request.json();
    const { dni } = body;

    if (!validarDNI(dni)) {
      return NextResponse.json(
        { success: false, error: 'DNI inválido. Debe tener 8 dígitos numéricos' }, 
        { status: 400 }
      );
    }

    console.log(`[DNI Consulta] Usuario ${userPayload.id} consultando DNI ${dni}`);

    // Consultar API Perú
    let datosReniec;
    try {
      datosReniec = await consultarDNI(dni);

      if (!datosReniec || !datosReniec.nombres) {
        return NextResponse.json(
          { success: false, error: 'No se encontraron datos para este DNI' }, 
          { status: 404 }
        );
      }
    } catch (error) {
      console.error('[API Peru] Error:', error.message);
      
      if (error.message.includes('no encontrado')) {
        return NextResponse.json(
          { success: false, error: 'DNI no encontrado en RENIEC' }, 
          { status: 404 }
        );
      }
      
      if (error.message.includes('Token')) {
        return NextResponse.json(
          { success: false, error: 'Error de configuración del servidor (Token API inválido)' }, 
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: false, error: 'Error al consultar datos del DNI. Intente nuevamente.' }, 
        { status: 500 }
      );
    }

    // Preparar datos a cifrar (INCLUYE EL DNI AQUÍ)
    const datosACifrar = {
      dni: dni, // ← AGREGAMOS EL DNI AQUÍ
      nombres: datosReniec.nombres,
      apellidoPaterno: datosReniec.apellidoPaterno,
      apellidoMaterno: datosReniec.apellidoMaterno,
      nombreCompleto: datosReniec.nombreCompleto
    };

    console.log('[DNI] Datos obtenidos:', datosACifrar.nombreCompleto);

    // Cifrar TODO (DNI + datos RENIEC juntos)
    let encryptedData;
    try {
      encryptedData = encryptJSON(datosACifrar);
    } catch (cryptoError) {
      console.error('[Crypto Error]', cryptoError.message);
      return NextResponse.json(
        { success: false, error: 'Error al cifrar datos' }, 
        { status: 500 }
      );
    }

    // Guardar en PostgreSQL (DNI en texto plano en la columna dni)
    let record;
    try {
      const result = await pool.query(
        `INSERT INTO dni_records (user_id, dni, encrypted_data, iv, auth_tag)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id, dni)
         DO UPDATE SET
           encrypted_data = EXCLUDED.encrypted_data,
           iv = EXCLUDED.iv,
           auth_tag = EXCLUDED.auth_tag,
           updated_at = CURRENT_TIMESTAMP
         RETURNING id, dni, created_at`,
        [
          userPayload.id, 
          dni, // ← DNI en texto plano (para búsquedas)
          encryptedData.encrypted, 
          encryptedData.iv, 
          encryptedData.authTag
        ]
      );
      record = result.rows[0];
      console.log('[DB] Registro guardado con ID:', record.id);
    } catch (dbError) {
      console.error('[DB Error]', dbError.message);
      return NextResponse.json(
        { success: false, error: 'Error al guardar en base de datos' }, 
        { status: 500 }
      );
    }

    // Registrar en audit_log CON DATOS ENCRIPTADOS
    try {
      const dniEncrypted = encryptJSON({ dni });
      
      const ipEncrypted = encryptJSON({ 
        ip: request.headers.get('x-forwarded-for') || 'unknown' 
      });

      const userAgentEncrypted = encryptJSON({ 
        userAgent: request.headers.get('user-agent') || 'unknown' 
      });

      await pool.query(
        'INSERT INTO audit_log (user_id, action, dni, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5)',
        [
          userPayload.id,
          'CONSULTA_DNI',
          JSON.stringify({
            encrypted: dniEncrypted.encrypted,
            iv: dniEncrypted.iv,
            authTag: dniEncrypted.authTag
          }),
          JSON.stringify({
            encrypted: ipEncrypted.encrypted,
            iv: ipEncrypted.iv,
            authTag: ipEncrypted.authTag
          }),
          JSON.stringify({
            encrypted: userAgentEncrypted.encrypted,
            iv: userAgentEncrypted.iv,
            authTag: userAgentEncrypted.authTag
          })
        ]
      );
    } catch (auditError) {
      console.error('[Audit Log] Error:', auditError.message);
    }

    // Respuesta exitosa
    return NextResponse.json({
      success: true,
      message: 'DNI consultado y guardado exitosamente (encriptado)',
      record: {
        id: record.id,
        dni: record.dni,
        createdAt: record.created_at
      },
      datos: datosACifrar
    });

  } catch (error) {
    console.error('[Server Error] Error inesperado:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' }, 
      { status: 500 }
    );
  }
}