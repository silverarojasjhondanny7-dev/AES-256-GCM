// lib/crypto.js - Funciones de Encriptación
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY 
  ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
  : crypto.randomBytes(32);

const ALGORITHM = 'aes-256-gcm';

/**
 * Cifra texto con AES-256-GCM
 * @param {string} text - Texto a cifrar
 * @returns {object} - {encrypted, iv, authTag}
 */
export function encrypt(text) {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  } catch (error) {
    console.error('Error al cifrar:', error);
    throw new Error('Error en el cifrado de datos');
  }
}

/**
 * Descifra datos cifrados con AES-256-GCM
 * @param {string} encrypted - Datos cifrados
 * @param {string} iv - Initialization Vector
 * @param {string} authTag - Authentication Tag
 * @returns {string} - Texto descifrado
 */
export function decrypt(encrypted, iv, authTag) {
  try {
    const decipher = crypto.createDecipheriv(
      ALGORITHM, 
      ENCRYPTION_KEY, 
      Buffer.from(iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Error al descifrar:', error);
    throw new Error('Error en el descifrado de datos - Datos corruptos o clave incorrecta');
  }
}

/**
 * Cifra un objeto JSON
 * @param {object} data - Objeto a cifrar
 * @returns {object} - {encrypted, iv, authTag}
 */
export function encryptJSON(data) {
  const jsonString = JSON.stringify(data);
  return encrypt(jsonString);
}

/**
 * Descifra a objeto JSON
 * @param {string} encrypted - Datos cifrados
 * @param {string} iv - Initialization Vector
 * @param {string} authTag - Authentication Tag
 * @returns {object} - Objeto descifrado
 */
export function decryptJSON(encrypted, iv, authTag) {
  const decrypted = decrypt(encrypted, iv, authTag);
  return JSON.parse(decrypted);
}

/**
 * Genera hash SHA-256 (para búsquedas sin descifrar)
 * @param {string} data - Dato a hashear
 * @returns {string} - Hash en hexadecimal
 */
export function hashData(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}