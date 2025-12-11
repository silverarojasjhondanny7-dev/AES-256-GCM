// lib/crypto.js - Cifrado y Descifrado AES-256-GCM
import crypto from 'crypto';

// Clave de cifrado (32 bytes para AES-256)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY 
  ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
  : crypto.randomBytes(32);

const ALGORITHM = 'aes-256-gcm';

/**
 * Cifra datos con AES-256-GCM
 * @param {string} text - Texto a cifrar
 * @returns {object} - {encrypted, iv, authTag}
 */
export function encrypt(text) {
  try {
    // Generar IV aleatorio (16 bytes)
    const iv = crypto.randomBytes(16);
    
    // Crear cipher
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    // Cifrar
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Obtener auth tag (para verificar integridad)
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
    // Crear decipher
    const decipher = crypto.createDecipheriv(
      ALGORITHM, 
      ENCRYPTION_KEY, 
      Buffer.from(iv, 'hex')
    );
    
    // Setear auth tag
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    // Descifrar
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