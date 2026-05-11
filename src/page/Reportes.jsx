import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import StatCard from '../components/StatCard';

const sampleRows = [
  { folio: 'IEI-2023-0021', fecha: '2026-05-01', asunto: 'Solicitud de información presupuestal para el ciclo...', departamento: 'Sistemas', estado: 'Recibido', dias: 14 },
  { folio: 'IEI-2023-0020', fecha: '2026-05-02', asunto: 'Requerimiento de documentos fiscales', departamento: 'Finanzas', estado: 'Turnado', dias: 7 },
  { folio: 'IEI-2023-0019', fecha: '2026-05-03', asunto: 'Informe de nómina y seguimiento', departamento: 'Recursos Humanos', estado: 'Atendido', dias: 5 },
  { folio: 'IEI-2023-0018', fecha: '2026-05-04', asunto: 'Archivos administrativos', departamento: 'Oficialía', estado: 'Archivado', dias: 1 }
];

const Reportes = () => {
  const [registros, setRegistros] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [filters, setFilters] = useState({
    estadoDocumento: '',
    departamento: '',
    desde: '',
    hasta: ''
  });
  const [loading, setLoading] = useState(true);

  const fetchRegistros = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3001/bandeja');
      setRegistros(res.data.data || sampleRows);
    } catch (err) {
      console.error('Error cargando registros', err);
      setRegistros(sampleRows);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartamentos = async () => {
    try {
      const res = await axios.get('http://localhost:3001/departamentos');
      setDepartamentos(res.data.data || []);
    } catch (err) {
      console.error('Error cargando departamentos', err);
    }
  };

  useEffect(() => {
    fetchRegistros();
    fetchDepartamentos();
  }, []);

  const filteredData = useMemo(() => {
    let data = registros;
    
    if (filters.estadoDocumento) {
      data = data.filter(r => r.estado === filters.estadoDocumento);
    }
    if (filters.departamento) {
      data = data.filter(r => r.departamento === filters.departamento);
    }
    if (filters.desde) {
      data = data.filter(r => new Date(r.fecha || r.createdAt) >= new Date(filters.desde));
    }
    if (filters.hasta) {
      data = data.filter(r => new Date(r.fecha || r.createdAt) <= new Date(filters.hasta));
    }
    
    return data;
  }, [registros, filters]);

  const estadoCounts = useMemo(() => {
    const counts = { Recibido: 0, Turnado: 0, Atendido: 0, Archivado: 0 };
    registros.forEach(r => {
      if (counts.hasOwnProperty(r.estado)) counts[r.estado]++;
    });
    return counts;
  }, [registros]);

  const handleExportJSON = () => {
    const data = {
      generado: new Date().toLocaleString(),
      filtros: filters,
      total: filteredData.length,
      registros: filteredData
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Generar Reportes</h1>
          <p className="text-slate-500 mt-2">Filtra y exporta reportes de documentos por estado y departamento.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <StatCard title="Total" value={registros.length} color="bg-emerald-500" icon="📊" />
        <StatCard title="Recibidos" value={estadoCounts.Recibido} color="bg-sky-500" icon="📥" />
        <StatCard title="Turnados" value={estadoCounts.Turnado} color="bg-amber-500" icon="🔁" />
        <StatCard title="Archivados" value={estadoCounts.Archivado} color="bg-slate-700" icon="📦" />
      </div>

      <div className="bg-white rounded-3xl shadow p-6 grid gap-4 lg:grid-cols-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Desde</label>
          <input 
            type="date" 
            value={filters.desde}
            onChange={(e) => setFilters({...filters, desde: e.target.value})}
            className="w-full rounded-3xl border border-slate-200 px-4 py-3" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Hasta</label>
          <input 
            type="date"
            value={filters.hasta}
            onChange={(e) => setFilters({...filters, hasta: e.target.value})}
            className="w-full rounded-3xl border border-slate-200 px-4 py-3"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Departamento</label>
          <select 
            value={filters.departamento}
            onChange={(e) => setFilters({...filters, departamento: e.target.value})}
            className="w-full rounded-3xl border border-slate-200 px-4 py-3">
            <option value="">Todos</option>
            {[...new Set(registros.map(r => r.departamento))].map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Estado</label>
          <select 
            value={filters.estadoDocumento}
            onChange={(e) => setFilters({...filters, estadoDocumento: e.target.value})}
            className="w-full rounded-3xl border border-slate-200 px-4 py-3">
            <option value="">Todos</option>
            <option value="Recibido">Recibido</option>
            <option value="Turnado">Turnado</option>
            <option value="Atendido">Atendido</option>
            <option value="Archivado">Archivado</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Resultados del Reporte</h2>
            <p className="text-sm text-slate-500">Total de registros: {filteredData.length}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setFilters({estadoDocumento: '', departamento: '', desde: '', hasta: ''})}
              className="rounded-3xl border border-slate-200 px-5 py-3 text-slate-700 hover:bg-slate-50">Limpiar Filtros</button>
            <button 
              onClick={handleExportJSON}
              className="rounded-3xl bg-emerald-600 px-5 py-3 text-white hover:bg-emerald-700">↓ Exportar JSON</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
              <tr>
                <th className="p-4">Folio</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Asunto</th>
                <th className="p-4">Departamento</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Días</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-slate-500">No hay registros que coincidan con los filtros.</td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.folio} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-900">{row.folio}</td>
                    <td className="p-4 text-slate-500">{new Date(row.fecha || row.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 truncate max-w-[22rem]">{row.asunto}</td>
                    <td className="p-4">{row.departamento}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        row.estado === 'Recibido' ? 'bg-sky-100 text-sky-700' :
                        row.estado === 'Turnado' ? 'bg-amber-100 text-amber-700' :
                        row.estado === 'Atendido' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>{row.estado}</span>
                    </td>
                    <td className="p-4 text-slate-500">{row.dias || Math.floor((new Date() - new Date(row.createdAt || row.fecha)) / (1000*60*60*24))}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="bg-white rounded-3xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Gráfica de Distribución por Estado</h3>
          <svg viewBox="0 0 400 250" className="w-full">
            {/* Eje */}
            <line x1="50" y1="200" x2="380" y2="200" stroke="#d1d5db" strokeWidth="2" />
            <line x1="50" y1="20" x2="50" y2="200" stroke="#d1d5db" strokeWidth="2" />
            
            {/* Barras */}
            {Object.entries(estadoCounts).map(([estado, count], idx) => {
              const width = 60;
              const x = 70 + idx * 80;
              const maxHeight = 160;
              const height = (count / Math.max(...Object.values(estadoCounts), 1)) * maxHeight;
              const colors = {
                'Recibido': '#0ea5e9',
                'Turnado': '#f59e0b',
                'Atendido': '#10b981',
                'Archivado': '#64748b'
              };
              return (
                <g key={estado}>
                  <rect x={x} y={200 - height} width={width} height={height} fill={colors[estado]} opacity="0.8" rx="4" />
                  <text x={x + width/2} y="220" textAnchor="middle" fontSize="12" fill="#475569">{estado}</text>
                  <text x={x + width/2} y={185 - height} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1e293b">{count}</text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-3xl shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Resumen por Estado</h3>
            {Object.entries(estadoCounts).map(([estado, count]) => {
              const total = registros.length;
              const percent = total > 0 ? (count / total * 100).toFixed(1) : 0;
              const colors = {
                'Recibido': 'bg-sky-500',
                'Turnado': 'bg-amber-500',
                'Atendido': 'bg-emerald-500',
                'Archivado': 'bg-slate-700'
              };
              return (
                <div key={estado} className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{estado}</span>
                    <span className="text-slate-500">{count} ({percent}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full ${colors[estado]}`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reportes;
