import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose, onLogout }) => {
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

  const linkClass = 'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white';

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-full w-[19rem] max-w-[86vw] flex-col overflow-hidden border-r border-white/10 bg-slate-950/90 text-white shadow-2xl shadow-slate-950/30 backdrop-blur-2xl transition-transform duration-300 ease-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      aria-hidden={!isOpen}
    >
      <div className="flex items-start justify-between gap-4 border-b border-white/10 p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Instituto Educativo Innovacion</p>
          <h2 className="mt-3 text-2xl font-semibold">Sistema de Oficialia</h2>
          <p className="mt-1 text-xs text-slate-500">Panel administrativo</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar menu"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl leading-none text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          x
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-6 text-sm">
        <div className="space-y-1">
          <p className="px-4 pb-2 text-[10px] uppercase tracking-[0.2em] text-slate-500">Navegacion</p>
          <Link to="/" onClick={onClose} className={linkClass}>
            <span>Inicio</span>
          </Link>
          {(userRole === 'administrador' || userRole === 'oficialia') && (
            <Link to="/registro" onClick={onClose} className={linkClass}>
              <span>Nuevo Registro</span>
            </Link>
          )}
          <Link to="/bandeja" onClick={onClose} className={linkClass}>
            <span>Bandeja de Entrada</span>
          </Link>
          <Link to="/reportes" onClick={onClose} className={linkClass}>
            <span>Reportes</span>
          </Link>
        </div>

        {userRole === 'administrador' && (
          <div className="mt-6 space-y-1">
            <p className="px-4 pb-2 text-[10px] uppercase tracking-[0.2em] text-slate-500">Administracion</p>
            <Link to="/departamentos" onClick={onClose} className={linkClass}>
              <span>Departamentos</span>
            </Link>
            <Link to="/register" onClick={onClose} className={linkClass}>
              <span>Crear Usuario</span>
            </Link>
          </div>
        )}
      </nav>

      <div className="space-y-3 border-t border-white/10 bg-slate-950/70 px-6 py-4 text-xs text-slate-500">
        <div>
          <p className="font-semibold text-slate-200">Rol actual</p>
          <p>{userRole ? userRole.toUpperCase() : 'INVITADO'}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
        >
          Cerrar Sesion
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
