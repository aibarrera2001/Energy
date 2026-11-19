import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserSidebar from '../../components/UserSidebar';
import {
  CARIBE_THEME,
  CaribeIcons,
  caribeInputStyle,
  caribeLabelStyle,
  caribePrimaryButtonStyle,
  useCaribeFonts,
} from '../../components/CaribeSolarUI';

export default function Reportes() {
  const navigate = useNavigate();
  useCaribeFonts();

  const rawId = localStorage.getItem('usuarioId') || localStorage.getItem('idUsuario');
  const userId = rawId && rawId !== 'undefined' && rawId !== 'null' ? Number(rawId) : null;
  const nombreUsuario = localStorage.getItem('nombreUsuario') || localStorage.getItem('nombre') || 'Usuario';

  const [propiedades, setPropiedades] = useState([]);
  const [casaSeleccionada, setCasaSeleccionada] = useState('');
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [citas, setCitas] = useState([]);
  const [filtroAnio, setFiltroAnio] = useState('2026');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatosBase();
  }, []);

  useEffect(() => {
    if (casaSeleccionada) {
      cargarRecomendaciones(casaSeleccionada);
    }
  }, [casaSeleccionada]);

  const cargarDatosBase = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const [resCasas, resCitas] = await Promise.all([
        fetch(`http://localhost:8080/api/casas/usuario/${userId}`).catch(() => fetch(`/api/casas/usuario/${userId}`)),
        fetch(`http://localhost:8080/api/citas/usuario/${userId}`).catch(() => fetch(`/api/citas/usuario/${userId}`)),
      ]);

      if (resCasas && resCasas.ok) {
        const dataCasas = await resCasas.json();
        const lista = Array.isArray(dataCasas) ? dataCasas : [];
        setPropiedades(lista);
        if (lista.length !== 0) {
          setCasaSeleccionada(String(lista[0].idCasa));
        }
      }

      if (resCitas && resCitas.ok) {
        const dataCitas = await resCitas.json();
        setCitas(Array.isArray(dataCitas) ? dataCitas : []);
      }
    } catch (err) {
      console.error('Error cargando datos para reportes:', err);
    } finally {
      setLoading(false);
    }
  };

  const cargarRecomendaciones = async (idCasa) => {
    try {
      const res = await fetch(`http://localhost:8080/api/paneles/recomendar/${idCasa}`).catch(() =>
        fetch(`/api/paneles/recomendar/${idCasa}`)
      );
      if (res && res.ok) {
        const data = await res.json();
        setRecomendaciones(Array.isArray(data) ? data : []);
      } else {
        setRecomendaciones([]);
      }
    } catch (err) {
      console.error('Error cargando recomendaciones:', err);
      setRecomendaciones([]);
    }
  };

  const propiedadActual = propiedades.find((p) => String(p.idCasa) === String(casaSeleccionada));
  const kitOptimo = recomendaciones.find((r) => r.recomendado) || recomendaciones[0] || null;

  const consumoBase = propiedadActual ? Number(propiedadActual.consumoMensual || 0) : 0;
  const generacionBase = kitOptimo ? Number(kitOptimo.generacionMensualKwh || 0) : 0;
  const tarifaKwhCop = 850;

  const mesesConfig = [
    { nombre: 'Noviembre', factorSolar: 1.02, factorConsumo: 1.0 },
    { nombre: 'Octubre', factorSolar: 0.96, factorConsumo: 0.98 },
    { nombre: 'Septiembre', factorSolar: 0.99, factorConsumo: 1.01 },
    { nombre: 'Agosto', factorSolar: 1.06, factorConsumo: 1.04 },
    { nombre: 'Julio', factorSolar: 1.08, factorConsumo: 1.05 },
    { nombre: 'Junio', factorSolar: 1.04, factorConsumo: 1.02 },
  ];

  const filasReporte = propiedadActual
    ? mesesConfig.map((m, index) => {
        const genMes = Number((generacionBase * m.factorSolar).toFixed(1));
        const consMes = Number((consumoBase * m.factorConsumo).toFixed(1));
        const ahorroMes = Math.round(Math.min(genMes, consMes) * tarifaKwhCop);
        const co2EvitadoKg = Number((genMes * 0.164).toFixed(1));
        return {
          id: index + 1,
          periodo: `${m.nombre} ${filtroAnio}`,
          generacion: genMes,
          consumo: consMes,
          ahorro: ahorroMes,
          co2: co2EvitadoKg,
        };
      })
    : [];

  const totalGeneracionSemestre = filasReporte.reduce((acc, f) => acc + f.generacion, 0);
  const totalAhorroSemestre = filasReporte.reduce((acc, f) => acc + f.ahorro, 0);
  const totalCo2Semestre = filasReporte.reduce((acc, f) => acc + f.co2, 0);

  const exportarCSV = () => {
    if (filasReporte.length === 0) return;

    const encabezados = ['Periodo', 'Propiedad', 'Ciudad', 'Generacion_Solar_kWh', 'Consumo_kWh', 'Ahorro_Estimado_COP', 'CO2_Evitado_kg'];
    const lineas = filasReporte.map((f) =>
      [
        f.periodo,
        `"${propiedadActual.tipoPropiedad} - ${propiedadActual.direccion || 'GPS'}"`,
        `"${propiedadActual.ciudad}"`,
        f.generacion,
        f.consumo,
        f.ahorro,
        f.co2,
      ].join(',')
    );

    const contenido = [encabezados.join(','), ...lineas].join('\n');
    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Reporte_EnergiApp_${propiedadActual.ciudad}_${filtroAnio}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
      <UserSidebar />

      <main
        style={{
          flex: 1,
          marginLeft: 'var(--sidebar-width, 260px)',
          width: 'calc(100% - var(--sidebar-width, 260px))',
          padding: '2.25rem 2.5rem',
          overflowY: 'auto',
          textAlign: 'left',
          transition: 'margin-left 0.28s cubic-bezier(0.4, 0, 0.2, 1), width 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
          {/* Encabezado */}
          <header
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: '1rem',
              paddingBottom: '1.5rem',
              borderBottom: `1px solid ${CARIBE_THEME.borde}`,
              marginBottom: '2rem',
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
                Análisis y Proyección · Región Caribe
              </span>
              <h1
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: 'clamp(1.65rem, 2.8vw, 2.15rem)',
                  fontWeight: 700,
                  color: CARIBE_THEME.petroleo,
                  margin: '0.3rem 0 0.25rem 0',
                  letterSpacing: '-0.02em',
                }}
              >
                Reportes y Balance Energético
              </h1>
              <p style={{ color: CARIBE_THEME.pizarra, margin: 0, fontSize: '0.95rem' }}>
                Proyección semestral de generación fotovoltaica, ahorro económico e impacto ambiental para {nombreUsuario}.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={exportarCSV}
                disabled={filasReporte.length === 0}
                style={{
                  backgroundColor: CARIBE_THEME.blanco,
                  color: CARIBE_THEME.petroleo,
                  fontWeight: 600,
                  border: `1px solid ${CARIBE_THEME.borde}`,
                  padding: '0.75rem 1.15rem',
                  borderRadius: '12px',
                  cursor: filasReporte.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: filasReporte.length === 0 ? 0.55 : 1,
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                }}
              >
                Exportar Excel (CSV)
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  ...caribePrimaryButtonStyle,
                  width: 'auto',
                  padding: '0.75rem 1.2rem',
                  fontSize: '0.9rem',
                }}
              >
                Imprimir / Guardar PDF
              </button>
            </div>
          </header>

          {loading ? (
            <p style={{ color: CARIBE_THEME.pizarra }}>Generando informes energéticos...</p>
          ) : propiedades.length === 0 ? (
            <div
              style={{
                backgroundColor: CARIBE_THEME.blanco,
                border: `1px solid ${CARIBE_THEME.borde}`,
                borderRadius: '16px',
                padding: '2.5rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.25rem',
              }}
            >
              <div>
                <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.2rem', margin: '0 0 0.4rem 0' }}>
                  Sin propiedades registradas
                </h2>
                <p style={{ color: CARIBE_THEME.pizarra, margin: 0, fontSize: '0.94rem' }}>
                  Registra primero una propiedad en la pestaña <strong>Mis propiedades</strong> para generar tus reportes energéticos.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/registrar-casa')}
                style={{
                  ...caribePrimaryButtonStyle,
                  width: 'auto',
                  padding: '0.8rem 1.3rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>Registrar propiedad</span>
                <CaribeIcons.ArrowRight color={CARIBE_THEME.petroleo} />
              </button>
            </div>
          ) : (
            <>
              {/* Barra de filtros */}
              <div
                style={{
                  backgroundColor: CARIBE_THEME.blanco,
                  border: `1px solid ${CARIBE_THEME.borde}`,
                  borderRadius: '16px',
                  padding: '1.35rem 1.65rem',
                  marginBottom: '1.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ minWidth: '260px' }}>
                    <label style={caribeLabelStyle}>Propiedad analizada:</label>
                    <select value={casaSeleccionada} onChange={(e) => setCasaSeleccionada(e.target.value)} style={caribeInputStyle}>
                      {propiedades.map((p) => (
                        <option key={p.idCasa} value={p.idCasa}>
                          {p.tipoPropiedad} - {p.direccion || 'GPS'} ({p.ciudad})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ minWidth: '140px' }}>
                    <label style={caribeLabelStyle}>Año de proyección:</label>
                    <select value={filtroAnio} onChange={(e) => setFiltroAnio(e.target.value)} style={caribeInputStyle}>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                    </select>
                  </div>
                </div>

                {kitOptimo && (
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.76rem', color: CARIBE_THEME.pizarra, display: 'block', fontWeight: 600 }}>
                      Kit base del reporte
                    </span>
                    <strong style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.98rem', color: CARIBE_THEME.turquesa }}>
                      {kitOptimo.cantidadPaneles}x {kitOptimo.nombrePanel} ({kitOptimo.potenciaTotalKw} kWp)
                    </strong>
                  </div>
                )}
              </div>

              {/* Tarjetas resumen */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1.25rem',
                  marginBottom: '1.75rem',
                }}
              >
                <div style={{ backgroundColor: CARIBE_THEME.blanco, border: `1px solid ${CARIBE_THEME.borde}`, borderRadius: '16px', padding: '1.4rem' }}>
                  <span style={{ fontSize: '0.74rem', color: CARIBE_THEME.turquesa, fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>
                    Generación acumulada (6 meses)
                  </span>
                  <strong style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.65rem', color: CARIBE_THEME.petroleo, display: 'block', margin: '0.35rem 0' }}>
                    {totalGeneracionSemestre.toFixed(1)} kWh
                  </strong>
                  <span style={{ fontSize: '0.82rem', color: CARIBE_THEME.pizarra }}>Energía limpia producida</span>
                </div>

                <div style={{ backgroundColor: CARIBE_THEME.blanco, border: `1px solid ${CARIBE_THEME.borde}`, borderRadius: '16px', padding: '1.4rem' }}>
                  <span style={{ fontSize: '0.74rem', color: CARIBE_THEME.turquesa, fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>
                    Ahorro acumulado (6 meses)
                  </span>
                  <strong style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.65rem', color: CARIBE_THEME.petroleo, display: 'block', margin: '0.35rem 0' }}>
                    ${totalAhorroSemestre.toLocaleString('es-CO')}
                  </strong>
                  <span style={{ fontSize: '0.82rem', color: CARIBE_THEME.pizarra }}>Tarifa ref. $850 COP/kWh</span>
                </div>

                <div style={{ backgroundColor: CARIBE_THEME.blanco, border: `1px solid ${CARIBE_THEME.borde}`, borderRadius: '16px', padding: '1.4rem' }}>
                  <span style={{ fontSize: '0.74rem', color: CARIBE_THEME.turquesa, fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>
                    CO₂ evitado estimado
                  </span>
                  <strong style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.65rem', color: CARIBE_THEME.petroleo, display: 'block', margin: '0.35rem 0' }}>
                    {totalCo2Semestre.toFixed(1)} kg
                  </strong>
                  <span style={{ fontSize: '0.82rem', color: CARIBE_THEME.pizarra }}>Huella de carbono reducida</span>
                </div>

                <div style={{ backgroundColor: CARIBE_THEME.blanco, border: `1px solid ${CARIBE_THEME.borde}`, borderRadius: '16px', padding: '1.4rem' }}>
                  <span style={{ fontSize: '0.74rem', color: CARIBE_THEME.turquesa, fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>
                    Visitas técnicas
                  </span>
                  <strong style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.65rem', color: CARIBE_THEME.petroleo, display: 'block', margin: '0.35rem 0' }}>
                    {citas.length}
                  </strong>
                  <span style={{ fontSize: '0.82rem', color: CARIBE_THEME.pizarra }}>Historial de soporte</span>
                </div>
              </div>

              {/* Tabla clara de desglose mensual */}
              <div
                style={{
                  backgroundColor: CARIBE_THEME.blanco,
                  border: `1px solid ${CARIBE_THEME.borde}`,
                  borderRadius: '16px',
                  overflowX: 'auto',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr
                      style={{
                        borderBottom: `1px solid ${CARIBE_THEME.borde}`,
                        backgroundColor: CARIBE_THEME.marfil,
                        color: CARIBE_THEME.pizarra,
                        fontSize: '0.76rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      <th style={{ padding: '1rem 1.25rem' }}>Periodo</th>
                      <th style={{ padding: '1rem 1.25rem' }}>Generación Solar</th>
                      <th style={{ padding: '1rem 1.25rem' }}>Consumo Inmueble</th>
                      <th style={{ padding: '1rem 1.25rem' }}>CO₂ Evitado</th>
                      <th style={{ padding: '1rem 1.25rem' }}>Ahorro Estimado</th>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filasReporte.map((rep) => {
                      const superavit = rep.generacion >= rep.consumo;
                      return (
                        <tr key={rep.id} style={{ borderBottom: `1px solid ${CARIBE_THEME.borde}`, fontSize: '0.92rem' }}>
                          <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: CARIBE_THEME.petroleo }}>
                            {rep.periodo}
                          </td>
                          <td style={{ padding: '1rem 1.25rem', color: CARIBE_THEME.turquesa, fontWeight: 700 }}>
                            {rep.generacion} kWh
                          </td>
                          <td style={{ padding: '1rem 1.25rem', color: CARIBE_THEME.pizarra }}>
                            {rep.consumo} kWh
                          </td>
                          <td style={{ padding: '1rem 1.25rem', color: CARIBE_THEME.pizarra }}>
                            {rep.co2} kg
                          </td>
                          <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: CARIBE_THEME.petroleo }}>
                            ${rep.ahorro.toLocaleString('es-CO')} COP
                          </td>
                          <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                            <span
                              style={{
                                backgroundColor: superavit ? 'rgba(28, 128, 119, 0.14)' : 'rgba(255, 191, 63, 0.28)',
                                color: superavit ? CARIBE_THEME.turquesa : CARIBE_THEME.petroleo,
                                fontSize: '0.73rem',
                                fontWeight: 700,
                                padding: '0.28rem 0.7rem',
                                borderRadius: '8px',
                              }}
                            >
                              {superavit ? 'EXCEDENTE SOLAR' : 'COBERTURA PARCIAL'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}