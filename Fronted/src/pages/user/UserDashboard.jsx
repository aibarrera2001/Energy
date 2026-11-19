import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserSidebar from '../../components/UserSidebar';
import {
  CARIBE_THEME,
  CaribeIcons,
  caribePrimaryButtonStyle,
  useCaribeFonts,
} from '../../components/CaribeSolarUI';

export default function UserDashboard() {
  const navigate = useNavigate();
  useCaribeFonts();

  /* Lectura segura de sesión evitando 'undefined' o 'null' como texto */
  const usuario = (() => {
    try {
      return JSON.parse(localStorage.getItem('usuario') || '{}');
    } catch {
      return {};
    }
  })();

  const rawId =
    localStorage.getItem('usuarioId') ||
    localStorage.getItem('idUsuario') ||
    usuario?.id ||
    usuario?.idUsuario ||
    usuario?.usuarioId;

  const usuarioId =
    rawId !== undefined &&
    rawId !== null &&
    String(rawId).trim() !== '' &&
    String(rawId) !== 'undefined' &&
    String(rawId) !== 'null'
      ? String(rawId)
      : null;

  const [propiedades, setPropiedades] = useState([]);
  const [paneles, setPaneles] = useState([]);
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    const cargarResumen = async () => {
      setCargando(true);
      try {
        const [resProp, resCitas] = await Promise.all([
          usuarioId ? fetch(`/api/casas/usuario/${usuarioId}`).catch(() => null) : Promise.resolve(null),
          usuarioId ? fetch(`/api/citas/usuario/${usuarioId}`).catch(() => null) : Promise.resolve(null),
        ]);

        if (!activo) return;

        let listaCasas = [];
        if (resProp && resProp.ok) {
          const dataProp = await resProp.json().catch(() => []);
          listaCasas = Array.isArray(dataProp) ? dataProp : [];
          setPropiedades(listaCasas);
        }

        if (resCitas && resCitas.ok) {
          const dataCitas = await resCitas.json().catch(() => []);
          setCitas(Array.isArray(dataCitas) ? dataCitas : []);
        }

        if (listaCasas.length > 0 && listaCasas[0].idCasa) {
          const resPaneles = await fetch(`/api/paneles/recomendar/${listaCasas[0].idCasa}`).catch(() => null);
          if (activo && resPaneles && resPaneles.ok) {
            const dataPaneles = await resPaneles.json().catch(() => []);
            setPaneles(Array.isArray(dataPaneles) ? dataPaneles : []);
          }
        } else {
          setPaneles([]);
        }
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargarResumen();

    return () => {
      activo = false;
    };
  }, [usuarioId]);

  const accesosRapidos = [
    {
      etiqueta: 'Inmuebles',
      titulo: 'Mis propiedades',
      descripcion: 'Consulta tus inmuebles registrados o agrega una nueva vivienda o local.',
      accion: 'Ver propiedades',
      ruta: '/propiedades',
      icon: <CaribeIcons.Building size={20} color={CARIBE_THEME.turquesa} />,
    },
    {
      etiqueta: 'Tecnología',
      titulo: 'Catálogo de paneles',
      descripcion: 'Explora módulos fotovoltaicos disponibles, eficiencia y potencia.',
      accion: 'Explorar paneles',
      ruta: '/paneles',
      icon: <CaribeIcons.GridSolar size={20} color={CARIBE_THEME.turquesa} />,
    },
    {
      etiqueta: 'Análisis',
      titulo: 'Reportes solares',
      descripcion: 'Revisa estimaciones de generación y desempeño en el Caribe.',
      accion: 'Ver reportes',
      ruta: '/reportes',
      icon: <CaribeIcons.ArrowUpRight size={20} color={CARIBE_THEME.turquesa} />,
    },
    {
      etiqueta: 'Operación',
      titulo: 'Citas y soporte',
      descripcion: 'Agenda mantenimiento preventivo o revisión técnica con empresas.',
      accion: 'Gestionar citas',
      ruta: '/citas',
      icon: <CaribeIcons.Compass size={20} color={CARIBE_THEME.turquesa} />,
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: CARIBE_THEME.marfil,
        color: CARIBE_THEME.petroleo,
        fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif",
      }}
    >
      <UserSidebar />

      <main
        style={{
          flex: 1,
          marginLeft: 'var(--sidebar-width, 260px)',
          width: 'calc(100% - var(--sidebar-width, 260px))',
          padding: '2.25rem 2.5rem',
          overflowY: 'auto',
          textAlign: 'left',
          transition: 'margin-left 0.28s cubic-bezier(0.4, 0, 0.2, 1), width 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
          {/* Cabecera */}
          <header
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: '1rem',
              paddingBottom: '1.5rem',
              borderBottom: `1px solid ${CARIBE_THEME.borde}`,
              marginBottom: '2rem',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: CARIBE_THEME.turquesa,
                }}
              >
                Panel de Propietario · Región Caribe
              </span>
              <h1
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: 'clamp(1.65rem, 2.8vw, 2.15rem)',
                  fontWeight: 700,
                  color: CARIBE_THEME.petroleo,
                  margin: '0.3rem 0 0 0',
                  letterSpacing: '-0.02em',
                }}
              >
                Hola, {usuario?.nombre || localStorage.getItem('nombreUsuario') || 'Propietario'}
              </h1>
            </div>

            <button
              type="button"
              onClick={() => navigate('/registrar-casa')}
              style={{
                ...caribePrimaryButtonStyle,
                width: 'auto',
                padding: '0.75rem 1.2rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = CARIBE_THEME.amarilloHover)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = CARIBE_THEME.amarillo)}
            >
              <span>Registrar propiedad</span>
              <CaribeIcons.ArrowRight color={CARIBE_THEME.petroleo} />
            </button>
          </header>

          {/* Indicadores principales */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2.25rem',
            }}
          >
            <div
              style={{
                backgroundColor: CARIBE_THEME.blanco,
                border: `1px solid ${CARIBE_THEME.borde}`,
                borderRadius: '16px',
                padding: '1.5rem',
              }}
            >
              <span
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  color: CARIBE_THEME.turquesa,
                  textTransform: 'uppercase',
                }}
              >
                Propiedades registradas
              </span>
              <strong
                style={{
                  display: 'block',
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '1.85rem',
                  margin: '0.4rem 0 0.2rem 0',
                }}
              >
                {cargando ? '...' : propiedades.length}
              </strong>
              <span style={{ fontSize: '0.84rem', color: CARIBE_THEME.pizarra }}>
                Inmuebles asociados a tu cuenta
              </span>
            </div>

            <div
              style={{
                backgroundColor: CARIBE_THEME.blanco,
                border: `1px solid ${CARIBE_THEME.borde}`,
                borderRadius: '16px',
                padding: '1.5rem',
              }}
            >
              <span
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  color: CARIBE_THEME.turquesa,
                  textTransform: 'uppercase',
                }}
              >
                Catálogo solar
              </span>
              <strong
                style={{
                  display: 'block',
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '1.85rem',
                  margin: '0.4rem 0 0.2rem 0',
                }}
              >
                {cargando ? '...' : `${paneles.length} paneles`}
              </strong>
              <span style={{ fontSize: '0.84rem', color: CARIBE_THEME.pizarra }}>
                Módulos disponibles para consulta
              </span>
            </div>

            <div
              style={{
                backgroundColor: CARIBE_THEME.blanco,
                border: `1px solid ${CARIBE_THEME.borde}`,
                borderRadius: '16px',
                padding: '1.5rem',
              }}
            >
              <span
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  color: CARIBE_THEME.turquesa,
                  textTransform: 'uppercase',
                }}
              >
                Citas técnicas
              </span>
              <strong
                style={{
                  display: 'block',
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '1.85rem',
                  margin: '0.4rem 0 0.2rem 0',
                }}
              >
                {cargando ? '...' : citas.length}
              </strong>
              <span style={{ fontSize: '0.84rem', color: CARIBE_THEME.pizarra }}>
                Revisiones y mantenimiento
              </span>
            </div>
          </div>

          {/* Destacado Asistente IA Solar */}
          <section
            style={{
              backgroundColor: CARIBE_THEME.petroleo,
              color: CARIBE_THEME.marfil,
              borderRadius: '16px',
              padding: '1.75rem 2rem',
              marginBottom: '2.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}
          >
            <div style={{ maxWidth: '58ch' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: CARIBE_THEME.amarillo,
                }}
              >
                Asistente técnico · Energiapp IA
              </span>
              <h2
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '1.3rem',
                  margin: '0.4rem 0 0.5rem 0',
                }}
              >
                Resuelve dudas sobre dimensionamiento y paneles solares
              </h2>
              <p
                style={{
                  color: 'rgba(247, 244, 235, 0.78)',
                  fontSize: '0.94rem',
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                Consulta recomendaciones adaptadas al clima y radiación del Caribe colombiano antes de tomar decisiones sobre tu instalación.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/asistente-ia')}
              style={{
                ...caribePrimaryButtonStyle,
                width: 'auto',
                padding: '0.85rem 1.35rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = CARIBE_THEME.amarilloHover)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = CARIBE_THEME.amarillo)}
            >
              <span>Abrir Asistente IA</span>
              <CaribeIcons.ArrowRight color={CARIBE_THEME.petroleo} />
            </button>
          </section>

          {/* Cuadrícula de módulos de usuario */}
          <section>
            <h2
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: '1.15rem',
                marginBottom: '1rem',
              }}
            >
              Módulos de tu cuenta
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(235px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {accesosRapidos.map((item) => (
                <article
                  key={item.ruta}
                  onClick={() => navigate(item.ruta)}
                  style={{
                    backgroundColor: CARIBE_THEME.blanco,
                    border: `1px solid ${CARIBE_THEME.borde}`,
                    borderRadius: '16px',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'border-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = CARIBE_THEME.turquesa)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = CARIBE_THEME.borde)}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '1rem',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          color: CARIBE_THEME.turquesa,
                        }}
                      >
                        {item.etiqueta}
                      </span>
                      {item.icon}
                    </div>

                    <h3
                      style={{
                        fontFamily: "'Sora', sans-serif",
                        fontSize: '1.1rem',
                        margin: '0 0 0.45rem 0',
                      }}
                    >
                      {item.titulo}
                    </h3>

                    <p
                      style={{
                        fontSize: '0.9rem',
                        color: CARIBE_THEME.pizarra,
                        lineHeight: 1.55,
                        margin: '0 0 1.25rem 0',
                      }}
                    >
                      {item.descripcion}
                    </p>
                  </div>

                  <span
                    style={{
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      color: CARIBE_THEME.petroleo,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    {item.accion} →
                  </span>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}