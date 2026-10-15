import React, { useState, useEffect } from 'react';
import UserSidebar from '../../components/UserSidebar';

export default function Reportes() {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroMes, setFiltroMes] = useState('2026-10');

  useEffect(() => {
    obtenerReportes();
  }, [filtroMes]);

  const obtenerReportes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('usuarioId');

      const res = await fetch(`http://localhost:5000/api/reportes/usuario/${userId}?mes=${filtroMes}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setReportes(data);
      } else {
        // Datos de ejemplo para la interfaz si la API aún no tiene registros de reportes
        setReportes([
          { id: 1, mes: 'Octubre 2026', generacionTotal: 340, consumoTotal: 190, ahorroMonetario: 145000 },
          { id: 2, mes: 'Septiembre 2026', generacionTotal: 310, consumoTotal: 205, ahorroMonetario: 132000 },
          { id: 3, mes: 'Agosto 2026', generacionTotal: 295, consumoTotal: 210, ahorroMonetario: 121000 }
        ]);
      }
    } catch (err) {
      console.error("Error al obtener reportes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarPDF = (reporteId) => {
    // Redirige al endpoint de descarga directa o ejecuta la ventana de impresión
    window.open(`http://localhost:5000/api/reportes/descargar/${reporteId}`, '_blank');
  };

  return (
    <div className="dashboard-container">
      <UserSidebar />

      <main className="dashboard-main-content">
        <header className="dashboard-header-card">
          <div className="header-info">
            <span className="header-badge">Análisis Histórico</span>
            <h1>Reportes Energéticos</h1>
            <p className="user-welcome">Descarga y analiza los informes de generación y ahorro de tus inmuebles</p>
          </div>
          <div className="header-actions">
            <button className="btn-accent-green" onClick={() => window.print()}>
              🖨️ Imprimir Resumen
            </button>
          </div>
        </header>

        {/* Filtros */}
        <div className="panel-card" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.9rem' }}>Periodo del Reporte:</label>
          <input
            type="month"
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
            style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
          />
        </div>

        {/* Tabla de Reportes */}
        {loading ? (
          <div className="panel-card" style={{ padding: '2rem', textAlign: 'center' }}>
            <p>Generando reportes del sistema...</p>
          </div>
        ) : reportes.length === 0 ? (
          <div className="panel-card">
            <div className="panel-body empty-state">
              <span className="empty-icon">📈</span>
              <p>No se encontraron reportes disponibles para el periodo seleccionado.</p>
            </div>
          </div>
        ) : (
          <div className="panel-card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Periodo</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Generación (kWh)</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Consumo (kWh)</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Ahorro Estimado</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reportes.map((rep) => (
                  <tr key={rep.id} style={{ borderBottom: '1px solid #F1F5F9', color: '#0F172A', fontSize: '0.95rem' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{rep.mes}</td>
                    <td style={{ padding: '1rem', color: '#10B981', fontWeight: 600 }}>{rep.generacionTotal} kWh</td>
                    <td style={{ padding: '1rem', color: '#F59E0B' }}>{rep.consumoTotal} kWh</td>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>${rep.ahorroMonetario.toLocaleString()}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button
                        className="btn-secondary"
                        onClick={() => handleDescargarPDF(rep.id)}
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                      >
                        📄 Descargar PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}