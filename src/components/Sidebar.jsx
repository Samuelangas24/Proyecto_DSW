import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose }) => {
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

  const linkClass = "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white";

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-full w-[19rem] max-w-[86vw] flex-col overflow-hidden border-r border-white/10 bg-slate-950/90 text-white shadow-2xl shadow-slate-950/30 backdrop-blur-2xl transition-transform duration-300 ease-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      aria-hidden={!isOpen}
    >
      <div className="flex items-start justify-between gap-4 border-b border-white/10 p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Instituto Educativo Innovación</p>
          <h2 className="mt-3 text-2xl font-semibold">Sistema de Oficialía</h2>
          <p className="mt-1 text-xs text-slate-500">Panel administrativo</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar menú"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl leading-none text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          ×
        </button>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1 text-sm">
        <div className="space-y-1">
          <p className="px-4 pb-2 text-[10px] uppercase tracking-[0.2em] text-slate-500">Navegación</p>
          <Link to="/" onClick={onClose} className={linkClass}>
            <span>🏠</span>
            Inicio
          </Link>
          <Link to="/registro" onClick={onClose} className={linkClass}>
            <span>➕</span>
            Nuevo Registro
          </Link>
          <Link to="/bandeja" onClick={onClose} className={linkClass}>
            <span>📥</span>
            Bandeja de Entrada
          </Link>
          <Link to="/reportes" onClick={onClose} className={linkClass}>
            <span>📈</span>
            Reportes
          </Link>
        </div>

        <div className="mt-6 space-y-1">
          <p className="px-4 pb-2 text-[10px] uppercase tracking-[0.2em] text-slate-500">Administración</p>
          <Link to="/departamentos" onClick={onClose} className={linkClass}>
            <span>🏛️</span>
            Departamentos
          </Link>
          {userRole === 'administrador' && (
            <Link to="/register" onClick={onClose} className={linkClass}>
              <span>👤</span>
              Crear Usuario
            </Link>
          )}
        </div>
      </nav>

      <div className="border-t border-white/10 bg-slate-950/70 px-6 py-4 text-xs text-slate-500">
        <p className="font-semibold text-slate-200">Rol actual</p>
        <p>{userRole ? userRole.toUpperCase() : 'INVITADO'}</p>
      </div>
    </aside>
  );
};

export default Sidebar;
