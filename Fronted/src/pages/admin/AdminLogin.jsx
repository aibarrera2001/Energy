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

    // Las claves deben coincidir exactamente con AdminLoginDTO.java (correo, contrasena)
    const payload = {
      correo: formData.correo.trim(),
      contrasena: formData.contrasena
    };

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        
        // Guardar la sesión devuelta por el backend
        localStorage.setItem('idEmpresa', data.idEmpresa || 1);
        localStorage.setItem('adminNombre', data.nombreAdmin || 'Administrador');
        localStorage.setItem('nombreEmpresa', data.nombreEmpresa || 'Empresa Solar');
        
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
    <div style={{ backgroundColor: '#0F172A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '420px', width: '100%', backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '1rem', padding: '2.5rem 2rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '3rem' }}>⚡</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', margin: '0.5rem 0' }}>Acceso Administrativo</h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', margin: 0 }}>Ingresa a la consola de gestión de EnergiApp</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Correo Electrónico *</label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              required
              placeholder="planetarenovable@gmail.com"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Contraseña *</label>
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
              backgroundColor: '#6366F1',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: cargando ? 'not-allowed' : 'pointer',
              opacity: cargando ? 0.7 : 1
            }}
          >
            {cargando ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', borderTop: '1px solid #334155', paddingTop: '1.5rem' }}>
          <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: '0 0 0.5rem 0' }}>
            ¿Nueva empresa?{' '}
            <span
              onClick={() => navigate('/admin-registro')}
              style={{ color: '#818CF8', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
            >
              Registrar Empresa
            </span>
          </p>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.8rem', cursor: 'pointer', marginTop: '0.5rem' }}
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
  backgroundColor: '#0F172A',
  border: '1px solid #334155',
  borderRadius: '0.5rem',
  color: '#FFFFFF',
  fontSize: '0.95rem',
  boxSizing: 'border-box',
  outline: 'none'
};