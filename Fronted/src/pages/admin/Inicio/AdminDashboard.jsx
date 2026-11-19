import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../../components/AdminSidebar';
import {
  CARIBE_THEME,
  CaribeIcons,
  caribeInputStyle,
  caribeLabelStyle,
  caribePrimaryButtonStyle,
  useCaribeFonts,
} from '../../../components/CaribeSolarUI';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function AdminDashboard() {
  useCaribeFonts();
  const [tabActiva, setTabActiva] = useState('resumen'); // 'resumen', 'catalogo', 'finanzas', 'factura'

  const idEmpresa = localStorage.getItem('idEmpresa') || 1;
  const adminNombre = localStorage.getItem('adminNombre') || 'Administrador';
  const nombreEmpresa = localStorage.getItem('nombreEmpresa') || 'Planeta Renovable';

  const [citas, setCitas] = useState([]);
  const [clientesCasas, setClientesCasas] = useState([]);
  const [catalogo, setCatalogo] = useState([]);
  const [reporteFinanciero, setReporteFinanciero] = useState([]);
  const [mensajeFeedback, setMensajeFeedback] = useState({ tipo: '', texto: '' });

  const [stats, setStats] = useState({
    citasPendientes: 0,
    clientesTotales: 0,
    capacidadInstaladaKwp: 0,
    mantenimientosAnio: 0,
  });

  const [nuevoPanel, setNuevoPanel] = useState({
    nombre: '',
    tipo: 'Monocristalino',
    potenciaW: 550,
    eficiencia: 21.5,
    precio: 480000,
    costoInstalacion: 150000,
    garantiaAnios: '25 años',
    descripcion: '',
  });

  const [anioFiltro, setAnioFiltro] = useState(2026);

  const [facturaData, setFacturaData] = useState({
    clienteNombre: '',
    nitCliente: '',
    concepto: 'Instalación de Sistema Solar Fotovoltaico',
    montoTotal: '',
    observaciones: '',
  });

  const mostrarFeedback = (tipo, texto) => {
    setMensajeFeedback({ tipo, texto });
    setTimeout(() => {
      setMensajeFeedback({ tipo: '', texto: '' });
    }, 4500);
  };

  // --- CONSULTA DINÁMICA A POSTGRESQL ---
  const cargarCatalogo = () => {
    fetch(`${API_URL}/api/admin/empresa/${idEmpresa}/catalogo/paneles`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setCatalogo(data);
      })
      .catch(() => setCatalogo([]));
  };

  useEffect(() => {
    fetch(`${API_URL}/api/admin/empresa/${idEmpresa}/citas`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setCitas(data);
          const pendientes = data.filter((c) => (c.estado || 'PENDIENTE').toUpperCase() === 'PENDIENTE').length;
          const completadas = data.filter((c) => (c.estado || '').toUpperCase() === 'COMPLETADA').length;
          setStats((prev) => ({
            ...prev,
            citasPendientes: pendientes,
            mantenimientosAnio: completadas,
          }));
        }
      })
      .catch(() => setCitas([]));

    fetch(`${API_URL}/api/admin/empresa/${idEmpresa}/clientes-casas`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setClientesCasas(data);
          const totalKw = data.reduce((acc, item) => acc + (Number(item.consumoMensualKwh) || 0), 0);
          setStats((prev) => ({
            ...prev,
            clientesTotales: data.length,
            capacidadInstaladaKwp: totalKw,
          }));
        }
      })
      .catch(() => setClientesCasas([]));

    cargarCatalogo();
  }, [idEmpresa]);

  // --- ACCIONES DE GESTIÓN ---
  const handleAgregarPanel = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/admin/empresa/${idEmpresa}/catalogo/panel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoPanel),
      });
      if (res.ok) {
        mostrarFeedback('exito', 'Panel agregado correctamente al catálogo de la empresa.');
        cargarCatalogo();
        setNuevoPanel({
          nombre: '',
          tipo: 'Monocristalino',
          potenciaW: 550,
          eficiencia: 21.5,
          precio: 480000,
          costoInstalacion: 150000,
          garantiaAnios: '25 años',
          descripcion: '',
        });
      } else {
        const errorText = await res.text();
        mostrarFeedback('error', 'Error al guardar el panel: ' + errorText);
      }
    } catch (err) {
      mostrarFeedback('error', 'Error de conexión con el servidor: ' + err.message);
    }
  };

  const handleEliminarPanel = async (idPanel) => {
    if (!window.confirm('¿Deseas eliminar este artículo del catálogo?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/empresa/${idEmpresa}/catalogo/panel/${idPanel}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCatalogo((prev) => prev.filter((p) => p.id !== idPanel));
        mostrarFeedback('exito', 'Panel eliminado del catálogo.');
      } else {
        const msg = await res.text();
        mostrarFeedback('error', 'No se pudo eliminar: ' + msg);
      }
    } catch (err) {
      mostrarFeedback('error', 'Error de conexión: ' + err.message);
    }
  };

  const handleCambiarEstadoCita = async (idCita, nuevoEstado) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/empresa/${idEmpresa}/cita/${idCita}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (res.ok) {
        const citasActualizadas = citas.map((c) =>
          c.idCita === idCita ? { ...c, estado: nuevoEstado } : c
        );
        setCitas(citasActualizadas);
        setStats((prev) => ({
          ...prev,
          citasPendientes: citasActualizadas.filter(
            (c) => (c.estado || 'PENDIENTE').toUpperCase() === 'PENDIENTE'
          ).length,
          mantenimientosAnio: citasActualizadas.filter(
            (c) => (c.estado || '').toUpperCase() === 'COMPLETADA'
          ).length,
        }));
        mostrarFeedback('exito', `Estado de cita actualizado a ${nuevoEstado}.`);
      } else {
        const msg = await res.text();
        mostrarFeedback('error', 'No se pudo actualizar el estado: ' + msg);
      }
    } catch (err) {
      mostrarFeedback('error', 'Error de conexión: ' + err.message);
    }
  };

  const handleBuscarFinanzas = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/empresa/${idEmpresa}/informe-financiero/${anioFiltro}`);
      if (res.ok) {
        const data = await res.json();
        setReporteFinanciero(Array.isArray(data) ? data : []);
      }
    } catch {
      setReporteFinanciero([]);
    }
  };

  const handleGenerarFactura = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/admin/factura`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...facturaData, empresaId: Number(idEmpresa) }),
      });
      if (res.ok) {
        mostrarFeedback('exito', 'Factura emitida y registrada correctamente.');
        setFacturaData({
          clienteNombre: '',
          nitCliente: '',
          concepto: 'Instalación de Sistema Solar Fotovoltaico',
          montoTotal: '',
          observaciones: '',
        });
      } else {
        const msg = await res.text();
        mostrarFeedback('error', 'Error al emitir factura: ' + msg);
      }
    } catch (err) {
      mostrarFeedback('error', 'Error de conexión: ' + err.message);
    }
  };

  const titulosPorTab = {
    resumen: {
      etiqueta: 'Operaciones & Clientes · Región Caribe',
      titulo: 'Panel de Control Empresarial',
      subtitulo: `Gestión integral de solicitudes técnicas y clientes asociados a ${nombreEmpresa}.`,
    },
    catalogo: {
      etiqueta: 'Inventario Fotovoltaico',
      titulo: 'Catálogo de Paneles Solares',
      subtitulo: 'Administra los módulos disponibles, especificaciones técnicas y tarifas de instalación.',
    },
    finanzas: {
      etiqueta: 'Contabilidad & Desempeño',
      titulo: 'Informes Financieros',
      subtitulo: 'Consulta los ingresos consolidados por servicio técnico e instalaciones en el año.',
    },
    factura: {
      etiqueta: 'Facturación Corporativa',
      titulo: 'Emisión de Facturas',
      subtitulo: 'Genera comprobantes de cobro por proyectos solares y mantenimiento preventivo.',
    },
  };

  const cabeceraActual = titulosPorTab[tabActiva];

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
      <AdminSidebar tabActiva={tabActiva} onSelectTab={setTabActiva} />

      <main
        style={{
          flex: 1,
          marginLeft: 'var(--admin-sidebar-width, 260px)',
          width: 'calc(100% - var(--admin-sidebar-width, 260px))',
          padding: '2.25rem 2.5rem',
          overflowY: 'auto',
          textAlign: 'left',
          transition: 'margin-left 0.28s cubic-bezier(0.4, 0, 0.2, 1), width 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          {/* CABECERA */}
          <header
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: '1rem',
              paddingBottom: '1.35rem',
              borderBottom: `1px solid ${CARIBE_THEME.borde}`,
              marginBottom: '1.75rem',
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
                {cabeceraActual.etiqueta}
              </span>
              <h1
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: 'clamp(1.65rem, 2.8vw, 2.15rem)',
                  fontWeight: 700,
                  color: CARIBE_THEME.petroleo,
                  margin: '0.3rem 0 0.2rem 0',
                  letterSpacing: '-0.02em',
                }}
              >
                {cabeceraActual.titulo}
              </h1>
              <p style={{ color: CARIBE_THEME.pizarra, margin: 0, fontSize: '0.94rem' }}>
                {cabeceraActual.subtitulo}
              </p>
            </div>

            <div
              style={{
                backgroundColor: CARIBE_THEME.blanco,
                border: `1px solid ${CARIBE_THEME.borde}`,
                borderRadius: '12px',
                padding: '0.55rem 0.95rem',
                fontSize: '0.84rem',
              }}
            >
              <span style={{ color: CARIBE_THEME.pizarra }}>Sesión: </span>
              <strong style={{ color: CARIBE_THEME.petroleo }}>{adminNombre}</strong>
            </div>
          </header>

          {/* ALERTA DE FEEDBACK */}
          {mensajeFeedback.texto && (
            <div
              role="status"
              style={{
                backgroundColor:
                  mensajeFeedback.tipo === 'error'
                    ? 'rgba(185, 45, 45, 0.09)'
                    : 'rgba(28, 128, 119, 0.13)',
                border:
                  mensajeFeedback.tipo === 'error'
                    ? '1px solid rgba(185, 45, 45, 0.3)'
                    : '1px solid rgba(28, 128, 119, 0.35)',
                color: mensajeFeedback.tipo === 'error' ? '#8E1F1F' : CARIBE_THEME.petroleo,
                padding: '0.85rem 1.1rem',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: 600,
                marginBottom: '1.5rem',
              }}
            >
              {mensajeFeedback.texto}
            </div>
          )}

          {/* --- PESTAÑA 1: RESUMEN GENERAL --- */}
          {tabActiva === 'resumen' && (
            <>
              {/* TARJETAS INDICADORES */}
              <section
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1.25rem',
                  marginBottom: '2rem',
                }}
              >
                <div style={cardStatStyle}>
                  <span style={statTagStyle}>Citas pendientes</span>
                  <strong style={statValueStyle}>{stats.citasPendientes}</strong>
                  <span style={statSubStyle}>Visitas técnicas por confirmar</span>
                </div>

                <div style={cardStatStyle}>
                  <span style={statTagStyle}>Clientes vinculados</span>
                  <strong style={statValueStyle}>{stats.clientesTotales}</strong>
                  <span style={statSubStyle}>Propietarios atendidos</span>
                </div>

                <div style={cardStatStyle}>
                  <span style={statTagStyle}>Demanda mensual</span>
                  <strong style={{ ...statValueStyle, color: CARIBE_THEME.turquesa }}>
                    {stats.capacidadInstaladaKwp.toLocaleString()} kWh
                  </strong>
                  <span style={statSubStyle}>Consumo agregado clientes</span>
                </div>

                <div style={cardStatStyle}>
                  <span style={statTagStyle}>Servicios cerrados</span>
                  <strong style={statValueStyle}>{stats.mantenimientosAnio}</strong>
                  <span style={statSubStyle}>Citas completadas en el año</span>
                </div>
              </section>

              {/* TABLA DE CITAS */}
              <section style={{ ...cardSectionStyle, marginBottom: '1.75rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.1rem',
                  }}
                >
                  <h2 style={sectionHeaderStyle}>Citas de Soporte e Instalación</h2>
                  <span style={{ fontSize: '0.82rem', color: CARIBE_THEME.pizarra }}>
                    {citas.length} solicitud(es)
                  </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr style={tableHeaderRowStyle}>
                        <th style={thStyle}>Cliente</th>
                        <th style={thStyle}>Fecha</th>
                        <th style={thStyle}>Servicio</th>
                        <th style={thStyle}>Notas / Solicitud</th>
                        <th style={thStyle}>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {citas.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '1.75rem', color: CARIBE_THEME.pizarra }}>
                            No hay citas registradas para esta empresa.
                          </td>
                        </tr>
                      ) : (
                        citas.map((c) => {
                          const estadoUpper = (c.estado || 'PENDIENTE').toUpperCase();
                          return (
                            <tr key={c.idCita} style={{ borderBottom: `1px solid ${CARIBE_THEME.borde}` }}>
                              <td style={{ ...tdStyle, fontWeight: 700, color: CARIBE_THEME.petroleo }}>
                                {c.nombreCliente}
                              </td>
                              <td style={{ ...tdStyle, color: CARIBE_THEME.pizarra }}>{c.fecha}</td>
                              <td style={{ ...tdStyle, color: CARIBE_THEME.petroleo }}>{c.tipoServicio}</td>
                              <td style={{ ...tdStyle, color: CARIBE_THEME.pizarra, fontSize: '0.84rem' }}>
                                {c.notas || '—'}
                              </td>
                              <td style={tdStyle}>
                                <select
                                  value={estadoUpper}
                                  onChange={(e) => handleCambiarEstadoCita(c.idCita, e.target.value)}
                                  style={{
                                    padding: '0.4rem 0.65rem',
                                    borderRadius: '8px',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    border: `1px solid ${CARIBE_THEME.borde}`,
                                    fontFamily: 'inherit',
                                    backgroundColor:
                                      estadoUpper === 'CONFIRMADA'
                                        ? 'rgba(28, 128, 119, 0.16)'
                                        : estadoUpper === 'COMPLETADA'
                                        ? 'rgba(9, 47, 53, 0.12)'
                                        : estadoUpper === 'CANCELADA'
                                        ? 'rgba(185, 45, 45, 0.12)'
                                        : 'rgba(255, 191, 63, 0.25)',
                                    color:
                                      estadoUpper === 'CONFIRMADA'
                                        ? CARIBE_THEME.turquesa
                                        : estadoUpper === 'CANCELADA'
                                        ? '#8E1F1F'
                                        : CARIBE_THEME.petroleo,
                                  }}
                                >
                                  <option value="PENDIENTE">PENDIENTE</option>
                                  <option value="CONFIRMADA">CONFIRMADA</option>
                                  <option value="COMPLETADA">COMPLETADA</option>
                                  <option value="CANCELADA">CANCELADA</option>
                                </select>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* TABLA DE CLIENTES Y PROPIEDADES */}
              <section style={cardSectionStyle}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.1rem',
                  }}
                >
                  <h2 style={sectionHeaderStyle}>Clientes y Propiedades Registradas</h2>
                  <span style={{ fontSize: '0.82rem', color: CARIBE_THEME.pizarra }}>
                    {clientesCasas.length} inmueble(s)
                  </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr style={tableHeaderRowStyle}>
                        <th style={thStyle}>Cliente</th>
                        <th style={thStyle}>Ciudad</th>
                        <th style={thStyle}>Tipo de Propiedad</th>
                        <th style={thStyle}>Consumo Mensual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientesCasas.length === 0 ? (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', padding: '1.75rem', color: CARIBE_THEME.pizarra }}>
                            No hay clientes vinculados a esta empresa aún.
                          </td>
                        </tr>
                      ) : (
                        clientesCasas.map((cl) => (
                          <tr key={`${cl.idUsuario}-${cl.idCasa}`} style={{ borderBottom: `1px solid ${CARIBE_THEME.borde}` }}>
                            <td style={{ ...tdStyle, fontWeight: 700, color: CARIBE_THEME.petroleo }}>
                              {cl.nombreCliente}
                            </td>
                            <td style={{ ...tdStyle, color: CARIBE_THEME.pizarra }}>{cl.ciudadCasa}</td>
                            <td style={{ ...tdStyle, color: CARIBE_THEME.turquesa, fontWeight: 700 }}>
                              {cl.tipoPropiedad}
                            </td>
                            <td style={{ ...tdStyle, fontWeight: 700, color: CARIBE_THEME.petroleo }}>
                              {cl.consumoMensualKwh || 0} kWh/mes
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {/* --- PESTAÑA 2: CATÁLOGO DE PANELES --- */}
          {tabActiva === 'catalogo' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              <section style={cardSectionStyle}>
                <h2 style={sectionHeaderStyle}>Agregar Módulo Fotovoltaico al Catálogo</h2>
                <form
                  onSubmit={handleAgregarPanel}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                    gap: '1rem',
                    marginTop: '1rem',
                  }}
                >
                  <div>
                    <label style={caribeLabelStyle}>Nombre / Modelo *</label>
                    <input
                      type="text"
                      value={nuevoPanel.nombre}
                      onChange={(e) => setNuevoPanel({ ...nuevoPanel, nombre: e.target.value })}
                      required
                      style={caribeInputStyle}
                      placeholder="JA Solar DeepBlue 550W"
                    />
                  </div>
                  <div>
                    <label style={caribeLabelStyle}>Tecnología *</label>
                    <input
                      type="text"
                      value={nuevoPanel.tipo}
                      onChange={(e) => setNuevoPanel({ ...nuevoPanel, tipo: e.target.value })}
                      required
                      style={caribeInputStyle}
                      placeholder="Monocristalino"
                    />
                  </div>
                  <div>
                    <label style={caribeLabelStyle}>Potencia (W) *</label>
                    <input
                      type="number"
                      value={nuevoPanel.potenciaW}
                      onChange={(e) => setNuevoPanel({ ...nuevoPanel, potenciaW: Number(e.target.value) })}
                      required
                      style={caribeInputStyle}
                    />
                  </div>
                  <div>
                    <label style={caribeLabelStyle}>Eficiencia (%) *</label>
                    <input
                      type="number"
                      step="0.1"
                      value={nuevoPanel.eficiencia}
                      onChange={(e) => setNuevoPanel({ ...nuevoPanel, eficiencia: Number(e.target.value) })}
                      required
                      style={caribeInputStyle}
                    />
                  </div>
                  <div>
                    <label style={caribeLabelStyle}>Precio Panel (COP) *</label>
                    <input
                      type="number"
                      value={nuevoPanel.precio}
                      onChange={(e) => setNuevoPanel({ ...nuevoPanel, precio: Number(e.target.value) })}
                      required
                      style={caribeInputStyle}
                    />
                  </div>
                  <div>
                    <label style={caribeLabelStyle}>Costo Instalación (COP) *</label>
                    <input
                      type="number"
                      value={nuevoPanel.costoInstalacion}
                      onChange={(e) =>
                        setNuevoPanel({ ...nuevoPanel, costoInstalacion: Number(e.target.value) })
                      }
                      required
                      style={caribeInputStyle}
                    />
                  </div>
                  <div>
                    <label style={caribeLabelStyle}>Garantía *</label>
                    <input
                      type="text"
                      value={nuevoPanel.garantiaAnios}
                      onChange={(e) => setNuevoPanel({ ...nuevoPanel, garantiaAnios: e.target.value })}
                      required
                      style={caribeInputStyle}
                      placeholder="25 años"
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={caribeLabelStyle}>Descripción técnica</label>
                    <input
                      type="text"
                      value={nuevoPanel.descripcion}
                      onChange={(e) => setNuevoPanel({ ...nuevoPanel, descripcion: e.target.value })}
                      style={caribeInputStyle}
                      placeholder="Panel monocristalino de alta eficiencia ideal para cubiertas en clima cálido"
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '0.35rem' }}>
                    <button
                      type="submit"
                      style={{
                        ...caribePrimaryButtonStyle,
                        width: 'auto',
                        padding: '0.8rem 1.5rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <span>Guardar en catálogo</span>
                      <CaribeIcons.ArrowRight color={CARIBE_THEME.petroleo} />
                    </button>
                  </div>
                </form>
              </section>

              <section style={cardSectionStyle}>
                <h2 style={{ ...sectionHeaderStyle, marginBottom: '1rem' }}>Inventario Activo</h2>
                <div style={{ overflowX: 'auto' }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr style={tableHeaderRowStyle}>
                        <th style={thStyle}>Modelo</th>
                        <th style={thStyle}>Tipo</th>
                        <th style={thStyle}>Potencia</th>
                        <th style={thStyle}>Eficiencia</th>
                        <th style={thStyle}>Garantía</th>
                        <th style={thStyle}>Precio Equipo</th>
                        <th style={thStyle}>Instalación</th>
                        <th style={thStyle}>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {catalogo.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '1.75rem', color: CARIBE_THEME.pizarra }}>
                            El catálogo de tu empresa está vacío.
                          </td>
                        </tr>
                      ) : (
                        catalogo.map((p) => (
                          <tr key={p.id} style={{ borderBottom: `1px solid ${CARIBE_THEME.borde}` }}>
                            <td style={{ ...tdStyle, fontWeight: 700, color: CARIBE_THEME.petroleo }}>{p.nombre}</td>
                            <td style={{ ...tdStyle, color: CARIBE_THEME.pizarra }}>{p.tipo}</td>
                            <td style={{ ...tdStyle, fontWeight: 600 }}>{p.potenciaW} W</td>
                            <td style={{ ...tdStyle, color: CARIBE_THEME.turquesa, fontWeight: 700 }}>{p.eficiencia}%</td>
                            <td style={{ ...tdStyle, color: CARIBE_THEME.pizarra }}>{p.garantiaAnios}</td>
                            <td style={{ ...tdStyle, fontWeight: 700 }}>
                              ${Number(p.precio).toLocaleString('es-CO')} COP
                            </td>
                            <td style={{ ...tdStyle, color: CARIBE_THEME.pizarra }}>
                              ${Number(p.costoInstalacion).toLocaleString('es-CO')} COP
                            </td>
                            <td style={tdStyle}>
                              <button
                                type="button"
                                onClick={() => handleEliminarPanel(p.id)}
                                style={{
                                  backgroundColor: 'rgba(185, 45, 45, 0.1)',
                                  color: '#8E1F1F',
                                  border: '1px solid rgba(185, 45, 45, 0.25)',
                                  padding: '0.38rem 0.75rem',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem',
                                  fontWeight: 700,
                                  fontFamily: 'inherit',
                                }}
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* --- PESTAÑA 3: INFORMES FINANCIEROS --- */}
          {tabActiva === 'finanzas' && (
            <section style={cardSectionStyle}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  marginBottom: '1.35rem',
                }}
              >
                <h2 style={sectionHeaderStyle}>Reporte Económico Consolidado</h2>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 600, color: CARIBE_THEME.pizarra }}>
                    Año fiscal:
                  </label>
                  <input
                    type="number"
                    value={anioFiltro}
                    onChange={(e) => setAnioFiltro(Number(e.target.value))}
                    style={{ ...caribeInputStyle, width: '110px', padding: '0.55rem 0.75rem' }}
                  />
                  <button
                    type="button"
                    onClick={handleBuscarFinanzas}
                    style={{
                      ...caribePrimaryButtonStyle,
                      width: 'auto',
                      padding: '0.6rem 1.15rem',
                      fontSize: '0.88rem',
                    }}
                  >
                    Consultar
                  </button>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={tableStyle}>
                  <thead>
                    <tr style={tableHeaderRowStyle}>
                      <th style={thStyle}>Mes</th>
                      <th style={thStyle}>Tipo de Servicio</th>
                      <th style={thStyle}>Cantidad</th>
                      <th style={thStyle}>Ingresos Totales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reporteFinanciero.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '1.75rem', color: CARIBE_THEME.pizarra }}>
                          No hay registros financieros para el año seleccionado. Pulsa &ldquo;Consultar&rdquo; para actualizar.
                        </td>
                      </tr>
                    ) : (
                      reporteFinanciero.map((f, idx) => (
                        <tr key={idx} style={{ borderBottom: `1px solid ${CARIBE_THEME.borde}` }}>
                          <td style={{ ...tdStyle, fontWeight: 700 }}>{f.mes}</td>
                          <td style={{ ...tdStyle, color: CARIBE_THEME.pizarra }}>{f.tipoServicio}</td>
                          <td style={{ ...tdStyle, color: CARIBE_THEME.pizarra }}>{f.cantidadServicios}</td>
                          <td style={{ ...tdStyle, color: CARIBE_THEME.turquesa, fontWeight: 800 }}>
                            ${Number(f.totalIngresos).toLocaleString('es-CO')} COP
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* --- PESTAÑA 4: EMISIÓN DE FACTURAS --- */}
          {tabActiva === 'factura' && (
            <section style={{ ...cardSectionStyle, maxWidth: '680px' }}>
              <h2 style={{ ...sectionHeaderStyle, marginBottom: '1.25rem' }}>
                Emitir Factura de Servicio Fotovoltaico
              </h2>
              <form onSubmit={handleGenerarFactura} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={caribeLabelStyle}>Cliente o Razón Social *</label>
                    <input
                      type="text"
                      value={facturaData.clienteNombre}
                      onChange={(e) => setFacturaData({ ...facturaData, clienteNombre: e.target.value })}
                      required
                      style={caribeInputStyle}
                      placeholder="Nombre del cliente"
                    />
                  </div>
                  <div>
                    <label style={caribeLabelStyle}>NIT o Cédula *</label>
                    <input
                      type="text"
                      value={facturaData.nitCliente}
                      onChange={(e) => setFacturaData({ ...facturaData, nitCliente: e.target.value })}
                      required
                      style={caribeInputStyle}
                      placeholder="900888777-1"
                    />
                  </div>
                </div>

                <div>
                  <label style={caribeLabelStyle}>Concepto de facturación *</label>
                  <input
                    type="text"
                    value={facturaData.concepto}
                    onChange={(e) => setFacturaData({ ...facturaData, concepto: e.target.value })}
                    required
                    style={caribeInputStyle}
                  />
                </div>

                <div>
                  <label style={caribeLabelStyle}>Monto Total (COP) *</label>
                  <input
                    type="number"
                    value={facturaData.montoTotal}
                    onChange={(e) => setFacturaData({ ...facturaData, montoTotal: e.target.value })}
                    required
                    style={caribeInputStyle}
                    placeholder="12500000"
                  />
                </div>

                <div>
                  <label style={caribeLabelStyle}>Observaciones adicionales</label>
                  <textarea
                    value={facturaData.observaciones}
                    onChange={(e) => setFacturaData({ ...facturaData, observaciones: e.target.value })}
                    rows={3}
                    style={{ ...caribeInputStyle, resize: 'vertical' }}
                    placeholder="Garantía de instalación, referencia de inversores, forma de pago..."
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                  <button
                    type="submit"
                    style={{
                      ...caribePrimaryButtonStyle,
                      width: 'auto',
                      padding: '0.85rem 1.75rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span>Generar factura</span>
                    <CaribeIcons.ArrowRight color={CARIBE_THEME.petroleo} />
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

const cardStatStyle = {
  backgroundColor: CARIBE_THEME.blanco,
  border: `1px solid ${CARIBE_THEME.borde}`,
  borderRadius: '16px',
  padding: '1.35rem 1.5rem',
  display: 'flex',
  flexDirection: 'column',
};

const statTagStyle = {
  fontSize: '0.74rem',
  fontWeight: 700,
  color: CARIBE_THEME.turquesa,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const statValueStyle = {
  fontFamily: "'Sora', sans-serif",
  fontSize: '1.8rem',
  color: CARIBE_THEME.petroleo,
  margin: '0.35rem 0 0.2rem 0',
};

const statSubStyle = {
  fontSize: '0.82rem',
  color: CARIBE_THEME.pizarra,
};

const cardSectionStyle = {
  backgroundColor: CARIBE_THEME.blanco,
  borderRadius: '18px',
  padding: '1.65rem',
  border: `1px solid ${CARIBE_THEME.borde}`,
};

const sectionHeaderStyle = {
  fontFamily: "'Sora', sans-serif",
  fontSize: '1.15rem',
  color: CARIBE_THEME.petroleo,
  margin: 0,
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left',
  fontSize: '0.9rem',
};

const tableHeaderRowStyle = {
  borderBottom: `1px solid ${CARIBE_THEME.borde}`,
  backgroundColor: CARIBE_THEME.marfil,
};

const thStyle = {
  padding: '0.75rem 0.85rem',
  fontSize: '0.76rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: CARIBE_THEME.pizarra,
};

const tdStyle = {
  padding: '0.85rem 0.85rem',
};