import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Reportes = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3001/reportes');
      setStats(res.data.data);
    } catch (err) {
      console.error('Error cargando reportes', err);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Reportes</h1>
      <div className="bg-white p-4 rounded shadow">
        {loading && <div>Cargando estadísticas...</div>}
        {!loading && !stats && <div>Error al cargar estadísticas</div>}
        {!loading && stats && (
          <div className="space-y-4">
            <div>Total de registros: <strong>{stats.total}</strong></div>

            <div>
              <h3 className="font-semibold">Por Estado</h3>
              <ul>
                {Object.entries(stats.byEstado).map(([k,v]) => (
                  <li key={k}>{k}: {v}</li>
                ))}
                {Object.keys(stats.byEstado).length===0 && <li>No hay datos</li>}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">Por Remitente (top)</h3>
              <ul>
                {Object.entries(stats.byRemitente).slice(0,10).map(([k,v]) => (
                  <li key={k}>{k}: {v}</li>
                ))}
                {Object.keys(stats.byRemitente).length===0 && <li>No hay datos</li>}
              </ul>
            </div>

            <div>
              <button onClick={fetchStats} className="bg-slate-700 text-white px-3 py-1 rounded">Actualizar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reportes;
