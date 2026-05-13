import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Bandeja = () => {
  const [registros, setRegistros] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroDepartamento, setFiltroDepartamento] = useState('');

  // Modal y selección
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [historial, setHistorial] = useState([]);
  
  // Formulario de turno
  const [formTurno, setFormTurno] = useState({
    estadoNuevo: '',
    departamentoDestino: '',
    observaciones: ''
  });
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
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payloadBase64 = token.split('.')[1];
        const decoded = JSON.parse(atob(payloadBase64));
        setUserRole(decoded.role);
      } catch (e) {
        console.error('Error decodificando token', e);
      }
    }
    fetchRegistros();
    fetchDepartamentos();
  }, []);

  const abrirModal = async (doc) => {
    setSelectedDoc(doc);
    setFormTurno({ estadoNuevo: doc.estado, departamentoDestino: '', observaciones: '' });
    setActionStatus(null);
    
    // Cargar historial del documento
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
      // Recargar datos
      fetchRegistros();
      abrirModal({...selectedDoc, estado: formTurno.estadoNuevo}); // refrescar modal
      setFormTurno({ ...formTurno, observaciones: '' }); // limpiar observaciones
    } catch (err) {
      console.error(err);
      setActionStatus({ error: err.response?.data?.error || 'Error al turnar' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este documento permanentemente?')) return;
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://localhost:3001/documentos/${id}`, config);
      fetchRegistros(); // Recargar la tabla
    } catch (err) {
      console.error('Error al eliminar', err);
      alert(err.response?.data?.error || 'Error al eliminar el documento');
    }
  };

  // Lógica de filtrado
  const registrosFiltrados = registros.filter(r => {
    const matchEstado = filtroEstado ? r.estado === filtroEstado : true;
    const deptoId = r.departamentoAsignado?._id || r.departamentoAsignado || '';
    const matchDepto = filtroDepartamento ? deptoId === filtroDepartamento : true;
    return matchEstado && matchDepto;
  });

  return (
    <div className="max-w-6xl mx-auto relative space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Bandeja de Entrada</h1>
        <button onClick={fetchRegistros} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded shadow transition-colors">
          ↻ Actualizar
        </button>
      </div>

      {/* Panel de Filtros */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row gap-4 items-center">
        <div className="w-full md:w-1/3">
          <label className="block text-sm font-medium text-slate-600 mb-1">Filtrar por Estado:</label>
          <select 
            value={filtroEstado} 
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="Recibido">Recibido</option>
            <option value="Turnado">Turnado</option>
            <option value="En Atención">En Atención</option>
            <option value="Atendido">Atendido</option>
            <option value="Archivado">Archivado</option>
          </select>
        </div>
        <div className="w-full md:w-1/3">
          <label className="block text-sm font-medium text-slate-600 mb-1">Filtrar por Departamento:</label>
          <select 
            value={filtroDepartamento} 
            onChange={(e) => setFiltroDepartamento(e.target.value)}
            className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos los departamentos</option>
            <option value="sin_asignar">-- Sin asignar --</option>
            {departamentos.map(d => (
              <option key={d._id} value={d._id}>{d.nombre}</option>
            ))}
          </select>
        </div>
        <div className="w-full md:w-1/3 flex justify-end mt-4 md:mt-6">
          <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            Mostrando {registrosFiltrados.length} documento(s)
          </span>
        </div>
      </div>

      {/* Tabla de Documentos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="text-center p-8 text-slate-500">Cargando documentos...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b">
                  <th className="p-3">Folio</th>
                  <th className="p-3">Remitente</th>
                  <th className="p-3">Asunto</th>
                  <th className="p-3">Área Asignada</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Fecha</th>
                  <th className="p-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {registrosFiltrados.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-500">No se encontraron documentos con estos filtros.</td></tr>
                )}
                {registrosFiltrados.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-medium text-blue-600">{r.folio}</td>
                    <td className="p-3">{r.remitente}</td>
                    <td className="p-3 truncate max-w-xs">{r.asunto}</td>
                    <td className="p-3 text-sm text-slate-600">
                      {r.departamentoAsignado?.nombre ? (
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded font-medium">{r.departamentoAsignado.nombre}</span>
                      ) : (
                        <span className="text-slate-400 italic">Sin asignar</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold 
                        ${r.estado === 'Recibido' ? 'bg-slate-100 text-slate-700' : 
                          r.estado === 'Turnado' ? 'bg-amber-100 text-amber-700' : 
                          r.estado === 'Atendido' ? 'bg-green-100 text-green-700' : 
                          'bg-blue-100 text-blue-700'}`}>
                        {r.estado}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 text-center space-x-2">
                      <button 
                        onClick={() => abrirModal(r)}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Gestionar
                      </button>
                      {userRole === 'administrador' && (
                        <button 
                          onClick={() => handleDelete(r._id)}
                          className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-3 py-1 rounded text-sm transition-colors"
                          title="Eliminar documento"
                        >
                          🗑️
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Gestión y Turnos */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Header Modal */}
            <div className="flex justify-between items-center p-5 border-b bg-slate-50">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Gestionar Documento: {selectedDoc.folio}</h2>
                <p className="text-sm text-slate-500">Asunto: {selectedDoc.asunto}</p>
              </div>
              <button onClick={cerrarModal} className="text-slate-400 hover:text-red-500 text-2xl font-bold">&times;</button>
            </div>

            {/* Contenido Modal (Scrollable) */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              
              {/* Lado Izquierdo: Formulario de Acción */}
              <div className="w-full md:w-1/3 p-5 border-r border-slate-100 overflow-y-auto bg-white">
                <h3 className="font-semibold text-slate-700 mb-4">Turnar / Actualizar</h3>
                <form onSubmit={handleTurnar} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Cambiar Estado</label>
                    <select 
                      value={formTurno.estadoNuevo} 
                      onChange={e => setFormTurno({...formTurno, estadoNuevo: e.target.value})}
                      className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Recibido">Recibido</option>
                      <option value="Turnado">Turnado</option>
                      <option value="En Atención">En Atención</option>
                      <option value="Atendido">Atendido</option>
                      <option value="Archivado">Archivado</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Asignar Departamento</label>
                    <select 
                      value={formTurno.departamentoDestino} 
                      onChange={e => setFormTurno({...formTurno, departamentoDestino: e.target.value})}
                      className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">-- Sin asignar --</option>
                      {departamentos.map(d => (
                        <option key={d._id} value={d._id}>{d.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Observaciones / Instrucciones <span className="text-red-500">*</span></label>
                    <textarea 
                      required
                      rows="3"
                      value={formTurno.observaciones}
                      onChange={e => setFormTurno({...formTurno, observaciones: e.target.value})}
                      className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ej. Favor de dar respuesta en 3 días hábiles..."
                    ></textarea>
                  </div>

                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded transition-colors shadow">
                    Guardar Movimiento
                  </button>
                  
                  {actionStatus === 'enviando' && <p className="text-sm text-blue-600 text-center">Procesando...</p>}
                  {actionStatus === 'ok' && <p className="text-sm text-green-600 text-center font-medium">¡Turno registrado exitosamente!</p>}
                  {actionStatus?.error && <p className="text-sm text-red-600 text-center bg-red-50 p-2 rounded">{actionStatus.error}</p>}
                </form>
              </div>

              {/* Lado Derecho: Historial */}
              <div className="w-full md:w-2/3 p-5 overflow-y-auto bg-slate-50">
                <h3 className="font-semibold text-slate-700 mb-4 flex items-center">
                  <span className="mr-2">⏱</span> Historial de Movimientos
                </h3>
                
                {historial.length === 0 ? (
                  <p className="text-sm text-slate-500 italic bg-white p-4 rounded border border-slate-100">No hay movimientos registrados para este documento.</p>
                ) : (
                  <div className="space-y-4">
                    {historial.map((mov, index) => (
                      <div key={mov._id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 relative">
                        {/* Línea conectora visual */}
                        {index !== historial.length - 1 && (
                          <div className="absolute left-6 top-14 bottom-[-1rem] w-0.5 bg-slate-200"></div>
                        )}
                        
                        <div className="flex items-start">
                          <div className="bg-blue-100 text-blue-600 w-4 h-4 rounded-full mt-1 mr-3 flex-shrink-0 relative z-10 ring-4 ring-white"></div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <p className="text-sm font-medium text-slate-800">
                                Estado cambió a: <span className="text-blue-600">{mov.estadoNuevo}</span>
                              </p>
                              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">
                                {new Date(mov.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              Por: <span className="font-medium text-slate-700">{mov.usuario?.email}</span>
                            </p>
                            {mov.departamentoDestino && (
                              <p className="text-xs text-slate-500 mt-1">
                                Turnado a: <span className="font-medium text-slate-700">{mov.departamentoDestino.nombre}</span>
                              </p>
                            )}
                            <div className="mt-2 text-sm text-slate-700 bg-slate-50 p-2 rounded italic border-l-4 border-slate-300">
                              "{mov.observaciones}"
                            </div>
                          </div>
                        </div>
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