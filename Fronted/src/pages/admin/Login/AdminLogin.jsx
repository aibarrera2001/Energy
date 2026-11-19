import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CARIBE_THEME,
  CaribeAuthLayout,
  LogoEnergiapp,
  CaribeIcons,
  caribeInputStyle,
  caribeLabelStyle,
  caribePrimaryButtonStyle,
} from '../../../components/CaribeSolarUI';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function AdminLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    correo: '',
    contrasena: '',
  });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    const payload = {
      correo: formData.correo.trim(),
      contrasena: formData.contrasena,
    };

    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        throw new Error(errorText || 'Credenciales administrativas inválidas. Verifica tus datos.');
      }

      const data = await res.json();

      localStorage.setItem('idEmpresa', String(data.idEmpresa || 1));
      localStorage.setItem('adminNombre', data.nombreAdmin || 'Administrador');
      localStorage.setItem('nombreEmpresa', data.nombreEmpresa || 'Empresa Solar');
      localStorage.setItem('adminSession', JSON.stringify(data));
      localStorage.setItem('rol', 'ADMIN');

      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Error de autenticación admin:', err);
      setError(err.message || 'No se pudo conectar con el servidor backend.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <CaribeAuthLayout
      badge="Consola de Empresas · Región Caribe"
      titulo="Acceso Administrativo"
      subtitulo="Gestiona el catálogo fotovoltaico, solicitudes técnicas, clientes y reportes operativos de tu empresa."
      footerLinkText="¿Tu empresa aún no está registrada en Energiapp?"
      footerActionText="Registrar empresa instaladora →"
      onFooterAction={() => navigate('/admin-registro')}
    >
      {/* Identificador de marca */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.55rem',
          padding: '0.45rem 0.75rem',
          backgroundColor: CARIBE_THEME.marfil,
          border: `1px solid ${CARIBE_THEME.borde}`,
          borderRadius: '10px',
          marginBottom: '1.35rem',
        }}
      >
        <LogoEnergiapp size={22} />
        <span
          style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 700,
            fontSize: '0.95rem',
            letterSpacing: '-0.02em',
            color: CARIBE_THEME.petroleo,
          }}
        >
          energiapp <span style={{ color: CARIBE_THEME.turquesa, fontWeight: 600 }}>· Admin</span>
        </span>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            backgroundColor: 'rgba(185, 45, 45, 0.08)',
            border: '1px solid rgba(185, 45, 45, 0.28)',
            color: '#8E1F1F',
            padding: '0.8rem 1rem',
            borderRadius: '12px',
            fontSize: '0.88rem',
            lineHeight: 1.5,
            marginBottom: '1.25rem',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
        <div>
          <label htmlFor="correo-admin" style={caribeLabelStyle}>
            Correo corporativo
          </label>
          <input
            id="correo-admin"
            type="email"
            name="correo"
            required
            autoComplete="email"
            placeholder="admin@solarcaribe.com"
            value={formData.correo}
            onChange={handleChange}
            style={caribeInputStyle}
            onFocus={(e) => (e.target.style.borderColor = CARIBE_THEME.turquesa)}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(9, 47, 53, 0.2)')}
          />
        </div>

        <div>
          <label htmlFor="contrasena-admin" style={caribeLabelStyle}>
            Contraseña
          </label>
          <input
            id="contrasena-admin"
            type="password"
            name="contrasena"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={formData.contrasena}
            onChange={handleChange}
            style={caribeInputStyle}
            onFocus={(e) => (e.target.style.borderColor = CARIBE_THEME.turquesa)}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(9, 47, 53, 0.2)')}
          />
        </div>

        <button
          type="submit"
          disabled={cargando}
          style={{
            ...caribePrimaryButtonStyle,
            marginTop: '0.35rem',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            opacity: cargando ? 0.75 : 1,
            cursor: cargando ? 'not-allowed' : 'pointer',
          }}
          onMouseEnter={(e) => {
            if (!cargando) e.currentTarget.style.backgroundColor = CARIBE_THEME.amarilloHover;
          }}
          onMouseLeave={(e) => {
            if (!cargando) e.currentTarget.style.backgroundColor = CARIBE_THEME.amarillo;
          }}
        >
          <span>{cargando ? 'Verificando credenciales...' : 'Ingresar a consola'}</span>
          {!cargando && <CaribeIcons.ArrowRight color={CARIBE_THEME.petroleo} />}
        </button>
      </form>
    </CaribeAuthLayout>
  );
}