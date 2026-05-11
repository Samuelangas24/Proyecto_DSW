import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  let role = null;
  try {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      role = payload.role;
    }
  } catch (e) {
    role = null;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
    window.location.reload();
  };

  return (
    <header className="bg-slate-50 border-b border-slate-200 px-6 py-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Sistema de Oficialía de Partes</h1>
          <p className="text-sm text-slate-600">Panel administrativo para control de documentos y turnos.</p>
        </div>
        <div className="flex items-center gap-4 text-slate-700">
          <div className="text-right">
            <p className="font-semibold">{token ? (JSON.parse(atob(token.split('.')[1])).name || JSON.parse(atob(token.split('.')[1])).email || 'Oficialía') : 'Invitado'}</p>
            <p className="text-xs text-slate-500">{role ? role.toUpperCase() : 'Sin sesión'}</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3 py-2 shadow-sm">
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