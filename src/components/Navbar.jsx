import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Navbar = ({ onMenuClick, isSidebarOpen }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  let role = null;
  let userName = 'Invitado';
  try {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      role = payload.role;
      userName = payload.name || payload.email || 'Oficialía';
    }
  } catch (e) {
    role = null;
    userName = 'Invitado';
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
    window.location.reload();
  };

  return (
    <header className="glass-panel mx-3 mt-3 rounded-2xl border px-4 py-4 shadow-lg sm:mx-6 sm:mt-6 sm:px-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label={isSidebarOpen ? 'Ocultar menú lateral' : 'Mostrar menú lateral'}
            aria-expanded={isSidebarOpen}
            className="group inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-white/70 text-slate-800 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            <span className="flex h-4 w-5 flex-col justify-between">
              <span className={`h-0.5 rounded-full bg-current transition duration-300 ${isSidebarOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
              <span className={`h-0.5 rounded-full bg-current transition duration-300 ${isSidebarOpen ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`h-0.5 rounded-full bg-current transition duration-300 ${isSidebarOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
            </span>
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-950 sm:text-xl">Sistema de Oficialía de Partes</h1>
            <p className="text-sm text-slate-600">Panel administrativo para control de documentos y turnos.</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-slate-700">
          <div className="hidden text-right sm:block">
            <p className="font-semibold">{userName}</p>
            <p className="text-xs text-slate-500">{role ? role.toUpperCase() : 'Sin sesión'}</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-2 shadow-sm backdrop-blur">
            <span>👤</span>
            {token ? (
              <button onClick={handleLogout} className="text-sm text-slate-500 hover:text-slate-900">Cerrar sesión</button>
            ) : (
              <Link to="/login" className="text-sm text-slate-500 hover:text-slate-900">Iniciar sesión</Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
