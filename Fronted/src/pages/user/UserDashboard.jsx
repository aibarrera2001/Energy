import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserSidebar from '../../components/UserSidebar';

export default function Dashboard() {
  const navigate = useNavigate();
  const userId = Number(localStorage.getItem('usuarioId') || localStorage.getItem('idUsuario'));
  const nombreUsuario = localStorage.getItem('nombreUsuario') || localStorage.getItem('nombre') || 'Usuario';

  const [propiedades, setPropiedades] = useState([]);
  const [casaSeleccionada, setCasaSeleccionada] = useState('');
  const [citas, setCitas] = useState([]);
  const [recomendacionOptima, setRecomendacionOptima] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    if (casaSeleccionada) {
      cargarRecomendacionCasa(casaSeleccionada);
    }
  }, [casaSeleccionada]);

  const cargarDatosIniciales = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const [resCasas, resCitas] = await Promise.all([
        fetch(`/api/casas/usuario/${userId}`),
        fetch(`/api/citas/usuario/${userId}`)
      ]);

      if (resCasas.ok) {
        const dataCasas = await resCasas.json();
        const listaCasas = Array.isArray(dataCasas) ? dataCasas : [];
        setPropiedades(listaCasas);
        if (listaCasas.length !== 0) {
          setCasaSeleccionada(String(listaCasas[0].idCasa));
        }
      }

      if (resCitas.ok) {
        const dataCitas = await resCitas.json();
        setCitas(Array.isArray(dataCitas) ? dataCitas : []);
      }
    } catch (err) {
      console.error('Error cargando dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const cargarRecomendacionCasa = async (idCasa) => {
    try {
      const resRec = await fetch(`/api/paneles/recomendar/${idCasa}`);
      if (resRec.ok) {
        const dataRec = await resRec.json();
        const listaRec = Array.isArray(dataRec) ? dataRec : [];
        const optima = listaRec.find((r) => r.recomendado) || listaRec[0] || null;
        setRecomendacionOptima(optima);
      } else {
        setRecomendacionOptima(null);
      }
    } catch (err) {
      console.error('Error cargando recomendación:', err);
      setRecomendacionOptima(null);
    }
  };

  const propiedadActual = propiedades.find((p) => String(p.idCasa) === String(casaSeleccionada));
  const consumoMensual = propiedadActual ? Number(propiedadActual.consumoMensual || 0) : 0;
  const generacionEstimada = recomendacionOptima ? Number(recomendacionOptima.generacionMensualKwh || 0) : 0;

  // Tarifa promedio residencial (~$850 COP/kWh)
  const ahorroMensualEstimado = Math.round(Math.min(consumoMensual, generacionEstimada) * 850);
  const ahorroAnualEstimado = ahorroMensualEstimado * 12;
  const citasActivas = citas.filter((c) => (c.estado || '').toUpperCase() !== 'CANCELADA');

  return (
    <div style={{ backgroundColor: '#0F172A', minHeight: '100vh', color: '#F8FAFC', fontFamily: "'Inter', sans-serif" }}>
      <UserSidebar />

      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', boxSizing: 'border-box' }}>
        {/* Encabezado idéntico a Paneles y Citas */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 0.25rem 0' }}>
              📊 Panel de Control — {nombreUsuario}
            </h1>
            <p style={{ color: '#94A3B8', margin: 0, fontSize: '0.95rem' }}>
              Resumen energético, ahorro proyectado y estado de tus instalaciones solares.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/propiedades')}
              style={{
                backgroundColor: '#1E293B',
                color: '#FFFFFF',
                fontWeight: 600,
                border: '1px solid #334155',
                padding: '0.65rem 1.1rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              + Nueva Propiedad
            </button>
            <button
              onClick={() => navigate('/citas')}
              style={{
                backgroundColor: '#10B981',
                color: '#0F172A',
                fontWeight: 700,
                border: 'none',
                padding: '0.65rem 1.2rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              📅 Agendar Cita
            </button>
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#94A3B8' }}>Cargando métricas de EnergiApp...</p>
        ) : (
          <>
            {/* Barra selectora de propiedad (igual que en Paneles.jsx) */}
            {propiedades.length !== 0 && (
              <div style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '0.85rem', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ minWidth: '280px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#94A3B8', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Visualizando métricas de:
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
                  <div style={{ display: 'flex', gap: '1.75rem', flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: '#94A3B8', display: 'block' }}>Método de cálculo</span>
                      <strong style={{ fontSize: '0.95rem', color: '#10B981' }}>{propiedadActual.metodoCalculo || 'Factura Directa'}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: '#94A3B8', display: 'block' }}>Ubicación</span>
                      <strong style={{ fontSize: '0.95rem', color: '#FFFFFF' }}>{propiedadActual.ciudad}</strong>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4 Tarjetas KPI */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '0.85rem', padding: '1.35rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600, display: 'block' }}>
                  CONSUMO MENSUAL ACTUAL
                </span>
                <strong style={{ fontSize: '1.75rem', color: '#F59E0B', display: 'block', margin: '0.4rem 0' }}>
                  {consumoMensual.toFixed(1)} kWh
                </strong>
                <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                  {propiedades.length} {propiedades.length === 1 ? 'propiedad activa' : 'propiedades activas'}
                </span>
              </div>

              <div style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '0.85rem', padding: '1.35rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600, display: 'block' }}>
                  GENERACIÓN SOLAR ESTIMADA
                </span>
                <strong style={{ fontSize: '1.75rem', color: '#10B981', display: 'block', margin: '0.4rem 0' }}>
                  {generacionEstimada.toFixed(1)} kWh
                </strong>
                <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                  {recomendacionOptima
                    ? `Cobertura del ${recomendacionOptima.porcentajeCobertura}%`
                    : 'Sin sistema calculado'}
                </span>
              </div>

              <div style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '0.85rem', padding: '1.35rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600, display: 'block' }}>
                  AHORRO PROYECTADO / MES
                </span>
                <strong style={{ fontSize: '1.75rem', color: '#818CF8', display: 'block', margin: '0.4rem 0' }}>
                  ${ahorroMensualEstimado.toLocaleString('es-CO')}
                </strong>
                <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                  ~${ahorroAnualEstimado.toLocaleString('es-CO')} COP / año
                </span>
              </div>

              <div style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '0.85rem', padding: '1.35rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600, display: 'block' }}>
                  CITAS TÉCNICAS ACTIVAS
                </span>
                <strong style={{ fontSize: '1.75rem', color: '#FFFFFF', display: 'block', margin: '0.4rem 0' }}>
                  {citasActivas.length}
                </strong>
                <span style={{ fontSize: '0.8rem', color: '#10B981' }}>
                  {citasActivas.length !== 0 ? `Próxima: ${citasActivas[0].fecha}` : 'Sin visitas pendientes'}
                </span>
              </div>
            </div>

            {/* Sección inferior de 2 columnas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
              {/* Tarjeta Kit Solar Recomendado */}
              <div style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '0.85rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                      🔋 Sistema Solar Recomendado
                    </h2>
                    <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '999px' }}>
                      ÓPTIMO
                    </span>
                  </div>

                  {recomendacionOptima ? (
                    <div>
                      <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', margin: '0 0 0.85rem 0' }}>
                        {recomendacionOptima.nombrePanel}
                      </p>
                      <div style={{ backgroundColor: '#0F172A', borderRadius: '0.6rem', padding: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block' }}>Paneles sugeridos</span>
                          <strong style={{ fontSize: '1.1rem', color: '#FFFFFF' }}>{recomendacionOptima.cantidadPaneles} unidades</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block' }}>Potencia total</span>
                          <strong style={{ fontSize: '1.1rem', color: '#818CF8' }}>{recomendacionOptima.potenciaTotalKw} kWp</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block' }}>Inversión estimada</span>
                          <strong style={{ fontSize: '1.1rem', color: '#10B981' }}>
                            ${Number(recomendacionOptima.inversionEstimada).toLocaleString('es-CO')}
                          </strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block' }}>Retorno estimado</span>
                          <strong style={{ fontSize: '1.1rem', color: '#F59E0B' }}>
                            {ahorroAnualEstimado !== 0
                              ? `${(Number(recomendacionOptima.inversionEstimada) / ahorroAnualEstimado).toFixed(1)} años`
                              : 'N/A'}
                          </strong>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: '#94A3B8', fontSize: '0.9rem', margin: 0 }}>
                      Registra una propiedad para ver el dimensionamiento fotovoltaico recomendado.
                    </p>
                  )}
                </div>

                <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => navigate('/paneles')}
                    style={{ backgroundColor: '#10B981', color: '#0F172A', fontWeight: 700, border: 'none', padding: '0.6rem 1.15rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.88rem' }}
                  >
                    Comparar todos los kits →
                  </button>
                </div>
              </div>

              {/* Tarjeta Próximas Citas */}
              <div style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '0.85rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                      📅 Próximas Visitas Técnicas
                    </h2>
                    <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                      {citasActivas.length} agendadas
                    </span>
                  </div>

                  {citasActivas.length === 0 ? (
                    <p style={{ color: '#94A3B8', fontSize: '0.9rem', margin: 0 }}>
                      No tienes citas técnicas programadas en este momento.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {citasActivas.slice(0, 3).map((cita) => (
                        <div
                          key={cita.idCita}
                          style={{
                            backgroundColor: '#0F172A',
                            borderRadius: '0.6rem',
                            padding: '0.85rem 1rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '0.75rem'
                          }}
                        >
                          <div>
                            <strong style={{ fontSize: '0.92rem', color: '#FFFFFF', display: 'block' }}>
                              {cita.tipoServicio}
                            </strong>
                            <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                              📆 {cita.fecha} • ⏰ {String(cita.hora).slice(0, 5)}
                            </span>
                          </div>
                          <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', fontSize: '0.72rem', fontWeight: 700, padding: '0.22rem 0.6rem', borderRadius: '999px' }}>
                            {cita.estado || 'PENDIENTE'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => navigate('/citas')}
                    style={{ backgroundColor: '#0F172A', color: '#FFFFFF', fontWeight: 600, border: '1px solid #334155', padding: '0.6rem 1.15rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.88rem' }}
                  >
                    Ver todas las citas →
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}