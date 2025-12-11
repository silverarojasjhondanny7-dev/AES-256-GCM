'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [dni, setDni] = useState('');
  const [resultado, setResultado] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/dni/obtener/historial', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setHistorial(data.registros || []);
      }
    } catch (err) {
      console.error('Error cargando historial:', err);
    }
  };

  const handleConsultar = async () => {
    setError('');
    setSuccessMessage('');
    setResultado(null);
    setLoading(true);

    const token = localStorage.getItem('token');

    try {
      const res = await fetch('/api/dni/consultar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ dni }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al consultar DNI');
      }

      setResultado(data.datos);
      setSuccessMessage('DNI consultado y almacenado exitosamente');
      setDni('');
      cargarHistorial();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .spinner {
            animation: spin 1s linear infinite;
          }
        `}</style>
        <div className="text-center">
          <svg className="spinner mx-auto w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-400 text-xs mt-2">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>

      {/* Navbar Compacto */}
      <nav className="bg-gray-800 border-b border-gray-700 backdrop-blur-sm bg-opacity-95 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-800"></div>
              </div>
              <div>
                <h1 className="text-sm font-bold text-white">DNI Perú</h1>
                <p className="text-xs text-gray-500 leading-none">Sistema de Consultas</p>
              </div>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg transition border border-gray-600"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-sm">
                    {(user.fullName || user.email).charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-white leading-tight">
                    {user.fullName || user.email.split('@')[0]}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                </div>
                <svg className="w-4 h-4 text-gray-400 transition-transform ml-2" style={{transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="fade-in absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 overflow-hidden z-50">
                  <div className="p-3 border-b border-gray-700">
                    <p className="text-xs font-semibold text-white">{user.fullName || 'Usuario'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                  </div>
                  <div className="p-1.5">
                    <button className="w-full text-left px-2.5 py-2 text-xs text-gray-300 hover:bg-gray-700 rounded-md transition flex items-center gap-3">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Mi Perfil</span>
                    </button>
                    <button className="w-full text-left px-2.5 py-2 text-xs text-gray-300 hover:bg-gray-700 rounded-md transition flex items-center gap-3">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Configuración</span>
                    </button>
                  </div>
                  <div className="p-1.5 border-t border-gray-700">
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-2.5 py-2 text-xs text-red-400 hover:bg-red-900 hover:bg-opacity-30 rounded-md transition flex items-center gap-3"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Panel de Consulta */}
          <div className="lg:col-span-2 space-y-5">
            {/* Card Principal */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-base font-bold text-white">Consultar DNI</h2>
                    <p className="text-indigo-200 text-xs mt-0.5">Ingresa un número de documento válido</p>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-3">
                {error && (
                  <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-50 rounded-lg p-3">
                    <div className="flex items-start gap-4">
                      <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-red-400 font-medium text-xs">Error en la consulta</p>
                        <p className="text-red-300 text-xs mt-0.5">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {successMessage && (
                  <div className="bg-green-500 bg-opacity-10 border border-green-500 border-opacity-50 rounded-lg p-3">
                    <div className="flex items-start gap-4">
                      <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-green-400 font-medium text-xs">Consulta exitosa</p>
                        <p className="text-green-300 text-xs mt-0.5">{successMessage}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2.5">
                  <label className="block">
                    <span className="text-xs font-medium text-gray-300 mb-1.5 block">Número de DNI</span>
                    <input
                      type="text"
                      value={dni}
                      onChange={(e) => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                      onKeyPress={(e) => e.key === 'Enter' && dni.length === 8 && !loading && handleConsultar()}
                      placeholder="Ingrese 8 dígitos"
                      maxLength={8}
                      className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition placeholder-gray-500 text-base font-mono"
                    />
                    <span className="text-xs text-gray-500 mt-1 block">{dni.length}/8 dígitos</span>
                  </label>

                  <button
                    onClick={handleConsultar}
                    disabled={loading || dni.length !== 8}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-2.5 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition duration-200 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm"
                  >
                    {loading ? (
                      <>
                        <svg className="spinner w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Consultando...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span>Buscar Información</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Resultado */}
            {resultado && (
              <div className="fade-in bg-gray-800 border border-green-500 border-opacity-30 rounded-xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-3.5">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-base font-bold text-white">Información Encontrada</h3>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div className="bg-gray-700 rounded-lg p-3 border border-gray-600">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Nombre Completo</p>
                    <p className="text-lg font-bold text-white">{resultado.nombreCompleto}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="bg-gray-700 rounded-lg p-2.5 border border-gray-600">
                      <p className="text-xs text-gray-400 mb-0.5">Nombres</p>
                      <p className="text-xs font-semibold text-white">{resultado.nombres}</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-2.5 border border-gray-600">
                      <p className="text-xs text-gray-400 mb-0.5">Ap. Paterno</p>
                      <p className="text-xs font-semibold text-white">{resultado.apellidoPaterno}</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-2.5 border border-gray-600">
                      <p className="text-xs text-gray-400 mb-0.5">Ap. Materno</p>
                      <p className="text-xs font-semibold text-white">{resultado.apellidoMaterno}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-2 border-t border-gray-700">
                    <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <p className="text-xs text-gray-400">Almacenado con cifrado AES-256-GCM</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Historial Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl sticky top-20">
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-sm font-bold text-white">Historial</h2>
                  </div>
                  <span className="bg-indigo-500 bg-opacity-20 text-indigo-400 px-2 py-0.5 rounded-full text-xs font-semibold">
                    {historial.length}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Consultas recientes</p>
              </div>

              <div className="p-2.5 max-h-[calc(100vh-220px)] overflow-y-auto space-y-2">
                {historial.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-10 h-10 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-400 text-xs font-medium">Sin consultas</p>
                    <p className="text-gray-600 text-xs mt-0.5">Realiza tu primera búsqueda</p>
                  </div>
                ) : (
                  historial.map((item, index) => (
                    <div
                      key={item.id}
                      className="bg-gray-700 hover:bg-gray-650 border border-gray-600 rounded-lg p-3 transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate group-hover:text-indigo-400 transition">
                            {item.nombreCompleto}
                          </p>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">{item.dni}</p>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-600">
                        <p className="text-xs text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString('es-PE', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}