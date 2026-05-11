import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Reportes = () => {
  const [stats, setStats] = useState(null);
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      // Obtener estadísticas
      const statsRes = await axios.get('http://localhost:3001/reportes');
      setStats(statsRes.data.data);

      // Obtener todos los registros
      const registrosRes = await axios.get('http://localhost:3001/bandeja');
      setRegistros(registrosRes.data.data || []);
    } catch (err) {
      console.error('Error cargando reportes', err);
      setStats(null);
      setRegistros([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  // Función para descargar CSV
  const descargarCSV = () => {
    if (registros.length === 0) {
      alert('No hay datos para descargar');
      return;
    }

    // Encabezados
    const headers = ['Folio', 'Remitente', 'Asunto', 'Estado', 'Departamento', 'Fecha'];
    
    // Datos
    const rows = registros.map(r => [
      r.folio || 'N/A',
      r.remitente || 'N/A',
      r.asunto || 'N/A',
      r.estado || 'N/A',
      r.departamento?.nombre || 'N/A',
      new Date(r.createdAt).toLocaleDateString('es-ES')
    ]);

    // Crear CSV
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(cell => `"${String(cell).replace(/"/g, '""')}"` ).join(',') + '\n';
    });

    // Descargar
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reportes-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función para descargar PDF (formato simple)
  const descargarPDF = () => {
    if (registros.length === 0) {
      alert('No hay datos para descargar');
      return;
    }

    const registrosFiltrados = filtroEstado 
      ? registros.filter(r => r.estado === filtroEstado)
      : registros;

    let contenido = 'REPORTE DE DOCUMENTOS\n';
    contenido += '=' .repeat(80) + '\n';
    contenido += `Fecha: ${new Date().toLocaleDateString('es-ES')}\n`;
    contenido += `Total de registros: ${registrosFiltrados.length}\n`;
    contenido += '='.repeat(80) + '\n\n';

    registrosFiltrados.forEach((r, idx) => {
      contenido += `${idx + 1}. Folio: ${r.folio}\n`;
      contenido += `   Remitente: ${r.remitente}\n`;
      contenido += `   Asunto: ${r.asunto}\n`;
      contenido += `   Estado: ${r.estado}\n`;
      contenido += `   Fecha: ${new Date(r.createdAt).toLocaleDateString('es-ES')}\n`;
      contenido += '-'.repeat(80) + '\n\n';
    });

    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte-documentos-${new Date().toISOString().split('T')[0]}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const registrosFiltrados = filtroEstado 
    ? registros.filter(r => r.estado === filtroEstado)
    : registros;

  const estados = [...new Set(registros.map(r => r.estado))].filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">📈 Reportes y Análisis</h1>
        <p className="text-slate-600">Visualiza y descarga estadísticas del sistema</p>
      </div>

      {/* Tarjetas de Estadísticas */}
      {!loading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg">
            <div className="text-4xl font-bold">{stats.total}</div>
            <div className="text-sm opacity-90">Total de Documentos</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow-lg">
            <div className="text-4xl font-bold">{stats.byEstado?.['Recibido'] || 0}</div>
            <div className="text-sm opacity-90">Recibidos</div>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-lg p-6 shadow-lg">
            <div className="text-4xl font-bold">{stats.byEstado?.['En Proceso'] || 0}</div>
            <div className="text-sm opacity-90">En Proceso</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
            <div className="text-4xl font-bold">{stats.byEstado?.['Archivado'] || 0}</div>
            <div className="text-sm opacity-90">Archivados</div>
          </div>
        </div>
      )}

      {/* Opciones de Descarga */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">💾 Descargar Reportes</h2>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={descargarCSV}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            📊 Descargar como CSV
          </button>
          <button 
            onClick={descargarPDF}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            📄 Descargar como TXT
          </button>
          <button 
            onClick={fetchData}
            disabled={loading}
            className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      {/* Tabla de Documentos */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-800">📋 Listado de Documentos</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Filtrar por Estado:</label>
            <select 
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="border-2 border-slate-300 rounded-lg p-2 focus:outline-none focus:border-blue-500"
            >
              <option value="">Todos los estados ({registros.length})</option>
              {estados.map(estado => (
                <option key={estado} value={estado}>
                  {estado} ({registros.filter(r => r.estado === estado).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center p-8 text-slate-500">⏳ Cargando datos...</div>
        ) : registrosFiltrados.length === 0 ? (
          <div className="text-center p-8 text-slate-500">📭 No hay documentos para mostrar</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b-2 border-slate-300">
                <tr>
                  <th className="p-4 font-bold text-slate-700">Folio</th>
                  <th className="p-4 font-bold text-slate-700">Remitente</th>
                  <th className="p-4 font-bold text-slate-700">Asunto</th>
                  <th className="p-4 font-bold text-slate-700">Estado</th>
                  <th className="p-4 font-bold text-slate-700">Departamento</th>
                  <th className="p-4 font-bold text-slate-700">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {registrosFiltrados.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-semibold text-blue-600">{r.folio}</td>
                    <td className="p-4">{r.remitente}</td>
                    <td className="p-4 truncate max-w-xs">{r.asunto}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold 
                        ${r.estado === 'Recibido' ? 'bg-blue-100 text-blue-700' : 
                          r.estado === 'En Proceso' ? 'bg-amber-100 text-amber-700' : 
                          r.estado === 'Completado' ? 'bg-green-100 text-green-700' : 
                          'bg-slate-100 text-slate-700'}`}>
                        {r.estado}
                      </span>
                    </td>
                    <td className="p-4">{r.departamento?.nombre || 'N/A'}</td>
                    <td className="p-4 text-xs text-slate-500">{new Date(r.createdAt).toLocaleDateString('es-ES')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resumen por Estado */}
      {!loading && stats && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">📊 Resumen por Estado</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.byEstado || {}).map(([estado, cantidad]) => (
              <div key={estado} className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-lg border border-slate-200">
                <div className="text-2xl font-bold text-slate-800">{cantidad}</div>
                <div className="text-sm text-slate-600">{estado}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Remitentes Principales */}
      {!loading && stats && Object.keys(stats.byRemitente).length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">👥 Top Remitentes</h2>
          <div className="space-y-2">
            {Object.entries(stats.byRemitente)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([remitente, cantidad]) => (
                <div key={remitente} className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-transparent rounded-lg border border-blue-100">
                  <span className="font-medium text-slate-700">{remitente}</span>
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">{cantidad}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reportes;
