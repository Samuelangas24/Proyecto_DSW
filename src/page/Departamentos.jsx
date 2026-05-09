import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Departamentos = () => {
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nombre: '', responsable: '', descripcion: '' });
  const [status, setStatus] = useState(null);

  const fetchDepartamentos = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3001/departamentos');
      setDepartamentos(res.data.data || []);
    } catch (err) {
      console.error('Error cargando departamentos', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartamentos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.responsable.trim()) {
      setStatus({ ok: false, error: 'Nombre y responsable son requeridos' });
      return;
    }
    setStatus('enviando');
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.post('http://localhost:3001/departamentos', form, config);
      setStatus('ok');
      setForm({ nombre: '', responsable: '', descripcion: '' });
      fetchDepartamentos(); // Recargar la lista
    } catch (err) {
      console.error(err);
      setStatus({ ok: false, error: err.response?.data?.error || 'Error al crear departamento' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Gestión de Departamentos</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Formulario para Nuevo Departamento */}
        <div className="w-full md:w-1/3">
          <div className="bg-white p-5 rounded-lg shadow">
            <h2 className="text-lg font-bold mb-4 text-slate-700">Nuevo Departamento</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del Departamento</label>
                <input 
                  name="nombre" 
                  value={form.nombre} 
                  onChange={handleChange} 
                  className="w-full border border-slate-300 rounded p-2 text-sm" 
                  placeholder="Ej. Recursos Humanos"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Responsable</label>
                <input 
                  name="responsable" 
                  value={form.responsable} 
                  onChange={handleChange} 
                  className="w-full border border-slate-300 rounded p-2 text-sm" 
                  placeholder="Ej. Lic. María López"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción (Opcional)</label>
                <textarea 
                  name="descripcion" 
                  value={form.descripcion} 
                  onChange={handleChange} 
                  rows="2"
                  className="w-full border border-slate-300 rounded p-2 text-sm" 
                ></textarea>
              </div>

              <button type="submit" className="w-full bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-900 transition-colors">
                Registrar
              </button>
              
              {status === 'enviando' && <p className="text-sm text-blue-600">Enviando...</p>}
              {status === 'ok' && <p className="text-sm text-green-600 font-medium">Departamento creado</p>}
              {status?.error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{status.error}</p>}
            </form>
          </div>
        </div>

        {/* Lista de Departamentos */}
        <div className="w-full md:w-2/3">
          <div className="bg-white p-5 rounded-lg shadow">
            <h2 className="text-lg font-bold mb-4 text-slate-700">Departamentos Registrados</h2>
            {loading ? (
              <p>Cargando...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b text-slate-600">
                      <th className="p-3">Nombre</th>
                      <th className="p-3">Responsable</th>
                      <th className="p-3">Descripción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {departamentos.length === 0 && (
                      <tr><td colSpan={3} className="p-4 text-center text-slate-500">No hay departamentos</td></tr>
                    )}
                    {departamentos.map(d => (
                      <tr key={d._id} className="hover:bg-slate-50">
                        <td className="p-3 font-medium text-slate-800">{d.nombre}</td>
                        <td className="p-3 text-slate-600">{d.responsable}</td>
                        <td className="p-3 text-sm text-slate-500">{d.descripcion || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Departamentos;