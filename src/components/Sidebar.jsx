import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
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
    <div className="w-72 bg-[#0f172a] text-white flex flex-col shadow-xl">
      <div className="p-6 border-b border-slate-800">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Instituto Educativo Innovación</p>
        <h2 className="mt-3 text-2xl font-semibold">Sistema de Oficialía</h2>
        <p className="mt-1 text-xs text-slate-500">Panel administrativo</p>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1 text-sm">
        <div className="space-y-1">
          <p className="px-4 pb-2 text-[10px] uppercase tracking-[0.2em] text-slate-500">Navegación</p>
          <Link to="/" className="block px-4 py-3 rounded-xl hover:bg-slate-800 transition flex items-center gap-3">
            <span>🏠</span>
            Inicio
          </Link>
          <Link to="/registro" className="block px-4 py-3 rounded-xl hover:bg-slate-800 transition flex items-center gap-3">
            <span>➕</span>
            Nuevo Registro
          </Link>
          <Link to="/bandeja" className="block px-4 py-3 rounded-xl hover:bg-slate-800 transition flex items-center gap-3">
            <span>📥</span>
            Bandeja de Entrada
          </Link>
          <Link to="/reportes" className="block px-4 py-3 rounded-xl hover:bg-slate-800 transition flex items-center gap-3">
            <span>📈</span>
            Reportes
          </Link>
        </div>

        <div className="mt-6 space-y-1">
          <p className="px-4 pb-2 text-[10px] uppercase tracking-[0.2em] text-slate-500">Administración</p>
          <Link to="/departamentos" className="block px-4 py-3 rounded-xl hover:bg-slate-800 transition flex items-center gap-3">
            <span>🏛️</span>
            Departamentos
          </Link>
          {userRole === 'administrador' && (
            <Link to="/register" className="block px-4 py-3 rounded-xl hover:bg-slate-800 transition flex items-center gap-3">
              <span>👤</span>
              Crear Usuario
            </Link>
          )}
        </div>
      </nav>

      <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 text-xs text-slate-500">
        <p className="font-semibold text-slate-200">Rol actual</p>
        <p>{userRole ? userRole.toUpperCase() : 'INVITADO'}</p>
      </div>
    </div>
  );
};

export default Sidebar;
