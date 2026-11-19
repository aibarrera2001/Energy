import React, { useState, useEffect } from 'react';
import UserSidebar from '../../components/UserSidebar';
import {
  CARIBE_THEME,
  CaribeIcons,
  caribeInputStyle,
  caribeLabelStyle,
  caribePrimaryButtonStyle,
  useCaribeFonts,
} from '../../components/CaribeSolarUI';

export default function Citas() {
  useCaribeFonts();

  const rawId = localStorage.getItem('usuarioId') || localStorage.getItem('idUsuario');
  const userId = rawId && rawId !== 'undefined' && rawId !== 'null' ? Number(rawId) : null;

  const [citas, setCitas] = useState([]);
  const [propiedades, setPropiedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [nuevaCita, setNuevaCita] = useState({
    idCasa: '',
    tipoServicio: 'Instalación de Paneles Solares',
    fecha: '',
    hora: '09:00',
    articuloDanado: '',
    descripcionDanio: '',
    notas: '',
  });

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const [resCitas, resCasas] = await Promise.all([
        fetch(`/api/citas/usuario/${userId}`),
        fetch(`/api/casas/usuario/${userId}`),
      ]);

      if (resCitas && resCitas.ok) {
        const dataCitas = await resCitas.json();
        setCitas(Array.isArray(dataCitas) ? dataCitas : []);
      }

      if (resCasas && resCasas.ok) {
        const dataCasas = await resCasas.json();
        const listaCasas = Array.isArray(dataCasas) ? dataCasas : [];
        setPropiedades(listaCasas);
        if (listaCasas.length !== 0) {
          setNuevaCita((prev) => ({ ...prev, idCasa: String(listaCasas[0].idCasa) }));
        }
      }
    } catch (err) {
      console.error('Error cargando datos de citas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nuevaCita.idCasa) {
      alert('Debes registrar primero una propiedad para agendar una cita.');
      return;
    }

    try {
      setGuardando(true);
      const payload = {
        idUsuario: userId,
        idCasa: Number(nuevaCita.idCasa),
        tipoServicio: nuevaCita.tipoServicio,
        fecha: nuevaCita.fecha,
        hora: nuevaCita.hora.length === 5 ? `${nuevaCita.hora}:00` : nuevaCita.hora,
        articuloDanado: nuevaCita.articuloDanado || null,
        descripcionDanio: nuevaCita.descripcionDanio || null,
        notas: nuevaCita.notas || null,
      };

      const res = await fetch('/api/citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo agendar la cita');
      }

      setShowModal(false);
      setNuevaCita((prev) => ({
        ...prev,
        fecha: '',
        hora: '09:00',
        articuloDanado: '',
        descripcionDanio: '',
        notas: '',
      }));
      cargarDatosIniciales();
    } catch (err) {
      alert(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const obtenerNombreCasa = (idCasa) => {
    const casa = propiedades.find((p) => Number(p.idCasa) === Number(idCasa));
    return casa ? `${casa.tipoPropiedad} - ${casa.direccion || casa.ciudad}` : `Propiedad #${idCasa}`;
  };

  const badgeEstado = (estado) => {
    const est = (estado || 'PENDIENTE').toUpperCase();
    if (est === 'CONFIRMADA' || est === 'COMPLETADA') {
      return { bg: 'rgba(28, 128, 119, 0.14)', color: CARIBE_THEME.turquesa, text: est };
    }
    if (est === 'CANCELADA') {
      return { bg: 'rgba(185, 45, 45, 0.1)', color: '#8E1F1F', text: est };
    }
    return { bg: 'rgba(255, 191, 63, 0.28)', color: CARIBE_THEME.petroleo, text: est };
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
                Operación y Soporte · Región Caribe
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
                Citas Técnicas e Instalaciones
              </h1>
              <p style={{ color: CARIBE_THEME.pizarra, margin: 0, fontSize: '0.95rem' }}>
                Programa visitas de instalación fotovoltaica, inspección o mantenimiento en tus propiedades.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowModal(true)}
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
              <span>+ Agendar nueva cita</span>
              <CaribeIcons.ArrowRight color={CARIBE_THEME.petroleo} />
            </button>
          </header>

          {loading ? (
            <p style={{ color: CARIBE_THEME.pizarra }}>Cargando tus citas agendadas...</p>
          ) : citas.length === 0 ? (
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
                  No tienes citas agendadas
                </h2>
                <p style={{ color: CARIBE_THEME.pizarra, margin: 0, fontSize: '0.94rem' }}>
                  Programa una visita técnica para evaluar la instalación o dar mantenimiento a tu sistema solar.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                style={{
                  ...caribePrimaryButtonStyle,
                  width: 'auto',
                  padding: '0.8rem 1.3rem',
                }}
              >
                Agendar primera cita
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {citas.map((cita) => {
                const badge = badgeEstado(cita.estado);
                return (
                  <article
                    key={cita.idCita}
                    style={{
                      backgroundColor: CARIBE_THEME.blanco,
                      border: `1px solid ${CARIBE_THEME.borde}`,
                      borderRadius: '16px',
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: CARIBE_THEME.petroleo, margin: 0 }}>
                        {cita.tipoServicio}
                      </h2>
                      <span
                        style={{
                          backgroundColor: badge.bg,
                          color: badge.color,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.28rem 0.65rem',
                          borderRadius: '8px',
                        }}
                      >
                        {badge.text}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.88rem', color: CARIBE_THEME.petroleo }}>
                      <strong>Propiedad:</strong> {obtenerNombreCasa(cita.idCasa)}
                    </div>

                    <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem', color: CARIBE_THEME.pizarra }}>
                      <span>Fecha: <strong>{cita.fecha}</strong></span>
                      <span>Hora: <strong>{String(cita.hora).slice(0, 5)}</strong></span>
                    </div>

                    {cita.tecnicoAsignado && (
                      <div style={{ fontSize: '0.84rem', color: CARIBE_THEME.turquesa }}>
                        Técnico asignado: <strong>{cita.tecnicoAsignado}</strong>
                      </div>
                    )}

                    {cita.notas && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.86rem',
                          color: CARIBE_THEME.pizarra,
                          backgroundColor: CARIBE_THEME.marfil,
                          padding: '0.75rem',
                          borderRadius: '10px',
                        }}
                      >
                        {cita.notas}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {showModal && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(9, 47, 53, 0.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem',
              }}
            >
              <div
                style={{
                  backgroundColor: CARIBE_THEME.blanco,
                  border: `1px solid ${CARIBE_THEME.borde}`,
                  borderRadius: '16px',
                  width: '100%',
                  maxWidth: '460px',
                  padding: '1.85rem',
                  color: CARIBE_THEME.petroleo,
                }}
              >
                <h2 style={{ fontFamily: "'Sora', sans-serif", margin: '0 0 1rem 0', fontSize: '1.3rem', color: CARIBE_THEME.petroleo }}>
                  Agendar Cita Técnica
                </h2>

                {propiedades.length === 0 ? (
                  <div>
                    <p style={{ color: CARIBE_THEME.pizarra, fontSize: '0.94rem', lineHeight: 1.55 }}>
                      Primero debes registrar una propiedad en la pestaña <strong>Mis propiedades</strong> antes de agendar una visita.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        style={{
                          padding: '0.65rem 1.15rem',
                          borderRadius: '10px',
                          border: `1px solid ${CARIBE_THEME.borde}`,
                          backgroundColor: CARIBE_THEME.marfil,
                          color: CARIBE_THEME.petroleo,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={caribeLabelStyle}>Propiedad</label>
                      <select
                        value={nuevaCita.idCasa}
                        onChange={(e) => setNuevaCita({ ...nuevaCita, idCasa: e.target.value })}
                        required
                        style={caribeInputStyle}
                      >
                        {propiedades.map((p) => (
                          <option key={p.idCasa} value={p.idCasa}>
                            {p.tipoPropiedad} - {p.direccion || 'GPS'} ({p.ciudad})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={caribeLabelStyle}>Tipo de Servicio</label>
                      <select
                        value={nuevaCita.tipoServicio}
                        onChange={(e) => setNuevaCita({ ...nuevaCita, tipoServicio: e.target.value })}
                        style={caribeInputStyle}
                      >
                        <option value="Instalación de Paneles Solares">Instalación de Paneles Solares</option>
                        <option value="Visita Técnica de Viabilidad">Visita Técnica de Viabilidad</option>
                        <option value="Mantenimiento Preventivo">Mantenimiento Preventivo</option>
                        <option value="Soporte y Reparación">Soporte y Reparación</option>
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                      <div>
                        <label style={caribeLabelStyle}>Fecha</label>
                        <input
                          type="date"
                          value={nuevaCita.fecha}
                          onChange={(e) => setNuevaCita({ ...nuevaCita, fecha: e.target.value })}
                          required
                          style={caribeInputStyle}
                        />
                      </div>
                      <div>
                        <label style={caribeLabelStyle}>Hora</label>
                        <input
                          type="time"
                          value={nuevaCita.hora}
                          onChange={(e) => setNuevaCita({ ...nuevaCita, hora: e.target.value })}
                          required
                          style={caribeInputStyle}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={caribeLabelStyle}>Observaciones o kit elegido</label>
                      <textarea
                        placeholder="Ej. Me interesa instalar el kit recomendado de 4 paneles de 550W..."
                        value={nuevaCita.notas}
                        onChange={(e) => setNuevaCita({ ...nuevaCita, notas: e.target.value })}
                        rows="3"
                        style={{ ...caribeInputStyle, resize: 'vertical' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        style={{
                          padding: '0.7rem 1.15rem',
                          borderRadius: '10px',
                          border: `1px solid ${CARIBE_THEME.borde}`,
                          backgroundColor: CARIBE_THEME.blanco,
                          color: CARIBE_THEME.petroleo,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={guardando}
                        style={{
                          ...caribePrimaryButtonStyle,
                          width: 'auto',
                          padding: '0.7rem 1.35rem',
                        }}
                      >
                        {guardando ? 'Agendando...' : 'Confirmar cita'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}