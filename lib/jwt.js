// lib/jwt.js - Manejo de JSON Web Tokens
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secret-key-super-segura-cambiar-en-produccion';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Genera un JWT token
 * @param {object} payload - Datos del usuario {id, email}
 * @returns {string} - Token JWT
 */
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'dni-system'
  });
}

/**
 * Verifica y decodifica un JWT token
 * @param {string} token - Token a verificar
 * @returns {object} - Payload decodificado
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expirado');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Token inválido');
    }
    throw new Error('Error al verificar token');
  }
}

/**
 * Extrae el token del header Authorization
 * @param {string} authHeader - Header "Bearer token"
 * @returns {string|null} - Token o null
 */
export function extractToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}