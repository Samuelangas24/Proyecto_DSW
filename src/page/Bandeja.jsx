import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Bandeja = () => {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchRegistros();
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Bandeja de Entrada</h1>
      <div className="bg-white p-4 rounded shadow">
        {loading ? (
          <div>Cargando...</div>
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">Folio</th>
                <th className="p-2">Remitente</th>
                <th className="p-2">Asunto</th>
                <th className="p-2">Estado</th>
                <th className="p-2">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {registros.length === 0 && (
                <tr><td colSpan={5} className="p-4 text-center">No hay registros</td></tr>
              )}
              {registros.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="p-2">{r.folio}</td>
                  <td className="p-2">{r.remitente}</td>
                  <td className="p-2">{r.asunto}</td>
                  <td className="p-2">{r.estado}</td>
                  <td className="p-2">{new Date(r.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="mt-4">
          <button onClick={fetchRegistros} className="bg-slate-700 text-white px-3 py-1 rounded">Actualizar</button>
        </div>
      </div>
    </div>
  );
};

export default Bandeja;
