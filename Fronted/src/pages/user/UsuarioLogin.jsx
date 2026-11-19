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
} from '../../components/CaribeSolarUI';

export default function UsuarioLogin() {
  const navigate = useNavigate();

  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const response = await fetch('/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo: correo.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.mensaje || data?.error || 'Credenciales incorrectas. Verifica tu correo y contraseña.');
      }

      localStorage.setItem('usuario', JSON.stringify(data));
      const idDetectado = data?.idUsuario || data?.id || data?.usuarioId;
      if (idDetectado) {
        localStorage.setItem('usuarioId', String(idDetectado));
        localStorage.setItem('idUsuario', String(idDetectado));
      }
      if (data?.nombre) localStorage.setItem('nombreUsuario', data.nombre);
      if (data?.rol) localStorage.setItem('rol', data.rol);

      navigate('/user/dashboard');
    } catch (err) {
      setError(err.message || 'No se pudo conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <CaribeAuthLayout
      badge="Portal de Propietarios"
      titulo="Ingresar a mi sistema"
      subtitulo="Consulta el estado de tu sistema fotovoltaico, estimaciones y solicitudes de soporte técnico."
      footerLinkText="¿Aún no tienes una cuenta registrada?"
      footerActionText="Crear cuenta de propietario →"
      onFooterAction={() => navigate('/usuario-registro')}
    >
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
          energiapp
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
          <label htmlFor="correo-usuario" style={caribeLabelStyle}>
            Correo electrónico
          </label>
          <input
            id="correo-usuario"
            type="email"
            required
            autoComplete="email"
            placeholder="nombre@correo.com"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            style={caribeInputStyle}
            onFocus={(e) => (e.target.style.borderColor = CARIBE_THEME.turquesa)}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(9, 47, 53, 0.2)')}
          />
        </div>

        <div>
          <label htmlFor="password-usuario" style={caribeLabelStyle}>
            Contraseña
          </label>
          <input
            id="password-usuario"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          <span>{cargando ? 'Verificando acceso...' : 'Iniciar sesión'}</span>
          {!cargando && <CaribeIcons.ArrowRight color={CARIBE_THEME.petroleo} />}
        </button>
      </form>
    </CaribeAuthLayout>
  );
}