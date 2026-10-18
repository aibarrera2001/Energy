import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    correo: '',
    contrasena: ''
  });
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);

    const payload = {
      correo: formData.correo.trim(),
      contrasena: formData.contrasena
    };

    try {
      // Se especifica la URL completa apuntando al backend Java
      const res = await fetch('http://localhost:8080/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        
        // Almacenamiento de variables de sesión en localStorage
        localStorage.setItem('idEmpresa', data.idEmpresa || 1);
        localStorage.setItem('adminNombre', data.nombreAdmin || 'Administrador');
        localStorage.setItem('nombreEmpresa', data.nombreEmpresa || 'Empresa Solar');
        localStorage.setItem('adminSession', JSON.stringify(data));
        
        alert(`¡Bienvenido/a, ${data.nombreAdmin || 'Administrador'}!`);
        navigate('/admin/dashboard');
      } else {
        const errorText = await res.text();
        alert(`Error: ${errorText || 'Credenciales inválidas.'}`);
      }
    } catch (err) {
      console.error("Error de autenticación:", err);
      alert('Error de conexión con el servidor backend.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#F8FAF8', color: '#123B4F', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '420px', width: '100%', backgroundColor: '#FFFFFF', border: '1px solid #DCE6E0', borderRadius: '0.5rem', padding: '2.5rem 2rem', boxShadow: '0 16px 35px rgba(18, 59, 79, 0.08)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '3rem' }}>⚡</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#123B4F', margin: '0.5rem 0' }}>Acceso Administrativo</h1>
          <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: 0 }}>Ingresa a la consola de gestión de EnergiApp</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: '#6B7280', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Correo Electrónico *</label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              required
              placeholder="admin@solarcaribe.com"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: '#6B7280', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Contraseña *</label>
            <input
              type="password"
              name="contrasena"
              value={formData.contrasena}
              onChange={handleChange}
              required
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            style={{
              marginTop: '0.5rem',
              padding: '0.85rem',
              backgroundColor: '#2E7D5B',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '0.375rem',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: cargando ? 'not-allowed' : 'pointer',
              opacity: cargando ? 0.7 : 1
            }}
          >
            {cargando ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', borderTop: '1px solid #DCE6E0', paddingTop: '1.5rem' }}>
          <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: '0 0 0.5rem 0' }}>
            ¿Nueva empresa?{' '}
            <span
              onClick={() => navigate('/admin-registro')}
              style={{ color: '#2E7D5B', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
            >
              Registrar Empresa
            </span>
          </p>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: '0.8rem', cursor: 'pointer', marginTop: '0.5rem' }}
          >
            ← Volver a la selección de portal
          </button>
        </div>

      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  backgroundColor: '#FFFFFF',
  border: '1px solid #DCE6E0',
  borderRadius: '0.375rem',
  color: '#123B4F',
  fontSize: '0.95rem',
  boxSizing: 'border-box',
  outline: 'none'
};