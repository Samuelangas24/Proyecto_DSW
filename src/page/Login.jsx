import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await axios.post('http://localhost:3001/auth/login', { email, password });
      const token = res.data.data.token;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-10">
      <div className="grid max-w-5xl w-full bg-white rounded-3xl shadow-xl overflow-hidden md:grid-cols-[1.2fr_1fr]">
        <div className="bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),_transparent_38%),linear-gradient(180deg,#e2e8f0_0%,#ffffff_100%)] p-10 flex flex-col justify-center">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Instituto Educativo Innovación</p>
            <h1 className="mt-4 text-4xl font-bold text-slate-900">Sistema de Oficialía de Partes</h1>
          </div>
          <p className="text-slate-600 leading-7">Gestión documental eficiente con turnos, estado de expedientes y reportes centralizados.</p>
        </div>

        <div className="p-10">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-slate-900">Iniciar Sesión</h2>
            <p className="text-sm text-slate-500 mt-2">Accede con tu correo institucional.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Correo Institucional</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="usuario@instituto.edu"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="********"
              />
            </div>

            {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

            <button className="w-full rounded-xl bg-blue-600 px-5 py-3 text-white font-semibold shadow hover:bg-blue-700 transition">
              Entrar
            </button>
          </form>

          <div className="mt-6 text-sm text-slate-500 space-y-2">
            <p>¿Olvidaste tu contraseña?</p>
            <p>Solicitar acceso al administrador del sistema.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
