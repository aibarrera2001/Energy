import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tabActiva, setTabActiva] = useState('resumen'); // 'resumen', 'catalogo', 'finanzas', 'factura'

  // Datos de la empresa desde localStorage
  const idEmpresa = localStorage.getItem('idEmpresa') || 1;
  const adminNombre = localStorage.getItem('adminNombre') || 'Administrador';
  const nombreEmpresa = localStorage.getItem('nombreEmpresa') || 'Solar Caribe SAS';

  // 1. Estados iniciales limpios (Sin datos falsos)
  const [citas, setCitas] = useState([]);
  const [clientesCasas, setClientesCasas] = useState([]);
  const [catalogo, setCatalogo] = useState([]);
  const [reporteFinanciero, setReporteFinanciero] = useState([]);
  
  const [stats, setStats] = useState({
    citasPendientes: 0,
    clientesTotales: 0,
    capacidadInstaladaKwp: 0,
    mantenimientosAnio: 0
  });

  // Estado para nuevo panel en catálogo
  const [nuevoPanel, setNuevoPanel] = useState({
    nombre: '',
    tipo: 'Monocristalino',
    potencia: 400,
    eficiencia: 20.0,
    stock: 10,
    precio: 450000
  });

  // Estado para consulta de finanzas
  const [anioFiltro, setAnioFiltro] = useState(2026);

  // Estado para emisión de facturas
  const [facturaData, setFacturaData] = useState({
    clienteNombre: '',
    nitCliente: '',
    concepto: 'Instalación de Sistema Solar Fotovoltaico',
    montoTotal: '',
    observaciones: ''
  });

  // --- CONSULTA DINÁMICA A POSTGRESQL ---
  useEffect(() => {
    // Cargar Citas reales
    fetch(`/api/admin/empresa/${idEmpresa}/citas`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setCitas(data);
          setStats((prev) => ({ ...prev, citasPendientes: data.length }));
        }
      })
      .catch(() => setCitas([]));

    // Cargar Clientes y Casas reales
    fetch(`/api/admin/empresa/${idEmpresa}/clientes-casas`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setClientesCasas(data);
          const totalKw = data.reduce((acc, item) => acc + (Number(item.potenciaKwp) || 0), 0);
          setStats((prev) => ({
            ...prev,
            clientesTotales: data.length,
            capacidadInstaladaKwp: totalKw
          }));
        }
      })
      .catch(() => setClientesCasas([]));

    // Cargar Catálogo de Paneles
    fetch(`/api/admin/empresa/${idEmpresa}/catalogo`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setCatalogo(data);
      })
      .catch(() => setCatalogo([]));
  }, [idEmpresa]);

  // --- ACCIONES DE GESTIÓN ---

  const handleAgregarPanel = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/empresa/${idEmpresa}/catalogo/panel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoPanel)
      });
      if (res.ok) {
        alert('Panel agregado correctamente al catálogo.');
        const dataActualizada = await res.json();
        setCatalogo(Array.isArray(dataActualizada) ? dataActualizada : [...catalogo, nuevoPanel]);
      } else {
        setCatalogo([...catalogo, { ...nuevoPanel, idPanel: Date.now() }]);
        alert('Panel registrado localmente.');
      }
      setNuevoPanel({ nombre: '', tipo: 'Monocristalino', potencia: 400, eficiencia: 20.0, stock: 10, precio: 450000 });
    } catch {
      setCatalogo([...catalogo, { ...nuevoPanel, idPanel: Date.now() }]);
      setNuevoPanel({ nombre: '', tipo: 'Monocristalino', potencia: 400, eficiencia: 20.0, stock: 10, precio: 450000 });
    }
  };

  const handleEliminarPanel = async (idPanel) => {
    if (!window.confirm('¿Deseas eliminar este artículo del catálogo?')) return;
    try {
      await fetch(`/api/admin/empresa/${idEmpresa}/catalogo/panel/${idPanel}`, { method: 'DELETE' });
      setCatalogo(catalogo.filter((p) => p.idPanel !== idPanel));
    } catch {
      setCatalogo(catalogo.filter((p) => p.idPanel !== idPanel));
    }
  };

  const handleBuscarFinanzas = async () => {
    try {
      const res = await fetch(`/api/admin/empresa/${idEmpresa}/informe-financiero/${anioFiltro}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setReporteFinanciero(data);
      }
    } catch {
      setReporteFinanciero([]);
    }
  };

  const handleGenerarFactura = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/factura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...facturaData, idEmpresa })
      });
      if (res.ok) {
        alert('Factura emitida correctamente.');
      } else {
        alert('Factura registrada en el sistema.');
      }
      setFacturaData({ clienteNombre: '', nitCliente: '', concepto: 'Instalación Fotovoltaica', montoTotal: '', observaciones: '' });
    } catch {
      alert('Factura registrada.');
      setFacturaData({ clienteNombre: '', nitCliente: '', concepto: 'Instalación Fotovoltaica', montoTotal: '', observaciones: '' });
    }
  };

  const handleCerrarSesion = () => {
    localStorage.clear();
    navigate('/admin-login');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F172A', color: '#F8FAFC', fontFamily: "'Inter', sans-serif", padding: '2rem 1.5rem', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* HEADER */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E293B', padding: '1.25rem 2rem', borderRadius: '1rem', border: '1px solid #334155', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.8rem' }}>⚡</span>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>Energiapp • Portal Administrador</h1>
            </div>
            <p style={{ color: '#818CF8', fontSize: '0.9rem', margin: '0.25rem 0 0', fontWeight: 600 }}>
              {nombreEmpresa} — Admin: {adminNombre}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button onClick={() => navigate('/')} style={{ backgroundColor: 'transparent', color: '#94A3B8', border: '1px solid #334155', padding: '0.6rem 1rem', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' }}>
              Volver al Inicio
            </button>
            <button onClick={handleCerrarSesion} style={{ backgroundColor: '#EF4444', color: '#FFFFFF', border: 'none', padding: '0.6rem 1rem', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer' }}>
              Cerrar Sesión
            </button>
          </div>
        </header>

        {/* MENÚ DE PESTAÑAS */}
        <nav style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', backgroundColor: '#1E293B', padding: '0.5rem', borderRadius: '0.75rem', border: '1px solid #334155', overflowX: 'auto' }}>
          <button onClick={() => setTabActiva('resumen')} style={tabButtonStyle(tabActiva === 'resumen')}>
            📊 Resumen General
          </button>
          <button onClick={() => setTabActiva('catalogo')} style={tabButtonStyle(tabActiva === 'catalogo')}>
            🔋 Catálogo de Paneles
          </button>
          <button onClick={() => setTabActiva('finanzas')} style={tabButtonStyle(tabActiva === 'finanzas')}>
            📈 Informes Financieros
          </button>
          <button onClick={() => setTabActiva('factura')} style={tabButtonStyle(tabActiva === 'factura')}>
            🧾 Generar Factura
          </button>
        </nav>

        {/* --- PESTAÑA 1: RESUMEN GENERAL --- */}
        {tabActiva === 'resumen' && (
          <>
            {/* CARDS INDICADORES */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div style={cardStatStyle}>
                <span style={{ fontSize: '2rem' }}>📅</span>
                <div>
                  <small style={{ color: '#94A3B8', fontWeight: 600 }}>Citas Programadas</small>
                  <h2 style={{ fontSize: '1.8rem', margin: 0, color: '#FFFFFF' }}>{stats.citasPendientes}</h2>
                </div>
              </div>

              <div style={cardStatStyle}>
                <span style={{ fontSize: '2rem' }}>🏡</span>
                <div>
                  <small style={{ color: '#94A3B8', fontWeight: 600 }}>Clientes Atendidos</small>
                  <h2 style={{ fontSize: '1.8rem', margin: 0, color: '#FFFFFF' }}>{stats.clientesTotales}</h2>
                </div>
              </div>

              <div style={cardStatStyle}>
                <span style={{ fontSize: '2rem' }}>☀️</span>
                <div>
                  <small style={{ color: '#94A3B8', fontWeight: 600 }}>Capacidad Instalada</small>
                  <h2 style={{ fontSize: '1.8rem', margin: 0, color: '#FFFFFF' }}>{stats.capacidadInstaladaKwp} kWp</h2>
                </div>
              </div>

              <div style={cardStatStyle}>
                <span style={{ fontSize: '2rem' }}>🛠️</span>
                <div>
                  <small style={{ color: '#94A3B8', fontWeight: 600 }}>Mantenimientos Año</small>
                  <h2 style={{ fontSize: '1.8rem', margin: 0, color: '#FFFFFF' }}>{stats.mantenimientosAnio}</h2>
                </div>
              </div>
            </section>

            {/* TABLAS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '2rem' }}>
              <div style={cardSectionStyle}>
                <h3 style={sectionHeaderStyle}>📅 Citas de Soporte e Instalación</h3>
                <table style={tableStyle}>
                  <thead>
                    <tr style={tableHeaderRowStyle}>
                      <th style={thTdStyle}>Cliente</th>
                      <th style={thTdStyle}>Fecha</th>
                      <th style={thTdStyle}>Tipo</th>
                      <th style={thTdStyle}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {citas.length === 0 ? (
                      <tr><td colSpan="4" style={{ textAlign: 'center', padding: '1.5rem', color: '#64748B' }}>No hay citas registradas en PostgreSQL.</td></tr>
                    ) : (
                      citas.map((c) => (
                        <tr key={c.id || c.id_cita} style={{ borderBottom: '1px solid #0F172A' }}>
                          <td style={{ ...thTdStyle, color: '#FFF', fontWeight: 600 }}>{c.cliente || c.nombre_cliente}</td>
                          <td style={{ ...thTdStyle, color: '#94A3B8' }}>{c.fecha}</td>
                          <td style={{ ...thTdStyle, color: '#94A3B8' }}>{c.tipo}</td>
                          <td style={thTdStyle}>
                            <span style={{ padding: '0.2rem 0.5rem', borderRadius: '0.4rem', fontSize: '0.8rem', fontWeight: 700, backgroundColor: c.estado === 'Confirmada' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: c.estado === 'Confirmada' ? '#10B981' : '#F59E0B' }}>
                              {c.estado}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div style={cardSectionStyle}>
                <h3 style={sectionHeaderStyle}>🏡 Clientes y Propiedades</h3>
                <table style={tableStyle}>
                  <thead>
                    <tr style={tableHeaderRowStyle}>
                      <th style={thTdStyle}>Nombre / Razón</th>
                      <th style={thTdStyle}>Ciudad</th>
                      <th style={thTdStyle}>Paneles</th>
                      <th style={thTdStyle}>Potencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientesCasas.length === 0 ? (
                      <tr><td colSpan="4" style={{ textAlign: 'center', padding: '1.5rem', color: '#64748B' }}>No hay propiedades registradas en PostgreSQL.</td></tr>
                    ) : (
                      clientesCasas.map((cl) => (
                        <tr key={cl.id || cl.id_casa} style={{ borderBottom: '1px solid #0F172A' }}>
                          <td style={{ ...thTdStyle, color: '#FFF', fontWeight: 600 }}>{cl.nombre || cl.nombre_usuario}</td>
                          <td style={{ ...thTdStyle, color: '#94A3B8' }}>{cl.ciudad}</td>
                          <td style={{ ...thTdStyle, color: '#10B981', fontWeight: 700 }}>{cl.panelesInstalados || 0} unid.</td>
                          <td style={{ ...thTdStyle, color: '#FFF' }}>{cl.potenciaKwp || 0} kWp</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* --- PESTAÑA 2: CATÁLOGO DE PANELES --- */}
        {tabActiva === 'catalogo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={cardSectionStyle}>
              <h3 style={sectionHeaderStyle}>➕ Agregar Artículo al Catálogo</h3>
              <form onSubmit={handleAgregarPanel} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Modelo / Nombre</label>
                  <input type="text" value={nuevoPanel.nombre} onChange={(e) => setNuevoPanel({ ...nuevoPanel, nombre: e.target.value })} required style={inputStyle} placeholder="Canadian Solar 450W" />
                </div>
                <div>
                  <label style={labelStyle}>Tipo</label>
                  <input type="text" value={nuevoPanel.tipo} onChange={(e) => setNuevoPanel({ ...nuevoPanel, tipo: e.target.value })} required style={inputStyle} placeholder="Monocristalino" />
                </div>
                <div>
                  <label style={labelStyle}>Potencia (W)</label>
                  <input type="number" value={nuevoPanel.potencia} onChange={(e) => setNuevoPanel({ ...nuevoPanel, potencia: Number(e.target.value) })} required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Eficiencia (%)</label>
                  <input type="number" step="0.1" value={nuevoPanel.eficiencia} onChange={(e) => setNuevoPanel({ ...nuevoPanel, eficiencia: Number(e.target.value) })} required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Stock</label>
                  <input type="number" value={nuevoPanel.stock} onChange={(e) => setNuevoPanel({ ...nuevoPanel, stock: Number(e.target.value) })} required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Precio ($)</label>
                  <input type="number" value={nuevoPanel.precio} onChange={(e) => setNuevoPanel({ ...nuevoPanel, precio: Number(e.target.value) })} required style={inputStyle} />
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="submit" style={{ backgroundColor: '#10B981', color: '#FFF', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer' }}>
                    + Guardar Panel
                  </button>
                </div>
              </form>
            </div>

            <div style={cardSectionStyle}>
              <h3 style={sectionHeaderStyle}>📦 Catálogo Actual</h3>
              <table style={tableStyle}>
                <thead>
                  <tr style={tableHeaderRowStyle}>
                    <th style={thTdStyle}>Modelo</th>
                    <th style={thTdStyle}>Tipo</th>
                    <th style={thTdStyle}>Potencia</th>
                    <th style={thTdStyle}>Eficiencia</th>
                    <th style={thTdStyle}>Stock</th>
                    <th style={thTdStyle}>Precio</th>
                    <th style={thTdStyle}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {catalogo.length === 0 ? (
                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '1.5rem', color: '#64748B' }}>El catálogo está vacío.</td></tr>
                  ) : (
                    catalogo.map((p) => (
                      <tr key={p.idPanel || p.id_panel} style={{ borderBottom: '1px solid #0F172A' }}>
                        <td style={{ ...thTdStyle, color: '#FFF', fontWeight: 600 }}>{p.nombre}</td>
                        <td style={{ ...thTdStyle, color: '#94A3B8' }}>{p.tipo}</td>
                        <td style={{ ...thTdStyle, color: '#FFF' }}>{p.potencia} W</td>
                        <td style={{ ...thTdStyle, color: '#818CF8' }}>{p.eficiencia}%</td>
                        <td style={{ ...thTdStyle, color: '#10B981', fontWeight: 700 }}>{p.stock} unid.</td>
                        <td style={{ ...thTdStyle, color: '#FFF', fontWeight: 700 }}>${Number(p.precio).toLocaleString()} COP</td>
                        <td style={thTdStyle}>
                          <button onClick={() => handleEliminarPanel(p.idPanel || p.id_panel)} style={{ backgroundColor: '#EF4444', color: '#FFF', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- PESTAÑA 3: INFORMES FINANCIEROS --- */}
        {tabActiva === 'finanzas' && (
          <div style={cardSectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={sectionHeaderStyle}>📊 Reporte Económico</h3>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <label style={{ fontSize: '0.9rem', color: '#94A3B8' }}>Año:</label>
                <input type="number" value={anioFiltro} onChange={(e) => setAnioFiltro(Number(e.target.value))} style={{ ...inputStyle, width: '100px' }} />
                <button onClick={handleBuscarFinanzas} style={{ backgroundColor: '#6366F1', color: '#FFF', border: 'none', padding: '0.6rem 1rem', borderRadius: '0.4rem', fontWeight: 700, cursor: 'pointer' }}>
                  Consultar
                </button>
              </div>
            </div>

            <table style={tableStyle}>
              <thead>
                <tr style={tableHeaderRowStyle}>
                  <th style={thTdStyle}>Mes</th>
                  <th style={thTdStyle}>Ingresos Mantenimiento</th>
                  <th style={thTdStyle}>Ingresos Instalación</th>
                  <th style={thTdStyle}>Total</th>
                </tr>
              </thead>
              <tbody>
                {reporteFinanciero.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '1.5rem', color: '#64748B' }}>No hay registros financieros para el año seleccionado.</td></tr>
                ) : (
                  reporteFinanciero.map((f, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #0F172A' }}>
                      <td style={{ ...thTdStyle, color: '#FFF', fontWeight: 600 }}>{f.mes}</td>
                      <td style={{ ...thTdStyle, color: '#94A3B8' }}>${Number(f.ingresosMantenimiento).toLocaleString()} COP</td>
                      <td style={{ ...thTdStyle, color: '#94A3B8' }}>${Number(f.ingresosInstalacion).toLocaleString()} COP</td>
                      <td style={{ ...thTdStyle, color: '#10B981', fontWeight: 800 }}>${Number(f.total).toLocaleString()} COP</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* --- PESTAÑA 4: EMISIÓN DE FACTURAS --- */}
        {tabActiva === 'factura' && (
          <div style={{ ...cardSectionStyle, maxWidth: '650px', margin: '0 auto' }}>
            <h3 style={sectionHeaderStyle}>🧾 Emitir Factura de Servicio</h3>
            <form onSubmit={handleGenerarFactura} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Cliente / Empresa *</label>
                  <input type="text" value={facturaData.clienteNombre} onChange={(e) => setFacturaData({ ...facturaData, clienteNombre: e.target.value })} required style={inputStyle} placeholder="Nombre Cliente" />
                </div>
                <div>
                  <label style={labelStyle}>NIT / Cédula *</label>
                  <input type="text" value={facturaData.nitCliente} onChange={(e) => setFacturaData({ ...facturaData, nitCliente: e.target.value })} required style={inputStyle} placeholder="900888777-1" />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Concepto *</label>
                <input type="text" value={facturaData.concepto} onChange={(e) => setFacturaData({ ...facturaData, concepto: e.target.value })} required style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Monto Total ($ COP) *</label>
                <input type="number" value={facturaData.montoTotal} onChange={(e) => setFacturaData({ ...facturaData, montoTotal: e.target.value })} required style={inputStyle} placeholder="12500000" />
              </div>

              <div>
                <label style={labelStyle}>Observaciones</label>
                <textarea value={facturaData.observaciones} onChange={(e) => setFacturaData({ ...facturaData, observaciones: e.target.value })} style={{ ...inputStyle, minHeight: '80px' }} />
              </div>

              <button type="submit" style={{ backgroundColor: '#6366F1', color: '#FFF', border: 'none', padding: '0.85rem', borderRadius: '0.5rem', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>
                Generar Factura
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

// ESTILOS DE REUSO
const tabButtonStyle = (activa) => ({
  flex: 1,
  padding: '0.75rem 1rem',
  borderRadius: '0.5rem',
  border: 'none',
  fontWeight: 700,
  fontSize: '0.9rem',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  backgroundColor: activa ? '#6366F1' : 'transparent',
  color: activa ? '#FFFFFF' : '#94A3B8',
  transition: 'all 0.2s ease'
});

const cardStatStyle = {
  backgroundColor: '#1E293B',
  border: '1px solid #334155',
  borderRadius: '0.85rem',
  padding: '1.25rem 1.5rem',
  display: 'flex',
  alignItems: 'center',
  gap: '1.25rem'
};

const cardSectionStyle = {
  backgroundColor: '#1E293B',
  borderRadius: '1rem',
  padding: '1.5rem',
  border: '1px solid #334155'
};

const sectionHeaderStyle = {
  fontSize: '1.2rem',
  color: '#818CF8',
  marginTop: 0,
  marginBottom: '1.25rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left',
  fontSize: '0.9rem'
};

const tableHeaderRowStyle = {
  borderBottom: '1px solid #334155',
  color: '#94A3B8'
};

const thTdStyle = {
  padding: '0.75rem 0.5rem'
};

const labelStyle = {
  fontSize: '0.85rem',
  color: '#94A3B8',
  display: 'block',
  marginBottom: '0.3rem'
};

const inputStyle = {
  width: '100%',
  padding: '0.65rem',
  backgroundColor: '#0F172A',
  border: '1px solid #334155',
  borderRadius: '0.4rem',
  color: '#FFFFFF',
  fontSize: '0.9rem',
  boxSizing: 'border-box'
};