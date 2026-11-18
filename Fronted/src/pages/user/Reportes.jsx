import React, { useState, useEffect } from 'react';
import UserSidebar from '../../components/UserSidebar';

export default function Reportes() {
  const userId = Number(localStorage.getItem('usuarioId') || localStorage.getItem('idUsuario'));
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
        fetch(`/api/casas/usuario/${userId}`),
        fetch(`/api/citas/usuario/${userId}`)
      ]);

      if (resCasas.ok) {
        const dataCasas = await resCasas.json();
        const lista = Array.isArray(dataCasas) ? dataCasas : [];
        setPropiedades(lista);
        if (lista.length !== 0) {
          setCasaSeleccionada(String(lista[0].idCasa));
        }
      }

      if (resCitas.ok) {
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
      const res = await fetch(`/api/paneles/recomendar/${idCasa}`);
      if (res.ok) {
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

  // Proyección mensual realista con variación estacional solar según el mes
  const mesesConfig = [
    { nombre: 'Noviembre', factorSolar: 1.02, factorConsumo: 1.00 },
    { nombre: 'Octubre', factorSolar: 0.96, factorConsumo: 0.98 },
    { nombre: 'Septiembre', factorSolar: 0.99, factorConsumo: 1.01 },
    { nombre: 'Agosto', factorSolar: 1.06, factorConsumo: 1.04 },
    { nombre: 'Julio', factorSolar: 1.08, factorConsumo: 1.05 },
    { nombre: 'Junio', factorSolar: 1.04, factorConsumo: 1.02 }
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
          co2: co2EvitadoKg
        };
      })
    : [];

  const totalGeneracionSemestre = filasReporte.reduce((acc, f) => acc + f.generacion, 0);
  const totalAhorroSemestre = filasReporte.reduce((acc, f) => acc + f.ahorro, 0);
  const totalCo2Semestre = filasReporte.reduce((acc, f) => acc + f.co2, 0);

  const exportarCSV = () => {
    if (filasReporte.length === 0) return;

    const encabezados = ['Periodo', 'Propiedad', 'Ciudad', 'Generacion_Solar_kWh', 'Consumo_kWh', 'Ahorro_Estimado_COP', 'CO2_Evitado_kg'];
    const lineas = filasReporte.map((f) => [
      f.periodo,
      `"${propiedadActual.tipoPropiedad} - ${propiedadActual.direccion || 'GPS'}"`,
      `"${propiedadActual.ciudad}"`,
      f.generacion,
      f.consumo,
      f.ahorro,
      f.co2
    ].join(','));

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
    <div style={{ backgroundColor: '#0F172A', minHeight: '100vh', color: '#F8FAFC', fontFamily: "'Inter', sans-serif" }}>
      <UserSidebar />

      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', boxSizing: 'border-box' }}>
        {/* Encabezado */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 0.25rem 0' }}>
              📈 Reportes y Balance Energético
            </h1>
            <p style={{ color: '#94A3B8', margin: 0, fontSize: '0.95rem' }}>
              Proyección semestral de generación fotovoltaica, ahorro económico e impacto ambiental para {nombreUsuario}.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={exportarCSV}
              disabled={filasReporte.length === 0}
              style={{
                backgroundColor: '#1E293B',
                color: '#FFFFFF',
                fontWeight: 600,
                border: '1px solid #334155',
                padding: '0.65rem 1.15rem',
                borderRadius: '0.5rem',
                cursor: filasReporte.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem'
              }}
            >
              📥 Exportar Excel (CSV)
            </button>
            <button
              onClick={() => window.print()}
              style={{
                backgroundColor: '#10B981',
                color: '#0F172A',
                fontWeight: 700,
                border: 'none',
                padding: '0.65rem 1.2rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              🖨️ Imprimir / Guardar PDF
            </button>
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#94A3B8' }}>Generando informes energéticos...</p>
        ) : propiedades.length === 0 ? (
          <div style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '0.85rem', padding: '2.25rem', textAlign: 'center', color: '#94A3B8' }}>
            Registra primero una propiedad en la pestaña <strong>Propiedades</strong> para generar tus reportes energéticos.
          </div>
        ) : (
          <>
            {/* Barra de filtros */}
            <div style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '0.85rem', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ minWidth: '260px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, marginBottom: '0.3rem' }}>
                    Propiedad analizada:
                  </label>
                  <select
                    value={casaSeleccionada}
                    onChange={(e) => setCasaSeleccionada(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '0.5rem', color: '#FFFFFF', fontSize: '0.9rem' }}
                  >
                    {propiedades.map((p) => (
                      <option key={p.idCasa} value={p.idCasa}>
                        {p.tipoPropiedad} - {p.direccion || 'GPS'} ({p.ciudad})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ minWidth: '140px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, marginBottom: '0.3rem' }}>
                    Año de proyección:
                  </label>
                  <select
                    value={filtroAnio}
                    onChange={(e) => setFiltroAnio(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '0.5rem', color: '#FFFFFF', fontSize: '0.9rem' }}
                  >
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                </div>
              </div>

              {kitOptimo && (
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94A3B8', display: 'block' }}>Kit base del reporte</span>
                  <strong style={{ fontSize: '0.95rem', color: '#10B981' }}>
                    {kitOptimo.cantidadPaneles}x {kitOptimo.nombrePanel} ({kitOptimo.potenciaTotalKw} kWp)
                  </strong>
                </div>
              )}
            </div>

            {/* Tarjetas resumen del semestre */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '0.85rem', padding: '1.3rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, display: 'block' }}>
                  GENERACIÓN ACUMULADA (6 MESES)
                </span>
                <strong style={{ fontSize: '1.65rem', color: '#10B981', display: 'block', margin: '0.35rem 0' }}>
                  {totalGeneracionSemestre.toFixed(1)} kWh
                </strong>
                <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Energía limpia producida</span>
              </div>

              <div style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '0.85rem', padding: '1.3rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, display: 'block' }}>
                  AHORRO ACUMULADO (6 MESES)
                </span>
                <strong style={{ fontSize: '1.65rem', color: '#818CF8', display: 'block', margin: '0.35rem 0' }}>
                  ${totalAhorroSemestre.toLocaleString('es-CO')}
                </strong>
                <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Tarifa ref. $850 COP/kWh</span>
              </div>

              <div style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '0.85rem', padding: '1.3rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, display: 'block' }}>
                  CO₂ EVITADO ESTIMADO
                </span>
                <strong style={{ fontSize: '1.65rem', color: '#F59E0B', display: 'block', margin: '0.35rem 0' }}>
                  {totalCo2Semestre.toFixed(1)} kg
                </strong>
                <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Huella de carbono reducida</span>
              </div>

              <div style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '0.85rem', padding: '1.3rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, display: 'block' }}>
                  VISITAS TÉCNICAS REGISTRADAS
                </span>
                <strong style={{ fontSize: '1.65rem', color: '#FFFFFF', display: 'block', margin: '0.35rem 0' }}>
                  {citas.length}
                </strong>
                <span style={{ fontSize: '0.8rem', color: '#10B981' }}>Historial de soporte</span>
              </div>
            </div>

            {/* Tabla oscura de desglose mensual */}
            <div style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '0.85rem', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', backgroundColor: '#0F172A', color: '#94A3B8', fontSize: '0.78rem', textTransform: 'uppercase' }}>
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
                      <tr key={rep.id} style={{ borderBottom: '1px solid #334155', fontSize: '0.92rem' }}>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#FFFFFF' }}>
                          {rep.periodo}
                        </td>
                        <td style={{ padding: '1rem 1.25rem', color: '#10B981', fontWeight: 600 }}>
                          {rep.generacion} kWh
                        </td>
                        <td style={{ padding: '1rem 1.25rem', color: '#F59E0B' }}>
                          {rep.consumo} kWh
                        </td>
                        <td style={{ padding: '1rem 1.25rem', color: '#CBD5E1' }}>
                          {rep.co2} kg
                        </td>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#818CF8' }}>
                          ${rep.ahorro.toLocaleString('es-CO')} COP
                        </td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                          <span
                            style={{
                              backgroundColor: superavit ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                              color: superavit ? '#10B981' : '#F59E0B',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '0.25rem 0.65rem',
                              borderRadius: '999px'
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
      </main>
    </div>
  );
}