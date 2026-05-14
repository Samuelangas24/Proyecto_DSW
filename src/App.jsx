import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './page/Dashboard';
import Registro from './page/Registro';
import Bandeja from './page/Bandeja';
import Reportes from './page/Reportes';
import Login from './page/Login';
import RegisterUser from './page/RegisterUser';
import Departamentos from './page/Departamentos';
import axios from 'axios';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, []);

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <Router>
      <div className="app-shell relative h-screen overflow-hidden text-slate-900">
        <div className="animated-backdrop" aria-hidden="true">
          <span className="particle particle-one" />
          <span className="particle particle-two" />
          <span className="particle particle-three" />
          <span className="particle particle-four" />
        </div>

        <button
          type="button"
          aria-label="Cerrar menú lateral"
          onClick={closeSidebar}
          className={`fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${
            isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        />

        {/* Lado Izquierdo: Menú */}
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

        {/* Lado Derecho: Contenido */}
        <div className="relative z-10 flex h-full min-w-0 flex-col overflow-hidden">
          <Navbar onMenuClick={() => setIsSidebarOpen((open) => !open)} isSidebarOpen={isSidebarOpen} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              {/* Rutas principales */}
              <Route path="/registro" element={<Registro />} />
              <Route path="/bandeja" element={<Bandeja />} />
              <Route path="/reportes" element={<Reportes />} />
              <Route path="/departamentos" element={<Departamentos />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<RegisterUser />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
