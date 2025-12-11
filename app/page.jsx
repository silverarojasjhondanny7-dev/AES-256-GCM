'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Navbar */}
      <nav className="bg-gray-800/50 backdrop-blur-md border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">Sistema DNI Perú</span>
            </div>
            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <Link href="/dashboard">
                  <button className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition">
                    Dashboard
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <button className="px-6 py-2 text-gray-300 font-semibold hover:bg-gray-700 rounded-lg transition">
                      Iniciar Sesión
                    </button>
                  </Link>
                  <Link href="/register">
                    <button className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition">
                      Registrarse
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-5">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-gray-800 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-700">
            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-gray-300 font-medium text-sm">Seguridad AES-256-GCM</span>
          </div>

          {/* Título */}
          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
            Sistema de Consulta<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              DNI Peruano
            </span>
          </h1>

          <p className="text-base text-gray-300 max-w-xl mx-auto">
            Consulta y almacena información de DNI de forma segura con cifrado de grado militar.
            Integrado con la API oficial de RENIEC.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link href={isLoggedIn ? "/dashboard" : "/register"}>
              <button className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold text-sm hover:from-indigo-700 hover:to-purple-700 transition transform hover:scale-105 shadow-xl shadow-indigo-500/30">
                {isLoggedIn ? "Ir al Dashboard" : "Comenzar Gratis"}
              </button>
            </Link>
            <a href="#features">
              <button className="px-6 py-2.5 bg-gray-800 text-white rounded-lg font-semibold text-sm hover:bg-gray-700 transition border border-gray-700">
                Ver Características
              </button>
            </a>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:bg-gray-750 transition">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Seguridad Máxima</h3>
            <p className="text-gray-400 text-sm">
              Cifrado AES-256-GCM. Tus datos están protegidos con el mismo nivel de seguridad que usan los bancos.
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:bg-gray-750 transition">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Consultas Rápidas</h3>
            <p className="text-gray-400 text-sm">
              Acceso instantáneo a la API de RENIEC. Resultados en segundos con información verificada.
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:bg-gray-750 transition">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Historial Completo</h3>
            <p className="text-gray-400 text-sm">
              Guarda y accede a todas tus consultas. Organiza y gestiona tu información de forma eficiente.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800/50 backdrop-blur-md border-t border-gray-700 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 Sistema DNI Perú. Integrado con API RENIEC oficial.
          </p>
        </div>
      </footer>
    </div>
  );
}