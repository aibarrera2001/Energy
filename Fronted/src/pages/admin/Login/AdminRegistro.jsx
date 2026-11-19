import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CARIBE_THEME,
  LogoEnergiapp,
  CaribeIcons,
  caribeInputStyle,
  caribeLabelStyle,
  caribePrimaryButtonStyle,
  useCaribeFonts,
} from '../../../components/CaribeSolarUI';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function AdminRegistro() {
  const navigate = useNavigate();
  useCaribeFonts();

  const [modo, setModo] = useState('CREAR'); // 'CREAR' o 'UNIR'
  const [empresasExistentes, setEmpresasExistentes] = useState([]);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);

  const [formData, setFormData] = useState({
    nombreAdmin: '',
    correoAdmin: '',
    telefonoAdmin: '',
    contrasena: '',
    contrasenaConf: '',
    empresaIdExistente: '',
    nombreEmpresa: '',
    nit: '',
    ciudad: 'Valledupar',
    direccion: '',
    telefonoEmpresa: '',
    emailEmpresa: '',
    aportes: '',
    diferenciadores: '',
  });

  const [paneles, setPaneles] = useState([
    { nombre: 'Panel X200', tipo: 'Monocristalino', potencia: 450, eficiencia: 20.5, stock: 10, precio: 500000 },
  ]);

  useEffect(() => {
    let mounted = true;

    if (modo === 'UNIR') {
      fetch(`${API_URL}/api/admin/empresas`)
        .then((res) => {
          if (!res.ok) throw new Error('Servidor no disponible');
          return res.json();
        })
        .then((data) => {
          if (!mounted) return;
          if (Array.isArray(data) && data.length > 0) {
            setEmpresasExistentes(data);
          } else {
            setEmpresasExistentes([
              { idEmpresa: 1, nombre: 'Solar Caribe SAS', nit: '900123456-1', ciudad: 'Valledupar' },
            ]);
          }
        })
        .catch(() => {
          if (mounted) {
            setEmpresasExistentes([
              { idEmpresa: 1, nombre: 'Solar Caribe SAS', nit: '900123456-1', ciudad: 'Valledupar' },
            ]);
          }
        });
    }

    return () => {
      mounted = false;
    };
  }, [modo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePanelChange = (index, field, value) => {
    setPaneles((prev) => {
      const copia = [...prev];
      copia[index] = { ...copia[index], [field]: value };
      return copia;
    });
  };

  const agregarPanel = () => {
    setPaneles((prev) => [
      ...prev,
      { nombre: '', tipo: 'Monocristalino', potencia: 400, eficiencia: 20, stock: 5, precio: 450000 },
    ]);
  };

  const removerPanel = (index) => {
    setPaneles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');

    if (formData.contrasena !== formData.contrasenaConf) {
      setError('Las contraseñas no coinciden. Verifícalas e intenta nuevamente.');
      return;
    }

    setCargando(true);

    const [nombre, ...resto] = formData.nombreAdmin.trim().split(' ');

    const payload = {
      tipoRegistro: modo,
      nombreAdmin: nombre,
      apellidoAdmin: resto.join(' ') || '-',
      correoAdmin: formData.correoAdmin.trim(),
      telefonoAdmin: formData.telefonoAdmin.trim(),
      contrasenaAdmin: formData.contrasena,
      idEmpresaExistente: modo === 'UNIR' ? Number(formData.empresaIdExistente) : null,
      nombreEmpresa: formData.nombreEmpresa.trim(),
      nit: formData.nit.trim(),
      ciudadEmpresa: formData.ciudad,
      direccionEmpresa: formData.direccion.trim(),
      telefonoEmpresa: formData.telefonoEmpresa.trim(),
      emailEmpresa: formData.emailEmpresa.trim(),
      aportes: formData.aportes.trim(),
      diferenciadores: formData.diferenciadores.trim(),
      panelesIniciales:
        modo === 'CREAR'
          ? paneles.map((p) => ({
              nombre: p.nombre.trim(),
              tipo: p.tipo,
              potencia: Number(p.potencia) || 0,
              eficiencia: Number(p.eficiencia) || 0,
              stock: Number(p.stock) || 0,
              precio: Number(p.precio) || 0,
            }))
          : [],
    };

    try {
      const res = await fetch(`${API_URL}/api/admin/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        throw new Error(errorText || `Error en el servidor (${res.status})`);
      }

      const mensajeText = await res.text().catch(() => '');
      setExito(mensajeText || 'Registro administrativo completado. Redirigiendo al acceso...');
      setTimeout(() => {
        navigate('/admin-login');
      }, 1500);
    } catch (err) {
      console.error('Error de conexión:', err);
      setError(err.message || 'Error de conexión con el servidor Spring Boot.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: CARIBE_THEME.marfil,
        color: CARIBE_THEME.petroleo,
        fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif",
        padding: '2.25rem 1.25rem',
        textAlign: 'left',
      }}
    >
      <div
        style={{
          maxWidth: '880px',
          margin: '0 auto',
          backgroundColor: CARIBE_THEME.blanco,
          border: `1px solid ${CARIBE_THEME.borde}`,
          borderRadius: '20px',
          padding: '2.25rem',
          boxShadow: '0 18px 42px rgba(9, 47, 53, 0.06)',
        }}
      >
        {/* Barra superior de marca y regreso */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingBottom: '1.35rem',
            borderBottom: `1px solid ${CARIBE_THEME.borde}`,
            marginBottom: '1.75rem',
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
            <LogoEnergiapp size={26} />
            <span
              style={{
                fontFamily: "'Sora', sans-serif",
                fontWeight: 700,
                fontSize: '1.05rem',
                letterSpacing: '-0.02em',
                color: CARIBE_THEME.petroleo,
              }}
            >
              energiapp <span style={{ color: CARIBE_THEME.turquesa, fontWeight: 600 }}>· Empresas</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/admin-login')}
            style={{
              background: 'none',
              border: 'none',
              color: CARIBE_THEME.turquesa,
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            ← Volver a iniciar sesión
          </button>
        </div>

        {/* Título */}
        <header style={{ marginBottom: '1.75rem' }}>
          <span
            style={{
              fontSize: '0.76rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: CARIBE_THEME.turquesa,
            }}
          >
            Alta de Proveedores · Región Caribe Colombiana
          </span>
          <h1
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: 'clamp(1.6rem, 2.8vw, 2.05rem)',
              fontWeight: 700,
              color: CARIBE_THEME.petroleo,
              margin: '0.35rem 0 0.35rem 0',
              letterSpacing: '-0.02em',
            }}
          >
            Registro de Administrador y Empresa
          </h1>
          <p style={{ color: CARIBE_THEME.pizarra, fontSize: '0.94rem', margin: 0 }}>
            Crea el perfil de tu empresa instaladora o vincúlate como administrador a una organización ya registrada.
          </p>
        </header>

        {/* Selector de modo */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.5rem',
            backgroundColor: CARIBE_THEME.marfil,
            border: `1px solid ${CARIBE_THEME.borde}`,
            padding: '0.4rem',
            borderRadius: '14px',
            marginBottom: '1.75rem',
          }}
        >
          <button
            type="button"
            onClick={() => setModo('CREAR')}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              backgroundColor: modo === 'CREAR' ? CARIBE_THEME.petroleo : 'transparent',
              color: modo === 'CREAR' ? CARIBE_THEME.marfil : CARIBE_THEME.pizarra,
              transition: 'all 0.15s ease',
            }}
          >
            Crear nueva empresa
          </button>
          <button
            type="button"
            onClick={() => setModo('UNIR')}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              backgroundColor: modo === 'UNIR' ? CARIBE_THEME.petroleo : 'transparent',
              color: modo === 'UNIR' ? CARIBE_THEME.marfil : CARIBE_THEME.pizarra,
              transition: 'all 0.15s ease',
            }}
          >
            Unirme a empresa existente
          </button>
        </div>

        {/* Alertas */}
        {error && (
          <div
            role="alert"
            style={{
              backgroundColor: 'rgba(185, 45, 45, 0.08)',
              border: '1px solid rgba(185, 45, 45, 0.28)',
              color: '#8E1F1F',
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              fontSize: '0.88rem',
              marginBottom: '1.35rem',
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
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              fontSize: '0.88rem',
              fontWeight: 600,
              marginBottom: '1.35rem',
            }}
          >
            {exito}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* BLOQUE 1: DATOS DEL ADMINISTRADOR */}
          <section
            style={{
              backgroundColor: CARIBE_THEME.marfil,
              padding: '1.45rem',
              borderRadius: '16px',
              border: `1px solid ${CARIBE_THEME.borde}`,
            }}
          >
            <h2
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: '1.05rem',
                color: CARIBE_THEME.petroleo,
                margin: '0 0 1rem 0',
              }}
            >
              1. Datos del Administrador
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={caribeLabelStyle}>Nombre completo *</label>
                <input
                  type="text"
                  name="nombreAdmin"
                  value={formData.nombreAdmin}
                  onChange={handleChange}
                  required
                  placeholder="Ana Martínez"
                  style={caribeInputStyle}
                />
              </div>
              <div>
                <label style={caribeLabelStyle}>Correo electrónico *</label>
                <input
                  type="email"
                  name="correoAdmin"
                  value={formData.correoAdmin}
                  onChange={handleChange}
                  required
                  placeholder="admin@empresa.com"
                  style={caribeInputStyle}
                />
              </div>
              <div>
                <label style={caribeLabelStyle}>Teléfono *</label>
                <input
                  type="tel"
                  name="telefonoAdmin"
                  value={formData.telefonoAdmin}
                  onChange={handleChange}
                  required
                  placeholder="+57 300 123 4567"
                  style={caribeInputStyle}
                />
              </div>
              <div>
                <label style={caribeLabelStyle}>Contraseña (mín. 8 caracteres) *</label>
                <input
                  type="password"
                  name="contrasena"
                  value={formData.contrasena}
                  onChange={handleChange}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  style={caribeInputStyle}
                />
              </div>
              <div>
                <label style={caribeLabelStyle}>Confirmar contraseña *</label>
                <input
                  type="password"
                  name="contrasenaConf"
                  value={formData.contrasenaConf}
                  onChange={handleChange}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  style={caribeInputStyle}
                />
              </div>
            </div>
          </section>

          {/* BLOQUE 2A: UNIRSE A EMPRESA EXISTENTE */}
          {modo === 'UNIR' && (
            <section
              style={{
                backgroundColor: CARIBE_THEME.marfil,
                padding: '1.45rem',
                borderRadius: '16px',
                border: `1px solid ${CARIBE_THEME.borde}`,
              }}
            >
              <h2
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '1.05rem',
                  color: CARIBE_THEME.petroleo,
                  margin: '0 0 1rem 0',
                }}
              >
                2. Seleccionar Empresa Registrada
              </h2>
              <div>
                <label style={caribeLabelStyle}>Empresa instaladora *</label>
                <select
                  name="empresaIdExistente"
                  value={formData.empresaIdExistente}
                  onChange={handleChange}
                  required
                  style={caribeInputStyle}
                >
                  <option value="">-- Selecciona una empresa --</option>
                  {empresasExistentes.map((emp) => (
                    <option key={emp.idEmpresa || emp.id_empresa} value={emp.idEmpresa || emp.id_empresa}>
                      {emp.nombre} (NIT: {emp.nit}) - {emp.ciudad}
                    </option>
                  ))}
                </select>
              </div>
            </section>
          )}

          {/* BLOQUE 2B: CREAR NUEVA EMPRESA */}
          {modo === 'CREAR' && (
            <>
              <section
                style={{
                  backgroundColor: CARIBE_THEME.marfil,
                  padding: '1.45rem',
                  borderRadius: '16px',
                  border: `1px solid ${CARIBE_THEME.borde}`,
                }}
              >
                <h2
                  style={{
                    fontFamily: "'Sora', sans-serif",
                    fontSize: '1.05rem',
                    color: CARIBE_THEME.petroleo,
                    margin: '0 0 1rem 0',
                  }}
                >
                  2. Datos Corporativos de la Empresa
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={caribeLabelStyle}>Nombre de la empresa *</label>
                    <input
                      type="text"
                      name="nombreEmpresa"
                      value={formData.nombreEmpresa}
                      onChange={handleChange}
                      required
                      placeholder="Solar Caribe SAS"
                      style={caribeInputStyle}
                    />
                  </div>
                  <div>
                    <label style={caribeLabelStyle}>NIT *</label>
                    <input
                      type="text"
                      name="nit"
                      value={formData.nit}
                      onChange={handleChange}
                      required
                      placeholder="900123456-1"
                      style={caribeInputStyle}
                    />
                  </div>
                  <div>
                    <label style={caribeLabelStyle}>Ciudad sede *</label>
                    <select name="ciudad" value={formData.ciudad} onChange={handleChange} style={caribeInputStyle}>
                      <option value="Valledupar">Valledupar</option>
                      <option value="Barranquilla">Barranquilla</option>
                      <option value="Cartagena">Cartagena</option>
                      <option value="Santa Marta">Santa Marta</option>
                      <option value="Montería">Montería</option>
                      <option value="Sincelejo">Sincelejo</option>
                      <option value="Riohacha">Riohacha</option>
                    </select>
                  </div>
                  <div>
                    <label style={caribeLabelStyle}>Dirección *</label>
                    <input
                      type="text"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      required
                      placeholder="Cra 7 #12-34"
                      style={caribeInputStyle}
                    />
                  </div>
                  <div>
                    <label style={caribeLabelStyle}>Teléfono empresa *</label>
                    <input
                      type="tel"
                      name="telefonoEmpresa"
                      value={formData.telefonoEmpresa}
                      onChange={handleChange}
                      required
                      placeholder="+57 300 999 8877"
                      style={caribeInputStyle}
                    />
                  </div>
                  <div>
                    <label style={caribeLabelStyle}>Email empresa *</label>
                    <input
                      type="email"
                      name="emailEmpresa"
                      value={formData.emailEmpresa}
                      onChange={handleChange}
                      required
                      placeholder="contacto@empresa.com"
                      style={caribeInputStyle}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div>
                    <label style={caribeLabelStyle}>¿Qué aporta su empresa? *</label>
                    <textarea
                      name="aportes"
                      value={formData.aportes}
                      onChange={handleChange}
                      required
                      rows={2}
                      placeholder="Instalación y mantenimiento de sistemas fotovoltaicos..."
                      style={{ ...caribeInputStyle, resize: 'vertical' }}
                    />
                  </div>
                  <div>
                    <label style={caribeLabelStyle}>¿En qué destaca? (Diferenciadores) *</label>
                    <textarea
                      name="diferenciadores"
                      value={formData.diferenciadores}
                      onChange={handleChange}
                      required
                      rows={2}
                      placeholder="Garantía extendida, soporte 24/7, certificación RETIE..."
                      style={{ ...caribeInputStyle, resize: 'vertical' }}
                    />
                  </div>
                </div>
              </section>

              {/* BLOQUE 3: INVENTARIO INICIAL DE PANELES */}
              <section
                style={{
                  backgroundColor: CARIBE_THEME.marfil,
                  padding: '1.45rem',
                  borderRadius: '16px',
                  border: `1px solid ${CARIBE_THEME.borde}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div>
                    <h2
                      style={{
                        fontFamily: "'Sora', sans-serif",
                        fontSize: '1.05rem',
                        color: CARIBE_THEME.petroleo,
                        margin: 0,
                      }}
                    >
                      3. Inventario Inicial de Paneles
                    </h2>
                    <span style={{ fontSize: '0.82rem', color: CARIBE_THEME.pizarra }}>
                      Modelo · Tecnología · Potencia (W) · Eficiencia (%) · Stock · Precio (COP)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={agregarPanel}
                    style={{
                      backgroundColor: CARIBE_THEME.turquesa,
                      color: CARIBE_THEME.blanco,
                      border: 'none',
                      padding: '0.5rem 0.9rem',
                      borderRadius: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.84rem',
                      fontFamily: 'inherit',
                    }}
                  >
                    + Agregar panel
                  </button>
                </div>

                {paneles.map((p, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1.2fr 0.9fr 0.9fr 0.8fr 1.2fr auto',
                      gap: '0.5rem',
                      marginBottom: '0.75rem',
                      alignItems: 'center',
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Modelo"
                      value={p.nombre}
                      onChange={(e) => handlePanelChange(index, 'nombre', e.target.value)}
                      required
                      style={caribeInputStyle}
                    />
                    <input
                      type="text"
                      placeholder="Tipo"
                      value={p.tipo}
                      onChange={(e) => handlePanelChange(index, 'tipo', e.target.value)}
                      required
                      style={caribeInputStyle}
                    />
                    <input
                      type="number"
                      placeholder="W"
                      value={p.potencia}
                      onChange={(e) => handlePanelChange(index, 'potencia', e.target.value)}
                      required
                      style={caribeInputStyle}
                    />
                    <input
                      type="number"
                      step="0.1"
                      placeholder="%"
                      value={p.eficiencia}
                      onChange={(e) => handlePanelChange(index, 'eficiencia', e.target.value)}
                      required
                      style={caribeInputStyle}
                    />
                    <input
                      type="number"
                      placeholder="Stock"
                      value={p.stock}
                      onChange={(e) => handlePanelChange(index, 'stock', e.target.value)}
                      required
                      style={caribeInputStyle}
                    />
                    <input
                      type="number"
                      placeholder="Precio ($)"
                      value={p.precio}
                      onChange={(e) => handlePanelChange(index, 'precio', e.target.value)}
                      required
                      style={caribeInputStyle}
                    />
                    {paneles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removerPanel(index)}
                        title="Eliminar fila"
                        style={{
                          backgroundColor: 'rgba(185, 45, 45, 0.12)',
                          color: '#8E1F1F',
                          border: '1px solid rgba(185, 45, 45, 0.25)',
                          padding: '0.65rem 0.8rem',
                          borderRadius: '10px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </section>
            </>
          )}

          {/* Botones finales */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => navigate('/admin-login')}
              style={{
                padding: '0.85rem 1.35rem',
                backgroundColor: CARIBE_THEME.blanco,
                color: CARIBE_THEME.petroleo,
                border: `1px solid ${CARIBE_THEME.borde}`,
                borderRadius: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando}
              style={{
                ...caribePrimaryButtonStyle,
                width: 'auto',
                padding: '0.85rem 1.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: cargando ? 0.7 : 1,
                cursor: cargando ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!cargando) e.currentTarget.style.backgroundColor = CARIBE_THEME.amarilloHover;
              }}
              onMouseLeave={(e) => {
                if (!cargando) e.currentTarget.style.backgroundColor = CARIBE_THEME.amarillo;
              }}
            >
              <span>{cargando ? 'Registrando empresa...' : 'Registrar Administrador'}</span>
              {!cargando && <CaribeIcons.ArrowRight color={CARIBE_THEME.petroleo} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}