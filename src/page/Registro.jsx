import React, { useState } from 'react';
import axios from 'axios';

const Registro = () => {
  const [form, setForm] = useState({ folio: '', remitente: '', asunto: '', estado: 'Recibido' });
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // cliente: validación básica
    if (!form.folio.trim() || !form.remitente.trim() || !form.asunto.trim()) {
      setStatus({ ok: false, error: 'Folio, remitente y asunto son requeridos' });
      return;
    }
    setStatus('enviando');
    try {
      const res = await axios.post('http://localhost:3001/registro', form);
      setStatus('ok');
      console.log('Respuesta backend:', res.data);
      setForm({ folio: '', remitente: '', asunto: '', estado: 'Recibido' });
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'Error al crear';
      setStatus({ ok: false, error: msg });
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Nuevo Registro</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block text-sm font-medium">Folio</label>
          <input name="folio" value={form.folio} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Remitente</label>
          <input name="remitente" value={form.remitente} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Asunto</label>
          <input name="asunto" value={form.asunto} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Estado</label>
          <select name="estado" value={form.estado} onChange={handleChange} className="mt-1 block w-full border rounded p-2">
            <option>Recibido</option>
            <option>En Proceso</option>
            <option>Archivado</option>
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Crear</button>
          {status === 'enviando' && <span>Enviando...</span>}
          {status === 'ok' && <span className="text-green-600">Registro creado</span>}
          {status && status.ok === false && <span className="text-red-600">{status.error}</span>}
        </div>
      </form>
    </div>
  );
};

export default Registro;
