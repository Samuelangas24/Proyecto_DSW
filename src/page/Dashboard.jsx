import React, { useMemo, useState } from 'react';
import StatCard from '../components/StatCard';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats] = useState({
    registrados: 14,
    pendientes: 5,
    turno: 9,
    archivados: 128,
    promedioAtencion: '2.3 días',
    proximosVencimientos: 4,
  });

  const [recentDocuments] = useState([
    { folio: 'IEI-2023-0021', fecha: '20/Oct/2023 10:15', remitente: 'SEP - Dirección General', asunto: 'Solicitud de información presupuestal para el ciclo...', estado: 'Recibido', tipo: 'Oficio', overdue: false },
    { folio: 'IEI-2023-0020', fecha: '20/Oct/2023 10:05', remitente: 'Dirección Administrativa', asunto: 'Requerimiento de documentos fiscales', estado: 'Turnado', tipo: 'Oficio', overdue: false },
    { folio: 'IEI-2023-0019', fecha: '19/Oct/2023 13:12', remitente: 'Recursos Humanos', asunto: 'Informe de nómina y seguimiento', estado: 'En Proceso', tipo: 'Oficio', overdue: true },
  ]);

  const [departments] = useState([
    { nombre: 'Sistemas', activos: 12 },
    { nombre: 'Finanzas', activos: 9 },
    { nombre: 'Recursos Humanos', activos: 7 },
    { nombre: 'Oficialía', activos: 5 },
  ]);

  const [tasks] = useState([
    { id: 1, title: 'Revisar folio IEI-2023-0019', due: 'Hoy', status: 'Urgente' },
    { id: 2, title: 'Crear nuevo departamento de Admisiones', due: '2 días', status: 'Media' },
    { id: 3, title: 'Actualizar estado de documento IEI-2023-0020', due: '3 días', status: 'Baja' },
  ]);

  const overdueCount = useMemo(() => recentDocuments.filter((item) => item.overdue).length, [recentDocuments]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-2">Vista general de la gestión documental para Oficialía.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/registro" className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-xl shadow hover:bg-emerald-700 transition">Nuevo Documento</Link>
          <Link to="/bandeja" className="inline-flex items-center px-4 py-2 bg-slate-200 text-slate-800 rounded-xl shadow hover:bg-slate-300 transition">Ver Bandeja</Link>
          <Link to="/reportes" className="inline-flex items-center px-4 py-2 bg-slate-900 text-white rounded-xl shadow hover:bg-slate-800 transition">Ir a Reportes</Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <StatCard title="Documentos Registrados" value={stats.registrados} color="bg-emerald-500" icon="📄" />
        <StatCard title="Pendientes" value={stats.pendientes} color="bg-amber-500" icon="⏳" />
        <StatCard title="Turnos Abiertos" value={stats.turno} color="bg-sky-500" icon="🔁" />
        <StatCard title="Archivados" value={stats.archivados} color="bg-slate-700" icon="📦" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Resumen de Gestión</h2>
                <p className="text-sm text-slate-500 mt-1">Un vistazo a los principales indicadores de proceso.</p>
              </div>
              <div className="rounded-3xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700">Promedio atención: {stats.promedioAtencion}</div>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
                  <span>Documentos atendidos</span>
                  <span className="font-semibold text-slate-900">68%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: '68%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
                  <span>Turnos procesados</span>
                  <span className="font-semibold text-slate-900">41%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-sky-500" style={{ width: '41%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
                  <span>Índice de cumplimiento</span>
                  <span className="font-semibold text-slate-900">82%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: '82%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Top Departamentos</h2>
              <span className="text-xs text-slate-400">Actividad reciente</span>
            </div>
            <div className="space-y-3">
              {departments.map((dept) => (
                <div key={dept.nombre} className="flex items-center justify-between rounded-3xl border border-slate-100 px-4 py-3">
                  <div>
                    <p className="font-medium text-slate-900">{dept.nombre}</p>
                    <p className="text-xs text-slate-500">Documentos activos</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{dept.activos}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-white rounded-3xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Tareas Urgentes</h2>
              <span className="text-xs text-slate-400">Prioridad</span>
            </div>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="rounded-3xl border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{task.title}</p>
                      <p className="text-xs text-slate-500 mt-1">Vence: {task.due}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${task.status === 'Urgente' ? 'bg-rose-100 text-rose-700' : task.status === 'Media' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-950 text-white rounded-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Incidencias</h2>
                <p className="text-sm text-slate-400">Seguimiento inmediato</p>
              </div>
              <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-slate-950">{overdueCount} Retrasados</span>
            </div>
            <p className="text-sm leading-6 text-slate-300">Revisa los documentos que ya superaron su tiempo de atención y asigna turnos antes de que queden pendientes.</p>
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl bg-slate-900/70 p-4">
                <p className="text-sm text-slate-300">Próximos vencimientos</p>
                <p className="text-2xl font-semibold mt-2">{stats.proximosVencimientos}</p>
              </div>
              <div className="rounded-3xl bg-slate-900/70 p-4">
                <p className="text-sm text-slate-300">Campañas de archivo pendientes</p>
                <p className="text-2xl font-semibold mt-2">3</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="bg-white rounded-3xl shadow p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Últimos Documentos</h2>
            <p className="text-sm text-slate-500">Actualiza el estado o turna documentos desde la bandeja.</p>
          </div>
          <Link to="/bandeja" className="inline-flex items-center px-4 py-2 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 transition">Abrir Bandeja</Link>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
              <tr>
                <th className="p-3">Folio</th>
                <th className="p-3">Remitente</th>
                <th className="p-3">Asunto</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentDocuments.map((doc) => (
                <tr key={doc.folio} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-medium text-slate-900">{doc.folio}</td>
                  <td className="p-3 text-slate-500">{doc.remitente}</td>
                  <td className="p-3 truncate max-w-[20rem]">{doc.asunto}</td>
                  <td className="p-3"><span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${doc.overdue ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>{doc.estado}</span></td>
                  <td className="p-3 text-slate-500">{doc.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
