// lib/apiPeru.js
import axios from 'axios';

const API_BASE_URL = 'https://apiperu.dev/api/dni';
const API_TOKEN = process.env.APIPERU_API_TOKEN;

if (!API_TOKEN) {
  console.error('APIPERU_API_TOKEN no definido en .env.local');
}

export async function consultarDNI(dni, retries = 2) {
  // Validación básica
  if (!/^\d{8}$/.test(dni)) {
    throw new Error('DNI debe tener 8 dígitos numéricos');
  }

  let lastError;

  for (let i = 0; i <= retries; i++) {
    try {
      console.log(`[API Peru] Consultando DNI ${dni} (intento ${i + 1}/${retries + 1})`);
      
      const response = await axios.get(`${API_BASE_URL}/${dni}`, {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000,
        validateStatus: (status) => status < 500 // No lanzar error en 4xx
      });

      // Verificar status HTTP
      if (response.status === 404) {
        throw new Error('DNI no encontrado en RENIEC');
      }

      if (response.status === 401 || response.status === 403) {
        throw new Error('Token de API inválido o expirado');
      }

      if (response.status !== 200) {
        throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
      }

      // Verificar estructura de respuesta
      const responseData = response.data;
      
      if (!responseData) {
        throw new Error('Respuesta vacía de la API');
      }

      // Verificar success flag
      if (responseData.success === false) {
        throw new Error(responseData.message || 'La API reportó un error');
      }

      // Normalizar datos (la API puede devolver data.data o directamente data)
      const rawData = responseData.data || responseData;

      // Validar que tengamos al menos el nombre
      if (!rawData.nombres) {
        throw new Error('Datos incompletos recibidos de la API');
      }

      // Normalizar campos (camelCase y snake_case)
      const datosNormalizados = {
        success: true,
        dni,
        nombres: rawData.nombres || '',
        apellidoPaterno: rawData.apellido_paterno || rawData.apellidoPaterno || '',
        apellidoMaterno: rawData.apellido_materno || rawData.apellidoMaterno || '',
        get nombreCompleto() {
          return `${this.nombres} ${this.apellidoPaterno} ${this.apellidoMaterno}`.trim();
        }
      };

      console.log(`[API Peru] DNI ${dni} consultado exitosamente`);
      return datosNormalizados;

    } catch (error) {
      lastError = error;
      const status = error.response?.status;

      // Log detallado del error
      console.error(`[API Peru] Error en intento ${i + 1}:`, {
        dni,
        status,
        message: error.message,
        data: error.response?.data
      });

      // No reintentar en errores 4xx (son definitivos)
      if (status && status >= 400 && status < 500) {
        throw error;
      }

      // Si es el último intento, lanzar el error
      if (i === retries) {
        throw error;
      }

      // Esperar antes del retry (backoff exponencial)
      const waitTime = 500 * (i + 1);
      console.log(`[API Peru] Reintentando en ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  // Si llegamos aquí, todos los intentos fallaron
  throw lastError || new Error('Error desconocido al consultar DNI');
}

// Validar formato DNI peruano
export function validarDNI(dni) {
  if (!dni) return false;
  return /^\d{8}$/.test(String(dni).trim());
}