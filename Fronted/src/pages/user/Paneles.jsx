import React, { useState, useEffect } from 'react';
import UserSidebar from '../../components/UserSidebar';

export default function Paneles() {
  const [paneles, setPaneles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obtenerPaneles();
  }, []);

  const obtenerPaneles = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('usuarioId');

      const res = await fetch(`http://localhost:5000/api/paneles/usuario/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setPaneles(data);
      }
    } catch (err) {
      console.error("Error al cargar paneles:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <UserSidebar />

      <main className="dashboard-main-content">
        <header className="dashboard-header-card">
          <div className="header-info">
            <span className="header-badge">Sistemas Fotovoltaicos</span>
            <h1>Mis Paneles Solares</h1>
            <p className="user-welcome">Supervisa el rendimiento y estado operativo de tus equipos</p>
          </div>
        </header>

        {loading ? (
          <div className="panel-card" style={{ padding: '2rem', textAlign: 'center' }}>
            <p>Cargando información de paneles...</p>
          </div>
        ) : paneles.length === 0 ? (
          <div className="panel-card">
            <div className="panel-body empty-state">
              <span className="empty-icon">🔋</span>
              <p>No tienes paneles solares asignados a tus propiedades.</p>
            </div>
          </div>
        ) : (
          <div className="stats-grid">
            {paneles.map((panel) => (
              <div key={panel._id || panel.id} className="panel-card">
                <div className="panel-header">
                  <h2>{panel.modelo || 'Panel Fotovoltaico'}</h2>
                  <span className="panel-sub">Ubicación: {panel.propiedadNombre || 'Principal'}</span>
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748B' }}>
                    Capacidad: <strong style={{ color: '#10B981' }}>{panel.potenciaW || 450} W</strong>
                  </p>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748B' }}>
                    Estado: <strong style={{ color: panel.estado === 'Activo' ? '#10B981' : '#F59E0B' }}>
                      {panel.estado || 'Activo'}
                    </strong>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}