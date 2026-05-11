import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const Bandeja = () => {
  const [registros, setRegistros] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    folio: '',
    fecha: '',
    estado: '',
    departamento: ''
  });

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [formTurno, setFormTurno] = useState({ estadoNuevo: '', departamentoDestino: '', observaciones: '' });
  const [actionStatus, setActionStatus] = useState(null);

  const fetchRegistros = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3001/bandeja');
      setRegistros(res.data.data || []);
    } catch (err) {
      console.error('Error cargando bandeja', err);
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

  const filteredRegistros = useMemo(() => {
    return registros.filter((item) => {
      const matchesFolio = filters.folio ? item.folio.toLowerCase().includes(filters.folio.toLowerCase()) : true;
      const matchesEstado = filters.estado ? item.estado === filters.estado : true;
      const matchesDept = filters.departamento ? item.departamentoAsignado?.nombre === filters.departamento : true;
      const matchesFecha = filters.fecha ? new Date(item.createdAt).toISOString().slice(0, 10) === filters.fecha : true;
      return matchesFolio && matchesEstado && matchesDept && matchesFecha;
    });
  }, [registros, filters]);

  const paginatedRegistros = useMemo(() => {
    const start = (page - 1) * 5;
    return filteredRegistros.slice(start, start + 5);
  }, [filteredRegistros, page]);

  const abrirModal = async (doc) => {
    setSelectedDoc(doc);
    setFormTurno({ estadoNuevo: doc.estado, departamentoDestino: '', observaciones: '' });
    setActionStatus(null);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`http://localhost:3001/turnos/${doc._id}`, config);
      setHistorial(res.data.data || []);
    } catch (err) {
      console.error('Error cargando historial', err);
      setHistorial([]);
    }
  };

  const cerrarModal = () => {
    setSelectedDoc(null);
    setHistorial([]);
  };

  const handleTurnar = async (e) => {
    e.preventDefault();
    setActionStatus('enviando');
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('http://localhost:3001/turnos', {
        documentoId: selectedDoc._id,
        estadoNuevo: formTurno.estadoNuevo,
        departamentoDestino: formTurno.departamentoDestino || null,
        observaciones: formTurno.observaciones
      }, config);
      setActionStatus('ok');
      fetchRegistros();
      abrirModal({ ...selectedDoc, estado: formTurno.estadoNuevo });
      setFormTurno((prev) => ({ ...prev, observaciones: '' }));
    } catch (err) {
      console.error(err);
      setActionStatus({ error: err.response?.data?.error || 'Error al turnar' });
    }
  };

  const totalPages = Math.max(1, Math.ceil(filteredRegistros.length / 5));

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Bandeja de Entrada - Búsqueda Avanzada</h1>
          <p className="text-slate-500 mt-2">Filtra documentos por folio, fecha, estado o departamento.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-3xl bg-emerald-500/10 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total</p>
            <p className="text-2xl font-semibold text-slate-900">{registros.length}</p>
          </div>
          <div className="rounded-3xl bg-slate-800 text-white px-4 py-4">
            <p className="text-xs uppercase tracking-[0.2em]">Turnados</p>
            <p className="text-2xl font-semibold">{registros.filter((r) => r.estado === 'Turnado').length}</p>
          </div>
          <div className="rounded-3xl bg-amber-500/10 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Pendientes</p>
            <p className="text-2xl font-semibold text-slate-900">{registros.filter((r) => r.estado === 'Recibido').length}</p>
          </div>
          <div className="rounded-3xl bg-slate-100 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Archivados</p>
            <p className="text-2xl font-semibold text-slate-900">{registros.filter((r) => r.estado === 'Archivado').length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow p-6 space-y-6">
        <div className="grid gap-4 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Folio (Búsqueda Exacta)</label>
            <input
              value={filters.folio}
              onChange={(e) => setFilters((prev) => ({ ...prev, folio: e.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
              placeholder="Folio"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Rango de Fechas</label>
            <input
              type="date"
              value={filters.fecha}
              onChange={(e) => setFilters((prev) => ({ ...prev, fecha: e.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Estado del Documento</label>
            <select
              value={filters.estado}
              onChange={(e) => setFilters((prev) => ({ ...prev, estado: e.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            >
              <option value="">Todos</option>
              <option value="Recibido">Recibido</option>
              <option value="Turnado">Turnado</option>
              <option value="En Atención">En Atención</option>
              <option value="Atendido">Atendido</option>
              <option value="Archivado">Archivado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Departamento Responsable</label>
            <select
              value={filters.departamento}
              onChange={(e) => setFilters((prev) => ({ ...prev, departamento: e.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            >
              <option value="">Todos</option>
              {departamentos.map((d) => (
                <option key={d._id} value={d.nombre}>{d.nombre}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Resultados de la Búsqueda</h2>
            <p className="text-sm text-slate-500">Mostrando {filteredRegistros.length} documentos</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setFilters({ folio: '', fecha: '', estado: '', departamento: '' })} className="rounded-2xl border border-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-50">Limpiar</button>
            <button onClick={() => setPage(1)} className="rounded-2xl bg-slate-900 text-white px-4 py-2 hover:bg-slate-800">Aplicar</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
              <tr>
                <th className="p-4">Folio</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Remitente</th>
                <th className="p-4">Asunto</th>
                <th className="p-4">Departamento Actual</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Días Transcurridos</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRegistros.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-slate-500">No se encontraron documentos con esos filtros.</td>
                </tr>
              ) : (
                paginatedRegistros.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-semibold text-slate-900">{r.folio}</td>
                    <td className="p-4 text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">Oficio</td>
                    <td className="p-4">{r.remitente}</td>
                    <td className="p-4 truncate max-w-[18rem]">{r.asunto}</td>
                    <td className="p-4">{r.departamentoAsignado?.nombre || 'Departamento Actual'}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold 
                        ${r.estado === 'Recibido' ? 'bg-emerald-100 text-emerald-700' : r.estado === 'Turnado' ? 'bg-amber-100 text-amber-700' : r.estado === 'Atendido' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                        {r.estado}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">{Math.max(1, Math.floor((new Date() - new Date(r.createdAt)) / (1000 * 60 * 60 * 24)))}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => abrirModal(r)} className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-100">Ver Detalle</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-slate-200 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-slate-500 text-sm">Página {page} de {totalPages}</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page === 1} className="rounded-2xl border border-slate-200 px-4 py-2 text-slate-700 disabled:cursor-not-allowed disabled:opacity-40">«</button>
            <button onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} disabled={page === totalPages} className="rounded-2xl border border-slate-200 px-4 py-2 text-slate-700 disabled:cursor-not-allowed disabled:opacity-40">»</button>
          </div>
        </div>
      </div>

      {selectedDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Detalle del Documento y Seguimiento</h2>
                <p className="text-sm text-slate-500">Folio {selectedDoc.folio}</p>
              </div>
              <button onClick={cerrarModal} className="text-slate-400 hover:text-red-500 text-3xl leading-none">×</button>
            </div>
            <div className="grid gap-6 lg:grid-cols-2 p-6">
              <div className="rounded-3xl bg-slate-50 p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Datos del Documento</h3>
                <div className="space-y-3 text-sm text-slate-700">
                  <div className="flex justify-between"><span className="font-medium">Folio</span><span>{selectedDoc.folio}</span></div>
                  <div className="flex justify-between"><span className="font-medium">Fecha de Recepción</span><span>{new Date(selectedDoc.createdAt).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="font-medium">Tipo de Documento</span><span>Oficio</span></div>
                  <div className="flex justify-between"><span className="font-medium">Remitente</span><span>{selectedDoc.remitente}</span></div>
                  <div>
                    <span className="font-medium">Asunto</span>
                    <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-4 text-slate-600">{selectedDoc.asunto}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Estado</span>
                    <span className="rounded-full bg-amber-100 text-amber-700 px-3 py-1 text-xs font-semibold">{selectedDoc.estado}</span>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Línea de Tiempo del Seguimiento</h3>
                {historial.length === 0 ? (
                  <p className="text-sm text-slate-500">No hay movimientos registrados todavía.</p>
                ) : (
                  <div className="space-y-4">
                    {historial.map((mov) => (
                      <div key={mov._id} className="relative pl-12">
                        <div className="absolute left-5 top-2 h-full w-px bg-slate-200"></div>
                        <div className="absolute left-0 top-2 w-3 h-3 rounded-full bg-emerald-500"></div>
                        <div className="rounded-3xl bg-slate-50 p-4">
                          <p className="text-sm font-semibold text-slate-900">{mov.estadoNuevo}</p>
                          <p className="text-xs text-slate-400 mt-1">{new Date(mov.createdAt).toLocaleString()}</p>
                          <p className="text-sm text-slate-600 mt-2">{mov.observaciones || 'Sin observaciones'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-6 flex flex-col gap-3">
                  <button className="rounded-3xl bg-slate-300 px-4 py-3 text-slate-800">Turnar Documento (Admin)</button>
                  <button className="rounded-3xl bg-emerald-600 px-4 py-3 text-white">Cambiar Estado (Sistemas)</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bandeja;
