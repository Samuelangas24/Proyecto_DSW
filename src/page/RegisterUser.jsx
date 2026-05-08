import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterUser = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [status, setStatus] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await axios.post('http://localhost:3001/auth/register', { email, password, role });
      setStatus('ok');
      setTimeout(() => navigate('/login'), 800);
    } catch (err) {
      console.error(err);
      setStatus(err.response?.data?.error || 'Error registrando usuario');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Crear usuario</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Contraseña</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Rol</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 block w-full border rounded p-2">
            <option value="user">Usuario</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {status === 'sending' && <div>Creando...</div>}
        {status === 'ok' && <div className="text-green-600">Usuario creado. Redirigiendo a login...</div>}
        {status && status !== 'sending' && status !== 'ok' && <div className="text-red-600">{status}</div>}
        <div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Crear usuario</button>
        </div>
      </form>
    </div>
  );
};

export default RegisterUser;
