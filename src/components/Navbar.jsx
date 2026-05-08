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
    <header className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-slate-800">Sistema de Gestión Documental</h1>
        <div className="flex items-center space-x-4">
          {token ? (
            <>
              <span className="text-sm text-slate-600">Usuario</span>
              {role === 'admin' && (
                <Link to="/register" className="text-slate-600 hover:text-slate-800">Nuevo usuario</Link>
              )}
              <button onClick={handleLogout} className="text-slate-500 hover:text-slate-700">Salir</button>
            </>
          ) : (
            <Link to="/login" className="text-slate-600 hover:text-slate-800">Iniciar sesión</Link>
          )}
          <button className="text-slate-500 hover:text-slate-700">⚙️</button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;