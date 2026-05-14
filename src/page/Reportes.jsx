import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import StatCard from '../components/StatCard';

const getDepartamentoNombre = (registro) => (
  registro.departamentoAsignado?.nombre ||
  registro.departamento?.nombre ||
  registro.departamento ||
  'Sin asignar'
);

const Reportes = () => {
  const [stats, setStats] = useState(null);
  const [registros, setRegistros] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    estadoDocumento: '',
    departamento: '',
    desde: '',
    hasta: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, registrosRes, departamentosRes] = await Promise.all([
        axios.get('http://localhost:3001/reportes'),
        axios.get('http://localhost:3001/bandeja', { params: { limite: 1000 } }),
        axios.get('http://localhost:3001/departamentos')
      ]);
      setStats(statsRes.data.data);
      setRegistros(registrosRes.data.data || []);
      setDepartamentos(departamentosRes.data.data || []);
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

  const filteredData = useMemo(() => {
    return registros.filter((registro) => {
      const fecha = new Date(registro.createdAt || registro.fecha);
      const deptoId = registro.departamentoAsignado?._id || registro.departamentoAsignado || '';
      const matchesEstado = filters.estadoDocumento ? registro.estado === filters.estadoDocumento : true;
      const matchesDepto = filters.departamento ? deptoId === filters.departamento : true;
      const matchesDesde = filters.desde ? fecha >= new Date(filters.desde) : true;
      const matchesHasta = filters.hasta ? fecha <= new Date(`${filters.hasta}T23:59:59`) : true;
      return matchesEstado && matchesDepto && matchesDesde && matchesHasta;
    });
  }, [registros, filters]);

  const estadoCounts = useMemo(() => {
    return registros.reduce((acc, registro) => {
      const estado = registro.estado || 'Desconocido';
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {});
  }, [registros]);

  const estados = useMemo(() => Object.keys(estadoCounts).sort(), [estadoCounts]);

  const exportRows = () => filteredData.map((registro) => ({
    folio: registro.folio || 'N/A',
    remitente: registro.remitente || 'N/A',
    asunto: registro.asunto || 'N/A',
    estado: registro.estado || 'N/A',
    departamento: getDepartamentoNombre(registro),
    fecha: registro.createdAt ? new Date(registro.createdAt).toLocaleDateString('es-ES') : 'N/A'
  }));

  const descargarCSV = () => {
    const rows = exportRows();
    if (rows.length === 0) {
      alert('No hay datos para descargar');
      return;
    }

    const headers = ['Folio', 'Remitente', 'Asunto', 'Estado', 'Departamento', 'Fecha'];
    const csvRows = rows.map((row) => [
      row.folio,
      row.remitente,
      row.asunto,
      row.estado,
      row.departamento,
      row.fecha
    ].map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','));

    const blob = new Blob([[headers.join(','), ...csvRows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reportes-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const descargarTXT = () => {
    const rows = exportRows();
    if (rows.length === 0) {
      alert('No hay datos para descargar');
      return;
    }

    let contenido = 'REPORTE DE DOCUMENTOS\n';
    contenido += '='.repeat(80) + '\n';
    contenido += `Fecha: ${new Date().toLocaleDateString('es-ES')}\n`;
    contenido += `Total de registros: ${rows.length}\n`;
    contenido += '='.repeat(80) + '\n\n';

    rows.forEach((row, index) => {
      contenido += `${index + 1}. Folio: ${row.folio}\n`;
      contenido += `   Remitente: ${row.remitente}\n`;
      contenido += `   Asunto: ${row.asunto}\n`;
      contenido += `   Estado: ${row.estado}\n`;
      contenido += `   Departamento: ${row.departamento}\n`;
      contenido += `   Fecha: ${row.fecha}\n`;
      contenido += '-'.repeat(80) + '\n\n';
    });

    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-documentos-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const descargarJSON = () => {
    const rows = exportRows();
    if (rows.length === 0) {
      alert('No hay datos para descargar');
      return;
    }

    const data = {
      generadoEl: new Date().toISOString(),
      filtros: filters,
      total: rows.length,
      estadisticas: stats,
      documentos: rows
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-dsw-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const maxCount = Math.max(...Object.values(estadoCounts), 1);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reportes y Analisis</h1>
          <p className="mt-2 text-slate-500">Visualiza, filtra y descarga estadisticas del sistema.</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="rounded-3xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <StatCard title="Total" value={stats?.total || registros.length} color="bg-emerald-500" icon="DOC" />
        <StatCard title="Recibidos" value={estadoCounts.Recibido || stats?.byEstado?.Recibido || 0} color="bg-sky-500" icon="IN" />
        <StatCard title="Turnados" value={estadoCounts.Turnado || stats?.byEstado?.Turnado || 0} color="bg-amber-500" icon="GO" />
        <StatCard title="Archivados" value={estadoCounts.Archivado || stats?.byEstado?.Archivado || 0} color="bg-slate-700" icon="OK" />
      </div>

      <div className="grid gap-4 rounded-3xl bg-white p-6 shadow lg:grid-cols-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Desde</label>
          <input
            type="date"
            value={filters.desde}
            onChange={(e) => setFilters((prev) => ({ ...prev, desde: e.target.value }))}
            className="w-full rounded-3xl border border-slate-200 px-4 py-3"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Hasta</label>
          <input
            type="date"
            value={filters.hasta}
            onChange={(e) => setFilters((prev) => ({ ...prev, hasta: e.target.value }))}
            className="w-full rounded-3xl border border-slate-200 px-4 py-3"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Departamento</label>
          <select
            value={filters.departamento}
            onChange={(e) => setFilters((prev) => ({ ...prev, departamento: e.target.value }))}
            className="w-full rounded-3xl border border-slate-200 px-4 py-3"
          >
            <option value="">Todos</option>
            {departamentos.map((depto) => <option key={depto._id} value={depto._id}>{depto.nombre}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Estado</label>
          <select
            value={filters.estadoDocumento}
            onChange={(e) => setFilters((prev) => ({ ...prev, estadoDocumento: e.target.value }))}
            className="w-full rounded-3xl border border-slate-200 px-4 py-3"
          >
            <option value="">Todos</option>
            {estados.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Resultados del Reporte</h2>
            <p className="text-sm text-slate-500">Total de registros: {filteredData.length}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setFilters({ estadoDocumento: '', departamento: '', desde: '', hasta: '' })} className="rounded-3xl border border-slate-200 px-5 py-3 text-slate-700 hover:bg-slate-50">Limpiar Filtros</button>
            <button onClick={descargarCSV} className="rounded-3xl bg-emerald-600 px-5 py-3 text-white hover:bg-emerald-700">CSV</button>
            <button onClick={descargarTXT} className="rounded-3xl bg-red-600 px-5 py-3 text-white hover:bg-red-700">TXT</button>
            <button onClick={descargarJSON} className="rounded-3xl bg-purple-600 px-5 py-3 text-white hover:bg-purple-700">JSON</button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Cargando datos...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs uppercase text-slate-600">
                <tr>
                  <th className="p-4">Folio</th>
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Remitente</th>
                  <th className="p-4">Asunto</th>
                  <th className="p-4">Departamento</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Dias</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-6 text-center text-slate-500">No hay registros que coincidan con los filtros.</td>
                  </tr>
                ) : (
                  filteredData.map((row) => (
                    <tr key={row._id || row.folio} className="transition-colors hover:bg-slate-50">
                      <td className="p-4 font-medium text-slate-900">{row.folio}</td>
                      <td className="p-4 text-slate-500">{new Date(row.createdAt || row.fecha).toLocaleDateString()}</td>
                      <td className="p-4">{row.remitente}</td>
                      <td className="max-w-[22rem] truncate p-4">{row.asunto}</td>
                      <td className="p-4">{getDepartamentoNombre(row)}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          row.estado === 'Recibido' ? 'bg-sky-100 text-sky-700' :
                          row.estado === 'Turnado' ? 'bg-amber-100 text-amber-700' :
                          row.estado === 'Atendido' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {row.estado}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">{Math.max(0, Math.floor((new Date() - new Date(row.createdAt || row.fecha)) / (1000 * 60 * 60 * 24)))}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-3xl bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold">Distribucion por Estado</h3>
          <div className="space-y-4">
            {Object.entries(estadoCounts).map(([estado, count]) => (
              <div key={estado}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{estado}</span>
                  <span className="text-slate-500">{count}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-slate-900" style={{ width: `${(count / maxCount) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold">Top Remitentes</h3>
          {stats?.byRemitente && Object.keys(stats.byRemitente).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(stats.byRemitente)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([remitente, cantidad]) => (
                  <div key={remitente} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <span className="font-medium text-slate-700">{remitente}</span>
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-sm font-bold text-white">{cantidad}</span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Sin remitentes para mostrar.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reportes;
