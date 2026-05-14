import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterUser = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'oficialia'
  });
  const [status, setStatus] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!form.email || !form.password || !form.confirmPassword) {
      setStatus({ ok: false, error: 'Todos los campos son requeridos' });
      return;
    }

    if (form.password !== form.confirmPassword) {
      setStatus({ ok: false, error: 'Las contraseñas no coinciden' });
      return;
    }

    if (form.password.length < 6) {
      setStatus({ ok: false, error: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    setStatus('enviando');
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.post('http://localhost:3001/auth/register',
        {
          email: form.email,
          password: form.password,
          role: form.role
        },
        config
      );

      setStatus('ok');
      setForm({ email: '', password: '', confirmPassword: '', role: 'oficialia' });
      setTimeout(() => {
        setStatus(null);
      }, 3000);
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error || 'Error al crear usuario';
      setStatus({ ok: false, error: errorMsg });
    }
  };

  const goBack = () => {
    navigate('/');
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">➕ Crear Nuevo Usuario</h1>
        <p className="text-slate-600">Registra un nuevo miembro en el sistema</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">📧 Email *</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="usuario@dsw.edu"
            className="w-full border-2 border-slate-300 rounded-lg p-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">🔒 Contraseña *</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Mínimo 6 caracteres"
            className="w-full border-2 border-slate-300 rounded-lg p-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">🔒 Confirmar Contraseña *</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Repite la contraseña"
            className="w-full border-2 border-slate-300 rounded-lg p-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">👤 Rol *</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border-2 border-slate-300 rounded-lg p-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value="usuario">Usuario Regular</option>
            <option value="oficialia">Oficialía</option>
            <option value="administrador">Administrador</option>
          </select>
        </div>

        {/* Mensajes de estado */}
        {status === 'enviando' && (
          <div className="bg-blue-50 border-l-4 border-blue-600 text-blue-700 px-4 py-3 rounded-lg">
            ⏳ Creando usuario...
          </div>
        )}
        {status === 'ok' && (
          <div className="bg-green-50 border-l-4 border-green-600 text-green-700 px-4 py-3 rounded-lg font-semibold">
            ✅ ¡Usuario creado exitosamente!
          </div>
        )}
        {status && status.ok === false && (
          <div className="bg-red-50 border-l-4 border-red-600 text-red-700 px-4 py-3 rounded-lg">
            ⚠️ {status.error}
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={status === 'enviando'}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {status === 'enviando' ? '⏳ Creando...' : '✅ Crear Usuario'}
          </button>
          <button
            type="button"
            onClick={goBack}
            className="flex-1 bg-slate-400 hover:bg-slate-500 text-white font-bold py-3 rounded-lg transition text-lg"
          >
            ❌ Cancelar
          </button>
        </div>

        <p className="text-xs text-slate-500 text-center">
          Los campos marcados con * son obligatorios
        </p>
      </form>
    </div>
  );
};

export default RegisterUser;
