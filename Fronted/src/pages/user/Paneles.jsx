import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserSidebar from '../../components/UserSidebar';
import {
  CARIBE_THEME,
  CaribeIcons,
  caribeInputStyle,
  caribeLabelStyle,
  caribePrimaryButtonStyle,
  useCaribeFonts,
} from '../../components/CaribeSolarUI';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function Paneles() {
  const navigate = useNavigate();
  useCaribeFonts();

  const rawId = localStorage.getItem('usuarioId') || localStorage.getItem('idUsuario');
  const userId = rawId && rawId !== 'undefined' && rawId !== 'null' ? Number(rawId) : null;

  const [propiedades, setPropiedades] = useState([]);
  const [casaSeleccionada, setCasaSeleccionada] = useState('');
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calculando, setCalculando] = useState(false);

  useEffect(() => {
    cargarPropiedades();
  }, []);

  useEffect(() => {
    if (casaSeleccionada) {
      obtenerRecomendaciones(casaSeleccionada);
    }
  }, [casaSeleccionada]);

  const cargarPropiedades = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/casas/usuario/${userId}`);
      if (res && res.ok) {
        const data = await res.json();
        const lista = Array.isArray(data) ? data : [];
        setPropiedades(lista);
        if (lista.length !== 0) {
          setCasaSeleccionada(String(lista[0].idCasa));
        }
      }
    } catch (err) {
      console.error('Error cargando propiedades:', err);
    } finally {
      setLoading(false);
    }
  };

  const obtenerRecomendaciones = async (idCasa) => {
    try {
      setCalculando(true);
      const res = await fetch(`${API_URL}/api/paneles/recomendar/${idCasa}`);
      if (res && res.ok) {
        const data = await res.json();
        setRecomendaciones(Array.isArray(data) ? data : []);
      } else {
        setRecomendaciones([]);
      }
    } catch (err) {
      console.error('Error obteniendo recomendaciones:', err);
      setRecomendaciones([]);
    } finally {
      setCalculando(false);
    }
  };

  const propiedadActual = propiedades.find((p) => String(p.idCasa) === String(casaSeleccionada));

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
              paddingBottom: '1.5rem',
              borderBottom: `1px solid ${CARIBE_THEME.borde}`,
              marginBottom: '2rem',
            }}
          >
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: CARIBE_THEME.turquesa,
              }}
            >
              Tecnología Fotovoltaica · Región Caribe
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
              Recomendación de Paneles Solares
            </h1>
            <p style={{ color: CARIBE_THEME.pizarra, margin: 0, fontSize: '0.95rem' }}>
              Dimensionamiento fotovoltaico calculado automáticamente según el consumo y radiación solar de tu propiedad.
            </p>
          </header>

          {loading ? (
            <p style={{ color: CARIBE_THEME.pizarra }}>Cargando propiedades...</p>
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
                <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.2rem', margin: '0 0 0.4rem 0' }}>
                  No tienes propiedades registradas
                </h2>
                <p style={{ color: CARIBE_THEME.pizarra, margin: 0, fontSize: '0.94rem' }}>
                  Registra primero una propiedad para calcular los paneles solares recomendados para tu inmueble.
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
                <span>Registrar propiedad</span>
                <CaribeIcons.ArrowRight color={CARIBE_THEME.petroleo} />
              </button>
            </div>
          ) : (
            <div>
              <div
                style={{
                  backgroundColor: CARIBE_THEME.blanco,
                  border: `1px solid ${CARIBE_THEME.borde}`,
                  borderRadius: '16px',
                  padding: '1.4rem 1.65rem',
                  marginBottom: '1.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1.25rem',
                }}
              >
                <div style={{ minWidth: '280px', flex: 1 }}>
                  <label style={caribeLabelStyle}>Selecciona una propiedad:</label>
                  <select
                    value={casaSeleccionada}
                    onChange={(e) => setCasaSeleccionada(e.target.value)}
                    style={caribeInputStyle}
                  >
                    {propiedades.map((p) => (
                      <option key={p.idCasa} value={p.idCasa}>
                        {p.tipoPropiedad} - {p.direccion || 'GPS'} ({p.ciudad})
                      </option>
                    ))}
                  </select>
                </div>

                {propiedadActual && (
                  <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ fontSize: '0.76rem', color: CARIBE_THEME.pizarra, display: 'block', fontWeight: 600 }}>
                        Consumo a cubrir
                      </span>
                      <strong style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.25rem', color: CARIBE_THEME.petroleo }}>
                        {Number(propiedadActual.consumoMensual).toFixed(1)} kWh/mes
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.76rem', color: CARIBE_THEME.pizarra, display: 'block', fontWeight: 600 }}>
                        Ubicación Solar
                      </span>
                      <strong style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.25rem', color: CARIBE_THEME.turquesa }}>
                        {propiedadActual.ciudad}
                      </strong>
                    </div>
                  </div>
                )}
              </div>

              {calculando ? (
                <p style={{ color: CARIBE_THEME.pizarra }}>Calculando configuración óptima...</p>
              ) : recomendaciones.length === 0 ? (
                <div
                  style={{
                    backgroundColor: CARIBE_THEME.blanco,
                    border: `1px solid ${CARIBE_THEME.borde}`,
                    borderRadius: '16px',
                    padding: '2rem',
                    color: CARIBE_THEME.pizarra,
                  }}
                >
                  No hay paneles registrados en el catálogo <code>paneles_solares</code> de la base de datos.
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
                    gap: '1.35rem',
                  }}
                >
                  {recomendaciones.map((rec) => (
                    <article
                      key={rec.idPanel}
                      style={{
                        backgroundColor: CARIBE_THEME.blanco,
                        border: rec.recomendado ? `2px solid ${CARIBE_THEME.turquesa}` : `1px solid ${CARIBE_THEME.borde}`,
                        borderRadius: '16px',
                        padding: '1.65rem',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      {rec.recomendado && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '-12px',
                            right: '16px',
                            backgroundColor: CARIBE_THEME.amarillo,
                            color: CARIBE_THEME.petroleo,
                            fontWeight: 700,
                            fontSize: '0.74rem',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '999px',
                          }}
                        >
                          OPCIÓN MÁS ÓPTIMA
                        </span>
                      )}

                      <div>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: CARIBE_THEME.turquesa,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          {rec.tipo || 'Monocristalino'} • {rec.potenciaW} W c/u
                        </span>
                        <h2
                          style={{
                            fontFamily: "'Sora', sans-serif",
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            color: CARIBE_THEME.petroleo,
                            margin: '0.35rem 0',
                          }}
                        >
                          {rec.nombrePanel}
                        </h2>
                        <p style={{ fontSize: '0.88rem', color: CARIBE_THEME.pizarra, marginBottom: '1.1rem', lineHeight: 1.5 }}>
                          {rec.descripcion || `Eficiencia del ${rec.eficiencia}% • Garantía: ${rec.garantiaAnios || '25 años'}`}
                        </p>

                        <div
                          style={{
                            backgroundColor: CARIBE_THEME.marfil,
                            borderRadius: '12px',
                            padding: '1rem',
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '0.85rem',
                            marginBottom: '1.15rem',
                          }}
                        >
                          <div>
                            <span style={{ fontSize: '0.74rem', color: CARIBE_THEME.pizarra, display: 'block' }}>
                              Cantidad sugerida
                            </span>
                            <strong style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.15rem', color: CARIBE_THEME.petroleo }}>
                              {rec.cantidadPaneles} paneles
                            </strong>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.74rem', color: CARIBE_THEME.pizarra, display: 'block' }}>
                              Potencia instalada
                            </span>
                            <strong style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.15rem', color: CARIBE_THEME.turquesa }}>
                              {rec.potenciaTotalKw} kWp
                            </strong>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.74rem', color: CARIBE_THEME.pizarra, display: 'block' }}>
                              Generación estimada
                            </span>
                            <strong style={{ fontSize: '0.96rem', color: CARIBE_THEME.petroleo }}>
                              {rec.generacionMensualKwh} kWh/mes
                            </strong>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.74rem', color: CARIBE_THEME.pizarra, display: 'block' }}>
                              Cobertura consumo
                            </span>
                            <strong style={{ fontSize: '0.96rem', color: CARIBE_THEME.turquesa }}>
                              {rec.porcentajeCobertura}%
                            </strong>
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          borderTop: `1px solid ${CARIBE_THEME.borde}`,
                          paddingTop: '1rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <span style={{ fontSize: '0.74rem', color: CARIBE_THEME.pizarra, display: 'block' }}>
                            Inversión total estimada
                          </span>
                          <strong style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.25rem', color: CARIBE_THEME.petroleo }}>
                            ${Number(rec.inversionEstimada).toLocaleString('es-CO')}
                          </strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate('/citas')}
                          style={{
                            ...caribePrimaryButtonStyle,
                            width: 'auto',
                            padding: '0.6rem 1rem',
                            fontSize: '0.84rem',
                          }}
                        >
                          Solicitar
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}