import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const estados = ['Recibido', 'Turnado', 'En Atención', 'Atendido', 'Archivado'];

const Bandeja = () => {
  const [registros, setRegistros] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [userRole, setUserRole] = useState(null);
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

  const fetchRegistros = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3001/bandeja', {
        params: {
          estado: filters.estado || undefined,
          departamento: filters.departamento || undefined,
          limite: 1000
        }
      });
      setRegistros(res.data.data || []);
    } catch (err) {
      console.error('Error cargando bandeja', err);
    } finally {
      setLoading(false);
    }
  }, [filters.estado, filters.departamento]);

  const fetchDepartamentos = async () => {
    try {
      const res = await axios.get('http://localhost:3001/departamentos');
      setDepartamentos(res.data.data || []);
    } catch (err) {
      console.error('Error cargando departamentos', err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUserRole(decoded.role);
      } catch (e) {
        console.error('Error decodificando token', e);
      }
    }
    fetchDepartamentos();
  }, []);

  useEffect(() => {
    fetchRegistros();
    setPage(1);
  }, [fetchRegistros]);

  const filteredRegistros = useMemo(() => {
    return registros.filter((item) => {
      const matchesFolio = filters.folio ? item.folio?.toLowerCase().includes(filters.folio.toLowerCase()) : true;
      const matchesFecha = filters.fecha ? new Date(item.createdAt).toISOString().slice(0, 10) === filters.fecha : true;
      return matchesFolio && matchesFecha;
    });
  }, [registros, filters.folio, filters.fecha]);

  const totalPages = Math.max(1, Math.ceil(filteredRegistros.length / 5));
  const paginatedRegistros = useMemo(() => {
    const start = (page - 1) * 5;
    return filteredRegistros.slice(start, start + 5);
  }, [filteredRegistros, page]);

  const abrirModal = async (doc) => {
    setSelectedDoc(doc);
    setFormTurno({ estadoNuevo: doc.estado, departamentoDestino: doc.departamentoAsignado?._id || '', observaciones: '' });
    setActionStatus(null);
    try {
      const res = await axios.get(`http://localhost:3001/turnos/${doc._id}`);
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
      await axios.post('http://localhost:3001/turnos', {
        documentoId: selectedDoc._id,
        estadoNuevo: formTurno.estadoNuevo,
        departamentoDestino: formTurno.departamentoDestino || null,
        observaciones: formTurno.observaciones
      });
      setActionStatus('ok');
      await fetchRegistros();
      await abrirModal({ ...selectedDoc, estado: formTurno.estadoNuevo });
      setFormTurno((prev) => ({ ...prev, observaciones: '' }));
    } catch (err) {
      console.error(err);
      setActionStatus({ error: err.response?.data?.error || 'Error al turnar' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Seguro que deseas eliminar este documento permanentemente?')) return;
    try {
      await axios.delete(`http://localhost:3001/registro/${id}`);
      fetchRegistros();
    } catch (err) {
      console.error('Error al eliminar', err);
      alert(err.response?.data?.error || 'Error al eliminar el documento');
    }
  };

  const resetFilters = () => {
    setFilters({ folio: '', fecha: '', estado: '', departamento: '' });
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Bandeja de Entrada</h1>
          <p className="mt-2 text-slate-500">Filtra documentos por folio, fecha, estado o departamento.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-3xl bg-emerald-500/10 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total</p>
            <p className="text-2xl font-semibold text-slate-900">{registros.length}</p>
          </div>
          <div className="rounded-3xl bg-slate-800 px-4 py-4 text-white">
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

      <div className="rounded-3xl bg-white p-6 shadow">
        <div className="grid gap-4 lg:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Folio</label>
            <input
              value={filters.folio}
              onChange={(e) => setFilters((prev) => ({ ...prev, folio: e.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
              placeholder="Buscar folio"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Fecha</label>
            <input
              type="date"
              value={filters.fecha}
              onChange={(e) => setFilters((prev) => ({ ...prev, fecha: e.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Estado</label>
            <select
              value={filters.estado}
              onChange={(e) => setFilters((prev) => ({ ...prev, estado: e.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            >
              <option value="">Todos</option>
              {estados.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Departamento</label>
            <select
              value={filters.departamento}
              onChange={(e) => setFilters((prev) => ({ ...prev, departamento: e.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            >
              <option value="">Todos</option>
              <option value="sin_asignar">Sin asignar</option>
              {departamentos.map((d) => <option key={d._id} value={d._id}>{d.nombre}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Resultados</h2>
            <p className="text-sm text-slate-500">Mostrando {filteredRegistros.length} documentos</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={resetFilters} className="rounded-2xl border border-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-50">Limpiar</button>
            <button onClick={fetchRegistros} className="rounded-2xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-800">Actualizar</button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Cargando documentos...</div>
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
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedRegistros.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-500">No se encontraron documentos con esos filtros.</td>
                  </tr>
                ) : (
                  paginatedRegistros.map((r) => (
                    <tr key={r._id} className="transition-colors hover:bg-slate-50">
                      <td className="p-4 font-semibold text-slate-900">{r.folio}</td>
                      <td className="p-4 text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">{r.remitente}</td>
                      <td className="max-w-[18rem] truncate p-4">{r.asunto}</td>
                      <td className="p-4">{r.departamentoAsignado?.nombre || 'Sin asignar'}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          r.estado === 'Recibido' ? 'bg-emerald-100 text-emerald-700' :
                          r.estado === 'Turnado' ? 'bg-amber-100 text-amber-700' :
                          r.estado === 'Atendido' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {r.estado}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">{Math.max(1, Math.floor((new Date() - new Date(r.createdAt)) / (1000 * 60 * 60 * 24)))}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => abrirModal(r)} className="rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-100">Gestionar</button>
                          {userRole === 'administrador' && (
                            <button onClick={() => handleDelete(r._id)} className="rounded-full border border-red-200 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50">Eliminar</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-500">Pagina {page} de {totalPages}</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page === 1} className="rounded-2xl border border-slate-200 px-4 py-2 text-slate-700 disabled:cursor-not-allowed disabled:opacity-40">Anterior</button>
            <button onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} disabled={page === totalPages} className="rounded-2xl border border-slate-200 px-4 py-2 text-slate-700 disabled:cursor-not-allowed disabled:opacity-40">Siguiente</button>
          </div>
        </div>
      </div>

      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Detalle del Documento y Seguimiento</h2>
                <p className="text-sm text-slate-500">Folio {selectedDoc.folio}</p>
              </div>
              <button onClick={cerrarModal} className="text-3xl leading-none text-slate-400 hover:text-red-500">x</button>
            </div>
            <div className="grid max-h-[78vh] gap-6 overflow-y-auto p-6 lg:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold">Datos del Documento</h3>
                <div className="space-y-3 text-sm text-slate-700">
                  <div className="flex justify-between gap-4"><span className="font-medium">Folio</span><span>{selectedDoc.folio}</span></div>
                  <div className="flex justify-between gap-4"><span className="font-medium">Fecha</span><span>{new Date(selectedDoc.createdAt).toLocaleString()}</span></div>
                  <div className="flex justify-between gap-4"><span className="font-medium">Remitente</span><span>{selectedDoc.remitente}</span></div>
                  <div>
                    <span className="font-medium">Asunto</span>
                    <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-4 text-slate-600">{selectedDoc.asunto}</div>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium">Estado</span>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{selectedDoc.estado}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold">Gestionar Seguimiento</h3>
                <form onSubmit={handleTurnar} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Nuevo estado</label>
                    <select
                      value={formTurno.estadoNuevo}
                      onChange={(e) => setFormTurno((prev) => ({ ...prev, estadoNuevo: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                    >
                      {estados.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Departamento destino</label>
                    <select
                      value={formTurno.departamentoDestino}
                      onChange={(e) => setFormTurno((prev) => ({ ...prev, departamentoDestino: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                    >
                      <option value="">Sin cambio</option>
                      {departamentos.map((d) => <option key={d._id} value={d._id}>{d.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Observaciones</label>
                    <textarea
                      value={formTurno.observaciones}
                      onChange={(e) => setFormTurno((prev) => ({ ...prev, observaciones: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                      rows="3"
                      required
                    />
                  </div>
                  {actionStatus === 'ok' && <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Movimiento guardado.</p>}
                  {actionStatus?.error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{actionStatus.error}</p>}
                  <button disabled={actionStatus === 'enviando'} className="w-full rounded-3xl bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-50">
                    {actionStatus === 'enviando' ? 'Guardando...' : 'Guardar Seguimiento'}
                  </button>
                </form>

                <h3 className="mb-4 mt-8 text-lg font-semibold">Linea de Tiempo</h3>
                {historial.length === 0 ? (
                  <p className="text-sm text-slate-500">No hay movimientos registrados todavia.</p>
                ) : (
                  <div className="space-y-4">
                    {historial.map((mov) => (
                      <div key={mov._id} className="rounded-3xl bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-900">{mov.estadoNuevo}</p>
                        <p className="mt-1 text-xs text-slate-400">{new Date(mov.createdAt).toLocaleString()}</p>
                        <p className="mt-2 text-sm text-slate-600">{mov.observaciones || 'Sin observaciones'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bandeja;
