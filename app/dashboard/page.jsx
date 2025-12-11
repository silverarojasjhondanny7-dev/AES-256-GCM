'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FileText, User, Shield, Clock, CheckCircle, XCircle, Settings, LogOut, ChevronDown } from 'lucide-react';

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
                  <FileText size={20} strokeWidth={2} className="text-white" />
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
                <ChevronDown size={16} strokeWidth={2} className={`text-gray-400 transition-transform ml-2 ${showUserMenu ? 'rotate-180' : ''}`} />
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
                      <User size={16} strokeWidth={2} />
                      <span>Mi Perfil</span>
                    </button>
                    <button className="w-full text-left px-2.5 py-2 text-xs text-gray-300 hover:bg-gray-700 rounded-md transition flex items-center gap-3">
                      <Settings size={16} strokeWidth={2} />
                      <span>Configuración</span>
                    </button>
                  </div>
                  <div className="p-1.5 border-t border-gray-700">
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-2.5 py-2 text-xs text-red-400 hover:bg-red-900 hover:bg-opacity-30 rounded-md transition flex items-center gap-3"
                    >
                      <LogOut size={16} strokeWidth={2} />
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
                    <Search size={20} strokeWidth={2} className="text-white" />
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
                      <XCircle size={20} strokeWidth={2} className="text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-red-400 font-medium text-xs">Error en la consulta</p>
                        <p className="text-red-300 text-xs mt-0.5">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {successMessage && (
                  <div className="bg-emerald-500 bg-opacity-10 border border-emerald-500 border-opacity-50 rounded-lg p-3">
                    <div className="flex items-start gap-4">
                      <CheckCircle size={20} strokeWidth={2} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-emerald-400 font-medium text-xs">Consulta exitosa</p>
                        <p className="text-emerald-300 text-xs mt-0.5">{successMessage}</p>
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
                        <Search size={16} strokeWidth={2} />
                        <span>Buscar Información</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Resultado MEJORADO */}
            {resultado && (
              <div className="fade-in bg-gradient-to-br from-gray-800 to-gray-900 border border-emerald-500/30 rounded-xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <CheckCircle size={20} strokeWidth={2} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">Información Encontrada</h3>
                        <p className="text-emerald-100 text-xs mt-0.5">Datos verificados por RENIEC</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-white/20 px-3 py-1.5 rounded-lg">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span className="text-white text-xs font-medium">Verificado</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Nombre Completo - Destacado */}
                  <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-xl p-4 border border-indigo-500/30">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-indigo-600/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User size={20} strokeWidth={2} className="text-indigo-300" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-indigo-300 uppercase tracking-wider mb-1">Nombre Completo</p>
                        <p className="text-xl font-bold text-white">{resultado.nombreCompleto}</p>
                      </div>
                    </div>
                  </div>

                  {/* Grid de Detalles */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50 hover:border-purple-600/50 transition">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-purple-600/20 rounded flex items-center justify-center">
                          <User size={14} strokeWidth={2} className="text-purple-400" />
                        </div>
                        <p className="text-xs text-gray-400">Nombres</p>
                      </div>
                      <p className="text-sm font-semibold text-white">{resultado.nombres}</p>
                    </div>

                    <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50 hover:border-blue-600/50 transition">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-blue-600/20 rounded flex items-center justify-center">
                          <User size={14} strokeWidth={2} className="text-blue-400" />
                        </div>
                        <p className="text-xs text-gray-400">Ap. Paterno</p>
                      </div>
                      <p className="text-sm font-semibold text-white">{resultado.apellidoPaterno}</p>
                    </div>

                    <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50 hover:border-cyan-600/50 transition">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-cyan-600/20 rounded flex items-center justify-center">
                          <User size={14} strokeWidth={2} className="text-cyan-400" />
                        </div>
                        <p className="text-xs text-gray-400">Ap. Materno</p>
                      </div>
                      <p className="text-sm font-semibold text-white">{resultado.apellidoMaterno}</p>
                    </div>
                  </div>

                  {/* Footer con Seguridad */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                    <div className="flex items-center gap-2">
                      <Shield size={16} strokeWidth={2} className="text-emerald-400" />
                      <p className="text-xs text-gray-400">Cifrado AES-256-GCM</p>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock size={14} strokeWidth={2} />
                      <span className="text-xs">{new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
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
                    <Clock size={16} strokeWidth={2} className="text-indigo-400" />
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
                    <FileText size={40} strokeWidth={1.5} className="text-gray-600 mx-auto mb-2" />
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