import React, { useState } from 'react';
import StatCard from '../components/StatCard';

const Dashboard = () => {
  // Aquí simulas los datos que vendrán del Backend (Node.js)
  const [stats] = useState({
    registrados: 14,
    pendientes: 5,
    archivados: 128
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Resumen del Día</h1>
      
      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Documentos Registrados" value={stats.registrados} color="bg-green-500" icon="📄" />
        <StatCard title="Pendientes de Turnar" value={stats.pendientes} color="bg-amber-500" icon="🔜" />
        <StatCard title="Total Archivados" value={stats.archivados} color="bg-slate-500" icon="📦" />
      </div>

      {/* Tabla de Documentos Recientes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b font-bold text-slate-700">Últimos Documentos</div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-600 text-sm uppercase">
            <tr>
              <th className="p-4">Folio</th>
              <th className="p-4">Remitente</th>
              <th className="p-4">Asunto</th>
              <th className="p-4">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr className="hover:bg-slate-50">
              <td className="p-4 font-medium">IDE-2024-001</td>
              <td className="p-4">Rectoría</td>
              <td className="p-4">Solicitud de becas...</td>
              <td className="p-4"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Recibido</span></td>
            </tr>
            {/* Aquí se mapearán los datos reales de la base de datos */}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;