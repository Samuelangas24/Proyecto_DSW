import React, { useState } from 'react';
import axios from 'axios';

const Registro = () => {
  const [form, setForm] = useState({
    remitente: '',
    asunto: '',
    descripcion: '',
    departamento: 'Rectoría',
    estado: 'Recibido'
  });
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.remitente.trim() || !form.asunto.trim()) {
      setStatus({ ok: false, error: 'Remitente y asunto son requeridos' });
      return;
    }
    setStatus('enviando');
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const res = await axios.post('http://localhost:3001/registro', form, config);
      setStatus('ok');
      console.log('Respuesta backend:', res.data);
      setForm({ remitente: '', asunto: '', descripcion: '', departamento: 'Rectoría', estado: 'Recibido' });
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        setStatus({ ok: false, error: 'No autorizado. Por favor, inicia sesión de nuevo.' });
      } else {
        const msg = err.response?.data?.error || 'Error al crear';
        setStatus({ ok: false, error: msg });
      }
    }
  };

  const handleReset = () => {
    setForm({ remitente: '', asunto: '', descripcion: '', departamento: 'Rectoría', estado: 'Recibido' });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">➕ Crear Nuevo Registro</h1>
        <p className="text-slate-600">Complete el formulario para registrar un nuevo documento en el sistema</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">

        {/* Primera fila */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">📧 Remitente *</label>
            <input
              name="remitente"
              value={form.remitente}
              onChange={handleChange}
              placeholder="Ej: Juan Pérez"
              className="w-full border-2 border-slate-300 rounded-lg p-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">🏢 Departamento</label>
            <select
              name="departamento"
              value={form.departamento}
              onChange={handleChange}
              className="w-full border-2 border-slate-300 rounded-lg p-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option>Rectoría</option>
              <option>Vicerrectoría Académica</option>
              <option>Vicerrectoría Administrativa</option>
              <option>Secretaría General</option>
              <option>Bienestar Universitario</option>
              <option>Investigación</option>
            </select>
          </div>
        </div>

        {/* Asunto */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">📝 Asunto *</label>
          <input
            name="asunto"
            value={form.asunto}
            onChange={handleChange}
            placeholder="Ej: Solicitud de información académica"
            className="w-full border-2 border-slate-300 rounded-lg p-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">📄 Descripción</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            placeholder="Detalles adicionales sobre el documento..."
            rows="5"
            className="w-full border-2 border-slate-300 rounded-lg p-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* Segunda fila */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">⏱️ Estado</label>
            <select
              name="estado"
              value={form.estado}
              onChange={handleChange}
              className="w-full border-2 border-slate-300 rounded-lg p-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option>Recibido</option>
              <option>En Proceso</option>
              <option>Completado</option>
              <option>Archivado</option>
            </select>
          </div>
        </div>

        {/* Mensajes de estado */}
        {status === 'enviando' && (
          <div className="bg-blue-50 border-l-4 border-blue-600 text-blue-700 px-4 py-3 rounded-lg">
            ⏳ Enviando formulario...
          </div>
        )}
        {status === 'ok' && (
          <div className="bg-green-50 border-l-4 border-green-600 text-green-700 px-4 py-3 rounded-lg font-semibold">
            ✅ ¡Registro creado exitosamente!
          </div>
        )}
        {status && status.ok === false && (
          <div className="bg-red-50 border-l-4 border-red-600 text-red-700 px-4 py-3 rounded-lg">
            ⚠️ {status.error}
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={status === 'enviando'}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {status === 'enviando' ? '⏳ Guardando...' : '💾 Guardar Registro'}
          </button>
          <button
            type="reset"
            onClick={handleReset}
            className="flex-1 bg-slate-400 hover:bg-slate-500 text-white font-bold py-3 rounded-lg transition text-lg"
          >
            🔄 Limpiar
          </button>
        </div>

        <p className="text-xs text-slate-500 text-center">
          Los campos marcados con * son obligatorios
        </p>
      </form>
    </div>
  );
};

export default Registro;
