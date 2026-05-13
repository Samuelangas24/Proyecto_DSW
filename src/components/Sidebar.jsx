import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ onLogout }) => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Función simple para decodificar el JWT y obtener el rol
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payloadBase64 = token.split('.')[1];
        const decodedJson = atob(payloadBase64);
        const decoded = JSON.parse(decodedJson);
        setUserRole(decoded.role);
      } catch (e) {
        console.error('Error decodificando token', e);
      }
    }
  }, []);

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col shadow-lg">
      <div className="p-6 text-2xl font-bold border-b border-slate-700 bg-blue-600">
        🏛️ OFICIALÍA DSW
      </div>
      <div className="px-6 py-3 bg-slate-800 text-xs text-slate-300 font-medium border-b border-slate-700">
        <div>👤 Rol: {userRole ? userRole.toUpperCase() : 'Sin rol'}</div>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <Link to="/" className="block p-3 rounded hover:bg-blue-600 transition font-semibold">
          📊 Dashboard
        </Link>
        
        {/* Nuevo Registro - Visible para Administrador y Oficialía */}
        {(userRole === 'administrador' || userRole === 'oficialia') && (
          <Link to="/registro" className="block p-3 rounded hover:bg-green-600 transition font-semibold bg-green-700 bg-opacity-40">
            ➕ Nuevo Registro
          </Link>
        )}

        <Link to="/bandeja" className="block p-3 rounded hover:bg-blue-600 transition font-semibold">
          📥 Bandeja de Entrada
        </Link>
        
        {/* Gestión de Departamentos - Solo Administrador */}
        {userRole === 'administrador' && (
          <Link to="/departamentos" className="block p-3 rounded hover:bg-purple-600 transition font-semibold">
            🏢 Departamentos
          </Link>
        )}

        <Link to="/reportes" className="block p-3 rounded hover:bg-orange-600 transition font-semibold">
          📈 Reportes
        </Link>
      </nav>

      <div className="p-4 border-t border-slate-700 text-xs text-slate-400 space-y-2">
        <div>v1.0.0 - Equipo DSW</div>
        <button 
          onClick={onLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded transition font-semibold text-sm"
        >
          🚪 Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Sidebar;