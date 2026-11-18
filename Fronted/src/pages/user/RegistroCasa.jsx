import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RegistroCasa() {
  const navigate = useNavigate();
  const idUsuario = Number(localStorage.getItem('idUsuario')) || 1;

  // Estado principal de la propiedad (alineado con CasaDTO.java)
  const [formData, setFormData] = useState({
    tipoPropiedad: 'CASA',
    direccion: '',
    ciudad: 'Valledupar',
    latitud: 10.4631,
    longitud: -73.2532,
    areaTerrazaTechoM2: '',
    areaBalconM2: '',
    areaDisponibleM2: '',
    consumoMensual: '',
    esCasaNueva: false
  });

  // Catálogo traído desde PostgreSQL y cantidades seleccionadas { [idArticulo]: cantidad }
  const [catalogoArticulos, setCatalogoArticulos] = useState([]);
  const [cantidades, setCantidades] = useState({});
  const [cargandoCatalogo, setCargandoCatalogo] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Cargar catálogo cuando el usuario marca que es casa nueva
  useEffect(() => {
    if (formData.esCasaNueva && catalogoArticulos.length === 0) {
      setCargandoCatalogo(true);
      fetch('/api/casas/catalogo-articulos')
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) setCatalogoArticulos(data);
        })
        .catch((err) => console.error('Error cargando catálogo de artículos:', err))
        .finally(() => setCargandoCatalogo(false));
    }
  }, [formData.esCasaNueva, catalogoArticulos.length]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Manejar incrementos/decrementos de electrodomésticos en el cuestionario
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

  // Cálculo preliminar en vivo para mostrar al usuario antes de guardar
  const consumoEstimadoCuestionario = catalogoArticulos.reduce((total, art) => {
    const cant = cantidades[art.idArticulo] || 0;
    return total + art.consumoKwhMes * cant;
  }, 0);

  // Agrupar artículos por categoría para una visualización limpia
  const articulosPorCategoria = catalogoArticulos.reduce((acc, art) => {
    if (!acc[art.categoria]) acc[art.categoria] = [];
    acc[art.categoria].push(art);
    return acc;
  }, {});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);

    // Construir lista de ItemCuestionarioDTO
    const articulosCuestionario = Object.entries(cantidades).map(([idArticulo, cantidad]) => ({
      idArticulo: Number(idArticulo),
      cantidad: Number(cantidad)
    }));

    if (formData.esCasaNueva && articulosCuestionario.length === 0) {
      alert('Por favor selecciona al menos un electrodoméstico o artículo en el cuestionario.');
      setEnviando(false);
      return;
    }

    const payload = {
      idUsuario,
      tipoPropiedad: formData.tipoPropiedad,
      direccion: formData.direccion.trim(),
      ciudad: formData.ciudad,
      latitud: Number(formData.latitud) || 0.0,
      longitud: Number(formData.longitud) || 0.0,
      areaTerrazaTechoM2: formData.areaTerrazaTechoM2 ? Number(formData.areaTerrazaTechoM2) : null,
      areaBalconM2: formData.areaBalconM2 ? Number(formData.areaBalconM2) : null,
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
        const casaGuardada = await res.json();
        alert(
          `¡Propiedad registrada con éxito!\nConsumo mensual asignado: ${Number(
            casaGuardada.consumoMensual
          ).toFixed(2)} kWh/mes`
        );
        navigate('/dashboard'); // Ajusta a la ruta del panel de usuario
      } else {
        const errorMsg = await res.text();
        alert(`No se pudo registrar la propiedad: ${errorMsg}`);
      }
    } catch (err) {
      console.error('Error registrando casa:', err);
      alert('Error de conexión con el servidor backend.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F172A', color: '#F8FAFC', fontFamily: "'Inter', sans-serif", padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '820px', margin: '0 auto', backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '1rem', padding: '2rem' }}>
        
        <div style={{ marginBottom: '1.75rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 0.4rem 0' }}>
            🏡 Registrar Propiedad y Perfil Energético
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', margin: 0 }}>
            Ingresa los datos de tu inmueble en la región Caribe para dimensionar tu sistema fotovoltaico.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* DATOS BÁSICOS DE UBICACIÓN */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
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
              <label style={labelStyle}>Ciudad / Municipio *</label>
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

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Dirección {formData.tipoPropiedad !== 'FINCA' ? '*' : '(Opcional para Finca)'}</label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                required={formData.tipoPropiedad !== 'FINCA'}
                placeholder="Ej: Calle 16 # 9-45, Barrio Novalito"
                style={inputStyle}
              />
            </div>
          </div>

          {/* COORDENADAS Y ÁREAS DISPONIBLES */}
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
              <label style={labelStyle}>Área Techo/Terraza (m²)</label>
              <input type="number" step="0.1" name="areaTerrazaTechoM2" value={formData.areaTerrazaTechoM2} onChange={handleChange} placeholder="60" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Área Disponible Total (m²)</label>
              <input type="number" step="0.1" name="areaDisponibleM2" value={formData.areaDisponibleM2} onChange={handleChange} placeholder="45" style={inputStyle} />
            </div>
          </div>

          {/* INTERRUPTOR REGLA DE NEGOCIO: CASA NUEVA VS RECIBO EXISTENTE */}
          <div style={{ backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '0.75rem', padding: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 700, color: '#818CF8', fontSize: '1rem' }}>
              <input
                type="checkbox"
                name="esCasaNueva"
                checked={formData.esCasaNueva}
                onChange={handleChange}
                style={{ width: '18px', height: '18px', accentColor: '#6366F1' }}
              />
              ¿Es una casa nueva o aún no cuentas con factura de consumo energético mensual?
            </label>

            {!formData.esCasaNueva ? (
              <div style={{ marginTop: '1rem' }}>
                <label style={labelStyle}>Consumo Mensual Promedio (kWh/mes según tu recibo) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  name="consumoMensual"
                  value={formData.consumoMensual}
                  onChange={handleChange}
                  required={!formData.esCasaNueva}
                  placeholder="Ej: 420"
                  style={{ ...inputStyle, maxWidth: '280px' }}
                />
              </div>
            ) : (
              /* CUESTIONARIO DE ELECTRODOMÉSTICOS */
              <div style={{ marginTop: '1.25rem', borderTop: '1px solid #1E293B', paddingTop: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#FFFFFF' }}>📋 Cuestionario de Carga Energética</h3>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#94A3B8' }}>
                      Indica la cantidad de equipos que utilizarás en la vivienda para calcular tu demanda mensual.
                    </p>
                  </div>
                  <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', padding: '0.5rem 1rem', borderRadius: '0.5rem', textAlign: 'right' }}>
                    <small style={{ color: '#94A3B8', display: 'block', fontSize: '0.75rem' }}>Consumo Estimado</small>
                    <strong style={{ color: '#10B981', fontSize: '1.15rem' }}>{consumoEstimadoCuestionario.toFixed(1)} kWh/mes</strong>
                  </div>
                </div>

                {cargandoCatalogo ? (
                  <p style={{ color: '#94A3B8', textAlign: 'center', padding: '1rem' }}>Cargando catálogo de electrodomésticos...</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '380px', overflowY: 'auto', paddingRight: '0.4rem' }}>
                    {Object.entries(articulosPorCategoria).map(([categoria, items]) => (
                      <div key={categoria}>
                        <h4 style={{ margin: '0 0 0.6rem 0', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#818CF8' }}>
                          {categoria}
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {items.map((art) => {
                            const cantActual = cantidades[art.idArticulo] || 0;
                            return (
                              <div
                                key={art.idArticulo}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  backgroundColor: cantActual > 0 ? 'rgba(99, 102, 241, 0.12)' : '#1E293B',
                                  border: cantActual > 0 ? '1px solid #6366F1' : '1px solid #334155',
                                  padding: '0.6rem 0.9rem',
                                  borderRadius: '0.5rem'
                                }}
                              >
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#F8FAFC' }}>{art.nombre}</div>
                                  <small style={{ color: '#94A3B8' }}>{art.consumoKwhMes} kWh/mes por unidad</small>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleCantidadChange(art.idArticulo, cantActual - 1)}
                                    style={counterBtnStyle}
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    min="0"
                                    value={cantActual}
                                    onChange={(e) => handleCantidadChange(art.idArticulo, e.target.value)}
                                    style={{ width: '48px', textAlign: 'center', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '0.35rem', color: '#FFF', padding: '0.3rem', fontWeight: 700 }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleCantidadChange(art.idArticulo, cantActual + 1)}
                                    style={counterBtnStyle}
                                  >
                                    +
                                  </button>
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

          {/* BOTONES DE ACCIÓN */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{ backgroundColor: 'transparent', color: '#94A3B8', border: '1px solid #334155', padding: '0.75rem 1.25rem', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              style={{ backgroundColor: '#6366F1', color: '#FFFFFF', border: 'none', padding: '0.75rem 1.75rem', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.95rem', cursor: enviando ? 'not-allowed' : 'pointer', opacity: enviando ? 0.7 : 1 }}
            >
              {enviando ? 'Guardando Propiedad...' : 'Guardar Propiedad'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

const labelStyle = {
  fontSize: '0.85rem',
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
  width: '28px',
  height: '28px',
  backgroundColor: '#334155',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '0.35rem',
  fontWeight: 800,
  cursor: 'pointer'
};