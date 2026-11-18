import React, { useState, useEffect } from 'react';
import UserSidebar from '../../components/UserSidebar';

export default function Paneles() {
  const userId = Number(localStorage.getItem('usuarioId') || localStorage.getItem('idUsuario'));

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
      const res = await fetch(`/api/casas/usuario/${userId}`);
      if (res.ok) {
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
      const res = await fetch(`/api/paneles/recomendar/${idCasa}`);
      if (res.ok) {
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
    <div style={{ backgroundColor: '#0F172A', minHeight: '100vh', color: '#F8FAFC', fontFamily: "'Inter', sans-serif" }}>
      <UserSidebar />

      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', boxSizing: 'border-box' }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 0.25rem 0' }}>
            🔋 Recomendación de Paneles Solares
          </h1>
          <p style={{ color: '#94A3B8', margin: 0, fontSize: '0.95rem' }}>
            Dimensionamiento fotovoltaico calculado automáticamente según el consumo y radiación solar de tu propiedad.
          </p>
        </div>

        {loading ? (
          <p style={{ color: '#94A3B8' }}>Cargando propiedades...</p>
        ) : propiedades.length === 0 ? (
          <div style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '0.85rem', padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>
            Registra primero una propiedad en la pestaña <strong>Propiedades</strong> para calcular tus paneles recomendados.
          </div>
        ) : (
          <div>
            {/* Selector de propiedad */}
            <div style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '0.85rem', padding: '1.25rem', marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ minWidth: '280px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#94A3B8', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Selecciona una propiedad:
                </label>
                <select
                  value={casaSeleccionada}
                  onChange={(e) => setCasaSeleccionada(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '0.5rem', color: '#FFFFFF', fontSize: '0.9rem' }}
                >
                  {propiedades.map((p) => (
                    <option key={p.idCasa} value={p.idCasa}>
                      {p.tipoPropiedad} - {p.direccion || 'GPS'} ({p.ciudad})
                    </option>
                  ))}
                </select>
              </div>

              {propiedadActual && (
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#94A3B8', display: 'block' }}>Consumo a cubrir</span>
                    <strong style={{ fontSize: '1.15rem', color: '#F59E0B' }}>
                      {Number(propiedadActual.consumoMensual).toFixed(1)} kWh/mes
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#94A3B8', display: 'block' }}>Ubicación Solar</span>
                    <strong style={{ fontSize: '1.15rem', color: '#10B981' }}>{propiedadActual.ciudad}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Tarjetas de recomendaciones */}
            {calculando ? (
              <p style={{ color: '#94A3B8' }}>Calculando configuración óptima...</p>
            ) : recomendaciones.length === 0 ? (
              <div style={{ backgroundColor: '#1E293B', border: '1px dashed #334155', borderRadius: '0.85rem', padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>
                No hay paneles registrados en el catálogo <code>paneles_solares</code> de la base de datos.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1.25rem' }}>
                {recomendaciones.map((rec) => (
                  <div
                    key={rec.idPanel}
                    style={{
                      backgroundColor: '#1E293B',
                      border: rec.recomendado ? '2px solid #10B981' : '1px solid #334155',
                      borderRadius: '0.85rem',
                      padding: '1.5rem',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    {rec.recomendado && (
                      <span style={{
                        position: 'absolute',
                        top: '-12px',
                        right: '16px',
                        backgroundColor: '#10B981',
                        color: '#0F172A',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        padding: '0.2rem 0.75rem',
                        borderRadius: '999px'
                      }}>
                        ⭐ OPCIÓN MÁS ÓPTIMA
                      </span>
                    )}

                    <div>
                      <span style={{ fontSize: '0.78rem', color: '#818CF8', fontWeight: 700, textTransform: 'uppercase' }}>
                        {rec.tipo || 'Monocristalino'} • {rec.potenciaW} W c/u
                      </span>
                      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', margin: '0.35rem 0' }}>
                        {rec.nombrePanel}
                      </h2>
                      <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '1rem' }}>
                        {rec.descripcion || `Eficiencia del ${rec.eficiencia}% • Garantía: ${rec.garantiaAnios || '25 años'}`}
                      </p>

                      <div style={{ backgroundColor: '#0F172A', borderRadius: '0.6rem', padding: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block' }}>Cantidad sugerida</span>
                          <strong style={{ fontSize: '1.2rem', color: '#FFFFFF' }}>{rec.cantidadPaneles} paneles</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block' }}>Potencia instalada</span>
                          <strong style={{ fontSize: '1.2rem', color: '#818CF8' }}>{rec.potenciaTotalKw} kWp</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block' }}>Generación estimada</span>
                          <strong style={{ fontSize: '1rem', color: '#10B981' }}>{rec.generacionMensualKwh} kWh/mes</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block' }}>Cobertura consumo</span>
                          <strong style={{ fontSize: '1rem', color: '#F59E0B' }}>{rec.porcentajeCobertura}%</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #334155', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block' }}>Inversión total estimada</span>
                        <strong style={{ fontSize: '1.25rem', color: '#FFFFFF' }}>
                          ${Number(rec.inversionEstimada).toLocaleString('es-CO')}
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}