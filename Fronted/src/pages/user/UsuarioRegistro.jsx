import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function UsuarioRegistro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
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

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch('http://localhost:8080/api/usuarios/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password
        })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token || 'token-demo-12345');
        localStorage.setItem('usuarioId', data.usuario?._id || data.usuario?.id || '12345');
        localStorage.setItem('usuarioNombre', formData.nombre);
        navigate('/user/dashboard');
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.mensaje || errorData.error || 'Error al registrar el usuario en el servidor.');
      }
    } catch (err) {
      console.warn('Backend no disponible. Iniciando sesión de prueba local...', err);
      // Modo de prueba sin backend
      localStorage.setItem('token', 'token-demo-12345');
      localStorage.setItem('usuarioId', '12345');
      localStorage.setItem('usuarioNombre', formData.nombre);
      navigate('/user/dashboard');
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
      backgroundColor: '#F8FAFC',
      padding: '1rem'
    }}>
      <div className="panel-card" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span className="header-badge" style={{ display: 'inline-block', marginBottom: '0.5rem' }}>
            EnergiApp
          </span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
            Crear una cuenta
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Regístrate para monitorear tu consumo solar
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#FEE2E2',
            color: '#EF4444',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.35rem' }}>
              Nombre completo
            </label>
            <input
              type="text"
              name="nombre"
              placeholder="Ej. Juan Pérez"
              value={formData.nombre}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid #CBD5E1',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.35rem' }}>
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              placeholder="usuario@ejemplo.com"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid #CBD5E1',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.35rem' }}>
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid #CBD5E1',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.35rem' }}>
              Confirmar contraseña
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid #CBD5E1',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            className="btn-accent-green"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.85rem',
              fontSize: '1rem',
              marginTop: '0.5rem',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Procesando...' : 'Registrarme'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748B', marginTop: '1.5rem' }}>
          ¿Ya tienes una cuenta?{' '}
          <Link to="/usuario-login" style={{ color: '#10B981', fontWeight: 600, textDecoration: 'none' }}>
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}