import React, { useState, useEffect } from 'react';
import UserSidebar from '../../components/UserSidebar';

export default function UserPropiedades() {
  const userId = Number(localStorage.getItem('usuarioId') || localStorage.getItem('idUsuario'));

  // Listado real de propiedades desde PostgreSQL
  const [propiedades, setPropiedades] = useState([]);
  const [cargandoPropiedades, setCargandoPropiedades] = useState(true);

  // Estado del formulario (alineado con CasaDTO y CasaService)
  const [formData, setFormData] = useState({
    tipoPropiedad: 'CASA',
    direccion: '',
    ciudad: 'Valledupar',
    latitud: 10.4631,
    longitud: -73.2532,
    areaTerrazaTechoM2: '',
    areaDisponibleM2: '',
    consumoMensual: '',
    esCasaNueva: false
  });

  // Estados del cuestionario de electrodomésticos (para casas nuevas sin factura)
  const [catalogoArticulos, setCatalogoArticulos] = useState([]);
  const [cantidades, setCantidades] = useState({});
  const [cargandoCatalogo, setCargandoCatalogo] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarPropiedades();
  }, []);

  // Cargar catálogo desde PostgreSQL cuando se marca "Casa nueva"
  useEffect(() => {
    if (formData.esCasaNueva && catalogoArticulos.length === 0) {
      setCargandoCatalogo(true);
      fetch('/api/casas/catalogo-articulos')
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) setCatalogoArticulos(data);
        })
        .catch((err) => console.error('Error cargando catálogo:', err))
        .finally(() => setCargandoCatalogo(false));
    }
  }, [formData.esCasaNueva, catalogoArticulos.length]);

  const cargarPropiedades = async () => {
    if (!userId) {
      setCargandoPropiedades(false);
      return;
    }
    try {
      setCargandoPropiedades(true);
      const res = await fetch(`/api/casas/usuario/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setPropiedades(Array.isArray(data) ? data : []);
      } else {
        setPropiedades([]);
      }
    } catch (err) {
      console.error('Error cargando propiedades:', err);
      setPropiedades([]);
    } finally {
      setCargandoPropiedades(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCantidadChange = (idArticulo, nuevaCantidad) => {
    const valor = Math.max(0, Number(nuevaCantidad) || 0);
    setCantidades((prev) => {
      const copia = { ...prev };
      if (valor === 0) {
        delete copia[idArticulo];
      } else {
        copia[idArticulo] = valor;
      }
      return copia;
    });
  };

  // Cálculo preliminar en tiempo real del cuestionario
  const consumoEstimadoCuestionario = catalogoArticulos.reduce((total, art) => {
    const cant = cantidades[art.idArticulo] || 0;
    return total + art.consumoKwhMes * cant;
  }, 0);

  const articulosPorCategoria = catalogoArticulos.reduce((acc, art) => {
    if (!acc[art.categoria]) acc[art.categoria] = [];
    acc[art.categoria].push(art);
    return acc;
  }, {});

  const handleGuardarPropiedad = async (e) => {
    e.preventDefault();
    if (!userId) {
      alert('No se detectó sesión de usuario activa.');
      return;
    }

    const articulosCuestionario = Object.entries(cantidades).map(([idArticulo, cantidad]) => ({
      idArticulo: Number(idArticulo),
      cantidad: Number(cantidad)
    }));

    if (formData.esCasaNueva && articulosCuestionario.length === 0) {
      alert('Selecciona al menos un electrodoméstico en el cuestionario para calcular el consumo.');
      return;
    }

    setGuardando(true);

    const payload = {
      idUsuario: userId,
      tipoPropiedad: formData.tipoPropiedad,
      direccion: formData.direccion.trim(),
      ciudad: formData.ciudad,
      latitud: Number(formData.latitud) || 0.0,
      longitud: Number(formData.longitud) || 0.0,
      areaTerrazaTechoM2: formData.areaTerrazaTechoM2 ? Number(formData.areaTerrazaTechoM2) : null,
      areaDisponibleM2: formData.areaDisponibleM2 ? Number(formData.areaDisponibleM2) : null,
      esCasaNueva: formData.esCasaNueva,
      consumoMensual: formData.esCasaNueva ? 0.0 : Number(formData.consumoMensual),
      articulosCuestionario: formData.esCasaNueva ? articulosCuestionario : []
    };

    try {
      const res = await fetch('/api/casas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const nuevaCasa = await res.json();
        alert(`Propiedad registrada con éxito. Consumo mensual: ${Number(nuevaCasa.consumoMensual).toFixed(1)} kWh/mes`);
        // Limpiar formulario y recargar listado desde PostgreSQL
        setFormData({
          tipoPropiedad: 'CASA',
          direccion: '',
          ciudad: 'Valledupar',
          latitud: 10.4631,
          longitud: -73.2532,
          areaTerrazaTechoM2: '',
          areaDisponibleM2: '',
          consumoMensual: '',
          esCasaNueva: false
        });
        setCantidades({});
        cargarPropiedades();
      } else {
        const errorMsg = await res.text();
        alert(`Error al guardar: ${errorMsg}`);
      }
    } catch (err) {
      console.error('Error conectando con el servidor:', err);
      alert('Error de conexión con el servidor backend.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#0F172A', minHeight: '100vh', color: '#F8FAFC', fontFamily: "'Inter', sans-serif" }}>
      <UserSidebar />

      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', boxSizing: 'border-box' }}>
        {/* Encabezado */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 0.25rem 0' }}>
            🏠 Gestión de Propiedades
          </h1>
          <p style={{ color: '#94A3B8', margin: 0, fontSize: '0.95rem' }}>
            Registra tus inmuebles y define su demanda energética mensual mediante recibo o cuestionario de equipos.
          </p>
        </div>

        {/* TARJETA OSCURA: AGREGAR NUEVA PROPIEDAD */}
        <section style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '0.85rem', padding: '1.75rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#818CF8', marginTop: 0, marginBottom: '1.25rem' }}>
            ➕ Agregar Nueva Propiedad
          </h2>

          <form onSubmit={handleGuardarPropiedad} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Tipo de Propiedad *</label>
                <select name="tipoPropiedad" value={formData.tipoPropiedad} onChange={handleChange} style={inputStyle}>
                  <option value="CASA">Casa</option>
                  <option value="APARTAMENTO">Apartamento</option>
                  <option value="FINCA">Finca</option>
                  <option value="EDIFICIO">Edificio / Comercio</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Ciudad *</label>
                <select name="ciudad" value={formData.ciudad} onChange={handleChange} style={inputStyle}>
                  <option value="Valledupar">Valledupar</option>
                  <option value="Barranquilla">Barranquilla</option>
                  <option value="Cartagena">Cartagena</option>
                  <option value="Santa Marta">Santa Marta</option>
                  <option value="Montería">Montería</option>
                  <option value="Sincelejo">Sincelejo</option>
                  <option value="Riohacha">Riohacha</option>
                </select>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Dirección {formData.tipoPropiedad !== 'FINCA' ? '*' : '(Opcional)'}</label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  required={formData.tipoPropiedad !== 'FINCA'}
                  placeholder="Ej: Cra 12 # 15-40, Barrio Cañaguate"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Latitud {formData.tipoPropiedad === 'FINCA' ? '*' : ''}</label>
                <input type="number" step="any" name="latitud" value={formData.latitud} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Longitud {formData.tipoPropiedad === 'FINCA' ? '*' : ''}</label>
                <input type="number" step="any" name="longitud" value={formData.longitud} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Área Techo / Terraza (m²)</label>
                <input type="number" step="0.1" name="areaTerrazaTechoM2" value={formData.areaTerrazaTechoM2} onChange={handleChange} placeholder="50" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Área Disponible (m²)</label>
                <input type="number" step="0.1" name="areaDisponibleM2" value={formData.areaDisponibleM2} onChange={handleChange} placeholder="40" style={inputStyle} />
              </div>
            </div>

            {/* BLOQUE DE CONSUMO / CUESTIONARIO */}
            <div style={{ backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '0.75rem', padding: '1.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontWeight: 700, color: '#F8FAFC', fontSize: '0.95rem' }}>
                <input
                  type="checkbox"
                  name="esCasaNueva"
                  checked={formData.esCasaNueva}
                  onChange={handleChange}
                  style={{ width: '17px', height: '17px', accentColor: '#6366F1' }}
                />
                La propiedad es nueva o no cuento con factura mensual (Calcular mediante cuestionario de artículos)
              </label>

              {!formData.esCasaNueva ? (
                <div style={{ marginTop: '1rem', maxWidth: '300px' }}>
                  <label style={labelStyle}>Consumo Promedio (kWh/mes) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    name="consumoMensual"
                    value={formData.consumoMensual}
                    onChange={handleChange}
                    required={!formData.esCasaNueva}
                    placeholder="Ej: 380"
                    style={inputStyle}
                  />
                </div>
              ) : (
                <div style={{ marginTop: '1.25rem', borderTop: '1px solid #1E293B', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                    <span style={{ color: '#94A3B8', fontSize: '0.88rem' }}>
                      Selecciona los electrodomésticos que usarás en la vivienda:
                    </span>
                    <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', padding: '0.4rem 0.9rem', borderRadius: '0.5rem' }}>
                      <span style={{ color: '#94A3B8', fontSize: '0.8rem', marginRight: '0.5rem' }}>Consumo calculado:</span>
                      <strong style={{ color: '#10B981', fontSize: '1.05rem' }}>{consumoEstimadoCuestionario.toFixed(1)} kWh/mes</strong>
                    </div>
                  </div>

                  {cargandoCatalogo ? (
                    <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Cargando catálogo desde PostgreSQL...</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', maxHeight: '320px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                      {Object.entries(articulosPorCategoria).map(([categoria, items]) => (
                        <div key={categoria} style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '0.6rem', padding: '0.85rem' }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#818CF8', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                            {categoria}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {items.map((art) => {
                              const cant = cantidades[art.idArticulo] || 0;
                              return (
                                <div key={art.idArticulo} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                                  <div style={{ fontSize: '0.83rem' }}>
                                    <div style={{ color: '#F8FAFC', fontWeight: 500 }}>{art.nombre}</div>
                                    <span style={{ color: '#64748B', fontSize: '0.75rem' }}>{art.consumoKwhMes} kWh/mes</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <button type="button" onClick={() => handleCantidadChange(art.idArticulo, cant - 1)} style={counterBtnStyle}>-</button>
                                    <span style={{ minWidth: '22px', textAlign: 'center', fontWeight: 700, fontSize: '0.85rem', color: cant > 0 ? '#10B981' : '#94A3B8' }}>
                                      {cant}
                                    </span>
                                    <button type="button" onClick={() => handleCantidadChange(art.idArticulo, cant + 1)} style={counterBtnStyle}>+</button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={guardando}
                style={{
                  backgroundColor: '#6366F1',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '0.75rem 1.75rem',
                  borderRadius: '0.5rem',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: guardando ? 'not-allowed' : 'pointer',
                  opacity: guardando ? 0.7 : 1
                }}
              >
                {guardando ? 'Guardando...' : 'Guardar Propiedad'}
              </button>
            </div>
          </form>
        </section>

        {/* LISTADO DE PROPIEDADES DESDE POSTGRESQL */}
        <section style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '0.85rem', padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', marginTop: 0, marginBottom: '1.25rem' }}>
            📋 Listado de Propiedades
          </h2>

          {cargandoPropiedades ? (
            <p style={{ color: '#94A3B8', textAlign: 'center', padding: '1.5rem 0' }}>Consultando propiedades en la base de datos...</p>
          ) : propiedades.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', border: '1px dashed #334155', borderRadius: '0.6rem', color: '#64748B' }}>
              Aún no tienes propiedades registradas. Utiliza el formulario superior para agregar la primera.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', color: '#94A3B8' }}>
                    <th style={thTdStyle}>Tipo</th>
                    <th style={thTdStyle}>Dirección</th>
                    <th style={thTdStyle}>Ciudad</th>
                    <th style={thTdStyle}>Método de Cálculo</th>
                    <th style={thTdStyle}>Consumo Mensual</th>
                  </tr>
                </thead>
                <tbody>
                  {propiedades.map((p) => (
                    <tr key={p.idCasa} style={{ borderBottom: '1px solid #0F172A' }}>
                      <td style={{ ...thTdStyle, fontWeight: 700, color: '#FFFFFF' }}>{p.tipoPropiedad}</td>
                      <td style={{ ...thTdStyle, color: '#CBD5E1' }}>{p.direccion || 'Coordenadas GPS'}</td>
                      <td style={{ ...thTdStyle, color: '#94A3B8' }}>{p.ciudad}</td>
                      <td style={thTdStyle}>
                        <span style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '0.4rem',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          backgroundColor: p.esCasaNueva ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                          color: p.esCasaNueva ? '#818CF8' : '#10B981'
                        }}>
                          {p.esCasaNueva ? 'Cuestionario Equipos' : 'Factura Directa'}
                        </span>
                      </td>
                      <td style={{ ...thTdStyle, fontWeight: 700, color: '#F59E0B' }}>
                        {Number(p.consumoMensual).toFixed(1)} kWh/mes
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

const labelStyle = {
  fontSize: '0.83rem',
  color: '#94A3B8',
  display: 'block',
  marginBottom: '0.35rem',
  fontWeight: 600
};

const inputStyle = {
  width: '100%',
  padding: '0.65rem 0.75rem',
  backgroundColor: '#0F172A',
  border: '1px solid #334155',
  borderRadius: '0.5rem',
  color: '#FFFFFF',
  fontSize: '0.9rem',
  boxSizing: 'border-box',
  outline: 'none'
};

const counterBtnStyle = {
  width: '26px',
  height: '26px',
  backgroundColor: '#0F172A',
  border: '1px solid #334155',
  color: '#FFFFFF',
  borderRadius: '0.35rem',
  fontWeight: 700,
  cursor: 'pointer'
};

const thTdStyle = {
  padding: '0.85rem 0.6rem'
};