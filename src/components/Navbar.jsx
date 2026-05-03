import React from 'react';

const Navbar = () => {
  return (
    <header className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-slate-800">Sistema de Gestión Documental</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-slate-600">Usuario: Admin</span>
          <button className="text-slate-500 hover:text-slate-700">⚙️</button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;