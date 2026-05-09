import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
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
    <div className="w-64 bg-slate-900 text-white flex flex-col">
      <div className="p-6 text-xl font-bold border-b border-slate-800">
        OFICIALÍA DSW
      </div>
      <div className="px-6 py-2 bg-slate-800 text-xs text-slate-300 font-medium">
        Rol actual: {userRole ? userRole.toUpperCase() : 'Invitado'}
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <Link to="/" className="block p-3 rounded hover:bg-blue-600 transition">
          📊 Dashboard
        </Link>
        
        {/* Visible para Administrador y Oficialía */}
        {(userRole === 'administrador' || userRole === 'oficialia') && (
          <Link to="/registro" className="block p-3 rounded hover:bg-slate-800 transition">
            ➕ Nuevo Registro
          </Link>
        )}

        <Link to="/bandeja" className="block p-3 rounded hover:bg-slate-800 transition">
          📥 Bandeja de Entrada
        </Link>
        
        {/* Visible solo para Administrador */}
        {userRole === 'administrador' && (
          <Link to="/departamentos" className="block p-3 rounded hover:bg-slate-800 transition">
            🏢 Departamentos
          </Link>
        )}

        <Link to="/reportes" className="block p-3 rounded hover:bg-slate-800 transition">
          📈 Reportes
        </Link>
      </nav>
      <div className="p-4 border-t border-slate-800 text-sm text-slate-400">
        v1.0.0 - Equipo DSW
      </div>
    </div>
  );
};

export default Sidebar;