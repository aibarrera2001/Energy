import React, { useState, useEffect } from 'react';
import UserSidebar from '../../components/UserSidebar';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function UserDashboard() {
  const [metricas, setMetricas] = useState({
    generacionHoy: 24.5,
    consumoHoy: 12.3,
    eficiencia: 98,
    panelesActivos: 8
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const usuarioNombre = localStorage.getItem('usuarioNombre') || 'Usuario';

  // Datos simulados de balance energético para el gráfico
  const datosGrafico = [
    { hora: '06:00', generacion: 0.2, consumo: 0.8 },
    { hora: '08:00', generacion: 1.5, consumo: 1.2 },
    { hora: '10:00', generacion: 3.8, consumo: 1.5 },
    { hora: '12:00', generacion: 5.2, consumo: 2.1 },
    { hora: '14:00', generacion: 4.6, consumo: 1.9 },
    { hora: '16:00', generacion: 2.8, consumo: 2.4 },
    { hora: '18:00', generacion: 0.5, consumo: 3.1 },
    { hora: '20:00', generacion: 0.0, consumo: 2.8 }
  ];

  useEffect(() => {
    cargarMetricas();
  }, []);

  const cargarMetricas = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('usuarioId');

      // Puerto 8080 de Spring Boot
      const res = await fetch(`http://localhost:8080/api/dashboard/usuario/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setMetricas(data);
      }
    } catch (err) {
      console.warn("Backend Spring Boot no disponible para métricas. Mostrando datos de prueba.", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/usuario-login';
  };

  return (
    <div style={{ backgroundColor: '#0F172A', minHeight: '100vh', color: '#F8FAFC' }}>
      {/* Navbar Superior */}
      <UserSidebar />

      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {/* Header Superior */}
        <header style={{
          backgroundColor: '#1E293B',
          border: '1px solid #334155',
          borderRadius: '0.75rem',
          padding: '1.5rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <div>
            <span style={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#10B981',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.25rem 0.6rem',
              borderRadius: '1rem',
              textTransform: 'uppercase'
            }}>
              Plataforma de Energía Inteligente
            </span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF', margin: '0.35rem 0 0.15rem 0' }}>
              Resumen de energía
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '0.95rem', margin: 0 }}>
              Bienvenido de nuevo, <strong style={{ color: '#FFFFFF' }}>{usuarioNombre}</strong>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => window.print()}
              style={{
                backgroundColor: '#334155',
                border: 'none',
                color: '#FFFFFF',
                padding: '0.6rem 1.2rem',
                borderRadius: '0.5rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Exportar
            </button>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid #EF4444',
                color: '#F87171',
                padding: '0.6rem 1.2rem',
                borderRadius: '0.5rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Salir
            </button>
          </div>
        </header>

        {/* Métrica Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '0.75rem', padding: '1.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 600 }}>Generación Hoy</span>
            <p style={{ fontSize: '1.8rem', fontWeight: 700, color: '#10B981', margin: '0.25rem 0' }}>{metricas.generacionHoy} kWh</p>
          </div>

          <div style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '0.75rem', padding: '1.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 600 }}>Consumo Hoy</span>
            <p style={{ fontSize: '1.8rem', fontWeight: 700, color: '#F59E0B', margin: '0.25rem 0' }}>{metricas.consumoHoy} kWh</p>
          </div>

          <div style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '0.75rem', padding: '1.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 600 }}>Eficiencia Sistema</span>
            <p style={{ fontSize: '1.8rem', fontWeight: 700, color: '#FFFFFF', margin: '0.25rem 0' }}>{metricas.eficiencia}%</p>
          </div>
          <div style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '0.75rem', padding: '1.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 600 }}>Paneles Activos</span>
            <p style={{ fontSize: '1.8rem', fontWeight: 700, color: '#FFFFFF', margin: '0.25rem 0' }}>{metricas.panelesActivos}</p>
          </div>
        </div>

        {/* Gráfico de Balance Energético */}
        <div style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '0.75rem', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1rem' }}>
            Balance Energético (kWh)
          </h3>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={datosGrafico}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="hora" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#FFF' }} />
                <Area type="monotone" dataKey="generacion" name="Generación" stroke="#10B981" fill="#10B981" fillOpacity={0.25} strokeWidth={2} />
                <Area type="monotone" dataKey="consumo" name="Consumo" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}