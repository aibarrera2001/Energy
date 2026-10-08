import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import { adminApi } from '../../api/adminApi';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [empresa, setEmpresa] = useState(null);
  const [metrics, setMetrics] = useState({ usuarios: 0, casas: 0, citas_pendientes: 0, total_paneles: 0 });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('adminEmpresa') || 'null');
    if (!stored || !stored.id_empresa) {
      navigate('/admin-login');
      return;
    }
    setEmpresa(stored);

    // Cargar métricas desde el backend
    fetch(`http://localhost:8080/api/admin/dashboard/${stored.id_empresa}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.exito && data.metrics) {
          setMetrics(data.metrics);
        }
      })
      .catch((err) => console.error(err));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminEmpresa');
    navigate('/admin-login');
  };

  return (
    <div className="dashboard-body">
      <div className="dashboard-shell">
        <AdminSidebar />

        <main className="dashboard-main">
          <header className="topbar">
            <div>
              <p className="eyebrow">Panel administrativo</p>
              <h2>{empresa ? empresa.nombre : 'Resumen general'}</h2>
            </div>
            <div className="actions">
              <button className="ghost-btn">Exportar</button>
              <button onClick={handleLogout} className="primary-btn small-btn">Salir</button>
            </div>
          </header>

          <section className="stats-grid">
            <article className="stat-card accent">
              <span>Usuarios</span>
              <strong>{metrics.usuarios}</strong>
              <small>Registrados</small>
            </article>
            <article className="stat-card">
              <span>Casas</span>
              <strong>{metrics.casas}</strong>
              <small>Activas</small>
            </article>
            <article className="stat-card">
              <span>Citas pendientes</span>
              <strong>{metrics.citas_pendientes}</strong>
              <small>Por revisar</small>
            </article>
            <article className="stat-card">
              <span>Paneles</span>
              <strong>{metrics.total_paneles}</strong>
              <small>En inventario</small>
            </article>
          </section>

          <section className="content-grid" style={{ marginTop: '20px' }}>
            <div className="panel large-panel">
              <div className="panel-head">
                <h3>Producción total</h3>
                <span>Resumen operativo</span>
              </div>
              <div className="chart-bars" style={{ padding: '20px', textAlign: 'center' }}>
                <p style={{ color: '#6b7280' }}>Panel listo para vincular datos en tiempo real.</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}