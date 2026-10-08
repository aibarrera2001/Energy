import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserSidebar from '../../components/UserSidebar';
import "../../App.css";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [nombreUsuario, setNombreUsuario] = useState('Usuario');

  useEffect(() => {
    const nombre = localStorage.getItem('usuarioNombre');
    if (nombre) {
      setNombreUsuario(nombre);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/usuario-login');
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar con la paleta de la landing */}
      <UserSidebar />

      {/* ÁREA PRINCIPAL */}
      <main className="dashboard-main-content">
        {/* Encabezado Principal */}
        <header className="dashboard-header-card">
          <div className="header-info">
            <span className="header-badge">Plataforma de Energía Inteligente</span>
            <h1>Resumen de energía</h1>
            <p className="user-welcome">Bienvenido de nuevo, <strong>{nombreUsuario}</strong></p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary">Exportar</button>
            <button className="btn-accent-orange" onClick={handleLogout}>Salir</button>
          </div>
        </header>

        {/* REJILLA DE TARJETAS DE ESTADÍSTICAS */}
        <section className="stats-grid">
          <div className="metric-card">
            <span className="metric-title">Producción</span>
            <div className="metric-value">
              <strong>0</strong> <small>kWh</small>
            </div>
            <span className="metric-sub">Mes actual</span>
          </div>

          <div className="metric-card">
            <span className="metric-title">Consumo</span>
            <div className="metric-value">
              <strong>0</strong> <small>kWh</small>
            </div>
            <span className="metric-sub">Promedio estimado</span>
          </div>

          <div className="metric-card highlight-green">
            <span className="metric-title">Ahorro Estimado</span>
            <div className="metric-value">
              <strong>$0</strong>
            </div>
            <span className="metric-sub">Acumulado</span>
          </div>

          <div className="metric-card">
            <span className="metric-title">Propiedades</span>
            <div className="metric-value">
              <strong>0</strong>
            </div>
            <span className="metric-sub">Registradas</span>
          </div>
        </section>

        {/* SECCIÓN INFERIOR EN DOS COLUMNAS */}
        <div className="content-columns">
          {/* Tarjeta de Balance Energético */}
          <div className="panel-card">
            <div className="panel-header">
              <h2>Balance energético</h2>
              <span className="panel-sub">Producción vs consumo</span>
            </div>
            <div className="panel-body empty-state">
              <span className="empty-icon">📊</span>
              <p>No hay datos suficientes para generar el balance.</p>
              <button className="btn-accent-green">Agregar propiedad</button>
            </div>
          </div>

          {/* Tarjeta de Estado del Sistema */}
          <div className="panel-card">
            <div className="panel-header">
              <h2>Estado del sistema</h2>
              <span className="panel-sub">Monitoreo activo</span>
            </div>
            <div className="panel-body">
              <ul className="status-list">
                <li className="status-item">
                  <span className="status-dot green"></span>
                  <div>
                    <strong>Conexión con servidor</strong>
                    <p>Operacional ok</p>
                  </div>
                </li>
                <li className="status-item">
                  <span className="status-dot orange"></span>
                  <div>
                    <strong>Cálculos de energía</strong>
                    <p>Agrega una propiedad para iniciar cálculos</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}