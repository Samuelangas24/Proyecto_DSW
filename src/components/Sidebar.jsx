import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col">
      <div className="p-6 text-xl font-bold border-b border-slate-800">
        OFICIALÍA DSW
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <Link to="/" className="block p-3 rounded hover:bg-blue-600 transition">
          📊 Dashboard
        </Link>
        <Link to="/registro" className="block p-3 rounded hover:bg-slate-800 transition">
          ➕ Nuevo Registro
        </Link>
        <Link to="/bandeja" className="block p-3 rounded hover:bg-slate-800 transition">
          📥 Bandeja de Entrada
        </Link>
        <Link to="/departamentos" className="block p-3 rounded hover:bg-slate-800 transition">
          🏢 Departamentos
        </Link>
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