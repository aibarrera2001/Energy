import React, { useState, useEffect } from 'react';
import UserSidebar from '../../components/UserSidebar';

export default function Citas() {
  const userId = Number(localStorage.getItem('usuarioId') || localStorage.getItem('idUsuario'));

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
    notas: ''
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
        fetch(`/api/casas/usuario/${userId}`)
      ]);

      if (resCitas.ok) {
        const dataCitas = await resCitas.json();
        setCitas(Array.isArray(dataCitas) ? dataCitas : []);
      }

      if (resCasas.ok) {
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
        notas: nuevaCita.notas || null
      };

      const res = await fetch('/api/citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
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
        notas: ''
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
      return { bg: 'rgba(16, 185, 129, 0.15)', color: '#10B981', text: est };
    }
    if (est === 'CANCELADA') {
      return { bg: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', text: est };
    }
    return { bg: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', text: est };
  };

  return (
    <div style={{ backgroundColor: '#0F172A', minHeight: '100vh', color: '#F8FAFC', fontFamily: "'Inter', sans-serif" }}>
      <UserSidebar />

      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 0.25rem 0' }}>
              📅 Citas Técnicas e Instalaciones
            </h1>
            <p style={{ color: '#94A3B8', margin: 0, fontSize: '0.95rem' }}>
              Programa visitas de instalación fotovoltaica, inspección o mantenimiento en tus propiedades.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            style={{
              backgroundColor: '#10B981',
              color: '#0F172A',
              fontWeight: 700,
              border: 'none',
              padding: '0.7rem 1.25rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            + Agendar Nueva Cita
          </button>
        </div>

        {loading ? (
          <p style={{ color: '#94A3B8' }}>Cargando tus citas agendadas...</p>
        ) : citas.length === 0 ? (
          <div style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '0.85rem', padding: '2.5rem', textAlign: 'center' }}>
            <span style={{ fontSize: '2.2rem', display: 'block', marginBottom: '0.5rem' }}>📅</span>
            <p style={{ color: '#94A3B8', marginBottom: '1.25rem' }}>
              No tienes citas agendadas en este momento.
            </p>
            <button
              onClick={() => setShowModal(true)}
              style={{ backgroundColor: '#10B981', color: '#0F172A', fontWeight: 700, border: 'none', padding: '0.65rem 1.2rem', borderRadius: '0.5rem', cursor: 'pointer' }}
            >
              Agendar primera cita
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {citas.map((cita) => {
              const badge = badgeEstado(cita.estado);
              return (
                <div
                  key={cita.idCita}
                  style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '0.85rem', padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                      {cita.tipoServicio}
                    </h2>
                    <span style={{ backgroundColor: badge.bg, color: badge.color, fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.6rem', borderRadius: '999px' }}>
                      {badge.text}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#CBD5E1' }}>
                    🏠 <strong>Propiedad:</strong> {obtenerNombreCasa(cita.idCasa)}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#94A3B8' }}>
                    <span>📆 {cita.fecha}</span>
                    <span>⏰ {String(cita.hora).slice(0, 5)}</span>
                  </div>

                  {cita.tecnicoAsignado && (
                    <div style={{ fontSize: '0.83rem', color: '#818CF8' }}>
                      👷 Técnico asignado: <strong>{cita.tecnicoAsignado}</strong>
                    </div>
                  )}

                  {cita.notas && (
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#94A3B8', backgroundColor: '#0F172A', padding: '0.65rem', borderRadius: '0.45rem' }}>
                      {cita.notas}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {showModal && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <div style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '0.85rem', width: '100%', maxWidth: '460px', padding: '1.75rem' }}>
              <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.3rem', color: '#FFFFFF' }}>Agendar Cita Técnica</h2>

              {propiedades.length === 0 ? (
                <p style={{ color: '#F59E0B', fontSize: '0.9rem' }}>
                  Primero debes registrar una propiedad en la pestaña <strong>Propiedades</strong> antes de agendar una visita.
                </p>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.3rem' }}>Propiedad</label>
                    <select
                      value={nuevaCita.idCasa}
                      onChange={(e) => setNuevaCita({ ...nuevaCita, idCasa: e.target.value })}
                      required
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '0.5rem', backgroundColor: '#0F172A', border: '1px solid #334155', color: '#FFFFFF' }}
                    >
                      {propiedades.map((p) => (
                        <option key={p.idCasa} value={p.idCasa}>
                          {p.tipoPropiedad} - {p.direccion || 'GPS'} ({p.ciudad})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.3rem' }}>Tipo de Servicio</label>
                    <select
                      value={nuevaCita.tipoServicio}
                      onChange={(e) => setNuevaCita({ ...nuevaCita, tipoServicio: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '0.5rem', backgroundColor: '#0F172A', border: '1px solid #334155', color: '#FFFFFF' }}
                    >
                      <option value="Instalación de Paneles Solares">Instalación de Paneles Solares</option>
                      <option value="Visita Técnica de Viabilidad">Visita Técnica de Viabilidad</option>
                      <option value="Mantenimiento Preventivo">Mantenimiento Preventivo</option>
                      <option value="Soporte y Reparación">Soporte y Reparación</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.3rem' }}>Fecha</label>
                      <input
                        type="date"
                        value={nuevaCita.fecha}
                        onChange={(e) => setNuevaCita({ ...nuevaCita, fecha: e.target.value })}
                        required
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '0.5rem', backgroundColor: '#0F172A', border: '1px solid #334155', color: '#FFFFFF', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.3rem' }}>Hora</label>
                      <input
                        type="time"
                        value={nuevaCita.hora}
                        onChange={(e) => setNuevaCita({ ...nuevaCita, hora: e.target.value })}
                        required
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '0.5rem', backgroundColor: '#0F172A', border: '1px solid #334155', color: '#FFFFFF', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.3rem' }}>Observaciones o kit elegido</label>
                    <textarea
                      placeholder="Ej. Me interesa instalar el kit recomendado de 4 paneles de 550W..."
                      value={nuevaCita.notas}
                      onChange={(e) => setNuevaCita({ ...nuevaCita, notas: e.target.value })}
                      rows="3"
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '0.5rem', backgroundColor: '#0F172A', border: '1px solid #334155', color: '#FFFFFF', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      style={{ padding: '0.6rem 1rem', borderRadius: '0.5rem', border: '1px solid #334155', backgroundColor: 'transparent', color: '#CBD5E1', cursor: 'pointer' }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={guardando}
                      style={{ padding: '0.6rem 1.2rem', borderRadius: '0.5rem', border: 'none', backgroundColor: '#10B981', color: '#0F172A', fontWeight: 700, cursor: 'pointer' }}
                    >
                      {guardando ? 'Agendando...' : 'Confirmar Cita'}
                    </button>
                  </div>
                </form>
              )}

              {propiedades.length === 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{ padding: '0.55rem 1rem', borderRadius: '0.5rem', border: '1px solid #334155', backgroundColor: 'transparent', color: '#CBD5E1', cursor: 'pointer' }}
                  >
                    Cerrar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}