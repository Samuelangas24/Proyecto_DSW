import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './page/Dashboard';

function App() {
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
              {/* Aquí tus compañeros irán agregando sus rutas */}
              {/* <Route path="/registro" element={<Registro />} /> */}
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;