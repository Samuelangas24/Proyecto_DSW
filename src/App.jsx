import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './page/Dashboard';
import Registro from './page/Registro';
import Bandeja from './page/Bandeja';
import Reportes from './page/Reportes';
import Login from './page/Login';
import RegisterUser from './page/RegisterUser';
import Departamentos from './page/Departamentos';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    closeSidebar();
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Cargando...</div>;
  }

  return (
    <Router>
      {isAuthenticated ? (
        <div className="app-shell relative h-screen overflow-hidden text-slate-900">
          <div className="animated-backdrop" aria-hidden="true">
            <span className="particle particle-one" />
            <span className="particle particle-two" />
            <span className="particle particle-three" />
            <span className="particle particle-four" />
          </div>

          <button
            type="button"
            aria-label="Cerrar menu lateral"
            onClick={closeSidebar}
            className={`fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${
              isSidebarOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
            }`}
          />

          <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} onLogout={handleLogout} />

          <div className="relative z-10 flex h-full min-w-0 flex-col overflow-hidden">
            <Navbar
              onMenuClick={() => setIsSidebarOpen((open) => !open)}
              isSidebarOpen={isSidebarOpen}
              onLogout={handleLogout}
            />
            <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/bandeja" element={<Bandeja />} />
                <Route path="/reportes" element={<Reportes />} />
                <Route path="/departamentos" element={<Departamentos />} />
                <Route path="/register" element={<RegisterUser />} />
                <Route path="/login" element={<Navigate to="/" />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </div>
      ) : (
        <div className="min-h-screen">
          <Routes>
            <Route path="/login" element={<Login onLoginSuccess={() => setIsAuthenticated(true)} />} />
            <Route path="/register" element={<RegisterUser />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      )}
    </Router>
  );
}

export default App;
