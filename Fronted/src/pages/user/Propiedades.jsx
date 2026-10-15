import React, { useState, useEffect } from 'react';
import UserSidebar from '../../components/UserSidebar';

export default function Propiedades() {
  const [propiedades, setPropiedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [nuevaPropiedad, setNuevaPropiedad] = useState({
    nombre: '',
    direccion: '',
    tipo: 'Residencial',
    capacidadKW: ''
  });

  useEffect(() => {
    obtenerPropiedades();
  }, []);

  const obtenerPropiedades = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('usuarioId');
      
      const res = await fetch(`http://localhost:5000/api/propiedades/usuario/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setPropiedades(data);
      }
    } catch (err) {
      console.error("Error al cargar propiedades:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('usuarioId');

      const res = await fetch('http://localhost:5000/api/propiedades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...nuevaPropiedad, usuarioId: userId })
      });

      if (res.ok) {
        setShowModal(false);
        setNuevaPropiedad({ nombre: '', direccion: '', tipo: 'Residencial', capacidadKW: '' });
        obtenerPropiedades();
      }
    } catch (err) {
      console.error("Error al crear propiedad:", err);
    }
  };

  return (
    <div className="dashboard-container">
      <UserSidebar />

      <main className="dashboard-main-content">
        {/* Header */}
        <header className="dashboard-header-card">
          <div className="header-info">
            <span className="header-badge">Gestión de Inmuebles</span>
            <h1>Mis Propiedades</h1>
            <p className="user-welcome">Administra y registra tus ubicaciones con paneles solares</p>
          </div>
          <div className="header-actions">
            <button className="btn-accent-green" onClick={() => setShowModal(true)}>
              + Agregar Propiedad
            </button>
          </div>
        </header>

        {/* Lista de Propiedades */}
        {loading ? (
          <div className="panel-card" style={{ padding: '2rem', textAlign: 'center' }}>
            <p>Cargando tus propiedades...</p>
          </div>
        ) : propiedades.length === 0 ? (
          <div className="panel-card">
            <div className="panel-body empty-state">
              <span className="empty-icon">🏠</span>
              <p>Aún no has registrado ninguna propiedad.</p>
              <button className="btn-accent-green" onClick={() => setShowModal(true)}>
                Registrar primera propiedad
              </button>
            </div>
          </div>
        ) : (
          <div className="stats-grid">
            {propiedades.map((prop) => (
              <div key={prop._id || prop.id} className="panel-card">
                <div className="panel-header">
                  <h2>{prop.nombre}</h2>
                  <span className="panel-sub">{prop.direccion}</span>
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748B' }}>
                    Tipo: <strong style={{ color: '#0F172A' }}>{prop.tipo}</strong>
                  </p>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748B' }}>
                    Capacidad: <strong style={{ color: '#10B981' }}>{prop.capacidadKW} kW</strong>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Simple para Registro */}
        {showModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div className="panel-card" style={{ width: '400px', padding: '2rem' }}>
              <h2>Nueva Propiedad</h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                <input
                  type="text"
                  placeholder="Nombre (ej. Casa Campestre)"
                  value={nuevaPropiedad.nombre}
                  onChange={(e) => setNuevaPropiedad({...nuevaPropiedad, nombre: e.target.value})}
                  required
                  style={{ padding: '0.65rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1' }}
                />
                <input
                  type="text"
                  placeholder="Dirección"
                  value={nuevaPropiedad.direccion}
                  onChange={(e) => setNuevaPropiedad({...nuevaPropiedad, direccion: e.target.value})}
                  required
                  style={{ padding: '0.65rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1' }}
                />
                <select
                  value={nuevaPropiedad.tipo}
                  onChange={(e) => setNuevaPropiedad({...nuevaPropiedad, tipo: e.target.value})}
                  style={{ padding: '0.65rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1' }}
                >
                  <option value="Residencial">Residencial</option>
                  <option value="Comercial">Comercial</option>
                  <option value="Industrial">Industrial</option>
                </select>
                <input
                  type="number"
                  placeholder="Capacidad en kW (ej. 5)"
                  value={nuevaPropiedad.capacidadKW}
                  onChange={(e) => setNuevaPropiedad({...nuevaPropiedad, capacidadKW: e.target.value})}
                  required
                  style={{ padding: '0.65rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1' }}
                />
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn-accent-green">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}