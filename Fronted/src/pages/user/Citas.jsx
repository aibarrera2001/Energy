import React, { useState, useEffect } from 'react';
import UserSidebar from '../../components/UserSidebar';

export default function Citas() {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [nuevaCita, setNuevaCita] = useState({
    fecha: '',
    motivo: 'Mantenimiento Preventivo',
    descripcion: ''
  });

  useEffect(() => {
    obtenerCitas();
  }, []);

  const obtenerCitas = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('usuarioId');

      const res = await fetch(`http://localhost:5000/api/citas/usuario/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setCitas(data);
      }
    } catch (err) {
      console.error("Error al cargar citas:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('usuarioId');

      const res = await fetch('http://localhost:5000/api/citas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...nuevaCita, usuarioId: userId })
      });

      if (res.ok) {
        setShowModal(false);
        setNuevaCita({ fecha: '', motivo: 'Mantenimiento Preventivo', descripcion: '' });
        obtenerCitas();
      }
    } catch (err) {
      console.error("Error al agendar cita:", err);
    }
  };

  return (
    <div className="dashboard-container">
      <UserSidebar />

      <main className="dashboard-main-content">
        <header className="dashboard-header-card">
          <div className="header-info">
            <span className="header-badge">Atención Técnica</span>
            <h1>Citas y Revisiones</h1>
            <p className="user-welcome">Programa visitas técnicas para la inspección de tus paneles</p>
          </div>
          <div className="header-actions">
            <button className="btn-accent-green" onClick={() => setShowModal(true)}>
              + Agendar Cita
            </button>
          </div>
        </header>

        {loading ? (
          <div className="panel-card" style={{ padding: '2rem', textAlign: 'center' }}>
            <p>Cargando tus citas agendadas...</p>
          </div>
        ) : citas.length === 0 ? (
          <div className="panel-card">
            <div className="panel-body empty-state">
              <span className="empty-icon">📅</span>
              <p>No tienes citas agendadas en este momento.</p>
              <button className="btn-accent-green" onClick={() => setShowModal(true)}>
                Agendar primera cita
              </button>
            </div>
          </div>
        ) : (
          <div className="stats-grid">
            {citas.map((cita) => (
              <div key={cita._id || cita.id} className="panel-card">
                <div className="panel-header">
                  <h2>{cita.motivo}</h2>
                  <span className="panel-sub">Fecha: {new Date(cita.fecha).toLocaleDateString()}</span>
                </div>
                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#64748B' }}>
                  {cita.descripcion || 'Sin observaciones adicionles.'}
                </p>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div className="panel-card" style={{ width: '400px', padding: '2rem' }}>
              <h2>Agendar Cita Técnica</h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                <input
                  type="date"
                  value={nuevaCita.fecha}
                  onChange={(e) => setNuevaCita({ ...nuevaCita, fecha: e.target.value })}
                  required
                  style={{ padding: '0.65rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1' }}
                />
                <select
                  value={nuevaCita.motivo}
                  onChange={(e) => setNuevaCita({ ...nuevaCita, motivo: e.target.value })}
                  style={{ padding: '0.65rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1' }}
                >
                  <option value="Mantenimiento Preventivo">Mantenimiento Preventivo</option>
                  <option value="Inspección Técnica">Inspección Técnica</option>
                  <option value="Soporte y Reparación">Soporte y Reparación</option>
                </select>
                <textarea
                  placeholder="Detalles o comentarios adicionales"
                  value={nuevaCita.descripcion}
                  onChange={(e) => setNuevaCita({ ...nuevaCita, descripcion: e.target.value })}
                  rows="3"
                  style={{ padding: '0.65rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1' }}
                />
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn-accent-green">Confirmar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}