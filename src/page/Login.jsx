import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3001/auth/login', { email, password });
      const token = res.data.data.token;
      localStorage.setItem('token', token);
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Error al iniciar sesion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-4 py-10">
      <div className="animated-backdrop" aria-hidden="true">
        <span className="particle particle-one" />
        <span className="particle particle-two" />
        <span className="particle particle-three" />
        <span className="particle particle-four" />
      </div>

      <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col justify-center bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),_transparent_38%),linear-gradient(180deg,#e2e8f0_0%,#ffffff_100%)] p-10">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Instituto Educativo Innovacion</p>
            <h1 className="mt-4 text-4xl font-bold text-slate-900">Sistema de Oficialia de Partes</h1>
          </div>
          <p className="leading-7 text-slate-600">Gestion documental eficiente con turnos, estado de expedientes y reportes centralizados.</p>
        </div>

        <div className="p-10">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-slate-900">Iniciar Sesion</h2>
            <p className="mt-2 text-sm text-slate-500">Accede con tu correo institucional.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Correo Institucional</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="usuario@instituto.edu"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Contrasena</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="********"
                required
              />
            </div>

            {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Cargando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 space-y-2 text-sm text-slate-500">
            <p>Solicita acceso al administrador del sistema.</p>
            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
              Registrar usuario
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
