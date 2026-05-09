import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './page/Dashboard';
import Registro from './page/Registro';
import Bandeja from './page/Bandeja';
import Reportes from './page/Reportes';
import Login from './page/Login';
import RegisterUser from './page/RegisterUser';
import axios from 'axios';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, []);
  return (
    <Router>
      <div className="flex h-screen bg-slate-100">
        {/* Lado Izquierdo: Menú */}
        <Sidebar />

        {/* Lado Derecho: Contenido */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              {/* Rutas principales */}
              <Route path="/registro" element={<Registro />} />
              <Route path="/bandeja" element={<Bandeja />} />
              <Route path="/reportes" element={<Reportes />} />
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