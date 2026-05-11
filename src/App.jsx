import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { useEffect, useState } from 'react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  return (
    <Router>
      {isAuthenticated ? (
        // Vista autenticada con Sidebar
        <div className="flex h-screen bg-slate-100">
          <Sidebar onLogout={() => setIsAuthenticated(false)} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Navbar onLogout={() => setIsAuthenticated(false)} />
            <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/bandeja" element={<Bandeja />} />
                <Route path="/reportes" element={<Reportes />} />
                <Route path="/departamentos" element={<Departamentos />} />
                <Route path="/register" element={<RegisterUser />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </div>
      ) : (
        // Vista sin autenticación - solo login
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center">
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