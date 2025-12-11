// middleware.js - Protección de rutas
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Obtener el path actual
  const { pathname } = request.nextUrl;

  // Rutas públicas (no requieren autenticación)
  const publicPaths = ['/', '/login', '/register'];
  
  // Si es ruta pública, permitir acceso
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Para rutas protegidas, solo verificar en el cliente
  // (Next.js no puede acceder a localStorage en el servidor)
  return NextResponse.next();
}

// Configurar qué rutas debe interceptar el middleware
export const config = {
  matcher: [
    /*
     * Interceptar todas las rutas excepto:
     * - api (API routes)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (favicon)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};