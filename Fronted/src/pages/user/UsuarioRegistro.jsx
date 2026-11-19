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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function UsuarioRegistro() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    ciudad: 'Valledupar',
    password: '',
    confirmarPassword: '',
  });

  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (formData.password !== formData.confirmarPassword) {
      setError('Las contraseñas no coinciden. Verifícalas e intenta nuevamente.');
      return;
    }

    setCargando(true);

    try {
      const response = await fetch(`${API_URL}/api/usuarios/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre.trim(),
          correo: formData.correo.trim(),
          telefono: formData.telefono.trim(),
          ciudad: formData.ciudad,
          password: formData.password,
          rol: 'USER',
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.mensaje || data?.error || 'No se pudo completar el registro. Verifica si el correo ya existe.'
        );
      }

      setExito('Cuenta creada correctamente. Redirigiendo al inicio de sesión...');
      setTimeout(() => {
        navigate('/usuario-login');
      }, 1400);
    } catch (err) {
      setError(err.message || 'Error de conexión con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <CaribeAuthLayout
      badge="Registro de Propietarios"
      titulo="Crea tu cuenta en Energiapp"
      subtitulo="Registra tus datos para consultar el potencial fotovoltaico de tu inmueble y gestionar soporte técnico."
      footerLinkText="¿Ya tienes una cuenta registrada?"
      footerActionText="Iniciar sesión →"
      onFooterAction={() => navigate('/usuario-login')}
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

      {exito && (
        <div
          role="status"
          style={{
            backgroundColor: 'rgba(28, 128, 119, 0.12)',
            border: '1px solid rgba(28, 128, 119, 0.35)',
            color: CARIBE_THEME.petroleo,
            padding: '0.8rem 1rem',
            borderRadius: '12px',
            fontSize: '0.88rem',
            fontWeight: 600,
            lineHeight: 1.5,
            marginBottom: '1.25rem',
          }}
        >
          {exito}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.05rem' }}>
        <div>
          <label htmlFor="nombre-usuario" style={caribeLabelStyle}>
            Nombre completo
          </label>
          <input
            id="nombre-usuario"
            name="nombre"
            type="text"
            required
            autoComplete="name"
            placeholder="Ej. Carlos Mendoza"
            value={formData.nombre}
            onChange={handleChange}
            style={caribeInputStyle}
            onFocus={(e) => (e.target.style.borderColor = CARIBE_THEME.turquesa)}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(9, 47, 53, 0.2)')}
          />
        </div>

        <div>
          <label htmlFor="correo-registro" style={caribeLabelStyle}>
            Correo electrónico
          </label>
          <input
            id="correo-registro"
            name="correo"
            type="email"
            required
            autoComplete="email"
            placeholder="nombre@correo.com"
            value={formData.correo}
            onChange={handleChange}
            style={caribeInputStyle}
            onFocus={(e) => (e.target.style.borderColor = CARIBE_THEME.turquesa)}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(9, 47, 53, 0.2)')}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.9rem',
          }}
        >
          <div>
            <label htmlFor="telefono-usuario" style={caribeLabelStyle}>
              Teléfono
            </label>
            <input
              id="telefono-usuario"
              name="telefono"
              type="tel"
              required
              autoComplete="tel"
              placeholder="300 000 0000"
              value={formData.telefono}
              onChange={handleChange}
              style={caribeInputStyle}
              onFocus={(e) => (e.target.style.borderColor = CARIBE_THEME.turquesa)}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(9, 47, 53, 0.2)')}
            />
          </div>

          <div>
            <label htmlFor="ciudad-usuario" style={caribeLabelStyle}>
              Ciudad (Región Caribe)
            </label>
            <select
              id="ciudad-usuario"
              name="ciudad"
              value={formData.ciudad}
              onChange={handleChange}
              style={{
                ...caribeInputStyle,
                cursor: 'pointer',
              }}
              onFocus={(e) => (e.target.style.borderColor = CARIBE_THEME.turquesa)}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(9, 47, 53, 0.2)')}
            >
              <option value="Valledupar">Valledupar</option>
              <option value="Barranquilla">Barranquilla</option>
              <option value="Cartagena">Cartagena</option>
              <option value="Santa Marta">Santa Marta</option>
              <option value="Riohacha">Riohacha</option>
              <option value="Montería">Montería</option>
              <option value="Sincelejo">Sincelejo</option>
              <option value="Otra ciudad del Caribe">Otra ciudad del Caribe</option>
            </select>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.9rem',
          }}
        >
          <div>
            <label htmlFor="password-registro" style={caribeLabelStyle}>
              Contraseña
            </label>
            <input
              id="password-registro"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={handleChange}
              style={caribeInputStyle}
              onFocus={(e) => (e.target.style.borderColor = CARIBE_THEME.turquesa)}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(9, 47, 53, 0.2)')}
            />
          </div>

          <div>
            <label htmlFor="confirmar-password" style={caribeLabelStyle}>
              Confirmar contraseña
            </label>
            <input
              id="confirmar-password"
              name="confirmarPassword"
              type="password"
              required
              autoComplete="new-password"
              placeholder="Repite tu contraseña"
              value={formData.confirmarPassword}
              onChange={handleChange}
              style={caribeInputStyle}
              onFocus={(e) => (e.target.style.borderColor = CARIBE_THEME.turquesa)}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(9, 47, 53, 0.2)')}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={cargando}
          style={{
            ...caribePrimaryButtonStyle,
            marginTop: '0.4rem',
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
          <span>{cargando ? 'Registrando cuenta...' : 'Registrarme como propietario'}</span>
          {!cargando && <CaribeIcons.ArrowRight color={CARIBE_THEME.petroleo} />}
        </button>
      </form>
    </CaribeAuthLayout>
  );
}