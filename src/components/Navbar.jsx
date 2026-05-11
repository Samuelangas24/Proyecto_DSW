import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Navbar = ({ onLogout }) => {
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
    if (onLogout) onLogout();
  };

  return (
    <header className="bg-white shadow-md border-b px-6 py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">📋 Sistema de Gestión Documental</h1>
        <div className="flex items-center space-x-6">
          {token && (
            <>
              <span className="text-sm font-medium text-slate-700">👤 Usuario Autenticado</span>
              {role === 'administrador' && (
                <Link 
                  to="/register" 
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition text-sm font-semibold"
                >
                  ➕ Nuevo Usuario
                </Link>
              )}
              <button 
                onClick={handleLogout} 
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition text-sm font-semibold"
              >
                🚪 Salir
              </button>
            </>
          )}
          <button className="text-slate-600 hover:text-slate-800 text-xl">⚙️</button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;