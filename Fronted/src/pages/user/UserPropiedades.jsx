import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserSidebar from '../../components/UserSidebar';
import {
  CARIBE_THEME,
  CaribeIcons,
  caribePrimaryButtonStyle,
  useCaribeFonts,
} from '../../components/CaribeSolarUI';

export default function UserPropiedades() {
  const navigate = useNavigate();
  useCaribeFonts();

  const rawId = localStorage.getItem('usuarioId') || localStorage.getItem('idUsuario');
  const userId = rawId && rawId !== 'undefined' && rawId !== 'null' ? Number(rawId) : null;

  const [propiedades, setPropiedades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obtenerPropiedades();
  }, []);

  const obtenerPropiedades = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/casas/usuario/${userId}`);
      if (res && res.ok) {
        const data = await res.json();
        setPropiedades(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error al cargar propiedades:', err);
    } finally {
      setLoading(false);
    }
  };

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
                Gestión de Inmuebles · Región Caribe
              </span>
              <h1
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: 'clamp(1.65rem, 2.8vw, 2.15rem)',
                  fontWeight: 700,
                  color: CARIBE_THEME.petroleo,
                  margin: '0.3rem 0 0.25rem 0',
                  letterSpacing: '-0.02em',
                }}
              >
                Mis Propiedades
              </h1>
              <p style={{ color: CARIBE_THEME.pizarra, margin: 0, fontSize: '0.95rem' }}>
                Administra tus inmuebles y perfiles de consumo energético para el dimensionamiento solar.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/registrar-casa')}
              style={{
                ...caribePrimaryButtonStyle,
                width: 'auto',
                padding: '0.75rem 1.25rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
              }}
            >
              <span>+ Registrar propiedad</span>
              <CaribeIcons.ArrowRight color={CARIBE_THEME.petroleo} />
            </button>
          </header>

          {loading ? (
            <p style={{ color: CARIBE_THEME.pizarra }}>Cargando tus propiedades...</p>
          ) : propiedades.length === 0 ? (
            <div
              style={{
                backgroundColor: CARIBE_THEME.blanco,
                border: `1px solid ${CARIBE_THEME.borde}`,
                borderRadius: '16px',
                padding: '2.5rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.25rem',
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: "'Sora', sans-serif",
                    fontSize: '1.2rem',
                    margin: '0 0 0.4rem 0',
                    color: CARIBE_THEME.petroleo,
                  }}
                >
                  Aún no has registrado ninguna propiedad
                </h2>
                <p style={{ color: CARIBE_THEME.pizarra, margin: 0, fontSize: '0.94rem' }}>
                  Agrega una vivienda, finca o local comercial para estimar los paneles solares recomendados.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/registrar-casa')}
                style={{
                  ...caribePrimaryButtonStyle,
                  width: 'auto',
                  padding: '0.8rem 1.3rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>Registrar primera propiedad</span>
                <CaribeIcons.ArrowRight color={CARIBE_THEME.petroleo} />
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {propiedades.map((prop) => (
                <article
                  key={prop.idCasa || prop.id}
                  style={{
                    backgroundColor: CARIBE_THEME.blanco,
                    border: `1px solid ${CARIBE_THEME.borde}`,
                    borderRadius: '16px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          color: CARIBE_THEME.turquesa,
                        }}
                      >
                        {prop.tipoPropiedad || 'INMUEBLE'} · {prop.ciudad}
                      </span>
                      <CaribeIcons.Building size={18} color={CARIBE_THEME.turquesa} />
                    </div>

                    <h2
                      style={{
                        fontFamily: "'Sora', sans-serif",
                        fontSize: '1.15rem',
                        margin: '0 0 0.35rem 0',
                        color: CARIBE_THEME.petroleo,
                      }}
                    >
                      {prop.direccion || 'Ubicación por coordenadas GPS'}
                    </h2>

                    <div
                      style={{
                        marginTop: '1rem',
                        padding: '0.85rem 1rem',
                        borderRadius: '12px',
                        backgroundColor: CARIBE_THEME.marfil,
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '0.75rem',
                      }}
                    >
                      <div>
                        <span style={{ display: 'block', fontSize: '0.74rem', color: CARIBE_THEME.pizarra }}>
                          Consumo mensual
                        </span>
                        <strong style={{ fontFamily: "'Sora', sans-serif", fontSize: '1rem', color: CARIBE_THEME.petroleo }}>
                          {Number(prop.consumoMensual || 0).toFixed(1)} kWh
                        </strong>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.74rem', color: CARIBE_THEME.pizarra }}>
                          Área disponible
                        </span>
                        <strong style={{ fontFamily: "'Sora', sans-serif", fontSize: '1rem', color: CARIBE_THEME.turquesa }}>
                          {prop.areaDisponibleM2 || prop.areaTerrazaTechoM2 || '—'} m²
                        </strong>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('/paneles')}
                    style={{
                      width: '100%',
                      padding: '0.7rem 1rem',
                      borderRadius: '10px',
                      border: `1px solid ${CARIBE_THEME.borde}`,
                      backgroundColor: CARIBE_THEME.blanco,
                      color: CARIBE_THEME.petroleo,
                      fontWeight: 700,
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Ver paneles recomendados →
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}