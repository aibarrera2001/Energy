import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert('Ingresa correo y contraseña de administrador.');
      return;
    }

    try {
      const res = await fetch('http://localhost:8080/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok && data.exito) {
        localStorage.setItem('adminEmpresa', JSON.stringify(data.empresa));
        navigate('/admin/dashboard');
      } else {
        alert(data.mensaje || 'Credenciales inválidas.');
      }
    } catch (err) {
      console.warn("Backend no disponible. Entrando con sesión simulada.", err);
      localStorage.setItem('adminEmpresa', JSON.stringify({
        id_empresa: 1,
        nombre: 'Empresa Demo EnergiApp'
      }));
      navigate('/admin/dashboard');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0F172A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      color: '#F8FAFC',
      fontFamily: "'Segoe UI', system-ui, sans-serif"
    }}>
      <div style={{
        maxWidth: '420px',
        width: '100%',
        backgroundColor: '#1E293B',
        border: '1px solid #334155',
        borderRadius: '1rem',
        padding: '2.5rem 2rem',
        boxSizing: 'border-box'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '2.5rem', display: 'inline-block', marginBottom: '0.25rem' }}>⚡</span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
            Acceso Administrativo
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Ingresa a la consola de gestión de EnergiApp
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
              Correo de Administrador
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@empresa.com"
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: '#0F172A',
                border: '1px solid #334155',
                borderRadius: '0.5rem',
                color: '#FFFFFF',
                fontSize: '0.95rem',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: '#0F172A',
                border: '1px solid #334155',
                borderRadius: '0.5rem',
                color: '#FFFFFF',
                fontSize: '0.95rem',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.85rem',
              backgroundColor: '#6366F1',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              marginTop: '0.5rem'
            }}
          >
            Iniciar Sesión
          </button>
        </form>

        {/* Enlaces inferiores */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #334155', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#94A3B8' }}>
            ¿Nueva empresa?{' '}
            <Link to="/admin-registro" style={{ color: '#818CF8', fontWeight: 600, textDecoration: 'none' }}>
              Registrar Empresa
            </Link>
          </p>
          <Link to="/" style={{ color: '#64748B', fontSize: '0.85rem', textDecoration: 'none' }}>
            ← Volver a la selección de portal
          </Link>
        </div>
      </div>
    </div>
  );
}