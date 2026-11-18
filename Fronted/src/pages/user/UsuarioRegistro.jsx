import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function UsuarioRegistro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    ciudad: 'Valledupar',
    contrasena: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.contrasena !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch('/api/usuarios/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          correo: formData.correo.trim(),
          telefono: formData.telefono.trim(),
          ciudad: formData.ciudad,
          contrasena: formData.contrasena
        })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.idUsuario) {
        localStorage.setItem('usuarioId', String(data.idUsuario));
        localStorage.setItem('idUsuario', String(data.idUsuario));
        localStorage.setItem('usuarioNombre', `${data.nombre} ${data.apellido || ''}`.trim());
        navigate('/user/dashboard');
      } else {
        setError(data.error || data.mensaje || 'No se pudo guardar el usuario en PostgreSQL.');
      }
    } catch (err) {
      console.error('Error conectando con Spring Boot:', err);
      setError('No se pudo conectar con el servidor (http://localhost:8080). Verifica que Spring Boot esté activo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0F172A',
      padding: '1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '450px',
        padding: '2.25rem',
        backgroundColor: '#1E293B',
        border: '1px solid #334155',
        borderRadius: '0.85rem'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <span style={{
            display: 'inline-block',
            marginBottom: '0.5rem',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            color: '#10B981',
            padding: '0.25rem 0.75rem',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            ⚡ EnergiApp
          </span>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
            Crear una cuenta
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Regístrate para monitorear tu consumo solar
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #EF4444',
            color: '#F87171',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            fontSize: '0.85rem',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>Nombre *</label>
              <input
                type="text"
                name="nombre"
                placeholder="Ej. Juan"
                value={formData.nombre}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Apellido *</label>
              <input
                type="text"
                name="apellido"
                placeholder="Ej. Pérez"
                value={formData.apellido}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Correo electrónico *</label>
            <input
              type="email"
              name="correo"
              placeholder="usuario@ejemplo.com"
              value={formData.correo}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>Teléfono</label>
              <input
                type="tel"
                name="telefono"
                placeholder="3001234567"
                value={formData.telefono}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Ciudad *</label>
              <select name="ciudad" value={formData.ciudad} onChange={handleChange} style={inputStyle}>
                <option value="Valledupar">Valledupar</option>
                <option value="Barranquilla">Barranquilla</option>
                <option value="Cartagena">Cartagena</option>
                <option value="Santa Marta">Santa Marta</option>
                <option value="Montería">Montería</option>
                <option value="Sincelejo">Sincelejo</option>
                <option value="Riohacha">Riohacha</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Contraseña *</label>
            <input
              type="password"
              name="contrasena"
              placeholder="••••••••"
              value={formData.contrasena}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Confirmar contraseña *</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.85rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              marginTop: '0.5rem',
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Registrando en base de datos...' : 'Registrarme'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#94A3B8', marginTop: '1.5rem' }}>
          ¿Ya tienes una cuenta?{' '}
          <Link to="/usuario-login" style={{ color: '#10B981', fontWeight: 600, textDecoration: 'none' }}>
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '0.83rem',
  fontWeight: 600,
  color: '#94A3B8',
  marginBottom: '0.35rem'
};

const inputStyle = {
  width: '100%',
  padding: '0.7rem 0.9rem',
  borderRadius: '0.5rem',
  backgroundColor: '#0F172A',
  border: '1px solid #334155',
  color: '#FFFFFF',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box'
};